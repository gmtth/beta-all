import assert from "node:assert/strict";
import test from "node:test";
import { buildTicketTimeline } from "../worker/movidesk-timeline";
import { registerMovideskTools, type MovideskReader } from "../worker/mcp-tools";

const clientAction = (createdDate: string, origin: number, description: string, id: string) => ({ createdDate, origin, type: 0, description, createdBy: { id, profileType: 2 } });
const teamAction = (createdDate: string, origin: number, description: string, id: string, type = 0) => ({ createdDate, origin, type, description, createdBy: { id, profileType: 1 } });

test("timeline extracts nested createdBy and attributes client/team sequence across origins", () => {
  const timeline = buildTicketTimeline({ status: "In Progress", actions: [
    teamAction("2026-08-16T13:00:00Z", 23, "última resposta", "agent-2"),
    clientAction("2026-08-15T09:00:00Z", 0, "primeira manifestação", "client-0"),
    clientAction("2026-08-16T11:00:00Z", 3, "complemento do cliente", "client-3"),
    teamAction("2026-08-15T10:00:00Z", 2, "primeira resposta", "agent-1"),
  ] });
  assert.deepEqual(timeline.events.map((event) => event.summary), ["primeira manifestação", "primeira resposta", "complemento do cliente", "última resposta"]);
  assert.equal(timeline.events[0].author, "client-0");
  assert.equal(timeline.firstClientManifestation?.summary, "primeira manifestação");
  assert.equal(timeline.lastTeamResponse?.summary, "última resposta");
  assert.equal(timeline.terminalStatus, "In Progress");
});

test("internal note type=1 is a team event and never a client manifestation", () => {
  const timeline = buildTicketTimeline({ actions: [
    clientAction("2026-08-15T09:00:00Z", 0, "relato", "client"),
    teamAction("2026-08-15T10:00:00Z", 2, "resposta pública", "agent", 2),
    teamAction("2026-08-15T11:00:00Z", 23, "nota interna", "agent", 1),
  ] });
  assert.equal(timeline.firstClientManifestation?.summary, "relato");
  assert.equal(timeline.lastTeamResponse?.summary, "resposta pública");
  assert.equal(timeline.events[2].type, "1");
});

test("lastTeamResponse keeps the latest public team response before internal notes", () => {
  const timeline = buildTicketTimeline({ actions: [
    clientAction("2026-08-15T09:00:00Z", 3, "relato", "client"),
    teamAction("2026-08-15T10:00:00Z", 2, "primeira resposta", "agent", 2),
    clientAction("2026-08-15T11:00:00Z", 3, "complemento", "client"),
    teamAction("2026-08-15T12:00:00Z", 2, "última resposta", "agent", 2),
    teamAction("2026-08-15T13:00:00Z", 23, "nota interna posterior", "agent", 1),
  ], status: "Resolved" });
  assert.equal(timeline.lastTeamResponse?.summary, "última resposta");
  assert.equal(timeline.terminalStatus, "Resolved");
});

test("lastTeamResponse is null when the ticket has no public team response", () => {
  const timeline = buildTicketTimeline({ actions: [
    clientAction("2026-08-15T09:00:00Z", 3, "relato", "client"),
    teamAction("2026-08-15T10:00:00Z", 23, "somente nota interna", "agent", 1),
  ] });
  assert.equal(timeline.lastTeamResponse, null);
});

test("timeline preserves ordering, sourceIndex, fields, and attachments", () => {
  const timeline = buildTicketTimeline({ actions: [
    { createdDate: "2026-08-16T10:00:00Z", origin: 2, type: 0, status: "Resolved", justification: "done", description: "later", attachments: [{ id: 1 }], createdBy: { name: "Equipe" } },
    { createdDate: "2026-08-15T10:00:00Z", origin: 3, type: 0, status: "Open", justification: "initial", description: "earlier", createdBy: { name: "Cliente", profileType: 2 } },
  ], status: "Resolved" });
  assert.deepEqual(timeline.events.map((event) => event.sourceIndex), [1, 0]);
  assert.equal(timeline.events[0].status, "Open");
  assert.equal(timeline.events[0].justification, "initial");
  assert.equal(timeline.events[0].origin, "3");
  assert.equal(timeline.events[1].hasAttachments, true);
  assert.equal(timeline.terminalStatus, "Resolved");
});

test("timeline reports a closed ticket terminal status", () => {
  assert.equal(buildTicketTimeline({ status: "Closed", actions: [] }).terminalStatus, "Closed");
});

function setup(client: Partial<MovideskReader>) {
  const tools = new Map<string, (args: unknown) => Promise<unknown>>();
  registerMovideskTools({ registerTool(name: string, _config: unknown, handler: (args: unknown) => Promise<unknown>) { tools.set(name, handler); } }, client as MovideskReader, "temporary-token");
  return tools;
}

test("timeline supports internal ID and long protocol without changing get_ticket", async () => {
  const calls: string[] = [];
  const longProtocol = "202608150000000000000001";
  const tools = setup({
    getTicket: async (id) => { calls.push(`id:${id}`); return { actions: [] }; },
    searchTickets: async (params) => { calls.push(`protocol:${params.protocol}`); return { id: 123, actions: [] }; },
  });
  await tools.get("movidesk_get_ticket_timeline")!({ ticket_id: "123" });
  await tools.get("movidesk_get_ticket_timeline")!({ protocol: longProtocol });
  assert.deepEqual(calls, [`id:123`, `protocol:${longProtocol}`, "id:123"]);
});

test("timeline returns a controlled not-found error for unknown protocol", async () => {
  const tools = setup({ searchTickets: async () => [] });
  await assert.rejects(() => tools.get("movidesk_get_ticket_timeline")!({ protocol: "999999999999999999999999" }), /ticket_not_found/);
});
