export const GPT_ACTION_CLIENT_ID = "movidesk-gpt-action";
export const MCP_CLIENT_ID = "movidesk-mcp-app";
export const OAUTH_SCOPE = "movidesk:read";

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

export function validateAuthorizationRequest(clientId: string, responseType: string, redirectUri: string, scope: string, challenge: string, method: string, env: Record<string, string | undefined>) {
  const client = oauthClient(clientId);
  return Boolean(client && responseType === "code" && scope === OAUTH_SCOPE && validRedirectForClient(clientId, redirectUri, env) && (!client.requiresPkce || (challenge.length > 0 && method === "S256")));
}

export function clientSecretFor(clientId: string, env: Record<string, string | undefined>) {
  return clientId === GPT_ACTION_CLIENT_ID ? (env.OAUTH_GPT_ACTION_CLIENT_SECRET ?? "").trim() || null : null;
}
