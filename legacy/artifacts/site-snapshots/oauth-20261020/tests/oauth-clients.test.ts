import assert from "node:assert/strict";
import { test } from "node:test";
import { GPT_ACTION_CLIENT_ID, MCP_CLIENT_ID, OAUTH_SCOPE, validateAuthorizationRequest, validRedirectForClient } from "../app/oauth/clients.js";

const env = {};
const actionRedirect = "https://chat.openai.com/aip/action-123/oauth/callback";
const mcpRedirect = "https://chatgpt.com/connector/oauth/mcp-123";

test("GPT Action accepts Authorization Code without PKCE", () => {
  assert.equal(validateAuthorizationRequest(GPT_ACTION_CLIENT_ID, "code", actionRedirect, OAUTH_SCOPE, "", "", env), true);
});

test("MCP requires PKCE S256", () => {
  assert.equal(validateAuthorizationRequest(MCP_CLIENT_ID, "code", mcpRedirect, OAUTH_SCOPE, "", "", env), false);
  assert.equal(validateAuthorizationRequest(MCP_CLIENT_ID, "code", mcpRedirect, OAUTH_SCOPE, "challenge", "plain", env), false);
  assert.equal(validateAuthorizationRequest(MCP_CLIENT_ID, "code", mcpRedirect, OAUTH_SCOPE, "challenge", "S256", env), true);
});

test("unknown clients, scopes, and redirects are rejected", () => {
  assert.equal(validateAuthorizationRequest("unknown", "code", actionRedirect, OAUTH_SCOPE, "", "", env), false);
  assert.equal(validateAuthorizationRequest(GPT_ACTION_CLIENT_ID, "code", actionRedirect, "other", "", "", env), false);
  assert.equal(validRedirectForClient(GPT_ACTION_CLIENT_ID, "https://evil.example/callback", env), false);
  assert.equal(validRedirectForClient(MCP_CLIENT_ID, actionRedirect, env), false);
});
