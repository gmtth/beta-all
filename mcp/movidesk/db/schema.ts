import { sqliteTable, text, integer, index } from "drizzle-orm/sqlite-core";

export const oauthCodes = sqliteTable("oauth_codes", {
  codeHash: text("code_hash").primaryKey(),
  clientId: text("client_id").notNull(),
  redirectUri: text("redirect_uri").notNull(),
  userId: text("user_id").notNull(),
  userEmail: text("user_email"),
  scope: text("scope").notNull(),
  resource: text("resource"),
  codeChallenge: text("code_challenge"),
  codeChallengeMethod: text("code_challenge_method"),
  expiresAt: integer("expires_at").notNull(),
});

export const oauthTokens = sqliteTable("oauth_tokens", {
  tokenHash: text("token_hash").primaryKey(),
  clientId: text("client_id").notNull(),
  userId: text("user_id").notNull(),
  userEmail: text("user_email"),
  scope: text("scope").notNull(),
  resource: text("resource"),
  familyId: text("family_id"),
  expiresAt: integer("expires_at").notNull(),
});

export const oauthRefreshTokens = sqliteTable("oauth_refresh_tokens", {
  tokenHash: text("token_hash").primaryKey(),
  familyId: text("family_id").notNull(),
  clientId: text("client_id").notNull(),
  userId: text("user_id").notNull(),
  userEmail: text("user_email").notNull(),
  scope: text("scope").notNull(),
  resource: text("resource").notNull(),
  expiresAt: integer("expires_at").notNull(),
  createdAt: integer("created_at").notNull(),
  consumedAt: integer("consumed_at"),
  replacedByHash: text("replaced_by_hash"),
  revokedAt: integer("revoked_at"),
}, (table) => [index("oauth_refresh_tokens_family_idx").on(table.familyId)]);

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
