import assert from "node:assert/strict";
import { test } from "node:test";
import { registerMovideskTools, type MovideskReader } from "../worker/mcp-tools";

type RegisteredTool = { config: unknown; handler: (args: unknown) => Promise<unknown> };

function setup(client: Partial<MovideskReader>) {
  const tools = new Map<string, RegisteredTool>();
  const server = { registerTool(name: string, config: unknown, handler: (args: unknown) => Promise<unknown>) { tools.set(name, { config, handler }); } };
  registerMovideskTools(server, client as MovideskReader, "temporary-token");
  return tools;
}

async function recurrenceResult(client: Partial<MovideskReader>, args: Record<string, unknown>) {
  const tools = setup(client);
  return (await tools.get("movidesk_detect_recurrent_issues")!.handler({ min_occurrences: 2, top: 10, skip: 0, ...args })) as { structuredContent: { groups: Array<Record<string, any>>; total: number; returned: number; top: number; skip: number; meta?: Record<string, any> } };
}

test("detect_recurrent_issues derives rising, falling, stable and insufficient trends from delta", async () => {
  const rows = [
    { id: "r1", subject: "Sensoralpha offline", description: "Sensoralpha offline", createdDate: "2026-01-01" },
    { id: "r2", subject: "Sensoralpha offline", description: "Sensoralpha offline", createdDate: "2026-02-01" },
    { id: "r3", subject: "Sensoralpha offline", description: "Sensoralpha offline", createdDate: "2026-02-02" },
    { id: "f1", subject: "Accessbeta denied", description: "Accessbeta denied", createdDate: "2026-01-01" },
    { id: "f2", subject: "Accessbeta denied", description: "Accessbeta denied", createdDate: "2026-01-02" },
    { id: "f3", subject: "Accessbeta denied", description: "Accessbeta denied", createdDate: "2026-02-01" },
    { id: "s1", subject: "Printergamma jammed", description: "Printergamma jammed", createdDate: "2026-01-01" },
    { id: "s2", subject: "Printergamma jammed", description: "Printergamma jammed", createdDate: "2026-02-01" },
    { id: "i1", subject: "Queueomega delayed", description: "Queueomega delayed", createdDate: "2026-01-03" },
    { id: "i2", subject: "Queueomega delayed", description: "Queueomega delayed", createdDate: "2026-01-04" },
  ];
  const result = await recurrenceResult({ searchTickets: async () => rows.map(({ id, subject, createdDate }) => ({ id, subject, createdDate })), getTicket: async (id) => rows.find((row) => row.id === id) }, {});
  const byKey = Object.fromEntries(result.structuredContent.groups.map((group) => [String(group.key), group]));
  const rising = Object.values(byKey).find((group) => String(group.key).includes("sensoralpha"))!;
  const falling = Object.values(byKey).find((group) => String(group.key).includes("accessbeta"))!;
  const stable = Object.values(byKey).find((group) => String(group.key).includes("printergamma"))!;
  const insufficient = Object.values(byKey).find((group) => String(group.key).includes("queueomega"))!;
  for (const group of [rising, falling, stable]) {
    const trend = group.trend;
    assert.equal(trend.direction, trend.deltaPercentage > 0 ? "rising" : trend.deltaPercentage < 0 ? "falling" : "stable");
    assert.equal(group.trendDirection, trend.direction);
    assert.equal(trend.lastCount > trend.firstCount, trend.direction === "rising");
    assert.equal(trend.lastCount < trend.firstCount, trend.direction === "falling");
  }
  assert.equal(rising.trend.deltaPercentage, 100);
  assert.equal(rising.trend.direction, "rising");
  assert.equal(falling.trend.deltaPercentage, -50);
  assert.equal(falling.trend.direction, "falling");
  assert.equal(stable.trend.deltaPercentage, 0);
  assert.equal(stable.trend.direction, "stable");
  assert.equal(insufficient.trend.deltaPercentage, null);
  assert.equal(insufficient.trend.direction, "insufficient_data");
});

test("detect_recurrent_issues preserves filtering, pagination, truncation and partial enrichment metadata", async () => {
  const rows = Array.from({ length: 100 }, (_, index) => ({ id: String(index + 1), subject: "Falha paginada", description: "Falha paginada", createdDate: `2026-${String((index % 3) + 1).padStart(2, "0")}-01` }));
  let received: Record<string, unknown> | undefined;
  const result = await recurrenceResult({
    searchTickets: async (params) => { received = params; return rows.map(({ id, subject, createdDate }) => ({ id, subject, createdDate })); },
    getTicket: async (id) => id === "2" ? Promise.reject(new Error("HTTP 502")) : rows.find((row) => row.id === id),
  }, { from_date: "2026-01-01", to_date: "2026-03-31", date_field: "createdDate", min_occurrences: 2, top: 2, skip: 1 });
  assert.equal(received?.from_date, "2026-01-01");
  assert.equal(received?.to_date, "2026-03-31");
  assert.equal(received?.date_field, "createdDate");
  assert.equal(received?.top, 100);
  assert.equal(result.structuredContent.top, 2);
  assert.equal(result.structuredContent.skip, 1);
  assert.equal(result.structuredContent.returned, result.structuredContent.groups.length);
  assert.equal(result.structuredContent.meta?.candidateCount, 100);
  assert.equal(result.structuredContent.meta?.enrichmentFailures, 1);
  assert.equal(result.structuredContent.meta?.enrichedCount, 99);
  assert.equal(result.structuredContent.meta?.maxCandidates, 100);
  assert.equal(result.structuredContent.meta?.truncated, true);
  assert.match(String(result.structuredContent.meta?.truncationNote), /limitada aos 100 candidatos/);
});

test("detect_recurrent_issues applies min_occurrences before pagination and handles empty results", async () => {
  const rows = [
    { id: "1", subject: "Falha recorrente", description: "Falha recorrente", createdDate: "2026-01-01" },
    { id: "2", subject: "Falha recorrente", description: "Falha recorrente", createdDate: "2026-02-01" },
    { id: "3", subject: "Caso isolado", description: "Caso isolado", createdDate: "2026-03-01" },
  ];
  const result = await recurrenceResult({ searchTickets: async () => rows, getTicket: async (id) => rows.find((row) => row.id === id) }, { min_occurrences: 2, top: 1, skip: 1 });
  assert.equal(result.structuredContent.total, 1);
  assert.equal(result.structuredContent.returned, 0);
  const empty = await recurrenceResult({ searchTickets: async () => [], getTicket: async () => undefined }, { min_occurrences: 2 });
  assert.deepEqual(empty.structuredContent.groups, []);
  assert.equal(empty.structuredContent.total, 0);
  assert.equal(empty.structuredContent.returned, 0);
});

test("characterization: stable Movidesk tools remain registered", () => {
  const tools = setup({});
  for (const name of [
    "movidesk_get_ticket",
    "movidesk_search_tickets",
    "movidesk_list_open_tickets",
    "movidesk_search_ticket_content",
    "movidesk_find_similar_tickets",
    "movidesk_detect_recurrent_issues",
    "movidesk_search_people",
    "movidesk_list_services",
  ]) assert.equal(tools.has(name), true, name);
  assert.equal(tools.has("movidesk_get_ticket_timeline"), true);
});

test("every Movidesk MCP tool declares its required OAuth scope", () => {
  const tools = setup({});
  for (const name of [
    "movidesk_get_ticket",
    "movidesk_get_ticket_timeline",
    "movidesk_summarize_ticket",
    "movidesk_classify_ticket_issue",
    "movidesk_search_tickets",
    "movidesk_list_open_tickets",
    "movidesk_search_ticket_content",
    "movidesk_find_similar_tickets",
    "movidesk_detect_recurrent_issues",
    "movidesk_search_people",
    "movidesk_list_services",
  ]) {
    const config = tools.get(name)?.config as { securitySchemes?: unknown } | undefined;
    assert.deepEqual(config?.securitySchemes, [{ type: "oauth2", scopes: ["movidesk:read"] }], name);
  }
});

test("detect_recurrent_issues groups problem terms with trend, status and client counts", async () => {
  const data = new Map<string, unknown>([
    ["1", { id: 1, protocol: "p1", subject: "Sensor offline", description: "Sensor da gaveta offline", status: "Resolvido", clientId: "A", createdDate: "2026-08-01" }],
    ["2", { id: 2, protocol: "p2", subject: "Sensor offline", description: "Sensor da gaveta offline", status: "Fechado", clientId: "B", createdDate: "2026-08-02" }],
    ["3", { id: 3, protocol: "p3", subject: "Sensor offline", description: "Sensor da gaveta offline", status: "Aguardando", clientId: "A", createdDate: "2026-09-01" }],
    ["4", { id: 4, protocol: "p4", subject: "Relatório vencido", description: "Relatório obrigatório vencido", status: "Resolvido", clientId: "C", createdDate: "2026-09-02" }],
  ]);
  const tools = setup({ searchTickets: async (params) => { assert.equal(params.top, 100); return [...data.values()].map(({ id, subject, createdDate, status, clientId }) => ({ id, subject, createdDate, status, clientId })); }, getTicket: async (id) => data.get(id) });
  const result = await tools.get("movidesk_detect_recurrent_issues")!.handler({ from_date: "2026-01-01", to_date: "2026-09-16", min_occurrences: 3, top: 10, skip: 0 }) as { structuredContent: { groups: Array<{ issue: string; occurrences: number; uniqueClients: number; sameClientDominant: boolean; trendByMonth: Record<string, number>; trendDirection: string; trend: { deltaPercentage: number | null }; statusCounts: Record<string, number>; signalDetails: Array<{ term: string; fields: Record<string, number>; examples: string[] }>; confidence: string }> } };
  const group = result.structuredContent.groups[0];
  assert.match(group.issue, /sensor|offline/);
  assert.equal(group.occurrences, 3);
  assert.equal(group.uniqueClients, 2);
  assert.deepEqual(group.trendByMonth, { "2026-08": 2, "2026-09": 1 });
  assert.equal(group.trendDirection, "falling");
  assert.equal(group.trend.deltaPercentage, -50);
  assert.equal(group.statusCounts.Resolvido, 1);
  assert.equal(group.sameClientDominant, true);
  assert.ok(group.signalDetails.some((signal) => signal.fields.subject >= 3 && signal.examples.length === 3));
});

test("detect_recurrent_issues preserves HTTP error codes as meaningful problem terms", async () => {
  const data = new Map<string, unknown>([
    ["1", { id: 1, subject: "Erro 500 no relatório", description: "Falha ao gerar relatório", createdDate: "2026-09-01" }],
    ["2", { id: 2, subject: "Erro 500 no sistema", description: "Erro ao abrir relatório", createdDate: "2026-09-02" }],
    ["3", { id: 3, subject: "Erro 500 recorrente", description: "Falha no relatório", createdDate: "2026-09-03" }],
  ]);
  const tools = setup({ searchTickets: async () => [...data.values()].map(({ id, subject, createdDate }) => ({ id, subject, createdDate })), getTicket: async (id) => data.get(id) });
  const result = await tools.get("movidesk_detect_recurrent_issues")!.handler({ min_occurrences: 3, top: 10, skip: 0 }) as { structuredContent: { groups: Array<{ issue: string; occurrences: number }> } };
  assert.equal(result.structuredContent.groups[0].occurrences, 3);
  assert.match(result.structuredContent.groups[0].issue, /erro 500/);
});

test("find_similar_tickets compares full content and exposes explainable signals", async () => {
  const tickets = new Map<string, unknown>([
    ["6280", { id: 6280, protocol: "P-6280", subject: "Máquina inoperante", category: "Hardware", service: "Suporte", ownerTeam: "N1", actions: [{ description: "Máquina não liga" }] }],
    ["6290", { id: 6290, protocol: "P-6290", subject: "Máquina parada", category: "Hardware", service: "Suporte", ownerTeam: "N1", actions: [{ description: "Equipamento inoperante e sem energia" }] }],
    ["6291", { id: 6291, protocol: "P-6291", subject: "Máquina parada", category: "Financeiro", service: "Faturamento", actions: [{ description: "Boleto vencido" }] }],
  ]);
  const searchParams: Record<string, unknown>[] = [];
  const tools = setup({
    getTicket: async (id) => tickets.get(id),
    searchTickets: async (params) => { searchParams.push(params); return [{ id: 6290 }, { id: 6291 }, { id: 6280 }]; },
  });
  const result = await tools.get("movidesk_find_similar_tickets")!.handler({ ticket_id: "6280", top: 10, skip: 0 }) as { structuredContent: { results: Array<{ id: number; similarityScore: number; matchedSignals: string[] }> } };
  assert.ok(searchParams.length >= 1);
  assert.ok(searchParams.every((params) => String(params.keyword).length <= 180));
  assert.equal(result.structuredContent.results[0].id, 6290);
  assert.ok(result.structuredContent.results[0].similarityScore > 0.2);
  assert.ok(result.structuredContent.results[0].matchedSignals.some((signal) => signal.includes("termos do subject")));
});

test("find_similar_tickets does not send a full transcript and structures upstream errors", async () => {
  const huge = "ação extensa ".repeat(5000);
  let query = "";
  const tools = setup({
    getTicket: async () => ({ id: 5871, protocol: "5871", subject: "Redefinição de senha", actions: [{ description: huge }] }),
    searchTickets: async (params) => { query = String(params.keyword); throw new Error("HTTP 414: Movidesk returned a non-JSON response"); },
  });
  const result = await tools.get("movidesk_find_similar_tickets")!.handler({ ticket_id: "5871", top: 5, skip: 0 }) as { structuredContent: { results: unknown[]; error?: { code: string }; returned: number; top: number; skip: number } };
  assert.ok(query.length <= 180);
  assert.deepEqual(result.structuredContent.results, []);
  assert.equal(result.structuredContent.error?.code, "upstream_search_failed");
  assert.equal(result.structuredContent.returned, 0);
  assert.equal(result.structuredContent.top, 5);
  assert.equal(result.structuredContent.skip, 0);
});

test("find_similar_tickets accepts text-only references and preserves scope", async () => {
  let received: Record<string, unknown> | undefined;
  const tools = setup({ searchTickets: async (params) => { received = params; return [{ id: 7001 }]; }, getTicket: async () => ({ id: 7001, subject: "Erro de login", description: "Erro de login no sistema" }) });
  const result = await tools.get("movidesk_find_similar_tickets")!.handler({ keyword: "erro de login", from_date: "2026-08-01", to_date: "2026-08-16", top: 5, skip: 2 }) as { structuredContent: { reference: string; results: unknown[] } };
  assert.equal(received?.from_date, "2026-08-01");
  assert.equal(received?.to_date, "2026-08-16");
  assert.equal(received?.skip, 2);
  assert.equal(result.structuredContent.reference, "erro de login");
  assert.equal(result.structuredContent.results.length, 1);
});

test("find_similar_tickets uses relevant terms from an ID reference", async () => {
  const origin = { id: 5871, protocol: "20260704000000052", subject: "Redefinição de senha", description: "Usuário não consegue acessar" };
  const similar = { id: 6069, protocol: "20260706000000069", subject: "Redefinição senha", description: "Solicitação de redefinição de senha" };
  const queries: string[] = [];
  const tools = setup({
    getTicket: async (id) => id === "5871" ? origin : similar,
    searchTickets: async (params) => { queries.push(String(params.keyword)); return params.keyword === "senha" ? [{ id: 6069 }] : []; },
  });
  const result = await tools.get("movidesk_find_similar_tickets")!.handler({ ticket_id: "5871", top: 5, skip: 0 }) as { structuredContent: { results: Array<{ id: number }> } };
  assert.ok(queries.includes("senha"));
  assert.deepEqual(result.structuredContent.results.map((item) => item.id), [6069]);
});

test("find_similar_tickets ranks problem terms above institutional metadata", async () => {
  const origin = { id: 5871, subject: "Redefinição de senha", description: "Usuário precisa redefinir senha do sistema" };
  const password = { id: 6069, subject: "Redefinição senha", description: "Redefinição de senha para acesso" };
  const machine = { id: 6316, subject: "Problemas de máquina", description: "Máquina fechada CenciHUB em 2026" };
  const tools = setup({ getTicket: async (id) => id === "5871" ? origin : id === "6069" ? password : machine, searchTickets: async () => [{ id: 6069 }, { id: 6316 }] });
  const result = await tools.get("movidesk_find_similar_tickets")!.handler({ ticket_id: "5871", top: 5, skip: 0 }) as { structuredContent: { results: Array<{ id: number; matchedSignals: string[] }> } };
  assert.equal(result.structuredContent.results[0].id, 6069);
  assert.ok(result.structuredContent.results[0].matchedSignals.every((signal) => !/2026|cencihub|fechado|closed/i.test(signal)));
});

test("find_similar_tickets never emits object-conversion tokens or broad fallback errors", async () => {
  const calls: Array<Record<string, unknown>> = [];
  const tools = setup({
    searchTickets: async (params) => { calls.push(params); return params.keyword ? [] : [{ id: 7100 }]; },
    getTicket: async (id) => id === "7100" ? { id: 7100, subject: "Máquina inoperante", actions: [{ description: "Falha de máquina" }] } : undefined,
  });
  const result = await tools.get("movidesk_find_similar_tickets")!.handler({ keyword: "máquina", top: 5, skip: 0 }) as { structuredContent: { results: Array<{ matchedSignals: string[] }>; error?: unknown } };
  assert.ok(calls.every((params) => params.keyword !== undefined));
  assert.equal(result.structuredContent.error, undefined);
});

test("find_similar_tickets keeps technical action terms and removes contact/signature noise", async () => {
  const tools = setup({
    searchTickets: async () => [{ id: 7200 }],
    getTicket: async (id) => id === "7200"
      ? { id: 7200, subject: "Falha de autenticação", actions: [{ description: "Validar biometria do usuário. https://example.invalid contato service25@cencicia.com.br\nAtenciosamente, Cenci" }] }
      : { id: 7199, subject: "Falha de autenticação", actions: [{ description: "Validar biometria do usuário. telefone 5511999999999" }] },
  });
  const result = await tools.get("movidesk_find_similar_tickets")!.handler({ ticket_id: "7199", top: 5, skip: 0 }) as { structuredContent: { results: Array<{ signalDetails: Array<{ term: string; field: string }> }> } };
  const details = result.structuredContent.results[0].signalDetails;
  assert.ok(details.some((signal) => signal.term === "biometria" && signal.field === "actions.technical"));
  assert.ok(details.every((signal) => !/example|cencicia|service|telefone|atenciosamente/i.test(signal.term)));
});

test("find_similar_tickets ignores operational actions for scoring", async () => {
  const tools = setup({
    searchTickets: async () => [{ id: 7300 }],
    getTicket: async (id) => id === "7300"
      ? { id: 7300, subject: "Outro assunto", actions: [{ description: "Olá, favor informe seus dados. Estamos à disposição." }] }
      : { id: 7299, subject: "Falha técnica", actions: [{ description: "Olá, favor informe seus dados. Estamos à disposição." }] },
  });
  const result = await tools.get("movidesk_find_similar_tickets")!.handler({ ticket_id: "7299", top: 5, skip: 0 }) as { structuredContent: { results: unknown[] } };
  assert.deepEqual(result.structuredContent.results, []);
});

test("find_similar_tickets excludes generic dialogue and names from technical action signals", async () => {
  const tools = setup({
    searchTickets: async () => [{ id: 7400 }],
    getTicket: async (id) => id === "7400"
      ? { id: 7400, subject: "Sensor offline", actions: [{ description: "Sensor offline após reiniciando o equipamento. Você pode falar com Eric Ribeiro e os analistas." }] }
      : { id: 7399, subject: "Sensor offline", actions: [{ description: "Sensor offline após reiniciando o equipamento. Você pode falar com Eric Ribeiro e os analistas." }] },
  });
  const result = await tools.get("movidesk_find_similar_tickets")!.handler({ ticket_id: "7399", top: 5, skip: 0 }) as { structuredContent: { results: Array<{ signalDetails: Array<{ term: string; field: string }> }> } };
  const terms = result.structuredContent.results[0].signalDetails.map((signal) => signal.term);
  assert.ok(terms.includes("sensor"));
  assert.ok(terms.includes("offline"));
  assert.ok(!terms.some((term) => /voce|sera|pode|precisa|junto|essa|eric|ribeiro|analistas/.test(term)));
});

test("new timeline tool preserves event order and returns analysis fields", async () => {
  const tools = setup({ getTicket: async () => ({ status: "Aguardando", actions: [
    { createdDate: "2026-08-16T10:00:00Z", origin: "team", description: "resposta" },
    { createdDate: "2026-08-15T10:00:00Z", origin: "client", description: "problema" },
  ] }) });
  const result = await tools.get("movidesk_get_ticket_timeline")!.handler({ ticket_id: "6280" }) as { structuredContent: { events: Array<{ summary: string | null }> } };
  assert.deepEqual(result.structuredContent.events.map((event) => event.summary), ["problema", "resposta"]);
});

test("characterization: search_tickets preserves filters and collection envelope", async () => {
  let received: Record<string, unknown> | undefined;
  const tools = setup({ searchTickets: async (params) => { received = params; return [{ id: 6280 }]; } });
  const result = await tools.get("movidesk_search_tickets")!.handler({ keyword: "VPN", from_date: "2026-08-01", owner_team: "Suporte N1", top: 10, skip: 5 }) as { structuredContent: unknown };
  assert.equal(received?.keyword, "VPN");
  assert.equal(received?.from_date, "2026-08-01");
  assert.equal(received?.owner_team, "Suporte N1");
  assert.equal(received?.top, 10);
  assert.equal(received?.skip, 5);
  assert.deepEqual(result.structuredContent, { results: [{ id: 6280 }] });
});

test("characterization: get_ticket preserves the ticket envelope", async () => {
  let receivedId = "";
  const tools = setup({ getTicket: async (id) => { receivedId = id; return [{ id: 6280, protocol: "20260702000000016", subject: "Assunto", status: "Aguardando" }]; } });
  const result = await tools.get("movidesk_get_ticket")!.handler({ ticket_id: "6280" }) as { structuredContent: unknown };
  assert.equal(receivedId, "6280");
  assert.deepEqual(result.structuredContent, { ticket: { id: 6280, protocol: "20260702000000016", subject: "Assunto", status: "Aguardando" } });
});

test("characterization: list_open_tickets always returns a results object", async () => {
  let received: Record<string, unknown> | undefined;
  const tools = setup({ searchTickets: async (params) => { received = params; return []; } });
  const result = await tools.get("movidesk_list_open_tickets")!.handler({ created_date: "2026-08-16", top: 20, skip: 0 }) as { structuredContent: unknown };
  assert.equal(received?.from_date, "2026-08-16");
  assert.equal(received?.to_date, "2026-08-16");
  assert.equal(received?.top, 20);
  assert.equal(received?.skip, 0);
  assert.deepEqual(result.structuredContent, { results: [] });
});

test("characterization: search_ticket_content finds subject and action text", async () => {
  const tools = setup({
    searchTickets: async () => [{ id: 6280, subject: "Máquina inoperante" }],
    getTicket: async () => [{ id: 6280, subject: "Máquina inoperante", actions: [{ id: 1, description: "Reinício da máquina realizado" }] }],
  });
  const result = await tools.get("movidesk_search_ticket_content")!.handler({ keyword: "máquina", from_date: "2026-08-10", case_sensitive: false, top: 20, skip: 0 }) as { structuredContent: { total: number; results: Array<{ matchedIn: string[] }> } };
  assert.equal(result.structuredContent.total, 1);
  assert.deepEqual(result.structuredContent.results[0].matchedIn, ["subject", "initialDescription"]);
});

test("search_ticket_content accepts the individual-ticket object returned by id lookups", async () => {
  const ticket = { id: 6246, subject: "Senha incorreta", actions: [{ id: 1, description: "consta senha incorreta" }] };
  const tools = setup({
    searchTickets: async (params) => params.id ? ticket : { results: [] },
    getTicket: async () => ticket,
  });
  const result = await tools.get("movidesk_search_ticket_content")!.handler({ id: "6246", keyword: "senha" }) as { structuredContent: { total: number; results: Array<{ id: number }> } };
  assert.equal(result.structuredContent.total, 1);
  assert.equal(result.structuredContent.results[0].id, 6246);
});

test("search_ticket_content reports later action matches as interactions", async () => {
  const ticket = { id: 6246, subject: "Senha", actions: [{ id: 1, description: "manifestação inicial" }, { id: 2, description: "Verificar zeros à esquerda" }] };
  const tools = setup({ searchTickets: async (params) => params.id ? ticket : { results: [] }, getTicket: async () => ticket });
  const result = await tools.get("movidesk_search_ticket_content")!.handler({ id: "6246", keyword: "zeros" }) as { structuredContent: { results: Array<{ matchedIn: string[] }> } };
  assert.deepEqual(result.structuredContent.results[0].matchedIn, ["interactions"]);
});

test("characterization: people and services preserve known filter calls", async () => {
  const calls: Record<string, Record<string, unknown>> = {};
  const tools = setup({
    searchPeople: async (params) => { calls.people = params; return [{ id: 1 }]; },
    listServices: async (params) => { calls.services = params; return [{ id: 2 }]; },
  });
  await tools.get("movidesk_search_people")!.handler({ id: "1", filter: "id eq 1" });
  await tools.get("movidesk_list_services")!.handler({ filter: "isActive eq true", page: 2, page_size: 10 });
  assert.equal(calls.people.id, "1");
  assert.equal(calls.people.filter, "id eq 1");
  assert.equal(calls.services.filter, "isActive eq true");
  assert.equal(calls.services.top, 10);
  assert.equal(calls.services.skip, 10);
});
