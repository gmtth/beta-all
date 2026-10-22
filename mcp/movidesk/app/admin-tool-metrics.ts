import { db, ensureToolUsageSchema } from "./oauth/_lib";
import { mapToolUsageRows, type ToolUsageRow } from "./tool-telemetry-math";

const DAY_MS = 24 * 60 * 60 * 1000;
const WINDOW_DAYS = 30;
const RETENTION_DAYS = 90;

export type AdminToolMetrics = {
  window: { start: string; end: string; days: number };
  totalCalls: number;
  usageByTool: Array<{ toolName: string; calls: number; errors: number; successRatePercent: number; averageLatencyMs: number | null }>;
  recentErrors: Array<{ toolName: string; errorCode: string; occurredAt: string }>;
  errorsByDay: Array<{ date: string; count: number }>;
  httpErrorsByStatus: Array<{ status: number; count: number }>;
};

type ErrorRow = { tool_name: string; error_code: string | null; created_at: number };
type DailyErrorRow = { day: number; count: number };
type HttpErrorRow = { http_status: number; count: number };

export async function getAdminToolMetrics(): Promise<AdminToolMetrics> {
  await ensureToolUsageSchema();
  const now = Date.now();
  const todayUtc = Date.UTC(new Date(now).getUTCFullYear(), new Date(now).getUTCMonth(), new Date(now).getUTCDate());
  const startUtc = todayUtc - (WINDOW_DAYS - 1) * DAY_MS;
  const retentionCutoff = now - RETENTION_DAYS * DAY_MS;
  await db().prepare("DELETE FROM mcp_tool_events WHERE created_at < ?").bind(retentionCutoff).run();

  const [usage, errors, daily, httpErrors] = await Promise.all([
    db().prepare("SELECT tool_name, COUNT(*) AS calls, SUM(CASE WHEN outcome = 'error' THEN 1 ELSE 0 END) AS errors, AVG(duration_ms) AS average_latency_ms FROM mcp_tool_events WHERE created_at >= ? AND created_at < ? GROUP BY tool_name ORDER BY calls DESC, tool_name ASC")
      .bind(startUtc, todayUtc + DAY_MS).all<ToolUsageRow>(),
    db().prepare("SELECT tool_name, error_code, created_at FROM mcp_tool_events WHERE outcome = 'error' ORDER BY created_at DESC, id DESC LIMIT 10")
      .all<ErrorRow>(),
    db().prepare("SELECT CAST(created_at / 86400000 AS INTEGER) AS day, COUNT(*) AS count FROM mcp_tool_events WHERE outcome = 'error' AND created_at >= ? AND created_at < ? GROUP BY day")
      .bind(startUtc, todayUtc + DAY_MS).all<DailyErrorRow>(),
    db().prepare("SELECT http_status, COUNT(*) AS count FROM mcp_tool_events WHERE outcome = 'error' AND http_status BETWEEN 400 AND 599 AND created_at >= ? AND created_at < ? GROUP BY http_status ORDER BY count DESC, http_status ASC")
      .bind(startUtc, todayUtc + DAY_MS).all<HttpErrorRow>(),
  ]);

  const dailyCounts = new Map((daily.results ?? []).map((row) => [row.day, row.count]));
  const errorsByDay = Array.from({ length: WINDOW_DAYS }, (_, index) => {
    const timestamp = startUtc + index * DAY_MS;
    return { date: new Date(timestamp).toISOString().slice(0, 10), count: dailyCounts.get(Math.floor(timestamp / DAY_MS)) ?? 0 };
  });
  const usageByTool = mapToolUsageRows(usage.results ?? []);

  return {
    window: { start: new Date(startUtc).toISOString(), end: new Date(todayUtc + DAY_MS - 1).toISOString(), days: WINDOW_DAYS },
    totalCalls: usageByTool.reduce((total, row) => total + row.calls, 0),
    usageByTool,
    recentErrors: (errors.results ?? []).map((row) => ({
      toolName: row.tool_name,
      errorCode: safeErrorCode(row.error_code),
      occurredAt: new Date(row.created_at).toISOString(),
    })),
    errorsByDay,
    httpErrorsByStatus: (httpErrors.results ?? []).map((row) => ({ status: row.http_status, count: row.count })),
  };
}

function safeErrorCode(value: string | null) {
  const allowed = new Set(["tool_error", "authorization", "validation", "timeout", "upstream_4xx", "upstream_5xx", "handler_exception"]);
  return value && allowed.has(value) ? value : "tool_error";
}
