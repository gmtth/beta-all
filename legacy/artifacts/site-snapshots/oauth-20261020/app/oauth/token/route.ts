import { env } from "cloudflare:workers";
import { clientSecretFor, ensureSchema, hash, json, oauthClient, pkceS256, randomToken, validRedirectForClient } from "../_lib";

export async function POST(request: Request) {
  const form = await request.formData().catch(() => null);
  const grant = String(form?.get("grant_type") ?? "");
  const requestedClient = String(form?.get("client_id") ?? "");
  const code = String(form?.get("code") ?? "");
  const redirectUri = String(form?.get("redirect_uri") ?? "");
  const verifier = String(form?.get("code_verifier") ?? "");
  const clientSecret = String(form?.get("client_secret") ?? "");
  const client = oauthClient(requestedClient);
  const expectedSecret = clientSecretFor(requestedClient, process.env);
  if (!client || grant !== "authorization_code" || !code || !redirectUri || !validRedirectForClient(requestedClient, redirectUri, process.env)) return json({ error: "invalid_grant" }, { status: 400 });
  if (client.kind === "gpt-action" && expectedSecret && clientSecret !== expectedSecret) return json({ error: "invalid_client" }, { status: 401 });
  if (client.kind === "mcp" && clientSecret) return json({ error: "invalid_client" }, { status: 401 });
  if (client.requiresPkce && !verifier) return json({ error: "invalid_grant" }, { status: 400 });
  await ensureSchema();
  const row = await env.DB.prepare("SELECT * FROM oauth_codes WHERE code_hash = ?").bind(await hash(code)).first<{ client_id: string; redirect_uri: string; user_id: string; user_email: string | null; scope: string; code_challenge: string | null; code_challenge_method: string | null; expires_at: number }>();
  if (!row || row.client_id !== requestedClient || row.redirect_uri !== redirectUri || row.expires_at < Date.now()) return json({ error: "invalid_grant" }, { status: 400 });
  if (client.requiresPkce && (row.code_challenge_method !== "S256" || !row.code_challenge || row.code_challenge !== await pkceS256(verifier))) return json({ error: "invalid_grant" }, { status: 400 });
  if (!client.requiresPkce && (row.code_challenge || row.code_challenge_method)) return json({ error: "invalid_grant" }, { status: 400 });
  await env.DB.prepare("DELETE FROM oauth_codes WHERE code_hash = ?").bind(await hash(code)).run();
  const access = randomToken();
  const expires = Date.now() + 3600000;
  await env.DB.prepare("INSERT INTO oauth_tokens (token_hash, client_id, user_id, user_email, scope, expires_at) VALUES (?, ?, ?, ?, ?, ?)").bind(await hash(access), requestedClient, row.user_id, row.user_email ?? null, row.scope, expires).run();
  return json({ access_token: access, token_type: "Bearer", expires_in: 3600, scope: row.scope });
}
