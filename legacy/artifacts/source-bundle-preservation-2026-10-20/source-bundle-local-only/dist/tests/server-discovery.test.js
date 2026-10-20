import assert from "node:assert/strict";
import { test } from "node:test";
import { handleDiscovery } from "../server/index.js";
test("server discovery returns a legacy fallback response", async () => {
    const response = await handleDiscovery(new Request("https://example.com/mcp/", {
        method: "POST",
        headers: { "mcp-method": "server/discover", "content-type": "application/json" },
        body: JSON.stringify({ jsonrpc: "2.0", id: "discover-1", method: "server/discover" }),
    }));
    assert.equal(response?.status, 404);
    assert.deepEqual(await response?.json(), {
        jsonrpc: "2.0",
        id: "discover-1",
        error: { code: -32601, message: "Method not found: server/discover" },
    });
});
