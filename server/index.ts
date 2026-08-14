import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js";
import { MovideskClient } from "../src/movidesk-client.js";
import { bearerToken, loadProxyOAuthConfig, oauthAuthorizationServerMetadata, protectedResourceMetadata } from "../src/auth.js";
import { registerTools } from "../src/tools/index.js";

type Env = Record<string, string | undefined> & { OAUTH_PROXY_URL: string; OAUTH_CLIENT_ID: string; MCP_PUBLIC_URL: string };

const corsHeaders = {
  "access-control-allow-origin": "https://chatgpt.com",
  "access-control-allow-methods": "GET, POST, OPTIONS",
  "access-control-allow-headers": "Authorization, Content-Type, Accept, MCP-Protocol-Version, Last-Event-ID",
  "access-control-expose-headers": "WWW-Authenticate, MCP-Session-Id",
};
const withCors = (response: Response) => new Response(response.body, { status: response.status, statusText: response.statusText, headers: { ...Object.fromEntries(response.headers), ...corsHeaders } });
const json = (data: unknown, init: ResponseInit = {}) => new Response(JSON.stringify(data), { ...init, headers: { "content-type": "application/json", ...corsHeaders, ...(init.headers ?? {}) } });
const landingPage = () => `<!doctype html>
<html lang="pt-BR"><head><meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1" /><title>Movidesk MCP · status</title>
<style>
:root{color-scheme:dark;--bg:#08090d;--line:rgba(255,255,255,.11);--muted:#a4a9b8;--text:#f7f8fb}*{box-sizing:border-box}body{margin:0;min-height:100vh;display:grid;place-items:center;padding:24px;font:15px/1.6 Inter,ui-sans-serif,system-ui,sans-serif;color:var(--text);background:radial-gradient(circle at 82% 10%,rgba(255,24,57,.2),transparent 28rem),radial-gradient(circle at 12% 90%,rgba(117,71,255,.16),transparent 28rem),var(--bg)}.hero-card{width:min(440px,100%);position:relative;overflow:hidden;padding:25px;border:1px solid var(--line);border-radius:22px;background:linear-gradient(145deg,rgba(33,35,46,.86),rgba(13,14,20,.9));box-shadow:0 20px 80px rgba(0,0,0,.28)}.hero-card:before{content:"";position:absolute;inset:-80px -100px auto auto;width:230px;height:230px;border-radius:50%;background:#ff2442;filter:blur(60px);opacity:.23}.card-kicker{position:relative;display:flex;justify-content:space-between;color:var(--muted);font-size:12px;letter-spacing:.04em}.live{color:#66e38f}.terminal{position:relative;margin:30px 0 18px;padding:17px;border:1px solid rgba(255,255,255,.08);border-radius:14px;background:#0a0b10;color:#d8dbea;font:12px/1.8 ui-monospace,SFMono-Regular,Menlo,monospace}.terminal .prompt{color:#ff9c22}.terminal .ok{color:#72df91}.status-row{position:relative;display:flex;justify-content:space-between;align-items:center;gap:12px;padding-top:17px;border-top:1px solid var(--line);color:var(--muted);font-size:12px}.pill{padding:4px 9px;border-radius:999px;color:#a8edbb;background:rgba(88,224,137,.1)}
</style></head><body><main class="hero-card"><div class="card-kicker"><span>STATUS DO SERVIÇO</span><span class="live">● online</span></div><div class="terminal"><div><span class="prompt">$</span> GET /health</div><div class="ok">{ "status": "ok" }</div><br /><div><span class="prompt">$</span> POST /mcp</div><div class="ok">Streamable HTTP · OAuth Bearer</div></div><div class="status-row"><span>Recurso protegido</span><span class="pill">movidesk:read</span></div></main></body></html>`;
const createMcpServer = (env: Env, accessToken: string) => { const server = new McpServer({ name: "movidesk-mcp", version: "1.0.0" }); registerTools(server, new MovideskClient({ proxyUrl: env.OAUTH_PROXY_URL as string }), accessToken); return server; };

export default { async fetch(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);
  const config = loadProxyOAuthConfig(env);
  if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: corsHeaders });
  if (request.method === "GET" && url.pathname === "/") return new Response(landingPage(), { status: 200, headers: { "content-type": "text/html; charset=utf-8", "cache-control": "public, max-age=60", ...corsHeaders } });
  if (request.method === "GET" && url.pathname === "/health") return json({ status: "ok" });
  const protectedResourceMetadataPaths = new Set(["/.well-known/oauth-protected-resource", "/.well-known/oauth-protected-resource/mcp", "/mcp/.well-known/oauth-protected-resource"]);
  const authorizationServerMetadataPaths = new Set(["/.well-known/oauth-authorization-server", "/.well-known/oauth-authorization-server/mcp", "/mcp/.well-known/oauth-authorization-server"]);
  if (request.method === "GET" && protectedResourceMetadataPaths.has(url.pathname)) return json(protectedResourceMetadata(config), { headers: { "cache-control": "public, max-age=300" } });
  if (request.method === "GET" && authorizationServerMetadataPaths.has(url.pathname)) return json(oauthAuthorizationServerMetadata(config), { headers: { "cache-control": "public, max-age=300" } });
  if (url.pathname !== "/mcp" || request.method !== "POST") return new Response("Not found", { status: 404, headers: corsHeaders });
  const accessToken = bearerToken(request.headers.get("authorization") ?? undefined); if (!accessToken) { const metadata = config.publicUrl + "/.well-known/oauth-protected-resource"; return json({ error: "invalid_token" }, { status: 401, headers: { "www-authenticate": 'Bearer resource_metadata="' + metadata + '", scope="' + config.scope + '"' } }); }
  const transport = new WebStandardStreamableHTTPServerTransport({ sessionIdGenerator: undefined }); const server = createMcpServer(env, accessToken); await server.connect(transport); return withCors(await transport.handleRequest(request));
} };
