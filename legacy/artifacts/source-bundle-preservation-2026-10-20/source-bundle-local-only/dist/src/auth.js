export const loadProxyOAuthConfig = (env) => {
    const publicUrl = (env.MCP_PUBLIC_URL ?? "").replace(/\/$/, "");
    const proxyUrl = (env.OAUTH_PROXY_URL ?? "").replace(/\/$/, "");
    const scope = env.OAUTH_SCOPE ?? "movidesk:read";
    const clientId = env.OAUTH_CLIENT_ID ?? "";
    if (!publicUrl || !proxyUrl || !clientId)
        throw new Error("MCP_PUBLIC_URL, OAUTH_PROXY_URL and OAUTH_CLIENT_ID are required");
    new URL(publicUrl);
    new URL(proxyUrl);
    return { publicUrl, authorizationEndpoint: proxyUrl + "/oauth/authorize", tokenEndpoint: proxyUrl + "/oauth/token", scope, resource: publicUrl + "/mcp/", clientId };
};
export const oauthAuthorizationServerMetadata = (config) => ({
    issuer: config.authorizationEndpoint.replace(/\/oauth\/authorize$/, ""),
    authorization_endpoint: config.authorizationEndpoint,
    token_endpoint: config.tokenEndpoint,
    response_types_supported: ["code"],
    grant_types_supported: ["authorization_code", "refresh_token"],
    token_endpoint_auth_methods_supported: ["none", "client_secret_post"],
    code_challenge_methods_supported: ["S256"],
    scopes_supported: [config.scope]
});
export const protectedResourceMetadata = (config) => ({
    resource: config.resource,
    authorization_servers: [config.authorizationEndpoint.replace(/\/oauth\/authorize$/, "")],
    scopes_supported: [config.scope],
    bearer_methods_supported: ["header"]
});
export const bearerToken = (authorization) => authorization?.match(/^Bearer\s+([^\s]+)$/i)?.[1];
export const unauthorized = (config, res) => {
    const metadata = config.publicUrl + "/.well-known/oauth-protected-resource";
    res.writeHead(401, { "content-type": "application/json", "www-authenticate": `Bearer resource_metadata="${metadata}", scope="${config.scope}"` });
    res.end(JSON.stringify({ error: "invalid_token" }));
};
