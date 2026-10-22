import assert from "node:assert/strict";
import { test } from "node:test";
import { SupabaseKnowledgeStore } from "../worker/supabase-knowledge";
import { KnowledgeImportError } from "../worker/knowledge-import-errors";
import type { MovideskKnowledgeRecord } from "../worker/knowledge-ingest";

test("Supabase source listing uses the beta schema and returns only bounded metadata", async () => {
  const previousUrl = process.env.SUPABASE_URL;
  const previousKey = process.env.SUPABASE_SECRET_KEY;
  const previousFetch = globalThis.fetch;
  let requestUrl: URL | undefined;
  let requestHeaders: Headers | undefined;
  process.env.SUPABASE_URL = "https://example-project.supabase.co";
  process.env.SUPABASE_SECRET_KEY = "unit-test-secret";
  globalThis.fetch = async (input, init) => {
    requestUrl = new URL(String(input));
    requestHeaders = new Headers(init?.headers);
    return Response.json([{ id: "movidesk", display_name: "Movidesk", private_value: "must not escape" }]);
  };

  try {
    const result = await new SupabaseKnowledgeStore().listSources();
    assert.equal(requestUrl?.pathname, "/rest/v1/source_system");
    assert.equal(requestUrl?.searchParams.get("select"), "id,name");
    assert.equal(requestUrl?.searchParams.get("limit"), "10");
    assert.equal(requestHeaders?.get("Accept-Profile"), "beta");
    assert.equal(requestHeaders?.get("apikey"), "unit-test-secret");
    assert.deepEqual(result, [{ id: "movidesk", name: "Movidesk" }]);
    assert.equal(JSON.stringify(result).includes("must not escape"), false);
  } finally {
    globalThis.fetch = previousFetch;
    if (previousUrl === undefined) delete process.env.SUPABASE_URL;
    else process.env.SUPABASE_URL = previousUrl;
    if (previousKey === undefined) delete process.env.SUPABASE_SECRET_KEY;
    else process.env.SUPABASE_SECRET_KEY = previousKey;
  }
});

test("Supabase knowledge search calls the beta RPC and maps bounded source evidence", async () => {
  const previousUrl = process.env.SUPABASE_URL;
  const previousKey = process.env.SUPABASE_SECRET_KEY;
  const previousFetch = globalThis.fetch;
  let requestUrl: URL | undefined;
  let requestHeaders: Headers | undefined;
  let requestBody: unknown;
  process.env.SUPABASE_URL = "https://example-project.supabase.co";
  process.env.SUPABASE_SECRET_KEY = "unit-test-secret";
  globalThis.fetch = async (input, init) => {
    requestUrl = new URL(String(input));
    requestHeaders = new Headers(init?.headers);
    requestBody = JSON.parse(String(init?.body));
    return Response.json([{
      record_id: "42", external_id: "5835", record_type: "ticket", title: "Falha na máquina",
      source_name: "Movidesk", source_created_at: "2026-07-02T00:00:00Z", section_title: "Interação 2",
      excerpt: "O equipamento voltou após reiniciar.", relevance: 0.42,
    }]);
  };

  try {
    const result = await new SupabaseKnowledgeStore().searchRecords("máquina reinicia", 3);
    assert.equal(requestUrl?.pathname, "/rest/v1/rpc/search_knowledge");
    assert.equal(requestHeaders?.get("Content-Profile"), "beta");
    assert.equal(requestHeaders?.get("apikey"), "unit-test-secret");
    assert.equal(requestHeaders?.get("Authorization"), "Bearer unit-test-secret");
    assert.deepEqual(requestBody, { p_query: "máquina reinicia", p_limit: 3 });
    assert.deepEqual(result, [{
      recordId: "42", externalId: "5835", recordType: "ticket", title: "Falha na máquina",
      sourceName: "Movidesk", sourceCreatedAt: "2026-07-02T00:00:00.000Z", sectionTitle: "Interação 2",
      excerpt: "O equipamento voltou após reiniciar.", relevance: 0.42,
    }]);
  } finally {
    globalThis.fetch = previousFetch;
    if (previousUrl === undefined) delete process.env.SUPABASE_URL;
    else process.env.SUPABASE_URL = previousUrl;
    if (previousKey === undefined) delete process.env.SUPABASE_SECRET_KEY;
    else process.env.SUPABASE_SECRET_KEY = previousKey;
  }
});

test("Supabase knowledge search rejects malformed responses without exposing provider data", async () => {
  const previousUrl = process.env.SUPABASE_URL;
  const previousKey = process.env.SUPABASE_SECRET_KEY;
  const previousFetch = globalThis.fetch;
  process.env.SUPABASE_URL = "https://example-project.supabase.co";
  process.env.SUPABASE_SECRET_KEY = "unit-test-secret";
  globalThis.fetch = async () => Response.json([{ record_id: "42", title: "must not escape" }]);

  try {
    await assert.rejects(new SupabaseKnowledgeStore().searchRecords("máquina offline", 5), /invalid response/);
  } finally {
    globalThis.fetch = previousFetch;
    if (previousUrl === undefined) delete process.env.SUPABASE_URL;
    else process.env.SUPABASE_URL = previousUrl;
    if (previousKey === undefined) delete process.env.SUPABASE_SECRET_KEY;
    else process.env.SUPABASE_SECRET_KEY = previousKey;
  }
});

test("Movidesk ticket import calls the narrow beta RPC and returns only bounded metadata", async () => {
  const previousUrl = process.env.SUPABASE_URL;
  const previousKey = process.env.SUPABASE_SECRET_KEY;
  const previousFetch = globalThis.fetch;
  let requestUrl: URL | undefined;
  let requestHeaders: Headers | undefined;
  let requestBody: any;
  process.env.SUPABASE_URL = "https://example-project.supabase.co";
  process.env.SUPABASE_SECRET_KEY = "unit-test-secret";
  globalThis.fetch = async (input, init) => {
    requestUrl = new URL(String(input));
    requestHeaders = new Headers(init?.headers);
    requestBody = JSON.parse(String(init?.body));
    return Response.json({ record_id: "42", chunk_count: 2 });
  };
  const record: MovideskKnowledgeRecord = {
    external_id: "20260702000000016", title: "Máquina offline", status: "Fechado",
    source_created_at: null, source_updated_at: null, attributes: { category: "Hardware" },
    chunks: [{ ordinal: 0, section_title: "Descrição inicial", content: "Máquina sem conexão" }, { ordinal: 1, section_title: "Interação 1", content: "Reinício realizado" }],
    content_hash: "a".repeat(64),
  };
  try {
    const result = await new SupabaseKnowledgeStore().importMovideskTicket(record, "analista@example.com");
    assert.equal(requestUrl?.pathname, "/rest/v1/rpc/upsert_movidesk_knowledge_record");
    assert.equal(requestHeaders?.get("Content-Profile"), "beta");
    assert.equal(requestHeaders?.get("apikey"), "unit-test-secret");
    assert.equal(requestBody.p_external_id, "20260702000000016");
    assert.equal(requestBody.p_actor_email, "analista@example.com");
    assert.deepEqual(result, { recordId: "42", chunkCount: 2 });
  } finally {
    globalThis.fetch = previousFetch;
    if (previousUrl === undefined) delete process.env.SUPABASE_URL;
    else process.env.SUPABASE_URL = previousUrl;
    if (previousKey === undefined) delete process.env.SUPABASE_SECRET_KEY;
    else process.env.SUPABASE_SECRET_KEY = previousKey;
  }
});

test("ticket import classifies a missing RPC/schema-cache failure without leaking PostgREST details", async () => {
  const previousUrl = process.env.SUPABASE_URL;
  const previousKey = process.env.SUPABASE_SECRET_KEY;
  const previousFetch = globalThis.fetch;
  process.env.SUPABASE_URL = "https://example-project.supabase.co";
  process.env.SUPABASE_SECRET_KEY = "unit-test-secret";
  globalThis.fetch = async () => Response.json({ code: "PGRST202", message: "Function not found; private detail" }, { status: 404 });
  const record: MovideskKnowledgeRecord = { external_id: "42", title: "Teste", status: null, source_created_at: null, source_updated_at: null, attributes: {}, chunks: [{ ordinal: 0, section_title: "Descrição", content: "Conteúdo" }], content_hash: "a".repeat(64) };
  try {
    await assert.rejects(new SupabaseKnowledgeStore().importMovideskTicket(record, "analista@example.com"), (error: unknown) => {
      assert.ok(error instanceof KnowledgeImportError);
      assert.equal(error.diagnostic, "supabase_rpc_unavailable");
      assert.doesNotMatch(error.message, /private detail|PGRST202/);
      return true;
    });
  } finally {
    globalThis.fetch = previousFetch;
    if (previousUrl === undefined) delete process.env.SUPABASE_URL;
    else process.env.SUPABASE_URL = previousUrl;
    if (previousKey === undefined) delete process.env.SUPABASE_SECRET_KEY;
    else process.env.SUPABASE_SECRET_KEY = previousKey;
  }
});

test("ticket import distinguishes Supabase permission failures from rejected content", async () => {
  const previousUrl = process.env.SUPABASE_URL;
  const previousKey = process.env.SUPABASE_SECRET_KEY;
  const previousFetch = globalThis.fetch;
  process.env.SUPABASE_URL = "https://example-project.supabase.co";
  process.env.SUPABASE_SECRET_KEY = "unit-test-secret";
  globalThis.fetch = async () => Response.json({ code: "42501", message: "permission denied; private detail" }, { status: 403 });
  const record: MovideskKnowledgeRecord = { external_id: "42", title: "Teste", status: null, source_created_at: null, source_updated_at: null, attributes: {}, chunks: [{ ordinal: 0, section_title: "Descrição", content: "Conteúdo" }], content_hash: "a".repeat(64) };
  try {
    await assert.rejects(new SupabaseKnowledgeStore().importMovideskTicket(record, "analista@example.com"), (error: unknown) => {
      assert.ok(error instanceof KnowledgeImportError);
      assert.equal(error.diagnostic, "supabase_permission_denied");
      assert.doesNotMatch(error.message, /private detail|42501/);
      return true;
    });
  } finally {
    globalThis.fetch = previousFetch;
    if (previousUrl === undefined) delete process.env.SUPABASE_URL;
    else process.env.SUPABASE_URL = previousUrl;
    if (previousKey === undefined) delete process.env.SUPABASE_SECRET_KEY;
    else process.env.SUPABASE_SECRET_KEY = previousKey;
  }
});
