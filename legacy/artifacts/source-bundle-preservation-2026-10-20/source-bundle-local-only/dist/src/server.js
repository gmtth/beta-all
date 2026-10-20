import "dotenv/config";
import { createServer } from "node:http";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { MovideskClient } from "./movidesk-client.js";
import { registerTools } from "./tools/index.js";
import { bearerToken, loadProxyOAuthConfig, oauthAuthorizationServerMetadata, protectedResourceMetadata, unauthorized } from "./auth.js";
const port = Number(process.env.PORT ?? 3000);
const authConfig = loadProxyOAuthConfig(process.env);
const body = async (req) => { let value = ""; for await (const chunk of req)
    value += chunk; return value ? JSON.parse(value) : undefined; };
const httpServer = createServer(async (req, res) => {
    try {
        if (req.method === "GET" && req.url === "/health") {
            res.writeHead(200, { "content-type": "application/json" });
            res.end(JSON.stringify({ status: "ok" }));
            return;
        }
        if (req.method === "GET" && req.url === "/.well-known/oauth-protected-resource") {
            res.writeHead(200, { "content-type": "application/json", "cache-control": "public, max-age=300" });
            res.end(JSON.stringify(protectedResourceMetadata(authConfig)));
            return;
        }
        if (req.method === "GET" && req.url === "/.well-known/oauth-authorization-server") {
            res.writeHead(200, { "content-type": "application/json", "cache-control": "public, max-age=300" });
            res.end(JSON.stringify(oauthAuthorizationServerMetadata(authConfig)));
            return;
        }
        if (req.url === "/mcp") {
            if (!bearerToken(req.headers.authorization)) {
                unauthorized(authConfig, res);
                return;
            }
        }
        if (req.method !== "POST" || req.url !== "/mcp") {
            res.writeHead(404);
            res.end("Not found");
            return;
        }
        const accessToken = bearerToken(req.headers.authorization);
        const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined });
        const server = new McpServer({ name: "movidesk-mcp", version: "1.0.0" });
        registerTools(server, new MovideskClient({ proxyUrl: process.env.OAUTH_PROXY_URL, siteAuthorization: process.env.OAUTH_PROXY_SITE_TOKEN }), accessToken);
        await server.connect(transport);
        await transport.handleRequest(req, res, await body(req));
    }
    catch {
        if (!res.headersSent) {
            res.writeHead(500, { "content-type": "application/json" });
            res.end(JSON.stringify({ error: "Internal server error" }));
        }
    }
});
httpServer.listen(port, "0.0.0.0", () => console.log("movidesk-mcp listening on port " + port));
