import { db, ensureToolUsageSchema } from "./oauth/_lib";
import { mapToolUsageRows, type ToolUsageRow } from "./tool-telemetry-math";

const DAY_MS = 24 * 60 * 60 * 1000;
const WINDOW_DAYS = 30;
const RETENTION_DAYS = 90;

export type AdminToolMetrics = {
  window: { start: string; end: string; days: number };
  periodComparison: { current: { calls: number; errors: number }; previous: { calls: number; errors: number } };
  totalCalls: number;
  usageByTool: Array<{ toolName: string; calls: number; errors: number; successRatePercent: number; averageLatencyMs: number | null }>;
  recentErrors: Array<{ toolName: string; errorCode: string; occurredAt: string; durationMs: number | null; httpStatus: number | null; userEmail: string | null }>;
  callsByDay: Array<{ date: string; calls: number; errors: number }>;
  httpErrorsByStatus: Array<{ status: number; count: number }>;
  errorsByCategory: Array<{ errorCode: string; count: number; previousCount: number }>;
  errorsByAccount: Array<{ userEmail: string; count: number }>;
  latencyByTool: Array<{ toolName: string; samples: number; p50Ms: number; p95Ms: number }>;
};

type ErrorRow = { tool_name: string; error_code: string | null; created_at: number; duration_ms: number | null; http_status: number | null; user_email: string | null };
type DailyActivityRow = { day: number; calls: number; errors: number };
type HttpErrorRow = { http_status: number; count: number };
type ErrorCategoryRow = { error_code: string; period: "current" | "previous"; count: number };
type PeriodRow = { period: "current" | "previous"; calls: number; errors: number };
type ErrorAccountRow = { user_email: string; count: number };
type LatencyPercentileRow = { tool_name: string; samples: number; p50_ms: number; p95_ms: number };

export async function getAdminToolMetrics(): Promise<AdminToolMetrics> {
  await ensureToolUsageSchema();
  const now = Date.now();
  const todayUtc = Date.UTC(new Date(now).getUTCFullYear(), new Date(now).getUTCMonth(), new Date(now).getUTCDate());
  const startUtc = todayUtc - (WINDOW_DAYS - 1) * DAY_MS;
  const retentionCutoff = now - RETENTION_DAYS * DAY_MS;
  await db().prepare("DELETE FROM mcp_tool_events WHERE created_at < ?").bind(retentionCutoff).run();

  const previousStartUtc = startUtc - WINDOW_DAYS * DAY_MS;
  const reportEndUtc = todayUtc + DAY_MS;
  const [usage, errors, daily, httpErrors, categories, accounts, latency, periodTotals] = await Promise.all([
    db().prepare("SELECT tool_name, COUNT(*) AS calls, SUM(CASE WHEN outcome = 'error' THEN 1 ELSE 0 END) AS errors, AVG(duration_ms) AS average_latency_ms FROM mcp_tool_events WHERE created_at >= ? AND created_at < ? GROUP BY tool_name ORDER BY calls DESC, tool_name ASC")
      .bind(startUtc, todayUtc + DAY_MS).all<ToolUsageRow>(),
    db().prepare("SELECT tool_name, error_code, created_at, duration_ms, http_status, user_email FROM mcp_tool_events WHERE outcome = 'error' ORDER BY created_at DESC, id DESC LIMIT 10")
      .all<ErrorRow>(),
    db().prepare("SELECT CAST(created_at / 86400000 AS INTEGER) AS day, COUNT(*) AS calls, SUM(CASE WHEN outcome = 'error' THEN 1 ELSE 0 END) AS errors FROM mcp_tool_events WHERE created_at >= ? AND created_at < ? GROUP BY day")
      .bind(startUtc, todayUtc + DAY_MS).all<DailyActivityRow>(),
    db().prepare("SELECT http_status, COUNT(*) AS count FROM mcp_tool_events WHERE outcome = 'error' AND http_status BETWEEN 400 AND 599 AND created_at >= ? AND created_at < ? GROUP BY http_status ORDER BY count DESC, http_status ASC")
      .bind(startUtc, todayUtc + DAY_MS).all<HttpErrorRow>(),
    db().prepare(`WITH categorized AS (
        SELECT CASE WHEN error_code IN ('tool_error','authorization','validation','timeout','upstream_4xx','upstream_5xx','handler_exception') THEN error_code ELSE 'tool_error' END AS error_code,
          CASE WHEN created_at >= ? THEN 'current' ELSE 'previous' END AS period
        FROM mcp_tool_events WHERE outcome = 'error' AND created_at >= ? AND created_at < ?
      )
      SELECT error_code, period, COUNT(*) AS count FROM categorized GROUP BY error_code, period ORDER BY count DESC, error_code ASC`)
      .bind(startUtc, previousStartUtc, reportEndUtc).all<ErrorCategoryRow>(),
    db().prepare("SELECT lower(user_email) AS user_email, COUNT(*) AS count FROM mcp_tool_events WHERE outcome = 'error' AND user_email IS NOT NULL AND created_at >= ? AND created_at < ? GROUP BY lower(user_email) ORDER BY count DESC, user_email ASC LIMIT 5")
      .bind(startUtc, todayUtc + DAY_MS).all<ErrorAccountRow>(),
    db().prepare(`WITH ranked AS (
        SELECT tool_name, duration_ms,
          ROW_NUMBER() OVER (PARTITION BY tool_name ORDER BY duration_ms, id) AS sample_position,
          COUNT(*) OVER (PARTITION BY tool_name) AS sample_count
        FROM mcp_tool_events
        WHERE created_at >= ? AND created_at < ? AND duration_ms IS NOT NULL
      )
      SELECT tool_name, MAX(sample_count) AS samples,
        MAX(CASE WHEN sample_position = MAX(1, CAST(sample_count * 0.5 + 0.999999 AS INTEGER)) THEN duration_ms END) AS p50_ms,
        MAX(CASE WHEN sample_position = MAX(1, CAST(sample_count * 0.95 + 0.999999 AS INTEGER)) THEN duration_ms END) AS p95_ms
      FROM ranked GROUP BY tool_name ORDER BY p95_ms DESC, samples DESC, tool_name ASC LIMIT 8`)
      .bind(startUtc, todayUtc + DAY_MS).all<LatencyPercentileRow>(),
    db().prepare("SELECT CASE WHEN created_at >= ? THEN 'current' ELSE 'previous' END AS period, COUNT(*) AS calls, SUM(CASE WHEN outcome = 'error' THEN 1 ELSE 0 END) AS errors FROM mcp_tool_events WHERE created_at >= ? AND created_at < ? GROUP BY period")
      .bind(startUtc, previousStartUtc, reportEndUtc).all<PeriodRow>(),
  ]);

  const dailyCounts = new Map((daily.results ?? []).map((row) => [row.day, row]));
  const callsByDay = Array.from({ length: WINDOW_DAYS }, (_, index) => {
    const timestamp = startUtc + index * DAY_MS;
    const counts = dailyCounts.get(Math.floor(timestamp / DAY_MS));
    return { date: new Date(timestamp).toISOString().slice(0, 10), calls: counts?.calls ?? 0, errors: counts?.errors ?? 0 };
  });
  const usageByTool = mapToolUsageRows(usage.results ?? []);
  const periodMap = new Map((periodTotals.results ?? []).map((row) => [row.period, { calls: row.calls, errors: row.errors }]));
  const currentPeriod = periodMap.get("current") ?? { calls: 0, errors: 0 };
  const previousPeriod = periodMap.get("previous") ?? { calls: 0, errors: 0 };
  const categoryCounts = new Map<string, { current: number; previous: number }>();
  for (const row of categories.results ?? []) {
    const code = safeErrorCode(row.error_code);
    const counts = categoryCounts.get(code) ?? { current: 0, previous: 0 };
    counts[row.period] += row.count;
    categoryCounts.set(code, counts);
  }

  return {
    window: { start: new Date(startUtc).toISOString(), end: new Date(todayUtc + DAY_MS - 1).toISOString(), days: WINDOW_DAYS },
    periodComparison: { current: currentPeriod, previous: previousPeriod },
    totalCalls: usageByTool.reduce((total, row) => total + row.calls, 0),
    usageByTool,
    recentErrors: (errors.results ?? []).map((row) => ({
      toolName: row.tool_name,
      errorCode: safeErrorCode(row.error_code),
      occurredAt: new Date(row.created_at).toISOString(),
      durationMs: row.duration_ms,
      httpStatus: row.http_status,
      userEmail: row.user_email,
    })),
    callsByDay,
    httpErrorsByStatus: (httpErrors.results ?? []).map((row) => ({ status: row.http_status, count: row.count })),
    errorsByCategory: Array.from(categoryCounts, ([errorCode, counts]) => ({ errorCode, count: counts.current, previousCount: counts.previous })).sort((a, b) => b.count - a.count || a.errorCode.localeCompare(b.errorCode)),
    errorsByAccount: (accounts.results ?? []).map((row) => ({ userEmail: row.user_email, count: row.count })),
    latencyByTool: (latency.results ?? []).map((row) => ({ toolName: row.tool_name, samples: row.samples, p50Ms: row.p50_ms, p95Ms: row.p95_ms })),
  };
}

function safeErrorCode(value: string | null) {
  const allowed = new Set(["tool_error", "authorization", "validation", "timeout", "upstream_4xx", "upstream_5xx", "handler_exception"]);
  return value && allowed.has(value) ? value : "tool_error";
}
