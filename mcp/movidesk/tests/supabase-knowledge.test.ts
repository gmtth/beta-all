import assert from "node:assert/strict";
import { test } from "node:test";
import { SupabaseKnowledgeReader } from "../worker/supabase-knowledge";

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
    const result = await new SupabaseKnowledgeReader().listSources();
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
