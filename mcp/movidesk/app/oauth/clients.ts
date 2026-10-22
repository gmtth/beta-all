export const GPT_ACTION_CLIENT_ID = "movidesk-gpt-action";
export const MCP_CLIENT_ID = "movidesk-mcp-app";
export const OAUTH_SCOPE = "movidesk:read";
export const KNOWLEDGE_READ_SCOPE = "knowledge:read";
export const KNOWLEDGE_WRITE_SCOPE = "knowledge:write";
export const FEEDBACK_WRITE_SCOPE = "feedback:write";
export const BETA_TERMS_VERSION = "2026-10-22-v2";
export const OFFLINE_ACCESS_SCOPE = "offline_access";
export const SUPPORTED_RESOURCE_SCOPES = [OAUTH_SCOPE, KNOWLEDGE_READ_SCOPE, KNOWLEDGE_WRITE_SCOPE, FEEDBACK_WRITE_SCOPE] as const;
export const SUPPORTED_OAUTH_SCOPES = [...SUPPORTED_RESOURCE_SCOPES, OFFLINE_ACCESS_SCOPE] as const;
export const ACCESS_TOKEN_TTL_SECONDS = 30 * 24 * 60 * 60;
export const REFRESH_TOKEN_TTL_SECONDS = 90 * 24 * 60 * 60;

export type OAuthClient = {
  id: string;
  kind: "gpt-action" | "mcp";
  requiresPkce: boolean;
  stableRedirect: boolean;
};

export function oauthClient(id: string): OAuthClient | null {
  if (id === GPT_ACTION_CLIENT_ID) return { id, kind: "gpt-action", requiresPkce: false, stableRedirect: false };
  if (id === MCP_CLIENT_ID) return { id, kind: "mcp", requiresPkce: true, stableRedirect: true };
  if (id === "https://chatgpt.com/oauth/client.json") return { id, kind: "mcp", requiresPkce: true, stableRedirect: true };
  if (/^https:\/\/chatgpt\.com\/oauth\/[A-Za-z0-9_-]+\/client\.json$/.test(id)) return { id, kind: "mcp", requiresPkce: true, stableRedirect: false };
  return null;
}

export type OAuthTokenRecord = {
  client_id: string;
  scope: string;
  expires_at: number;
  user_email: string | null;
  resource: string | null;
};

export type OAuthTokenFailure = "invalid_token" | "insufficient_scope" | "terms_not_accepted";

export function oauthTokenFailure(
  row: OAuthTokenRecord | null,
  requiredScopes: readonly string[],
  expectedResource: string,
  now = Date.now(),
  expectedClientKind?: OAuthClient["kind"],
): OAuthTokenFailure | null {
  if (!row || !requiredScopes.length || !expectedResource) return "invalid_token";
  const client = oauthClient(row.client_id);
  if (!client || (expectedClientKind && client.kind !== expectedClientKind) || !row.user_email?.trim()) return "invalid_token";
  if (!row.resource || row.resource !== expectedResource) return "invalid_token";
  if (!Number.isFinite(row.expires_at) || row.expires_at <= now) return "invalid_token";
  if (requiredScopes.some((scope) => !(SUPPORTED_RESOURCE_SCOPES as readonly string[]).includes(scope))) return "invalid_token";
  const granted = new Set(row.scope.split(/\s+/).filter(Boolean));
  return requiredScopes.some((scope) => !granted.has(scope)) ? "insufficient_scope" : null;
}

/** Validate stored OAuth claims before user lookup or protected data access. */
export function isOAuthTokenRecordValid(
  row: OAuthTokenRecord | null,
  requiredScopes: readonly string[],
  expectedResource: string,
  now = Date.now(),
  expectedClientKind?: OAuthClient["kind"],
) {
  return oauthTokenFailure(row, requiredScopes, expectedResource, now, expectedClientKind) === null;
}

function csv(value: string | undefined) {
  return (value ?? "").split(",").map((item) => item.trim()).filter(Boolean);
}

function isOfficialGptActionRedirect(uri: string) {
  try {
    const parsed = new URL(uri);
    return parsed.origin === "https://chat.openai.com"
      && parsed.username === ""
      && parsed.password === ""
      && /^\/aip\/[A-Za-z0-9_-]+\/oauth\/callback$/.test(parsed.pathname)
      && parsed.search === ""
      && parsed.hash === "";
  } catch {
    return false;
  }
}

function isOfficialMcpRedirect(uri: string) {
  try {
    const parsed = new URL(uri);
    const connector = parsed.origin === "https://chatgpt.com"
      && (/^\/connector\/oauth\/[A-Za-z0-9_-]+$/.test(parsed.pathname)
        || parsed.pathname === "/connector_platform_oauth_redirect");
    const loopback = parsed.protocol === "http:"
      && parsed.hostname === "127.0.0.1"
      && parsed.port !== ""
      && (/^\/callback\/[A-Za-z0-9_-]+$/.test(parsed.pathname) || parsed.pathname === "/callback")
      && parsed.username === ""
      && parsed.password === ""
      && parsed.search === ""
      && parsed.hash === "";
    return connector || loopback;
  } catch {
    return false;
  }
}

export function supportsScopeRequest(clientId: string, scope: string) {
  const client = oauthClient(clientId);
  if (!client) return false;
  const requested = scope.split(" ").filter(Boolean);
  if (!requested.length || new Set(requested).size !== requested.length) return false;
  const supported = client.kind === "gpt-action" ? [OAUTH_SCOPE] : SUPPORTED_OAUTH_SCOPES;
  return requested.every((item) => (supported as readonly string[]).includes(item));
}

export function validRedirectForClient(clientId: string, uri: string, env: Record<string, string | undefined>) {
  const client = oauthClient(clientId);
  if (!client) return false;
  const official = client.kind === "gpt-action"
    ? isOfficialGptActionRedirect(uri)
    : isOfficialMcpRedirect(uri) && (client.stableRedirect || !uri.endsWith("/connector_platform_oauth_redirect"));
  if (!official) return false;
  const configured = client.kind === "gpt-action" ? csv(env.OAUTH_GPT_ACTION_REDIRECT_URIS) : csv(env.OAUTH_MCP_REDIRECT_URIS);
  return configured.length === 0 ? true : configured.includes(uri);
}

export function permissionLabelForScopes(scope: string) {
  const requested = new Set(scope.split(" ").filter(Boolean));
  const labels: string[] = [];
  if (requested.has(OAUTH_SCOPE)) labels.push("Movidesk · leitura de tickets");
  if (requested.has(KNOWLEDGE_READ_SCOPE)) labels.push("Base de conhecimento · leitura");
  if (requested.has(KNOWLEDGE_WRITE_SCOPE)) labels.push("Base de conhecimento · inclusão de chamados");
  if (requested.has(FEEDBACK_WRITE_SCOPE)) labels.push("Feedback da Beta · registro de avaliações e lacunas observadas");
  if (requested.has(OFFLINE_ACCESS_SCOPE)) labels.push("Sessão contínua · renovação automática");
  return labels.join(" + ");
}

export function validateAuthorizationRequest(clientId: string, responseType: string, redirectUri: string, scope: string, challenge: string, method: string, env: Record<string, string | undefined>) {
  const client = oauthClient(clientId);
  return Boolean(client && responseType === "code" && supportsScopeRequest(clientId, scope) && validRedirectForClient(clientId, redirectUri, env) && (!client.requiresPkce || (challenge.length > 0 && method === "S256")));
}

export function clientSecretFor(clientId: string, env: Record<string, string | undefined>) {
  return clientId === GPT_ACTION_CLIENT_ID ? (env.OAUTH_GPT_ACTION_CLIENT_SECRET ?? "").trim() || null : null;
}
