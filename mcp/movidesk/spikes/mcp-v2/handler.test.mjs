import assert from "node:assert/strict";
import test from "node:test";
import { Client, StreamableHTTPClientTransport } from "@modelcontextprotocol/client";
import { createSpikeHandler } from "./handler.mjs";

const url = new URL("https://spike.invalid/mcp-v2-spike");

async function connect(token, answer = "accept") {
  const handler = createSpikeHandler();
  const client = new Client({ name: "local-test", version: "0.0.1" }, {
    capabilities: { elicitation: { form: {} } },
    versionNegotiation: { mode: "auto" },
  });
  client.setRequestHandler("elicitation/create", async () => answer === "accept"
    ? { action: "accept", content: { confirmed: true } }
    : { action: answer });
  const transport = new StreamableHTTPClientTransport(url, {
    fetch: (input, init) => handler.fetch(new Request(input, {
      ...init,
      headers: { ...Object.fromEntries(new Headers(init?.headers)), authorization: `Bearer ${token}` },
    })),
  });
  await client.connect(transport);
  return { client, transport };
}

test("tool manifest keeps per-tool security schemes at the expected wire level", async () => {
  const handler = createSpikeHandler();
  let wireTools;
  const client = new Client({ name: "local-test", version: "0.0.1" }, { versionNegotiation: { mode: "auto" } });
  const transport = new StreamableHTTPClientTransport(url, {
    fetch: async (input, init) => {
      const response = await handler.fetch(new Request(input, {
        ...init, headers: { ...Object.fromEntries(new Headers(init?.headers)), authorization: "Bearer valid-test-token" },
      }));
      const body = await response.clone().json();
      wireTools = body.result?.tools ?? body.tools;
      return response;
    },
  });
  await client.connect(transport);
  await client.listTools();
  assert.deepEqual(wireTools.map(({ name, securitySchemes: schemes }) => [name, schemes]), [
    ["spike_read", [{ type: "oauth2", scopes: ["movidesk:read"] }]],
    ["spike_confirm", [{ type: "oauth2", scopes: ["movidesk:write"] }]],
  ]);
});

test("OAuth token is rechecked on each round trip before the tool runs", async () => {
  let calls = 0;
  const handler = createSpikeHandler(async (token, scopes) => {
    calls += 1;
    return token === "valid-test-token" && scopes.includes("movidesk:write");
  });
  const client = new Client({ name: "local-test", version: "0.0.1" }, {
    capabilities: { elicitation: { form: {} } }, versionNegotiation: { mode: "auto" },
  });
  client.setRequestHandler("elicitation/create", async () => ({ action: "accept", content: { confirmed: true } }));
  const transport = new StreamableHTTPClientTransport(url, {
    fetch: (input, init) => handler.fetch(new Request(input, {
      ...init, headers: { ...Object.fromEntries(new Headers(init?.headers)), authorization: "Bearer valid-test-token" },
    })),
  });
  await client.connect(transport);
  const result = await client.callTool({ name: "spike_confirm", arguments: {} });
  assert.match(result.content[0].text, /nenhuma escrita executada/);
  assert.ok(calls >= 2, `esperadas verificações na chamada inicial e na rodada de resposta; recebidas ${calls}`);
});

test("valid OAuth token can call the isolated read-only tool", async () => {
  const { client } = await connect("valid-test-token");
  const result = await client.callTool({ name: "spike_read", arguments: {} });
  assert.equal(result.content[0].text, "leitura autorizada");
});

test("missing or invalid token cannot call the isolated read-only tool", async () => {
  const handler = createSpikeHandler();
  const client = new Client({ name: "local-test", version: "0.0.1" }, { versionNegotiation: { mode: "auto" } });
  const transport = new StreamableHTTPClientTransport(url, {
    fetch: (input, init) => handler.fetch(new Request(input, {
      ...init, headers: { ...Object.fromEntries(new Headers(init?.headers)), authorization: "Bearer invalid-test-token" },
    })),
  });
  await client.connect(transport);
  const result = await client.callTool({ name: "spike_read", arguments: {} });
  assert.equal(result.isError, true);
  assert.match(result.content[0].text, /Não autorizado/);
});

test("decline and cancel never produce a successful simulation result", async () => {
  for (const action of ["decline", "cancel"]) {
    const { client } = await connect("valid-test-token", action);
    const result = await client.callTool({ name: "spike_confirm", arguments: {} });
    assert.equal(result.isError, true, `${action} should not complete as success`);
    await client.close();
  }
});
