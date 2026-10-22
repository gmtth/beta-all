import { env } from "cloudflare:workers";
import { ACCESS_TOKEN_TTL_SECONDS, REFRESH_TOKEN_TTL_SECONDS, clientSecretFor, GPT_ACTION_CLIENT_ID, KNOWLEDGE_READ_SCOPE, KNOWLEDGE_WRITE_SCOPE, MCP_CLIENT_ID, oauthClient, permissionLabelForScopes, OAUTH_SCOPE, OFFLINE_ACCESS_SCOPE, SUPPORTED_OAUTH_SCOPES, SUPPORTED_RESOURCE_SCOPES, validRedirectForClient, validateAuthorizationRequest, oauthTokenFailure, type OAuthTokenFailure } from "./clients";
import { DEFAULT_ACCESS_TOKEN_LIFETIME_MS } from "./token-lifetime";
import { validToolDuration, validToolHttpStatus } from "../tool-telemetry-math";

const encoder = new TextEncoder();
export const db = () => env.DB as D1Database;
let toolUsageSchemaPromise: Promise<void> | undefined;
export async function ensureToolUsageSchema() {
  if (!toolUsageSchemaPromise) {
    toolUsageSchemaPromise = db().batch([
      db().prepare("CREATE TABLE IF NOT EXISTS mcp_tool_events (id INTEGER PRIMARY KEY AUTOINCREMENT, tool_name TEXT NOT NULL, outcome TEXT NOT NULL CHECK (outcome IN ('success', 'error')), error_code TEXT, duration_ms INTEGER, http_status INTEGER, user_email TEXT, created_at INTEGER NOT NULL)"),
      db().prepare("CREATE INDEX IF NOT EXISTS mcp_tool_events_created_at_idx ON mcp_tool_events(created_at DESC)"),
      db().prepare("CREATE INDEX IF NOT EXISTS mcp_tool_events_tool_created_at_idx ON mcp_tool_events(tool_name, created_at DESC)"),
    ]).then(async () => {
      for (const column of ["duration_ms", "http_status", "user_email"]) {
        try {
          await db().prepare(`ALTER TABLE mcp_tool_events ADD COLUMN ${column} ${column === "user_email" ? "TEXT" : "INTEGER"}`).run();
        } catch (error) {
          if (!/duplicate column name/i.test(error instanceof Error ? error.message : String(error))) throw error;
        }
      }
      await db().prepare("CREATE INDEX IF NOT EXISTS mcp_tool_events_http_status_created_at_idx ON mcp_tool_events(http_status, created_at DESC)").run();
    }).catch((error) => { toolUsageSchemaPromise = undefined; throw error; });
  }
  await toolUsageSchemaPromise;
}
export async function recordMcpToolEvent(toolName: string, outcome: "success" | "error", errorCode: string | null, durationMs: number | null, httpStatus: number | null, userEmail: string | null) {
  try {
    await ensureToolUsageSchema();
    const now = Date.now();
    await db().batch([
      db().prepare("INSERT INTO mcp_tool_events (tool_name, outcome, error_code, duration_ms, http_status, user_email, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)").bind(toolName, outcome, errorCode, validToolDuration(durationMs), outcome === "error" ? validToolHttpStatus(httpStatus) : null, outcome === "error" && userEmail ? userEmail.trim().toLowerCase().slice(0, 254) : null, now),
      db().prepare("DELETE FROM mcp_tool_events WHERE created_at < ?").bind(now - 90 * 24 * 60 * 60 * 1000),
    ]);
  } catch {
    // Telemetry must never make an otherwise successful MCP tool call fail.
  }
}
export async function hash(value: string) { const digest = await crypto.subtle.digest("SHA-256", encoder.encode(value)); return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join(""); }
export function randomToken() { const bytes = new Uint8Array(32); crypto.getRandomValues(bytes); return btoa(String.fromCharCode(...bytes)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, ""); }
export function masterEmails() { return (process.env.OAUTH_MASTER_EMAILS ?? "").split(",").map((value) => value.trim().toLowerCase()).filter(Boolean); }
export async function ensureSchema() {
  const statements = [
    db().prepare("CREATE TABLE IF NOT EXISTS oauth_codes (code_hash TEXT PRIMARY KEY, client_id TEXT NOT NULL, redirect_uri TEXT NOT NULL, user_id TEXT NOT NULL, user_email TEXT, scope TEXT NOT NULL, resource TEXT, code_challenge TEXT, code_challenge_method TEXT, expires_at INTEGER NOT NULL)"),
    db().prepare("CREATE TABLE IF NOT EXISTS oauth_tokens (token_hash TEXT PRIMARY KEY, client_id TEXT NOT NULL, user_id TEXT NOT NULL, user_email TEXT, scope TEXT NOT NULL, resource TEXT, family_id TEXT, expires_at INTEGER NOT NULL)"),
    db().prepare("CREATE TABLE IF NOT EXISTS oauth_refresh_tokens (token_hash TEXT PRIMARY KEY, family_id TEXT NOT NULL, client_id TEXT NOT NULL, user_id TEXT NOT NULL, user_email TEXT NOT NULL, scope TEXT NOT NULL, resource TEXT NOT NULL, expires_at INTEGER NOT NULL, created_at INTEGER NOT NULL, consumed_at INTEGER, replaced_by_hash TEXT, revoked_at INTEGER)"),
    db().prepare("CREATE INDEX IF NOT EXISTS oauth_refresh_tokens_family_idx ON oauth_refresh_tokens(family_id)"),
    db().prepare("CREATE TABLE IF NOT EXISTS oauth_settings (setting_key TEXT PRIMARY KEY NOT NULL, setting_value INTEGER NOT NULL CHECK (setting_value BETWEEN 60000 AND 2592000000))"),
    db().prepare("INSERT OR IGNORE INTO oauth_settings (setting_key, setting_value) VALUES ('access_token_lifetime_ms', ?)").bind(DEFAULT_ACCESS_TOKEN_LIFETIME_MS),
    db().prepare("CREATE TABLE IF NOT EXISTS oauth_users (email TEXT PRIMARY KEY, role TEXT NOT NULL, active INTEGER NOT NULL DEFAULT 1, created_at INTEGER NOT NULL)"),
  ];
  await db().batch(statements);
  for (const statement of [
    "ALTER TABLE oauth_codes ADD COLUMN user_email TEXT",
    "ALTER TABLE oauth_codes ADD COLUMN code_challenge TEXT",
    "ALTER TABLE oauth_codes ADD COLUMN code_challenge_method TEXT",
    "ALTER TABLE oauth_codes ADD COLUMN resource TEXT",
    "ALTER TABLE oauth_tokens ADD COLUMN user_email TEXT",
    "ALTER TABLE oauth_tokens ADD COLUMN resource TEXT",
    "ALTER TABLE oauth_tokens ADD COLUMN family_id TEXT",
  ]) { try { await db().prepare(statement).run(); } catch { /* already migrated */ } }
  for (const email of masterEmails()) await db().prepare("INSERT OR IGNORE INTO oauth_users (email, role, active, created_at) VALUES (?, 'master', 1, ?)").bind(email, Date.now()).run();
}
export async function getUserRole(email: string) { return (await db().prepare("SELECT role FROM oauth_users WHERE email = ? AND active = 1").bind(email.trim().toLowerCase()).first<{ role: string }>())?.role ?? null; }
export type OAuthPrincipal = { email: string; role: string };
export type OAuthPrincipalAuthorization = { authorized: true; principal: OAuthPrincipal } | { authorized: false; error: OAuthTokenFailure };

export async function authorizeOAuthPrincipal(accessToken: string, requiredScopes: string[], expectedResource: string, expectedClientKind?: "mcp" | "gpt-action"): Promise<OAuthPrincipalAuthorization> {
  if (!accessToken || !requiredScopes.length || requiredScopes.some((scope) => !(SUPPORTED_RESOURCE_SCOPES as readonly string[]).includes(scope))) return { authorized: false, error: "invalid_token" };
  await ensureSchema();
  const row = await db().prepare("SELECT client_id, scope, expires_at, user_email, resource FROM oauth_tokens WHERE token_hash = ?")
    .bind(await hash(accessToken))
    .first<{ client_id: string; scope: string; expires_at: number; user_email: string | null; resource: string | null }>();
  const error = oauthTokenFailure(row, requiredScopes, expectedResource, Date.now(), expectedClientKind);
  if (!row || error === "invalid_token") return { authorized: false, error: "invalid_token" };
  const role = await getUserRole(row.user_email);
  if (!role) return { authorized: false, error: "invalid_token" };
  if (error) return { authorized: false, error };
  return { authorized: true, principal: { email: row.user_email.trim().toLowerCase(), role } };
}
export async function getAuthorizedOAuthPrincipal(accessToken: string, requiredScopes: string[], expectedResource: string, expectedClientKind?: "mcp" | "gpt-action") {
  const result = await authorizeOAuthPrincipal(accessToken, requiredScopes, expectedResource, expectedClientKind);
  return result.authorized ? result.principal : null;
}
export async function authorizeOAuthScope(accessToken: string, requiredScope: string, expectedResource: string) { return Boolean(await getAuthorizedOAuthPrincipal(accessToken, [requiredScope], expectedResource)); }
export { ACCESS_TOKEN_TTL_SECONDS, REFRESH_TOKEN_TTL_SECONDS, clientSecretFor, GPT_ACTION_CLIENT_ID, KNOWLEDGE_READ_SCOPE, KNOWLEDGE_WRITE_SCOPE, MCP_CLIENT_ID, oauthClient, OAUTH_SCOPE, OFFLINE_ACCESS_SCOPE, SUPPORTED_OAUTH_SCOPES, SUPPORTED_RESOURCE_SCOPES, permissionLabelForScopes, validRedirectForClient, validateAuthorizationRequest, oauthTokenFailure };
export function allowedScopes() { return [...SUPPORTED_OAUTH_SCOPES]; }
export function canonicalResource(origin: string) { return `${origin}/mcp/`; }
export function isMaster(role: string | null) { return role === "master"; }
export function validRedirect(uri: string, requestedClient: string) { return validRedirectForClient(requestedClient, uri, process.env); }
export async function pkceS256(value: string) { const digest = await crypto.subtle.digest("SHA-256", encoder.encode(value)); return btoa(String.fromCharCode(...new Uint8Array(digest))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, ""); }
export function json(data: unknown, init?: ResponseInit) { return Response.json(data, { ...init, headers: { "Cache-Control": "no-store", ...init?.headers } }); }
