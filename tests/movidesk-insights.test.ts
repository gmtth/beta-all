import assert from "node:assert/strict";
import test from "node:test";
import { classifyTicketIssue, summarizeTicket } from "../worker/movidesk-insights";
import { registerMovideskTools, type MovideskReader } from "../worker/mcp-tools";

const ticket = { id: 6280, protocol: "20260814000000159", subject: "Máquina inoperante", description: "A máquina parou e não liga.", category: "Equipamento", status: "Aguardando", actions: [
  { description: "Reinício da máquina realizado" },
  { description: "Aguardar confirmação da visita técnica" },
  { description: "Pode ser falha de energia" },
] };

test("summary separates facts, actions, pending items, evidence, and hypotheses", () => {
  const result = summarizeTicket(ticket);
  assert.equal(result.id, 6280);
  assert.equal(result.protocol, "20260814000000159");
  assert.match(result.summary, /máquina parou/i);
  assert.deepEqual(result.actionsTaken, ["Reinício da máquina realizado"]);
  assert.deepEqual(result.pendingItems, ["Aguardar confirmação da visita técnica"]);
  assert.deepEqual(result.hypotheses, ["Pode ser falha de energia"]);
  assert.equal(result.incomplete, false);
});

test("classification returns explainable category without replacing official category", () => {
  const result = classifyTicketIssue(ticket);
  assert.equal(result.category, "máquina inoperante");
  assert.deepEqual(result.categories, ["máquina inoperante"]);
  assert.equal(result.officialCategory, "Equipamento");
  assert.match(result.evidence[0], /Máquina inoperante/);
});

test("empty or incomplete history is explicit and low confidence", () => {
  const result = summarizeTicket({ id: 1, subject: "Dúvida" });
  assert.equal(result.incomplete, true);
  assert.equal(result.confidence, "medium");
  assert.deepEqual(classifyTicketIssue({ id: 1, subject: "Dúvida" }).category, "não classificado");
});

test("MCP registers summary and classification as additive read-only tools", async () => {
  const tools = new Map<string, (args: unknown) => Promise<unknown>>();
  registerMovideskTools({ registerTool(name: string, _config: unknown, handler: (args: unknown) => Promise<unknown>) { tools.set(name, handler); } }, { getTicket: async () => ticket } as Partial<MovideskReader> as MovideskReader, "temporary-token");
  const summary = await tools.get("movidesk_summarize_ticket")!({ ticket_id: "6280" }) as { structuredContent: { reportedProblem: string } };
  const classification = await tools.get("movidesk_classify_ticket_issue")!({ ticket_id: "6280" }) as { structuredContent: { category: string } };
  assert.match(summary.structuredContent.reportedProblem, /máquina parou/i);
  assert.equal(classification.structuredContent.category, "máquina inoperante");
});

test("analysis tools expose ticket_id and protocol in MCP input schemas and keep XOR at runtime", async () => {
  const configs = new Map<string, unknown>();
  const tools = new Map<string, (args: unknown) => Promise<unknown>>();
  registerMovideskTools({ registerTool(name: string, config: unknown, handler: (args: unknown) => Promise<unknown>) { configs.set(name, config); tools.set(name, handler); } }, { getTicket: async () => ticket } as Partial<MovideskReader> as MovideskReader, "temporary-token");
  for (const name of ["movidesk_get_ticket_timeline", "movidesk_summarize_ticket", "movidesk_classify_ticket_issue"]) {
    const config = configs.get(name) as { inputSchema: { _def?: { typeName?: string }; shape?: Record<string, unknown> } };
    assert.equal(config.inputSchema._def?.typeName, "ZodObject");
    assert.ok(config.inputSchema.shape?.ticket_id);
    assert.ok(config.inputSchema.shape?.protocol);
    await assert.rejects(() => tools.get(name)!({ ticket_id: "6280", protocol: "20260814000000159" }), /Informe exatamente um/);
  }
});
