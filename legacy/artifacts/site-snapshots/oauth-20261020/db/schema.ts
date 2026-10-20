import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

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
