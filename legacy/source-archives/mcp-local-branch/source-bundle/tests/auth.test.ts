import assert from "node:assert/strict";
import { test } from "node:test";
import { bearerToken, loadProxyOAuthConfig, oauthAuthorizationServerMetadata, protectedResourceMetadata } from "../src/auth.js";

const env = { MCP_PUBLIC_URL: "https://mcp.example.com", OAUTH_PROXY_URL: "https://proxy.example.com", OAUTH_SCOPE: "movidesk:read", OAUTH_CLIENT_ID: "movidesk-gpt" };
test("proxy OAuth metadata is exposed without Auth0", () => { const config = loadProxyOAuthConfig(env); const metadata = oauthAuthorizationServerMetadata(config); assert.equal(metadata.authorization_endpoint, "https://proxy.example.com/oauth/authorize"); assert.equal(metadata.token_endpoint, "https://proxy.example.com/oauth/token"); assert.equal(protectedResourceMetadata(config).resource, "https://mcp.example.com/mcp/"); });
test("Bearer parsing accepts only an Authorization header token", () => { assert.equal(bearerToken("Bearer temporary-token"), "temporary-token"); assert.equal(bearerToken("Basic temporary-token"), undefined); assert.equal(bearerToken(undefined), undefined); });
