CREATE TABLE IF NOT EXISTS mcp_tool_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tool_name TEXT NOT NULL,
  outcome TEXT NOT NULL CHECK (outcome IN ('success', 'error')),
  error_code TEXT,
  created_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS mcp_tool_events_created_at_idx ON mcp_tool_events(created_at DESC);
CREATE INDEX IF NOT EXISTS mcp_tool_events_tool_created_at_idx ON mcp_tool_events(tool_name, created_at DESC);
