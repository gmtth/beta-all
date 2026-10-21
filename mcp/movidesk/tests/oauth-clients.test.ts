import assert from "node:assert/strict";
import { test } from "node:test";
import { GPT_ACTION_CLIENT_ID, KNOWLEDGE_READ_SCOPE, KNOWLEDGE_WRITE_SCOPE, MCP_CLIENT_ID, OAUTH_SCOPE, permissionLabelForScopes, validateAuthorizationRequest, validRedirectForClient } from "../app/oauth/clients.js";

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
});
