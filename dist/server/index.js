import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js";
import { MovideskClient } from "../src/movidesk-client.js";
import { bearerToken, loadProxyOAuthConfig, oauthAuthorizationServerMetadata, protectedResourceMetadata } from "../src/auth.js";
import { registerTools } from "../src/tools/index.js";
const json = (data, init = {}) => new Response(JSON.stringify(data), { ...init, headers: { "content-type": "application/json", ...(init.headers ?? {}) } });
const createMcpServer = (env, accessToken) => { const server = new McpServer({ name: "movidesk-mcp", version: "1.0.0" }); registerTools(server, new MovideskClient({ proxyUrl: env.OAUTH_PROXY_URL }), accessToken); return server; };
export async function handleDiscovery(request) {
    if (request.headers.get("mcp-method") !== "server/discover")
        return null;
    let body;
    try {
        body = await request.clone().json();
    }
    catch {
        return null;
    }
    return json({
        jsonrpc: "2.0",
        id: body.id ?? null,
        error: { code: -32601, message: "Method not found: server/discover" },
    }, { status: 404 });
}
export default { async fetch(request, env) {
        const url = new URL(request.url);
        const pathname = url.pathname.replace(/\/+$/, "") || "/";
        const isMcpEndpoint = url.pathname === "/mcp" || url.pathname === "/mcp/";
        const config = loadProxyOAuthConfig(env);
        if (request.method === "GET" && pathname === "/health")
            return json({ status: "ok" });
        const protectedResourceMetadataPaths = new Set([
            "/.well-known/oauth-protected-resource",
            "/.well-known/oauth-protected-resource/mcp",
            "/mcp/.well-known/oauth-protected-resource",
        ]);
        const authorizationServerMetadataPaths = new Set([
            "/.well-known/oauth-authorization-server",
            "/.well-known/oauth-authorization-server/mcp",
            "/mcp/.well-known/oauth-authorization-server",
        ]);
        if (request.method === "GET" && protectedResourceMetadataPaths.has(pathname))
            return json(protectedResourceMetadata(config), { headers: { "cache-control": "public, max-age=300" } });
        if (request.method === "GET" && authorizationServerMetadataPaths.has(pathname))
            return json(oauthAuthorizationServerMetadata(config), { headers: { "cache-control": "public, max-age=300" } });
        if (!isMcpEndpoint || request.method !== "POST")
            return new Response("Not found", { status: 404 });
        const accessToken = bearerToken(request.headers.get("authorization") ?? undefined);
        if (!accessToken) {
            const metadata = config.publicUrl + "/.well-known/oauth-protected-resource";
            return json({ error: "invalid_token" }, { status: 401, headers: { "www-authenticate": 'Bearer resource_metadata="' + metadata + '", scope="' + config.scope + '"' } });
        }
        const discovery = await handleDiscovery(request);
        if (discovery)
            return discovery;
        const transport = new WebStandardStreamableHTTPServerTransport({ sessionIdGenerator: undefined });
        const server = createMcpServer(env, accessToken);
        await server.connect(transport);
        return transport.handleRequest(request);
    } };
