import assert from "node:assert/strict";
import { test } from "node:test";
import { getDatabasePreview, getDatabaseSchema } from "../app/api/admin/database/handlers";
import { DATABASE_BROWSER_PAGE_SIZE, parseDatabaseCursor, parseDatabasePageSize, sanitizeDatabasePreviewRows } from "../worker/database-browser-contract";
import { DatabaseBrowserError, SupabaseKnowledgeStore } from "../worker/supabase-knowledge";

test("database browser contract bounds pagination and excludes record chunks", () => {
  assert.equal(DATABASE_BROWSER_PAGE_SIZE, 25);
  assert.equal(parseDatabasePageSize(null), 25);
  assert.equal(parseDatabasePageSize("25"), 25);
  assert.equal(parseDatabasePageSize("26"), null);
  assert.equal(parseDatabasePageSize("0"), null);
  assert.equal(parseDatabasePageSize("1.5"), null);
  assert.equal(parseDatabaseCursor("9223372036854775807"), "9223372036854775807");
  assert.equal(parseDatabaseCursor("9223372036854775808"), undefined);
  assert.equal(parseDatabaseCursor("-1"), undefined);
  assert.equal(parseDatabaseCursor(null), null);
  assert.deepEqual(sanitizeDatabasePreviewRows("source_record", [{ id: "2", source_system_id: 1, external_id: "ticket-2", record_type: "ticket", status: null, classification: "internal", source_created_at: null, source_updated_at: null, imported_at: "2026-10-21T00:00:00Z", deleted_at: null, title: "must be removed" }]), [
    { id: "2", source_system_id: 1, external_id: "ticket-2", record_type: "ticket", status: null, classification: "internal", source_created_at: null, source_updated_at: null, imported_at: "2026-10-21T00:00:00Z", deleted_at: null },
  ]);
  assert.equal(sanitizeDatabasePreviewRows("source_system", [{ id: "1", name: "Beta", active: true, created_at: null, extra: "drop" }])?.[0].extra, undefined);
  assert.equal(sanitizeDatabasePreviewRows("source_system", [{ id: "1", code: Number.NaN }]), null);
});

function routeDeps(overrides: Partial<{
  getUser: () => Promise<{ email: string } | null>;
  ensureSchema: () => Promise<void>;
  getUserRole: (email: string) => Promise<string | null>;
  isMaster: (role: string | null) => boolean;
  store: () => SupabaseKnowledgeStore;
}> = {}) {
  const calls: unknown[][] = [];
  const store = {
    getAdminDatabaseSchema: async () => { calls.push(["schema"]); return { schema: { name: "beta", grants: [] }, missingTables: ["source_system", "source_record", "knowledge_ingest_audit", "record_chunk"], tables: [], rpcs: [] }; },
    getAdminDatabasePage: async (...args: unknown[]) => { calls.push(["page", ...args]); return { table: "source_system", rows: [], nextCursor: null, pageSize: 25 }; },
  } as unknown as SupabaseKnowledgeStore;
  const deps = {
    getUser: async () => ({ email: "master@example.com" }),
    ensureSchema: async () => undefined,
    getUserRole: async () => "master",
    isMaster: (role: string | null) => role === "master",
    store: () => store,
    ...overrides,
  };
  return { deps, calls };
}

test("database schema endpoint gates RPC access to active master accounts", async () => {
  const unauthenticated = routeDeps({ getUser: async () => null });
  const unauthenticatedResponse = await getDatabaseSchema(unauthenticated.deps);
  assert.equal(unauthenticatedResponse.status, 401);
  assert.deepEqual(unauthenticated.calls, []);

  const nonMaster = routeDeps({ getUserRole: async () => "analyst" });
  const forbiddenResponse = await getDatabaseSchema(nonMaster.deps);
  assert.equal(forbiddenResponse.status, 403);
  assert.deepEqual(nonMaster.calls, []);

  const master = routeDeps();
  const response = await getDatabaseSchema(master.deps);
  assert.equal(response.status, 200);
  assert.deepEqual(master.calls, [["schema"]]);
});

test("database preview rejects unapproved tables and malformed query before RPC", async () => {
  const { deps, calls } = routeDeps();
  for (const url of [
    "https://site.test/api/admin/database/preview?table=record_chunk",
    "https://site.test/api/admin/database/preview?table=source_record&order=title",
    "https://site.test/api/admin/database/preview?table=source_record&page_size=26",
    "https://site.test/api/admin/database/preview?table=source_record&after_id=-2",
    "https://site.test/api/admin/database/preview?table=source_record&table=source_system",
  ]) {
    const response = await getDatabasePreview(new Request(url), deps);
    assert.equal(response.status, 400);
  }
  assert.deepEqual(calls, []);

  const valid = await getDatabasePreview(new Request("https://site.test/api/admin/database/preview?table=source_system"), deps);
  assert.equal(valid.status, 200);
  assert.deepEqual(calls, [["page", "source_system", "25", null]]);
});

test("Supabase database RPCs use explicit payloads and sanitize preview fields", async () => {
  const previousUrl = process.env.SUPABASE_URL;
  const previousKey = process.env.SUPABASE_SECRET_KEY;
  const previousFetch = globalThis.fetch;
  process.env.SUPABASE_URL = "https://example-project.supabase.co";
  process.env.SUPABASE_SECRET_KEY = "unit-test-secret";
  const calls: Array<{ url: URL; headers: Headers; body: Record<string, unknown> }> = [];
  globalThis.fetch = async (input, init) => {
    const call = { url: new URL(String(input)), headers: new Headers(init?.headers), body: JSON.parse(String(init?.body)) as Record<string, unknown> };
    calls.push(call);
    if (call.url.pathname.endsWith("get_admin_database_page")) {
      return Response.json({ table: "source_system", page_size: 25, next_cursor: null, rows: [{ id: "1", code: "movidesk", name: "Movidesk", active: true, created_at: null, secret: "never return" }] });
    }
    return Response.json({ schema: { name: "beta", grants: [] }, missing_tables: ["source_system", "source_record", "knowledge_ingest_audit", "record_chunk"], tables: [], rpcs: [] });
  };
  try {
    const store = new SupabaseKnowledgeStore();
    const schema = await store.getAdminDatabaseSchema();
    assert.equal(schema.missingTables.length, 4);
    const page = await store.getAdminDatabasePage("source_system", null, null);
    assert.deepEqual(page.rows, [{ id: "1", code: "movidesk", name: "Movidesk", active: true, created_at: null }]);
    assert.equal(calls[0].url.pathname, "/rest/v1/rpc/get_admin_database_schema");
    assert.equal(calls[1].url.pathname, "/rest/v1/rpc/get_admin_database_page");
    assert.equal(calls[0].headers.get("Content-Profile"), "beta");
    assert.deepEqual(calls[1].body, { p_table_key: "source_system", p_page_size: 25, p_after_id: null });
    await assert.rejects(() => store.getAdminDatabasePage("record_chunk", null, null), DatabaseBrowserError);
    assert.equal(calls.length, 2);
  } finally {
    globalThis.fetch = previousFetch;
    if (previousUrl === undefined) delete process.env.SUPABASE_URL;
    else process.env.SUPABASE_URL = previousUrl;
    if (previousKey === undefined) delete process.env.SUPABASE_SECRET_KEY;
    else process.env.SUPABASE_SECRET_KEY = previousKey;
  }
});
