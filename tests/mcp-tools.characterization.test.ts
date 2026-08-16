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

test("characterization: stable Movidesk tools remain registered", () => {
  const tools = setup({});
  for (const name of [
    "movidesk_get_ticket",
    "movidesk_search_tickets",
    "movidesk_list_open_tickets",
    "movidesk_search_ticket_content",
    "movidesk_search_people",
    "movidesk_list_services",
  ]) assert.equal(tools.has(name), true, name);
  assert.equal(tools.has("movidesk_get_ticket_timeline"), true);
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
  const tools = setup({ getTicket: async (id) => { receivedId = id; return [{ id: 6280, subject: "Assunto", status: "Aguardando" }]; } });
  const result = await tools.get("movidesk_get_ticket")!.handler({ ticket_id: "6280" }) as { structuredContent: unknown };
  assert.equal(receivedId, "6280");
  assert.deepEqual(result.structuredContent, { ticket: { id: 6280, subject: "Assunto", status: "Aguardando" } });
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
