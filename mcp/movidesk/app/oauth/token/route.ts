import { env } from "cloudflare:workers";
import {
  OFFLINE_ACCESS_SCOPE,
  REFRESH_TOKEN_TTL_SECONDS,
  canonicalResource,
  clientSecretFor,
  ensureSchema,
  hash,
  json,
  oauthClient,
  pkceS256,
  randomToken,
  validRedirectForClient,
} from "../_lib";
import { createAuthorizationCodeGrant, rotateRefreshToken } from "../token-grants";
import { getAccessTokenLifetimeMs } from "../token-lifetime";

function validateClientCredentials(clientId: string, clientSecret: string, clientKind: "mcp" | "gpt-action") {
  const expectedSecret = clientSecretFor(clientId, process.env);
  if (clientKind === "gpt-action" && expectedSecret && clientSecret !== expectedSecret) return false;
  if (clientKind === "mcp" && clientSecret) return false;
  return true;
}

export async function POST(request: Request) {
  const form = await request.formData().catch(() => null);
  const grant = String(form?.get("grant_type") ?? "");
  const requestedClient = String(form?.get("client_id") ?? "");
  const client = oauthClient(requestedClient);
  if (!form || !client) return json({ error: "invalid_grant" }, { status: 400 });

  const clientSecret = String(form.get("client_secret") ?? "");
  if (!validateClientCredentials(requestedClient, clientSecret, client.kind)) return json({ error: "invalid_client" }, { status: 401 });

  const now = Date.now();
  const resource = String(form.get("resource") ?? canonicalResource(new URL(request.url).origin));
  if (grant === "refresh_token") {
    const refreshToken = String(form.get("refresh_token") ?? "");
    if (!refreshToken) return json({ error: "invalid_grant" }, { status: 400 });
    await ensureSchema();
    const replacementAccessToken = randomToken();
    const replacementRefreshToken = randomToken();
    const accessTokenLifetimeMs = await getAccessTokenLifetimeMs(env.DB);
    const accessExpiresAt = now + accessTokenLifetimeMs;
    const rotated = await rotateRefreshToken(env.DB, {
      tokenHash: await hash(refreshToken),
      replacementRefreshTokenHash: await hash(replacementRefreshToken),
      accessTokenHash: await hash(replacementAccessToken),
      clientId: requestedClient,
      resource,
      requestedScope: form.has("scope") ? String(form.get("scope") ?? "") : undefined,
      now,
      accessExpiresAt,
    });
    if (!rotated) return json({ error: "invalid_grant" }, { status: 400 });
    return json({
      access_token: replacementAccessToken,
      token_type: "Bearer",
      expires_in: Math.ceil(accessTokenLifetimeMs / 1000),
      refresh_token: replacementRefreshToken,
      refresh_token_expires_in: Math.floor((rotated.refreshExpiresAt - now) / 1000),
      scope: rotated.scope,
      resource: rotated.resource,
    });
  }

  const code = String(form.get("code") ?? "");
  const redirectUri = String(form.get("redirect_uri") ?? "");
  const verifier = String(form.get("code_verifier") ?? "");
  if (grant !== "authorization_code" || !code || !redirectUri || !validRedirectForClient(requestedClient, redirectUri, process.env)) return json({ error: "invalid_grant" }, { status: 400 });
  if (client.requiresPkce && !verifier) return json({ error: "invalid_grant" }, { status: 400 });

  await ensureSchema();
  const row = await env.DB.prepare("SELECT * FROM oauth_codes WHERE code_hash = ?").bind(await hash(code)).first<{
    client_id: string;
    redirect_uri: string;
    user_id: string;
    user_email: string | null;
    scope: string;
    resource: string | null;
    code_challenge: string | null;
    code_challenge_method: string | null;
    expires_at: number;
  }>();
  if (!row || row.client_id !== requestedClient || row.redirect_uri !== redirectUri || row.expires_at < now || (client.kind === "mcp" && row.resource !== resource)) return json({ error: "invalid_grant" }, { status: 400 });
  if (client.requiresPkce && (row.code_challenge_method !== "S256" || !row.code_challenge || row.code_challenge !== await pkceS256(verifier))) return json({ error: "invalid_grant" }, { status: 400 });
  if (!client.requiresPkce && (row.code_challenge || row.code_challenge_method)) return json({ error: "invalid_grant" }, { status: 400 });

  if (!row.user_email) return json({ error: "invalid_grant" }, { status: 400 });
  const activeUser = await env.DB.prepare("SELECT 1 AS active FROM oauth_users WHERE email = ? AND active = 1").bind(row.user_email.toLowerCase()).first<{ active: number }>();
  if (!activeUser) return json({ error: "invalid_grant" }, { status: 400 });
  const accessToken = randomToken();
  const familyId = client.kind === "mcp" && row.scope.split(/\s+/).includes(OFFLINE_ACCESS_SCOPE) ? randomToken() : undefined;
  const refreshToken = familyId ? randomToken() : undefined;
  const accessTokenLifetimeMs = await getAccessTokenLifetimeMs(env.DB);
  const accessExpiresAt = now + accessTokenLifetimeMs;
  const refreshExpiresAt = familyId ? now + REFRESH_TOKEN_TTL_SECONDS * 1000 : undefined;
  const issued = await createAuthorizationCodeGrant(env.DB, {
    codeHash: await hash(code),
    now,
    accessTokenHash: await hash(accessToken),
    accessExpiresAt,
    refreshTokenHash: refreshToken ? await hash(refreshToken) : undefined,
    refreshExpiresAt,
    familyId,
    clientId: requestedClient,
    userId: row.user_id,
    userEmail: row.user_email ?? "",
    scope: row.scope,
    resource: row.resource ?? resource,
  });
  if (!issued) return json({ error: "invalid_grant" }, { status: 400 });

  return json({
    access_token: accessToken,
    token_type: "Bearer",
    expires_in: Math.ceil(accessTokenLifetimeMs / 1000),
    ...(refreshToken && refreshExpiresAt ? {
      refresh_token: refreshToken,
      refresh_token_expires_in: REFRESH_TOKEN_TTL_SECONDS,
    } : {}),
    scope: row.scope,
    resource: row.resource ?? resource,
  });
}
