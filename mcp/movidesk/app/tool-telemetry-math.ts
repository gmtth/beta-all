export type ToolUsageRow = {
  tool_name: string;
  calls: number;
  errors: number;
  average_latency_ms: number | null;
};

export function mapToolUsageRows(rows: ToolUsageRow[]) {
  return rows.map((row) => {
    const calls = Number(row.calls) || 0;
    const errors = Number(row.errors) || 0;
    const averageLatency = row.average_latency_ms === null ? null : Number(row.average_latency_ms);
    return {
      toolName: row.tool_name,
      calls,
      errors,
      successRatePercent: calls ? Math.round(((calls - errors) / calls) * 1000) / 10 : 0,
      averageLatencyMs: Number.isFinite(averageLatency) ? Math.round(averageLatency) : null,
    };
  });
}

export function validToolDuration(value: number | null) {
  return typeof value === "number" && Number.isFinite(value) && value >= 0 ? Math.round(value) : null;
}

export function validToolHttpStatus(value: number | null) {
  return typeof value === "number" && Number.isInteger(value) && value >= 400 && value <= 599 ? value : null;
}
