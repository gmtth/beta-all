import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);
const read = (path) => readFile(new URL(path, root), "utf8");

test("the proxy renders its branded access page", async () => {
  const page = await read("app/page.tsx");
  const layout = await read("app/layout.tsx");
  assert.match(page, /Movidesk/);
  assert.match(page, /Acesso seguro|conector/i);
  assert.match(layout, /Movidesk \\| Acesso seguro/);
  assert.match(layout, /favicon\.png/);
  assert.doesNotMatch(page, /SkeletonPreview|codex-preview|Your site is taking shape/);
});

test("OAuth metadata advertises only the implemented PKCE flow", async () => {
  const metadata = await read("app/.well-known/oauth-authorization-server/route.ts");
  assert.match(metadata, /authorization_code/);
  assert.match(metadata, /S256/);
  assert.doesNotMatch(metadata, /refresh_token|client_secret_post/);
});

test("the REST proxy remains read-only and protects its token boundary", async () => {
  const route = await read("app/api/tickets/route.ts");
  assert.match(route, /authorization/);
  assert.match(route, /status: 401/);
  assert.match(route, /export async function GET/);
  assert.match(route, /ticket_not_found/);
  assert.doesNotMatch(route, /POST|PUT|PATCH|DELETE/);
});

test("ticket search exposes bounded read-only filters", async () => {
  const route = await read("app/api/tickets/route.ts");
  assert.match(route, /from_date/);
  assert.match(route, /responsible_id/);
  assert.match(route, /keyword/);
  assert.match(route, /include_past/);
  assert.match(route, /invalid_pagination/);
  assert.match(route, /search_criteria_required/);
  assert.doesNotMatch(route, /export async function POST|export async function PATCH|export async function DELETE/);
});

test("MCP instructions document the published tools and ticket id search", async () => {
  const panel = await read("app/mcp-instructions-panel.tsx");
  for (const tool of ["movidesk_get_ticket", "movidesk_search_tickets", "movidesk_search_people", "movidesk_list_services"]) assert.match(panel, new RegExp(tool));
  assert.match(panel, /id, filter, keyword/);
  assert.match(panel, /somente leitura/);
});

test("OAuth source does not log credentials", async () => {
  const files = await Promise.all([read("app/oauth/_lib.ts"), read("app/oauth/authorize/route.ts"), read("app/oauth/token/route.ts"), read("app/api/tickets/route.ts")]);
  assert.doesNotMatch(files.join("\n"), /console\.(log|info|debug|warn|error)/);
});
