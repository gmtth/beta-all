import assert from "node:assert/strict";
import { test } from "node:test";
import { GPT_ACTION_CLIENT_ID, KNOWLEDGE_READ_SCOPE, KNOWLEDGE_WRITE_SCOPE, MCP_CLIENT_ID, OFFLINE_ACCESS_SCOPE, OAUTH_SCOPE, permissionLabelForScopes, validateAuthorizationRequest, validRedirectForClient, isOAuthTokenRecordValid, oauthTokenFailure } from "../app/oauth/clients.js";

const env = {};
const actionRedirect = "https://chat.openai.com/aip/action-123/oauth/callback";
const mcpRedirect = "https://chatgpt.com/connector/oauth/mcp-123";
const stableRedirect = "https://chatgpt.com/connector_platform_oauth_redirect";
const cimdClient = "https://chatgpt.com/oauth/client.json";
const codexCimdClient = "https://chatgpt.com/oauth/codex/client.json";
const loopbackRedirect = "http://127.0.0.1:61177/callback";

test("GPT Action accepts Authorization Code without PKCE", () => {
  assert.equal(validateAuthorizationRequest(GPT_ACTION_CLIENT_ID, "code", actionRedirect, OAUTH_SCOPE, "", "", env), true);
});

test("MCP requires PKCE S256", () => {
  assert.equal(validateAuthorizationRequest(MCP_CLIENT_ID, "code", mcpRedirect, OAUTH_SCOPE, "", "", env), false);
  assert.equal(validateAuthorizationRequest(MCP_CLIENT_ID, "code", mcpRedirect, OAUTH_SCOPE, "challenge", "plain", env), false);
  assert.equal(validateAuthorizationRequest(MCP_CLIENT_ID, "code", mcpRedirect, OAUTH_SCOPE, "challenge", "S256", env), true);
  assert.equal(validateAuthorizationRequest(MCP_CLIENT_ID, "code", stableRedirect, OAUTH_SCOPE, "challenge", "S256", env), true);
  assert.equal(validateAuthorizationRequest(cimdClient, "code", stableRedirect, OAUTH_SCOPE, "challenge", "S256", env), true);
  assert.equal(validateAuthorizationRequest(codexCimdClient, "code", loopbackRedirect, OAUTH_SCOPE, "challenge", "S256", env), true);
});

test("MCP accepts separate Movidesk and knowledge read scopes, while GPT Action remains Movidesk-only", () => {
  const combined = `${OAUTH_SCOPE} ${KNOWLEDGE_READ_SCOPE}`;
  assert.equal(validateAuthorizationRequest(MCP_CLIENT_ID, "code", mcpRedirect, KNOWLEDGE_READ_SCOPE, "challenge", "S256", env), true);
  assert.equal(validateAuthorizationRequest(MCP_CLIENT_ID, "code", mcpRedirect, combined, "challenge", "S256", env), true);
  assert.equal(validateAuthorizationRequest(GPT_ACTION_CLIENT_ID, "code", actionRedirect, KNOWLEDGE_READ_SCOPE, "", "", env), false);
  assert.equal(validateAuthorizationRequest(GPT_ACTION_CLIENT_ID, "code", actionRedirect, combined, "", "", env), false);
});

test("MCP can request the separate knowledge writer scope; GPT Action cannot", () => {
  const combined = `${OAUTH_SCOPE} ${KNOWLEDGE_WRITE_SCOPE}`;
  assert.equal(validateAuthorizationRequest(MCP_CLIENT_ID, "code", mcpRedirect, KNOWLEDGE_WRITE_SCOPE, "challenge", "S256", env), true);
  assert.equal(validateAuthorizationRequest(MCP_CLIENT_ID, "code", mcpRedirect, combined, "challenge", "S256", env), true);
  assert.equal(validateAuthorizationRequest(GPT_ACTION_CLIENT_ID, "code", actionRedirect, KNOWLEDGE_WRITE_SCOPE, "", "", env), false);
  assert.equal(validateAuthorizationRequest(GPT_ACTION_CLIENT_ID, "code", actionRedirect, combined, "", "", env), false);
});

test("MCP rejects unsupported or duplicate scopes", () => {
  assert.equal(validateAuthorizationRequest(MCP_CLIENT_ID, "code", mcpRedirect, "knowledge:admin", "challenge", "S256", env), false);
  assert.equal(validateAuthorizationRequest(MCP_CLIENT_ID, "code", mcpRedirect, `${KNOWLEDGE_READ_SCOPE} ${KNOWLEDGE_READ_SCOPE}`, "challenge", "S256", env), false);
});

test("offline access is available only to MCP authorization and is never a tool permission", () => {
  assert.equal(validateAuthorizationRequest(MCP_CLIENT_ID, "code", mcpRedirect, `${OAUTH_SCOPE} ${OFFLINE_ACCESS_SCOPE}`, "challenge", "S256", env), true);
  assert.equal(validateAuthorizationRequest(GPT_ACTION_CLIENT_ID, "code", actionRedirect, `${OAUTH_SCOPE} ${OFFLINE_ACCESS_SCOPE}`, "", "", env), false);
  const token = { client_id: MCP_CLIENT_ID, scope: `${OAUTH_SCOPE} ${OFFLINE_ACCESS_SCOPE}`, expires_at: 2_000, user_email: "analyst@example.com", resource: "https://beta.example/mcp/" };
  assert.equal(oauthTokenFailure(token, [OFFLINE_ACCESS_SCOPE], token.resource, 1_000), "invalid_token");
});

test("unknown clients, scopes, and redirects are rejected", () => {
  assert.equal(validateAuthorizationRequest("unknown", "code", actionRedirect, OAUTH_SCOPE, "", "", env), false);
  assert.equal(validateAuthorizationRequest(GPT_ACTION_CLIENT_ID, "code", actionRedirect, "other", "", "", env), false);
  assert.equal(validRedirectForClient(GPT_ACTION_CLIENT_ID, "https://evil.example/callback", env), false);
  assert.equal(validRedirectForClient(MCP_CLIENT_ID, actionRedirect, env), false);
});

test("consent labels match the scopes being granted", () => {
  assert.equal(permissionLabelForScopes(OAUTH_SCOPE), "Movidesk · leitura de tickets");
  assert.equal(permissionLabelForScopes(KNOWLEDGE_READ_SCOPE), "Base de conhecimento · leitura");
  assert.equal(permissionLabelForScopes(`${OAUTH_SCOPE} ${KNOWLEDGE_READ_SCOPE}`), "Movidesk · leitura de tickets + Base de conhecimento · leitura");
  assert.equal(permissionLabelForScopes(KNOWLEDGE_WRITE_SCOPE), "Base de conhecimento · inclusão de chamados");
  assert.equal(permissionLabelForScopes(`${OAUTH_SCOPE} ${OFFLINE_ACCESS_SCOPE}`), "Movidesk · leitura de tickets + Sessão contínua · renovação automática");
});

test("stored OAuth tokens must match the expected resource before authorizing", () => {
  const now = 1_800_000_000_000;
  const valid = {
    client_id: MCP_CLIENT_ID,
    scope: `${OAUTH_SCOPE} ${KNOWLEDGE_READ_SCOPE}`,
    expires_at: now + 60_000,
    user_email: "analyst@example.com",
    resource: "https://beta.example/mcp/",
  };
  assert.equal(isOAuthTokenRecordValid(valid, [OAUTH_SCOPE], "https://beta.example/mcp/", now), true);
  assert.equal(isOAuthTokenRecordValid(valid, [OAUTH_SCOPE], "https://beta.example/mcp/", now, "mcp"), true);
  assert.equal(isOAuthTokenRecordValid(valid, [OAUTH_SCOPE], "https://beta.example/mcp/", now, "gpt-action"), false);
  assert.equal(isOAuthTokenRecordValid(valid, [KNOWLEDGE_READ_SCOPE], "https://other.example/mcp/", now), false);
  assert.equal(isOAuthTokenRecordValid({ ...valid, resource: null }, [OAUTH_SCOPE], "https://beta.example/mcp/", now), false);
  assert.equal(isOAuthTokenRecordValid({ ...valid, resource: "https://beta.example/mcp" }, [OAUTH_SCOPE], "https://beta.example/mcp/", now), false);
});

test("stored OAuth tokens reject expiry, missing identity, unknown clients, and insufficient scopes", () => {
  const now = 1_800_000_000_000;
  const valid = {
    client_id: MCP_CLIENT_ID,
    scope: OAUTH_SCOPE,
    expires_at: now + 1,
    user_email: "analyst@example.com",
    resource: "https://beta.example/mcp/",
  };
  assert.equal(isOAuthTokenRecordValid(valid, [OAUTH_SCOPE], valid.resource, now), true);
  assert.equal(isOAuthTokenRecordValid({ ...valid, expires_at: now }, [OAUTH_SCOPE], valid.resource, now), false);
  assert.equal(isOAuthTokenRecordValid({ ...valid, user_email: null }, [OAUTH_SCOPE], valid.resource, now), false);
  assert.equal(isOAuthTokenRecordValid({ ...valid, client_id: "unknown" }, [OAUTH_SCOPE], valid.resource, now), false);
  assert.equal(isOAuthTokenRecordValid(valid, [KNOWLEDGE_READ_SCOPE], valid.resource, now), false);
  assert.equal(oauthTokenFailure(valid, [KNOWLEDGE_READ_SCOPE], valid.resource, now), "insufficient_scope");
  assert.equal(oauthTokenFailure({ ...valid, expires_at: now }, [OAUTH_SCOPE], valid.resource, now), "invalid_token");
});
