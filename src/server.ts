import "dotenv/config";
import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { MovideskClient } from "./movidesk-client.js";
import { registerTools } from "./tools/index.js";
import { bearerToken, loadProxyOAuthConfig, oauthAuthorizationServerMetadata, protectedResourceMetadata, unauthorized } from "./auth.js";
const port = Number(process.env.PORT ?? 3000);
const authConfig = loadProxyOAuthConfig(process.env);
const body = async (req: IncomingMessage) => { let value = ""; for await (const chunk of req) value += chunk; return value ? JSON.parse(value) : undefined; };
const metadataPaths = (path: string, kind: "resource" | "authorization") => kind === "resource"
  ? new Set(["/.well-known/oauth-protected-resource", "/.well-known/oauth-protected-resource/mcp", "/mcp/.well-known/oauth-protected-resource"]).has(path)
  : new Set(["/.well-known/oauth-authorization-server", "/.well-known/oauth-authorization-server/mcp", "/mcp/.well-known/oauth-authorization-server"]).has(path);
const httpServer = createServer(async (req: IncomingMessage, res: ServerResponse) => {
  try {
    if (req.method === "OPTIONS") { res.writeHead(204, { "access-control-allow-origin": "https://chatgpt.com", "access-control-allow-methods": "GET, POST, OPTIONS", "access-control-allow-headers": "Authorization, Content-Type, Accept, MCP-Protocol-Version, Last-Event-ID" }); res.end(); return; }
    if (req.method === "GET" && req.url === "/health") { res.writeHead(200, { "content-type": "application/json" }); res.end(JSON.stringify({ status: "ok" })); return; }
    const path = new URL(req.url ?? "/", "http://localhost").pathname;
    if (req.method === "GET" && metadataPaths(path, "resource")) { res.writeHead(200, { "content-type": "application/json", "cache-control": "public, max-age=300" }); res.end(JSON.stringify(protectedResourceMetadata(authConfig))); return; }
    if (req.method === "GET" && metadataPaths(path, "authorization")) { res.writeHead(200, { "content-type": "application/json", "cache-control": "public, max-age=300" }); res.end(JSON.stringify(oauthAuthorizationServerMetadata(authConfig))); return; }
    if (path === "/mcp") {
      if (!bearerToken(req.headers.authorization)) { unauthorized(authConfig, res); return; }
    }
    if (!(["GET", "POST", "DELETE"].includes(req.method ?? "")) || path !== "/mcp") { res.writeHead(404); res.end("Not found"); return; }
    const accessToken = bearerToken(req.headers.authorization) as string; const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined }); const server = new McpServer({ name: "movidesk-mcp", version: "1.0.0" }); registerTools(server, new MovideskClient({ proxyUrl: process.env.OAUTH_PROXY_URL as string }), accessToken); await server.connect(transport); await transport.handleRequest(req, res, await body(req));
  } catch { if (!res.headersSent) { res.writeHead(500, { "content-type": "application/json" }); res.end(JSON.stringify({ error: "Internal server error" })); } }
});
httpServer.listen(port, "0.0.0.0", () => console.log("movidesk-mcp listening on port " + port));
