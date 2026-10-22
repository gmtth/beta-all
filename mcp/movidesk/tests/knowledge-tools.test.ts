import assert from "node:assert/strict";
import { test } from "node:test";
import { registerKnowledgeTools, type KnowledgeStore } from "../worker/knowledge-tools";
import type { OAuthPrincipalAuthorization } from "../app/oauth/_lib";
import { McpAuthorizationFailure } from "../worker/oauth-auth-challenge";
import { KnowledgeImportError } from "../worker/knowledge-import-errors";
import { buildMovideskKnowledgeRecord, resolveMovideskTicketIdentifier } from "../worker/knowledge-ingest";

type RegisteredTool = { config: any; handler: (args: unknown) => Promise<any> };

const authorized: OAuthPrincipalAuthorization = { authorized: true, principal: { email: "analista@example.com", role: "support" } };
const invalidToken: OAuthPrincipalAuthorization = { authorized: false, error: "invalid_token" };
const insufficientScope: OAuthPrincipalAuthorization = { authorized: false, error: "insufficient_scope" };

function setup(reader: KnowledgeStore, authorizeRead: () => Promise<OAuthPrincipalAuthorization>, authorizeImport: () => Promise<OAuthPrincipalAuthorization> = async () => invalidToken, getMovideskTicket: (id: string) => Promise<unknown> = async () => null) {
  const tools = new Map<string, RegisteredTool>();
  const server = { registerTool(name: string, config: any, handler: (args: unknown) => Promise<any>) { tools.set(name, { config, handler }); } };
  registerKnowledgeTools(server, reader, { resource: "https://beta.example/mcp/", authorizeRead, authorizeImport, getMovideskTicket });
  return tools;
}

test("knowledge_list_sources returns only bounded source summaries to authorized callers", async () => {
  const tools = setup({ searchRecords: async () => [], listSources: async () => [{ id: "movidesk", name: "Movidesk" }], importMovideskTicket: async () => ({ recordId: "1", chunkCount: 1 }) }, async () => authorized);
  const registered = tools.get("knowledge_list_sources")!;
  assert.deepEqual(registered.config.securitySchemes, [{ type: "oauth2", scopes: ["knowledge:read"] }]);
  assert.equal(registered.config.annotations.readOnlyHint, true);
  assert.equal(registered.config.annotations.destructiveHint, false);
  assert.deepEqual(await registered.handler({}), {
    content: [{ type: "text", text: "1 fonte(s) listada(s)." }],
    structuredContent: { sources: [{ id: "movidesk", name: "Movidesk" }], total: 1 },
  });
});

test("knowledge_list_sources fails closed without knowledge:read authorization", async () => {
  const tools = setup({ searchRecords: async () => [], listSources: async () => [{ id: "movidesk", name: "Movidesk" }], importMovideskTicket: async () => ({ recordId: "1", chunkCount: 1 }) }, async () => invalidToken);
  const result = await tools.get("knowledge_list_sources")!.handler({});
  assert.equal(result.isError, true);
  assert.match(result.content[0].text, /conexão expirou/);
  assert.ok(result._meta["mcp/www_authenticate"][0].includes('error="invalid_token"'));
});

test("knowledge_list_sources challenges for insufficient scope and names the requested scope", async () => {
  const tools = setup({ searchRecords: async () => [], listSources: async () => [], importMovideskTicket: async () => ({ recordId: "1", chunkCount: 1 }) }, async () => insufficientScope);
  const result = await tools.get("knowledge_list_sources")!.handler({});
  assert.equal(result.isError, true);
  assert.ok(result._meta["mcp/www_authenticate"][0].includes('error="insufficient_scope"'));
  assert.ok(result._meta["mcp/www_authenticate"][0].includes('scope="knowledge:read"'));
  assert.ok(result._meta["mcp/www_authenticate"][0].includes('resource_metadata="https://beta.example/.well-known/oauth-protected-resource"'));
});

test("knowledge_list_sources hides backend errors", async () => {
  const tools = setup({ searchRecords: async () => [], listSources: async () => { throw new Error("secret backend details"); }, importMovideskTicket: async () => ({ recordId: "1", chunkCount: 1 }) }, async () => authorized);
  const result = await tools.get("knowledge_list_sources")!.handler({});
  assert.equal(result.isError, true);
  assert.match(result.content[0].text, /indisponível ou não configurada/);
  assert.doesNotMatch(result.content[0].text, /secret backend details/);
});

test("knowledge_search returns bounded lexical evidence to authorized callers", async () => {
  let received: { query: string; limit: number } | undefined;
  const evidence = {
    recordId: "42", externalId: "5835", recordType: "ticket", title: "Falha na máquina",
    sourceName: "Movidesk", sourceCreatedAt: "2026-07-02T00:00:00.000Z", sectionTitle: "Interação 2",
    excerpt: "O equipamento voltou após reiniciar.", relevance: 0.42,
  };
  const reader: KnowledgeStore = {
    listSources: async () => [],
    searchRecords: async (query, limit) => { received = { query, limit }; return [evidence]; },
    importMovideskTicket: async () => ({ recordId: "1", chunkCount: 1 }),
  };
  const tools = setup(reader, async () => authorized);
  const registered = tools.get("knowledge_search")!;
  assert.deepEqual(registered.config.securitySchemes, [{ type: "oauth2", scopes: ["knowledge:read"] }]);
  assert.equal(registered.config.annotations.readOnlyHint, true);
  const result = await registered.handler({ query: "  máquina reinicia  ", limit: 3 });
  assert.deepEqual(received, { query: "máquina reinicia", limit: 3 });
  assert.deepEqual(result.structuredContent, { query: "máquina reinicia", mode: "lexical", results: [evidence], returned: 1 });
  assert.match(result.content[0].text, /cópia indexada/);
});

test("knowledge_search rejects invalid arguments before authorization or backend access", async () => {
  let authorizedCalls = 0;
  let searched = false;
  const reader: KnowledgeStore = {
    listSources: async () => [],
    searchRecords: async () => { searched = true; return []; },
    importMovideskTicket: async () => ({ recordId: "1", chunkCount: 1 }),
  };
  const tools = setup(reader, async () => { authorizedCalls++; return authorized; });
  const result = await tools.get("knowledge_search")!.handler({ query: "xy", limit: 11 });
  assert.equal(result.isError, true);
  assert.match(result.content[0].text, /3 a 500 caracteres/);
  assert.equal(authorizedCalls, 0);
  assert.equal(searched, false);
});

test("knowledge_search does not query the index without knowledge:read", async () => {
  let searched = false;
  const reader: KnowledgeStore = {
    listSources: async () => [],
    searchRecords: async () => { searched = true; return []; },
    importMovideskTicket: async () => ({ recordId: "1", chunkCount: 1 }),
  };
  const tools = setup(reader, async () => insufficientScope);
  const result = await tools.get("knowledge_search")!.handler({ query: "máquina offline" });
  assert.equal(result.isError, true);
  assert.ok(result._meta["mcp/www_authenticate"][0].includes('error="insufficient_scope"'));
  assert.ok(result._meta["mcp/www_authenticate"][0].includes('scope="knowledge:read"'));
  assert.equal(searched, false);
});

test("knowledge_search hides backend errors", async () => {
  const reader: KnowledgeStore = {
    listSources: async () => [],
    searchRecords: async () => { throw new Error("private PostgREST details"); },
    importMovideskTicket: async () => ({ recordId: "1", chunkCount: 1 }),
  };
  const tools = setup(reader, async () => authorized);
  const result = await tools.get("knowledge_search")!.handler({ query: "máquina offline" });
  assert.equal(result.isError, true);
  assert.match(result.content[0].text, /indisponível ou não configurada/);
  assert.doesNotMatch(result.content[0].text, /private PostgREST details/);
});

test("knowledge_import_movidesk_ticket requires explicit writer scope and persists sanitized source text", async () => {
  let received: any;
  let requestedId = "";
  const reader: KnowledgeStore = {
    searchRecords: async () => [], listSources: async () => [],
    importMovideskTicket: async (record, actorEmail) => { received = { record, actorEmail }; return { recordId: "42", chunkCount: record.chunks.length }; },
  };
  const ticket = { id: 20260702000000016, subject: "Máquina offline", description: "Equipamento sem conexão. Contato ana@example.com, CPF 123.456.789-00.", status: "Fechado", actions: [{ description: "Reinício concluído; telefone 11999998888" }] };
  const tools = setup(reader, async () => authorized, async () => authorized, async (id) => { requestedId = id; return ticket; });
  const registered = tools.get("knowledge_import_movidesk_ticket")!;
  assert.deepEqual(registered.config.securitySchemes, [{ type: "oauth2", scopes: ["movidesk:read", "knowledge:write"] }]);
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
  const reader: KnowledgeStore = { searchRecords: async () => [], listSources: async () => [], importMovideskTicket: async () => ({ recordId: "1", chunkCount: 1 }) };
  const tools = setup(reader, async () => authorized, async () => invalidToken, async () => { fetched = true; return {}; });
  const result = await tools.get("knowledge_import_movidesk_ticket")!.handler({ ticket_id: "20260702000000016" });
  assert.equal(result.isError, true);
  assert.match(result.content[0].text, /conexão expirou/);
  assert.ok(result._meta["mcp/www_authenticate"][0].includes('error="invalid_token"'));
  assert.equal(fetched, false);
});

test("knowledge_import_movidesk_ticket explains persistence failures without exposing provider details", async () => {
  const reader: KnowledgeStore = { searchRecords: async () => [], listSources: async () => [], importMovideskTicket: async () => { throw new Error("private database error"); } };
  const tools = setup(reader, async () => authorized, async () => authorized, async () => ({ id: "20260702000000016", subject: "Falha", description: "Problema técnico" }));
  const result = await tools.get("knowledge_import_movidesk_ticket")!.handler({ ticket_id: "20260702000000016" });
  assert.equal(result.isError, true);
  assert.match(result.content[0].text, /causa não classificada/);
  assert.match(result.content[0].text, /diagnóstico: unexpected/);
  assert.doesNotMatch(result.content[0].text, /private database error/);
});

test("knowledge_import_movidesk_ticket identifies preparation failures before persistence", async () => {
  let persisted = false;
  const reader: KnowledgeStore = { searchRecords: async () => [], listSources: async () => [], importMovideskTicket: async () => { persisted = true; return { recordId: "1", chunkCount: 1 }; } };
  const tools = setup(reader, async () => authorized, async () => authorized, async () => ({ id: "20260702000000016", subject: "Falha", description: "" }));
  const result = await tools.get("knowledge_import_movidesk_ticket")!.handler({ ticket_id: "20260702000000016" });
  assert.equal(result.isError, true);
  assert.match(result.content[0].text, /não contém descrição nem interações/);
  assert.match(result.content[0].text, /diagnóstico: ticket_missing_content/);
  assert.equal(persisted, false);
});

test("knowledge_import_movidesk_ticket distinguishes a missing source ticket", async () => {
  const reader: KnowledgeStore = { searchRecords: async () => [], listSources: async () => [], importMovideskTicket: async () => ({ recordId: "1", chunkCount: 1 }) };
  const tools = setup(reader, async () => authorized, async () => authorized, async () => { throw new KnowledgeImportError("ticket_not_found"); });
  const result = await tools.get("knowledge_import_movidesk_ticket")!.handler({ ticket_id: "20260702000000016" });
  assert.equal(result.isError, true);
  assert.match(result.content[0].text, /não encontrou esse chamado/);
  assert.match(result.content[0].text, /diagnóstico: ticket_not_found/);
});

test("knowledge_import_movidesk_ticket preserves the reconnect challenge from an authorization failure", async () => {
  const reader: KnowledgeStore = { searchRecords: async () => [], listSources: async () => [], importMovideskTicket: async () => ({ recordId: "1", chunkCount: 1 }) };
  const tools = setup(reader, async () => authorized, async () => authorized, async () => { throw new McpAuthorizationFailure("invalid_token"); });
  const result = await tools.get("knowledge_import_movidesk_ticket")!.handler({ ticket_id: "20260702000000016" });
  assert.equal(result.isError, true);
  assert.ok(result._meta["mcp/www_authenticate"][0].includes('error="invalid_token"'));
});

test("knowledge_import_movidesk_ticket does not persist a ticket whose returned ID differs", async () => {
  let persisted = false;
  const reader: KnowledgeStore = { searchRecords: async () => [], listSources: async () => [], importMovideskTicket: async () => { persisted = true; return { recordId: "1", chunkCount: 1 }; } };
  const tools = setup(reader, async () => authorized, async () => authorized, async () => ({ id: "999", subject: "Ticket diferente", description: "Descrição técnica" }));
  const result = await tools.get("knowledge_import_movidesk_ticket")!.handler({ ticket_id: "20260702000000016" });
  assert.equal(result.isError, true);
  assert.equal(persisted, false);
});

test("knowledge import resolves a requested Movidesk protocol and stores the canonical internal ID", async () => {
  const record = await buildMovideskKnowledgeRecord({
    id: 5835,
    protocol: "20260702000000016",
    subject: "Máquina sem conexão",
    description: "Equipamento não comunica com o sistema.",
  }, "20260702000000016");

  assert.equal(record.external_id, "5835");
  assert.equal(record.title, "Máquina sem conexão");
});

test("Movidesk ticket lookup falls back from internal ID to an exact protocol match", async () => {
  const lookups: Array<[string, string]> = [];
  const ticket = await resolveMovideskTicketIdentifier("20260702000000016", async (kind, value) => {
    lookups.push([kind, value]);
    return kind === "id" ? { id: 5835, protocol: "different" } : { id: 5835, protocol: value };
  });

  assert.deepEqual(lookups, [["id", "20260702000000016"], ["protocol", "20260702000000016"]]);
  assert.deepEqual(ticket, { id: 5835, protocol: "20260702000000016" });
});

test("Movidesk ticket lookup rejects an identifier that resolves to different tickets by ID and protocol", async () => {
  await assert.rejects(
    () => resolveMovideskTicketIdentifier("5835", async (kind) => kind === "id"
      ? { id: 5835, protocol: "other" }
      : { id: 9012, protocol: "5835" }),
    (error: unknown) => error instanceof KnowledgeImportError && error.diagnostic === "ticket_mismatch",
  );
});

test("knowledge_import_movidesk_ticket stores by canonical ID when called with a protocol", async () => {
  let persistedExternalId = "";
  const reader: KnowledgeStore = {
    searchRecords: async () => [], listSources: async () => [],
    importMovideskTicket: async (record) => { persistedExternalId = record.external_id; return { recordId: "42", chunkCount: record.chunks.length }; },
  };
  const ticket = { id: 5835, protocol: "20260702000000016", subject: "Máquina sem conexão", description: "Equipamento não comunica com o sistema." };
  const tools = setup(reader, async () => authorized, async () => authorized, async () => ticket);
  const result = await tools.get("knowledge_import_movidesk_ticket")!.handler({ ticket_id: "20260702000000016" });

  assert.equal(result.structuredContent.imported, true);
  assert.equal(persistedExternalId, "5835");
});

test("knowledge import selects the matching ticket from a Movidesk result array", async () => {
  const record = await buildMovideskKnowledgeRecord([
    { id: 17, protocol: "other", subject: "Outro chamado", description: "Outra descrição" },
    { id: 5835, protocol: "20260702000000016", subject: "Chamado correto", description: "Descrição correta" },
  ], "20260702000000016");

  assert.equal(record.external_id, "5835");
  assert.equal(record.title, "Chamado correto");
});
