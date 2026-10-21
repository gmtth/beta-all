import assert from "node:assert/strict";
import { test } from "node:test";
import { registerKnowledgeTools, type KnowledgeStore } from "../worker/knowledge-tools";

type RegisteredTool = { config: any; handler: (args: unknown) => Promise<any> };

function setup(reader: KnowledgeStore, authorizeRead: () => Promise<boolean>, authorizeImport: () => Promise<{ email: string; role: string } | null> = async () => null, getMovideskTicket: (id: string) => Promise<unknown> = async () => null) {
  const tools = new Map<string, RegisteredTool>();
  const server = { registerTool(name: string, config: any, handler: (args: unknown) => Promise<any>) { tools.set(name, { config, handler }); } };
  registerKnowledgeTools(server, reader, { authorizeRead, authorizeImport, getMovideskTicket });
  return tools;
}

test("knowledge_list_sources returns only bounded source summaries to authorized callers", async () => {
  const tools = setup({ listSources: async () => [{ id: "movidesk", name: "Movidesk" }], importMovideskTicket: async () => ({ recordId: "1", chunkCount: 1 }) }, async () => true);
  const registered = tools.get("knowledge_list_sources")!;
  assert.equal(registered.config.annotations.readOnlyHint, true);
  assert.equal(registered.config.annotations.destructiveHint, false);
  assert.deepEqual(await registered.handler({}), {
    content: [{ type: "text", text: "1 fonte(s) listada(s)." }],
    structuredContent: { sources: [{ id: "movidesk", name: "Movidesk" }], total: 1 },
  });
});

test("knowledge_list_sources fails closed without knowledge:read authorization", async () => {
  const tools = setup({ listSources: async () => [{ id: "movidesk", name: "Movidesk" }], importMovideskTicket: async () => ({ recordId: "1", chunkCount: 1 }) }, async () => false);
  const result = await tools.get("knowledge_list_sources")!.handler({});
  assert.equal(result.isError, true);
  assert.match(result.content[0].text, /Autorização ausente/);
});

test("knowledge_list_sources hides backend errors", async () => {
  const tools = setup({ listSources: async () => { throw new Error("secret backend details"); }, importMovideskTicket: async () => ({ recordId: "1", chunkCount: 1 }) }, async () => true);
  const result = await tools.get("knowledge_list_sources")!.handler({});
  assert.equal(result.isError, true);
  assert.match(result.content[0].text, /indisponível ou não configurada/);
  assert.doesNotMatch(result.content[0].text, /secret backend details/);
});

test("knowledge_import_movidesk_ticket requires explicit writer scope and persists sanitized source text", async () => {
  let received: any;
  let requestedId = "";
  const reader: KnowledgeStore = {
    listSources: async () => [],
    importMovideskTicket: async (record, actorEmail) => { received = { record, actorEmail }; return { recordId: "42", chunkCount: record.chunks.length }; },
  };
  const ticket = { id: 20260702000000016, subject: "Máquina offline", description: "Equipamento sem conexão. Contato ana@example.com, CPF 123.456.789-00.", status: "Fechado", actions: [{ description: "Reinício concluído; telefone 11999998888" }] };
  const tools = setup(reader, async () => true, async () => ({ email: "analista@example.com", role: "support" }), async (id) => { requestedId = id; return ticket; });
  const registered = tools.get("knowledge_import_movidesk_ticket")!;
  assert.equal(registered.config.annotations.readOnlyHint, false);
  assert.equal(registered.config.annotations.destructiveHint, false);
  const result = await registered.handler({ ticket_id: "20260702000000016" });
  assert.equal(requestedId, "20260702000000016");
  assert.equal(received.actorEmail, "analista@example.com");
  assert.equal(received.record.external_id, "20260702000000016");
  assert.equal(received.record.attributes.owner_email, undefined);
  assert.ok(received.record.chunks.some((chunk: any) => chunk.content.includes("[e-mail removido]")));
  assert.ok(received.record.chunks.some((chunk: any) => chunk.content.includes("[documento removido]")));
  assert.ok(received.record.chunks.some((chunk: any) => chunk.content.includes("[telefone removido]")));
  assert.equal(JSON.stringify(result.structuredContent).includes("ana@example.com"), false);
  assert.deepEqual(result.structuredContent, { imported: true, ticket_id: "20260702000000016", chunks: received.record.chunks.length });
});

test("knowledge_import_movidesk_ticket fails closed without writer authorization", async () => {
  let fetched = false;
  const reader: KnowledgeStore = { listSources: async () => [], importMovideskTicket: async () => ({ recordId: "1", chunkCount: 1 }) };
  const tools = setup(reader, async () => true, async () => null, async () => { fetched = true; return {}; });
  const result = await tools.get("knowledge_import_movidesk_ticket")!.handler({ ticket_id: "20260702000000016" });
  assert.equal(result.isError, true);
  assert.match(result.content[0].text, /Autorização ausente/);
  assert.equal(fetched, false);
});

test("knowledge_import_movidesk_ticket hides upstream and persistence errors", async () => {
  const reader: KnowledgeStore = { listSources: async () => [], importMovideskTicket: async () => { throw new Error("private database error"); } };
  const tools = setup(reader, async () => true, async () => ({ email: "analista@example.com", role: "support" }), async () => ({ id: "20260702000000016", subject: "Falha", description: "Problema técnico" }));
  const result = await tools.get("knowledge_import_movidesk_ticket")!.handler({ ticket_id: "20260702000000016" });
  assert.equal(result.isError, true);
  assert.match(result.content[0].text, /Não foi possível importar/);
  assert.doesNotMatch(result.content[0].text, /private database error/);
});

test("knowledge_import_movidesk_ticket does not persist a ticket whose returned ID differs", async () => {
  let persisted = false;
  const reader: KnowledgeStore = { listSources: async () => [], importMovideskTicket: async () => { persisted = true; return { recordId: "1", chunkCount: 1 }; } };
  const tools = setup(reader, async () => true, async () => ({ email: "analista@example.com", role: "support" }), async () => ({ id: "999", subject: "Ticket diferente", description: "Descrição técnica" }));
  const result = await tools.get("knowledge_import_movidesk_ticket")!.handler({ ticket_id: "20260702000000016" });
  assert.equal(result.isError, true);
  assert.equal(persisted, false);
});
