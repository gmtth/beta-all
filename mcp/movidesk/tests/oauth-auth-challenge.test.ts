import assert from "node:assert/strict";
import { test } from "node:test";
import { bearerAuthenticateChallenge, mcpAuthorizationError, missingMcpAuthorizationResponse, protectedResourceMetadataUrl } from "../worker/oauth-auth-challenge";
import { OFFLINE_ACCESS_SCOPE, SUPPORTED_RESOURCE_SCOPES } from "../app/oauth/clients";
import { authorizationServerMetadata, protectedResourceMetadata } from "../app/oauth/metadata";

test("invalid token challenge advertises safe reconnection metadata", () => {
  const result = mcpAuthorizationError("invalid_token", "https://beta.example/mcp/", []);
  assert.equal(result.isError, true);
  assert.match(result.content[0].text, /Reconecte sua conta/);
  assert.deepEqual(result._meta["mcp/www_authenticate"], [
    'Bearer error="invalid_token", error_description="A conexão expirou ou foi revogada. Reconecte sua conta para continuar.", resource_metadata="https://beta.example/.well-known/oauth-protected-resource"',
  ]);
});

test("insufficient scope challenge identifies the missing scopes", () => {
  const result = mcpAuthorizationError("insufficient_scope", "https://beta.example/mcp/", ["knowledge:read"]);
  assert.equal(result.isError, true);
  assert.ok(result._meta["mcp/www_authenticate"][0].includes('error="insufficient_scope"'));
  assert.ok(result._meta["mcp/www_authenticate"][0].includes('scope="knowledge:read"'));
  assert.doesNotMatch(JSON.stringify(result), /token|secret|analyst@example/);
});

test("HTTP 401 uses the same invalid-token challenge and canonical metadata URL", async () => {
  const resource = "https://beta.example/mcp/";
  const response = missingMcpAuthorizationResponse(resource);
  assert.equal(response.status, 401);
  assert.deepEqual(await response.json(), { error: "invalid_token" });
  assert.equal(response.headers.get("www-authenticate"), bearerAuthenticateChallenge("invalid_token", resource));
  assert.match(response.headers.get("www-authenticate") ?? "", /error="invalid_token"/);
  assert.match(response.headers.get("www-authenticate") ?? "", /error_description="[^"]+"/);
  assert.equal(protectedResourceMetadataUrl(resource), "https://beta.example/.well-known/oauth-protected-resource");
});

test("OAuth discovery and protected-resource metadata agree on issuer, scopes, and implemented endpoints", () => {
  const origin = "https://beta.example";
  const scopes = [...SUPPORTED_RESOURCE_SCOPES];
  const resource = protectedResourceMetadata(origin, scopes);
  const authorizationScopes: string[] = [...scopes, OFFLINE_ACCESS_SCOPE];
  const authorization = authorizationServerMetadata(origin, authorizationScopes, ["movidesk-mcp-app"]);
  assert.equal(resource.resource, `${origin}/mcp/`);
  assert.deepEqual(resource.authorization_servers, [authorization.issuer]);
  assert.deepEqual(resource.scopes_supported, scopes);
  assert.ok(authorization.scopes_supported.includes(OFFLINE_ACCESS_SCOPE));
  assert.ok(!(resource.scopes_supported as readonly string[]).includes(OFFLINE_ACCESS_SCOPE));
  assert.equal(authorization.authorization_endpoint, `${origin}/oauth/authorize`);
  assert.equal(authorization.token_endpoint, `${origin}/oauth/token`);
  assert.deepEqual(authorization.grant_types_supported, ["authorization_code", "refresh_token"]);
  assert.deepEqual(authorization.code_challenge_methods_supported, ["S256"]);
});
