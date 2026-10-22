ALTER TABLE mcp_tool_events ADD COLUMN http_status INTEGER;
CREATE INDEX IF NOT EXISTS mcp_tool_events_http_status_created_at_idx ON mcp_tool_events(http_status, created_at DESC);
