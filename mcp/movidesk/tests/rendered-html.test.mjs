import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import yaml from "js-yaml";

const root = new URL("../", import.meta.url);
const read = (path) => readFile(new URL(path, root), "utf8");

test("the proxy renders its branded access page", async () => {
  const page = await read("app/page.tsx");
  const layout = await read("app/layout.tsx");
  assert.match(page, /Movidesk/);
  assert.match(page, /A Beta ajuda a equipe a analisar chamados e diagnosticar ocorrências/i);
  assert.match(layout, /Movidesk \\| Acesso seguro/);
  assert.match(layout, /beta-logo\.svg/);
  assert.doesNotMatch(page, /codex-preview/);
});

test("feedback admin returns to the access page with a full navigation", async () => {
  const page = await read("app/admin/feedback/page.tsx");
  assert.match(page, /<a className="back-link" href="\/">← Voltar ao acesso<\/a>/);
  assert.doesNotMatch(page, /<Link className="back-link"/);
});

test("terms page returns to the access page with a full navigation", async () => {
  const page = await read("app/terms/page.tsx");
  assert.match(page, /<a className="back-link" href="\/">← Voltar ao acesso<\/a>/);
  assert.doesNotMatch(page, /next\/link|<Link className="back-link"/);
});

test("feedback group disclosures use the admin plus/minus toggle pattern", async () => {
  const panel = await read("app/feedback-admin-panel.tsx");
  assert.doesNotMatch(panel, /feedback-page-heading|Feedback da Beta/);
  assert.match(panel, /className="panel-heading">PANORAMA/);
  assert.match(panel, /className="panel-heading">INVESTIGAÇÃO/);
  assert.match(panel, /className="panel-heading">REVISÃO/);
  assert.doesNotMatch(panel, /className="data-card"><h3>(Ocorrências por categoria|Nível de fricção observado|Frustrações por analista|Origem do sinal)/);
  assert.match(panel, /className="feedback-group-toggle"[^>]*aria-expanded=\{expanded === group\.group_id\}/);
  assert.match(panel, /className="admin-section-toggle" aria-hidden="true"/);
  assert.match(panel, /expanded === group\.group_id \? "−" : "\+"/);
});

test("admin tool metrics show friendly and technical tool names", async () => {
  const panel = await read("app/user-admin-panel.tsx");
  const titles = panel.match(/const toolTitles: Record<string, string> = \{([\s\S]*?)\n\};/)?.[1] ?? "";
  const registrations = await Promise.all([
    read("worker/mcp-tools.ts"),
    read("worker/knowledge-tools.ts"),
    read("worker/feedback-tools.ts"),
  ]);
  const toolNames = registrations.flatMap((source) => [...source.matchAll(/registerTool\(\s*"([a-z0-9_]+)"/g)].map((match) => match[1]));
  for (const name of toolNames) assert.match(titles, new RegExp(`${name}:`), `the admin dashboard has a friendly name for ${name}`);
  assert.match(panel, /className="tool-name-friendly"/);
  assert.match(panel, /className="tool-name-technical"/);
  assert.match(panel, /className="usage-tool-header"/);
  assert.match(panel, /{item\.calls\.toLocaleString\("pt-BR"\)\} calls/);
  assert.match(panel, /className="usage-metrics"/);
  assert.match(panel, /className="usage-bar-track"/);
  assert.match(panel, /className="usage-error-count"/);
  assert.match(panel, /className="latency-tool-header"/);
  assert.match(panel, /item\.samples\.toLocaleString\("pt-BR"\).*?medição/);
  assert.match(panel, /className="latency-values"/);
  assert.match(panel, /className="latency-track"/);
});

test("OAuth metadata advertises the implemented MCP refresh and PKCE flow", async () => {
  const route = await read("app/.well-known/oauth-authorization-server/route.ts");
  const metadata = await read("app/oauth/metadata.ts");
  const actionMetadata = await read("app/.well-known/openid-configuration/route.ts");
  assert.match(route, /authorizationServerMetadata/);
  assert.match(metadata, /authorization_code.*refresh_token/);
  assert.match(metadata, /S256/);
  assert.match(metadata, /scopes_supported: \[\.\.\.scopes\]/);
  assert.match(metadata, /authorization_response_iss_parameter_supported: true/);
  assert.match(metadata, /client_id_metadata_document_supported: true/);
  assert.match(actionMetadata, /authorization_code/);
  assert.doesNotMatch(actionMetadata, /refresh_token|offline_access/);
});

test("OAuth authorization grants the scopes configured for the active account", async () => {
  const route = await read("app/oauth/authorize/route.ts");
  assert.equal((route.match(/getEnabledUserScopes\(db\(\), user\.email, clientScopes\)/g) ?? []).length, 2);
  assert.match(route, /const scopePermissions = renderScopePermissions\(grantedScope\)/);
  assert.match(route, /name="scope" value="\$\{escapeHtml\(grantedScope\)\}"/);
  assert.match(route, /user\.email\.toLowerCase\(\), grantedScope, resource/);
  assert.match(route, /if \(grantedScope !== scope\) callback\.searchParams\.set\("scope", grantedScope\)/);
  assert.doesNotMatch(route, /areUserScopesEnabled/);
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

test("GPT Action OpenAPI schema parses and matches the OAuth client and read-only routes", async () => {
  const panel = await read("app/action-instructions-panel.tsx");
  const match = panel.match(/const schema = `([\s\S]*?)`;/);
  assert.ok(match, "OpenAPI schema literal should be present");
  const schema = yaml.load(match[1]);
  assert.equal(schema.openapi, "3.1.0");
  assert.deepEqual(schema.servers, [{ url: "https://movidesk-oauth-proxy-pkce.thngrns.chatgpt.site" }]);
  assert.deepEqual(Object.keys(schema.paths).sort(), ["/api/ticket-content", "/api/tickets"]);
  for (const [path, item] of Object.entries(schema.paths)) {
    assert.deepEqual(Object.keys(item), ["get"], `${path} remains read-only`);
    assert.equal(item.get.security[0].MovideskOAuth[0], "movidesk:read");
  }
  assert.deepEqual(schema.components.securitySchemes.MovideskOAuth.flows.authorizationCode.scopes, {
    "movidesk:read": "Consultar tickets (somente leitura).",
  });
  assert.equal(schema.components.securitySchemes.MovideskOAuth.flows.authorizationCode.authorizationUrl, "https://movidesk-oauth-proxy-pkce.thngrns.chatgpt.site/oauth/authorize");
  assert.equal(schema.components.securitySchemes.MovideskOAuth.flows.authorizationCode.tokenUrl, "https://movidesk-oauth-proxy-pkce.thngrns.chatgpt.site/oauth/token");
});

test("GPT Action setup reports secret readiness without exposing the secret", async () => {
  const page = await read("app/action/page.tsx");
  const panel = await read("app/action-instructions-panel.tsx");
  const tokenRoute = await read("app/oauth/token/route.ts");
  const clients = await read("app/oauth/clients.ts");
  assert.match(page, /clientSecretFor\(GPT_ACTION_CLIENT_ID, process\.env\)/);
  assert.match(page, /clientSecretConfigured=\{clientSecretConfigured\}/);
  assert.match(panel, /clientSecretConfigured: boolean/);
  assert.match(panel, /OAUTH_GPT_ACTION_CLIENT_SECRET/);
  assert.match(panel, /O editor do GPT pede um Client Secret/);
  assert.match(panel, /Authorization Code e envio das credenciais no corpo da requisição \(POST\)/);
  assert.doesNotMatch(panel, /process\.env|clientSecretFor/);
  assert.match(tokenRoute, /request\.formData\(\)/);
  assert.match(tokenRoute, /form\.get\("client_secret"\)/);
  assert.match(clients, /id === GPT_ACTION_CLIENT_ID[\s\S]*?kind: "gpt-action", requiresPkce: false/);
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
  const registrations = await Promise.all([
    read("worker/mcp-tools.ts"),
    read("worker/knowledge-tools.ts"),
    read("worker/feedback-tools.ts"),
  ]);
  const toolNames = registrations.flatMap((source) => [...source.matchAll(/registerTool\(\s*"([a-z0-9_]+)"/g)].map((match) => match[1]));
  for (const tool of toolNames) assert.match(panel, new RegExp(tool), `the setup page documents ${tool}`);
  assert.match(panel, /id, filter, keyword/);
  assert.match(panel, /somente leitura/);
  assert.match(panel, /feedback:write offline_access/);
  assert.match(panel, /visualizar parâmetros/i);
  assert.match(panel, /A cópia foi bloqueada/);
  assert.doesNotMatch(panel, /barra final obrigatória/);
  const mcp = await read("worker/mcp.ts");
  assert.match(mcp, /const pathname = url\.pathname\.replace/);
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
