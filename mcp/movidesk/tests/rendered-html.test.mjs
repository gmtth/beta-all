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
  assert.doesNotMatch(page, /codex-preview/);
});

test("OAuth metadata advertises only the implemented PKCE flow", async () => {
  const metadata = await read("app/.well-known/oauth-authorization-server/route.ts");
  assert.match(metadata, /authorization_code/);
  assert.match(metadata, /S256/);
  assert.match(metadata, /authorization_response_iss_parameter_supported: true/);
  assert.match(metadata, /client_id_metadata_document_supported: true/);
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

test("GPT Action documents ticket content search", async () => {
  const panel = await read("app/action-instructions-panel.tsx");
  const route = await read("app/api/ticket-content/route.ts");
  assert.match(panel, /searchTicketContent/);
  assert.match(panel, /\/api\/ticket-content/);
  assert.match(panel, /case_sensitive/);
  assert.match(route, /export async function GET/);
  assert.match(route, /initial_action/);
  assert.match(route, /actions/);
  assert.match(route, /\$select/);
  assert.doesNotMatch(route, /export async function POST|export async function PATCH|export async function DELETE/);
});

test("individual ticket lookups use Movidesk direct identifiers", async () => {
  const route = await read("app/api/tickets/route.ts");
  assert.match(route, /target\.searchParams\.set\("id", id\)/);
  assert.match(route, /target\.searchParams\.set\("protocol", protocol\)/);
  assert.match(route, /else target\.searchParams\.set\("\$filter", filters\.join\(" and "\)\)/);
});

test("ticket date filters use the documented UTC literal", async () => {
  const route = await read("app/api/tickets/route.ts");
  assert.match(route, /23:59:59.*00:00:00.*Z/);
  assert.doesNotMatch(route, /23:59:59\.99.*00:00:00\.00.*z/);
});

test("MCP instructions document the published tools and ticket id search", async () => {
  const panel = await read("app/mcp-instructions-panel.tsx");
  for (const tool of ["movidesk_get_ticket", "movidesk_search_tickets", "movidesk_search_people", "movidesk_list_services"]) assert.match(panel, new RegExp(tool));
  assert.match(panel, /id, filter, keyword/);
  assert.match(panel, /somente leitura/);
});

test("MCP runs inside the OAuth proxy without a Worker-to-Worker HTTP hop", async () => {
  const entry = await read("worker/index.ts");
  const mcp = await read("worker/mcp.ts");
  const tools = await read("worker/mcp-tools.ts");
  assert.match(entry, /handleMcp/);
  assert.match(mcp, /LocalMovideskClient/);
  assert.match(mcp, /getTickets\(request\)/);
  assert.match(mcp, /server\/discover/);
  assert.doesNotMatch(mcp, /OAUTH_PROXY_URL|fetch\(.*api\//);
  for (const tool of ["movidesk_get_ticket", "movidesk_search_tickets", "movidesk_search_people", "movidesk_list_services"]) assert.match(tools, new RegExp(tool));
});

test("OAuth source does not log credentials", async () => {
  const files = await Promise.all([read("app/oauth/_lib.ts"), read("app/oauth/authorize/route.ts"), read("app/oauth/token/route.ts"), read("app/api/tickets/route.ts")]);
  assert.doesNotMatch(files.join("\n"), /console\.(log|info|debug|warn|error)/);
});
