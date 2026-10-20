import { sqliteTable, text, integer, index } from "drizzle-orm/sqlite-core";

export const oauthCodes = sqliteTable("oauth_codes", {
  codeHash: text("code_hash").primaryKey(),
  clientId: text("client_id").notNull(),
  redirectUri: text("redirect_uri").notNull(),
  userId: text("user_id").notNull(),
  scope: text("scope").notNull(),
  expiresAt: integer("expires_at").notNull(),
});

export const oauthTokens = sqliteTable("oauth_tokens", {
  tokenHash: text("token_hash").primaryKey(),
  clientId: text("client_id").notNull(),
  userId: text("user_id").notNull(),
  scope: text("scope").notNull(),
  expiresAt: integer("expires_at").notNull(),
});

export const mcpToolEvents = sqliteTable("mcp_tool_events", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  toolName: text("tool_name").notNull(),
  outcome: text("outcome", { enum: ["success", "error"] }).notNull(),
  errorCode: text("error_code"),
  createdAt: integer("created_at").notNull(),
}, (table) => [
  index("mcp_tool_events_created_at_idx").on(table.createdAt),
  index("mcp_tool_events_tool_created_at_idx").on(table.toolName, table.createdAt),
]);
