import assert from "node:assert/strict";
import { test } from "node:test";
import { handleDiscovery } from "../server/index.js";

test("server discovery advertises the supported legacy MCP protocol", async () => {
  const response = await handleDiscovery(new Request("https://example.com/mcp/", {
    method: "POST",
    headers: { "mcp-method": "server/discover", "content-type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: "discover-1", method: "server/discover" }),
  }));
  assert.equal(response?.status, 200);
  assert.deepEqual(await response?.json(), {
    jsonrpc: "2.0",
    id: "discover-1",
    result: {
      resultType: "complete",
      supportedVersions: ["2025-11-25"],
      capabilities: { tools: {} },
      _meta: { "io.modelcontextprotocol/serverInfo": { name: "movidesk-mcp", version: "1.0.0" } },
    },
  });
});
