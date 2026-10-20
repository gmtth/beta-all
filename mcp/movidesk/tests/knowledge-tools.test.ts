import assert from "node:assert/strict";
import { test } from "node:test";
import { registerKnowledgeTools, type KnowledgeReader } from "../worker/knowledge-tools";

type RegisteredTool = { config: any; handler: (args: unknown) => Promise<any> };

function setup(reader: KnowledgeReader, authorize: () => Promise<boolean>) {
  const tools = new Map<string, RegisteredTool>();
  const server = { registerTool(name: string, config: any, handler: (args: unknown) => Promise<any>) { tools.set(name, { config, handler }); } };
  registerKnowledgeTools(server, reader, authorize);
  return tools;
}

test("knowledge_list_sources returns only bounded source summaries to authorized callers", async () => {
  const tools = setup({ listSources: async () => [{ id: "movidesk", name: "Movidesk" }] }, async () => true);
  const registered = tools.get("knowledge_list_sources")!;
  assert.equal(registered.config.annotations.readOnlyHint, true);
  assert.equal(registered.config.annotations.destructiveHint, false);
  assert.deepEqual(await registered.handler({}), {
    content: [{ type: "text", text: "1 fonte(s) listada(s)." }],
    structuredContent: { sources: [{ id: "movidesk", name: "Movidesk" }], total: 1 },
  });
});

test("knowledge_list_sources fails closed without knowledge:read authorization", async () => {
  const tools = setup({ listSources: async () => [{ id: "movidesk", name: "Movidesk" }] }, async () => false);
  const result = await tools.get("knowledge_list_sources")!.handler({});
  assert.equal(result.isError, true);
  assert.match(result.content[0].text, /Autorização ausente/);
});

test("knowledge_list_sources hides backend errors", async () => {
  const tools = setup({ listSources: async () => { throw new Error("secret backend details"); } }, async () => true);
  const result = await tools.get("knowledge_list_sources")!.handler({});
  assert.equal(result.isError, true);
  assert.match(result.content[0].text, /indisponível ou não configurada/);
  assert.doesNotMatch(result.content[0].text, /secret backend details/);
});
