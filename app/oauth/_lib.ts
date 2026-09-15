import { env } from "cloudflare:workers";
import { clientSecretFor, GPT_ACTION_CLIENT_ID, MCP_CLIENT_ID, oauthClient, OAUTH_SCOPE, validRedirectForClient, validateAuthorizationRequest } from "./clients";

const encoder = new TextEncoder();
export const db = () => env.DB as D1Database;
export async function hash(value: string) { const digest = await crypto.subtle.digest("SHA-256", encoder.encode(value)); return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join(""); }
export function randomToken() { const bytes = new Uint8Array(32); crypto.getRandomValues(bytes); return btoa(String.fromCharCode(...bytes)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, ""); }
export function masterEmails() { return (process.env.OAUTH_MASTER_EMAILS ?? "").split(",").map((value) => value.trim().toLowerCase()).filter(Boolean); }
export async function ensureSchema() {
  const statements = [
    db().prepare("CREATE TABLE IF NOT EXISTS oauth_codes (code_hash TEXT PRIMARY KEY, client_id TEXT NOT NULL, redirect_uri TEXT NOT NULL, user_id TEXT NOT NULL, user_email TEXT, scope TEXT NOT NULL, resource TEXT, code_challenge TEXT, code_challenge_method TEXT, expires_at INTEGER NOT NULL)"),
    db().prepare("CREATE TABLE IF NOT EXISTS oauth_tokens (token_hash TEXT PRIMARY KEY, client_id TEXT NOT NULL, user_id TEXT NOT NULL, user_email TEXT, scope TEXT NOT NULL, resource TEXT, expires_at INTEGER NOT NULL)"),
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
  ]) { try { await db().prepare(statement).run(); } catch { /* already migrated */ } }
  for (const email of masterEmails()) await db().prepare("INSERT OR IGNORE INTO oauth_users (email, role, active, created_at) VALUES (?, 'master', 1, ?)").bind(email, Date.now()).run();
}
export async function getUserRole(email: string) { return (await db().prepare("SELECT role FROM oauth_users WHERE email = ? AND active = 1").bind(email.trim().toLowerCase()).first<{ role: string }>())?.role ?? null; }
export { clientSecretFor, GPT_ACTION_CLIENT_ID, MCP_CLIENT_ID, oauthClient, OAUTH_SCOPE, validRedirectForClient, validateAuthorizationRequest };
export function allowedScopes() { return [OAUTH_SCOPE]; }
export function canonicalResource(origin: string) { return `${origin}/mcp/`; }
export function isMaster(role: string | null) { return role === "master"; }
export function validRedirect(uri: string, requestedClient: string) { return validRedirectForClient(requestedClient, uri, process.env); }
export async function pkceS256(value: string) { const digest = await crypto.subtle.digest("SHA-256", encoder.encode(value)); return btoa(String.fromCharCode(...new Uint8Array(digest))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, ""); }
export function json(data: unknown, init?: ResponseInit) { return Response.json(data, { ...init, headers: { "Cache-Control": "no-store", ...init?.headers } }); }
