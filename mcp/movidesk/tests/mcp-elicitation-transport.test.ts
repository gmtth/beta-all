import assert from "node:assert/strict";
import { test } from "node:test";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js";
import { ElicitRequestSchema } from "@modelcontextprotocol/sdk/types.js";

type ElicitationAction = "accept" | "decline" | "cancel";
type ProbeResult = { isError?: boolean; content: Array<{ type: string; text: string }> };

const asProbeResult = (result: unknown) => result as ProbeResult;

function createProbeServer() {
  const server = new McpServer({ name: "elicitation-transport-probe", version: "0.0.1" });
  server.registerTool("probe_confirmation", { inputSchema: {} }, async (_args, extra) => {
    const result = await server.server.elicitInput({
      mode: "form",
      message: "Confirme a prova local de elicitação MCP. Nenhum dado será alterado.",
      requestedSchema: {
        type: "object",
        properties: { confirm: { type: "boolean", title: "Confirmar prova local" } },
        required: ["confirm"],
      },
    }, { relatedRequestId: extra.requestId });
    return { content: [{ type: "text", text: JSON.stringify(result) }] };
  });
  return server;
}

function createProbeClient(
  action: ElicitationAction,
  options: { advertisesElicitation?: boolean; content?: Record<string, unknown>; waitForever?: boolean } = {},
) {
  const client = new Client(
    { name: "elicitation-transport-probe-client", version: "0.0.1" },
    options.advertisesElicitation === false ? {} : { capabilities: { elicitation: { form: {} } } },
  );
  if (options.advertisesElicitation !== false) {
    client.setRequestHandler(ElicitRequestSchema, async () => options.waitForever
      ? new Promise(() => {})
      : {
        action,
        ...(action === "accept" ? { content: options.content ?? { confirm: true } } : {}),
      });
  }
  return client;
}

async function callThroughSessionfulTransport(
  action: ElicitationAction,
  options: { advertisesElicitation?: boolean; content?: Record<string, unknown>; waitForever?: boolean; timeout?: number } = {},
) {
  const server = createProbeServer();
  const serverTransport = new WebStandardStreamableHTTPServerTransport({ sessionIdGenerator: () => crypto.randomUUID() });
  await server.connect(serverTransport);

  const client = createProbeClient(action, options);
  const clientTransport = new StreamableHTTPClientTransport(new URL("https://probe.invalid/mcp"), {
    fetch: (input, init) => serverTransport.handleRequest(new Request(input, init)),
  });
  try {
    await client.connect(clientTransport);
    return asProbeResult(await client.callTool(
      { name: "probe_confirmation", arguments: {} },
      undefined,
      { timeout: options.timeout ?? 5_000 },
    ));
  } finally {
    await client.close();
    await serverTransport.close();
  }
}

test("sessionful Streamable HTTP carries accept, decline, and cancel elicitation results", async () => {
  for (const action of ["accept", "decline", "cancel"] as const) {
    const result = await callThroughSessionfulTransport(action);
    assert.equal(result.isError, undefined, `${action} should complete without a protocol error`);
    assert.deepEqual(JSON.parse(result.content[0].text), {
      action,
      ...(action === "accept" ? { content: { confirm: true } } : {}),
    });
  }
});

test("missing capability and malformed accepted content fail closed", async () => {
  const noCapability = await callThroughSessionfulTransport("accept", { advertisesElicitation: false });
  assert.equal(noCapability.isError, true);
  assert.match(noCapability.content[0].text, /Client does not support form elicitation/);

  const malformedAnswer = await callThroughSessionfulTransport("accept", { content: { confirm: "yes" } });
  assert.equal(malformedAnswer.isError, true);
  assert.match(malformedAnswer.content[0].text, /Elicitation response content does not match requested schema/);
});

test("an unanswered elicitation times out without producing a tool result", async () => {
  await assert.rejects(
    callThroughSessionfulTransport("accept", { waitForever: true, timeout: 100 }),
    /timed out|timeout/i,
  );
});

test("a fresh stateless server per POST loses the negotiated elicitation capability", async () => {
  const client = createProbeClient("accept");
  const clientTransport = new StreamableHTTPClientTransport(new URL("https://probe.invalid/mcp"), {
    fetch: async (input, init) => {
      const server = createProbeServer();
      const serverTransport = new WebStandardStreamableHTTPServerTransport({ sessionIdGenerator: undefined });
      await server.connect(serverTransport);
      return serverTransport.handleRequest(new Request(input, init));
    },
  });

  try {
    await client.connect(clientTransport);
    const result = asProbeResult(await client.callTool({ name: "probe_confirmation", arguments: {} }, undefined, { timeout: 5_000 }));
    assert.equal(result.isError, true);
    assert.match(result.content[0].text, /Client does not support form elicitation/);
  } finally {
    await client.close();
  }
});
