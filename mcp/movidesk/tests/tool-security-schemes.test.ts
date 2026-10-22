import assert from "node:assert/strict";
import { test } from "node:test";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { exposeToolSecuritySchemes } from "../worker/tool-security-schemes";
import { registerKnowledgeTools, type KnowledgeStore } from "../worker/knowledge-tools";
import type { ToolSecurityScheme } from "../worker/tool-security-schemes";

test("tools/list emits the configured per-tool OAuth security schemes", async () => {
  const server = new McpServer({ name: "test", version: "1.0.0" });
  server.registerTool("ticket_read", {
    description: "Read a ticket",
    inputSchema: {},
    securitySchemes: [{ type: "oauth2", scopes: ["movidesk:read"] }],
  } as never, async () => ({ content: [{ type: "text", text: "ok" }] }));
  server.registerTool("sources_list", {
    description: "List sources",
    inputSchema: {},
    securitySchemes: [{ type: "oauth2", scopes: ["knowledge:read"] }],
  } as never, async () => ({ content: [{ type: "text", text: "ok" }] }));

  exposeToolSecuritySchemes(server, new Map([
    ["ticket_read", [{ type: "oauth2", scopes: ["movidesk:read"] }]],
    ["sources_list", [{ type: "oauth2", scopes: ["knowledge:read"] }]],
  ]));

  const listHandler = (server.server as unknown as {
    _requestHandlers: Map<string, (request: unknown, extra: unknown) => Promise<{ tools: Array<Record<string, unknown>> }>>;
  })._requestHandlers.get("tools/list");
  assert.ok(listHandler);
  const { tools } = await listHandler({ method: "tools/list", params: {} }, {});
  assert.deepEqual(tools.map(({ name, securitySchemes }) => ({ name, securitySchemes })), [
    { name: "ticket_read", securitySchemes: [{ type: "oauth2", scopes: ["movidesk:read"] }] },
    { name: "sources_list", securitySchemes: [{ type: "oauth2", scopes: ["knowledge:read"] }] },
  ]);
  await server.close();
});

test("tools/list exposes knowledge_search with only the knowledge:read scope", async () => {
  const server = new McpServer({ name: "test", version: "1.0.0" });
  const schemesByTool = new Map<string, ToolSecurityScheme[]>();
  const instrumented = {
    registerTool(name: string, config: unknown, handler: (...args: never[]) => Promise<unknown>) {
      const schemes = (config as { securitySchemes?: ToolSecurityScheme[] }).securitySchemes;
      if (schemes) schemesByTool.set(name, schemes);
      server.registerTool(name, config as never, handler as never);
    },
  };
  const reader: KnowledgeStore = {
    listSources: async () => [],
    searchRecords: async () => [],
    importMovideskTicket: async () => ({ recordId: "1", chunkCount: 1 }),
  };
  registerKnowledgeTools(instrumented, reader, {
    resource: "https://beta.example/mcp/",
    authorizeRead: async () => ({ authorized: false, error: "invalid_token" }),
    authorizeImport: async () => ({ authorized: false, error: "invalid_token" }),
    getMovideskTicket: async () => null,
  });
  exposeToolSecuritySchemes(server, schemesByTool);

  const listHandler = (server.server as unknown as {
    _requestHandlers: Map<string, (request: unknown, extra: unknown) => Promise<{ tools: Array<Record<string, unknown>> }>>;
  })._requestHandlers.get("tools/list");
  assert.ok(listHandler);
  const { tools } = await listHandler({ method: "tools/list", params: {} }, {});
  assert.ok(schemesByTool.has("knowledge_search"), [...schemesByTool.keys()].join(", "));
  const search = tools.find(({ name }) => name === "knowledge_search");
  assert.ok(search);
  assert.deepEqual(search.securitySchemes, [{ type: "oauth2", scopes: ["knowledge:read"] }]);
  await server.close();
});
