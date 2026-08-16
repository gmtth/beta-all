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

test("answered questions are removed from pending items and administrative text is not a hypothesis", () => {
  const result = summarizeTicket({
    id: 6246,
    subject: "Senha incorreta na máquina",
    description: "Muitos funcionários recebem senha incorreta; mais de 200 pessoas são afetadas.",
    actions: [
      { description: "Confirmar se o problema também acontece na entrega balcão" },
      { description: "A cliente informou que não utiliza entrega balcão." },
      { description: "Caso encaminhado para desenvolvimento; estamos analisando." },
      { description: "Verificar se não pode ter relação com os zeros à esquerda" },
    ],
  });
  assert.deepEqual(result.pendingItems, ["Verificar se não pode ter relação com os zeros à esquerda"]);
  assert.deepEqual(result.hypotheses, ["Verificar se não pode ter relação com os zeros à esquerda"]);
  assert.match(result.reportedProblem ?? "", /mais de 200/i);
});

test("semantic summary prioritizes technical evidence and keeps an open ticket structurally complete", () => {
  const result = summarizeTicket({
    id: 6246,
    subject: "COFCO - SENHA INCORRETA MÁQUINA",
    status: "Em atendimento",
    description: "O mesmo funcionário tentou a mesma senha várias vezes; em algumas tentativas foi aceita e em outras foi identificada como incorreta.",
    actions: [{ description: "Teste reproduzido e retorno da integração Power verificado." }],
  });
  assert.equal(result.incomplete, false);
  assert.ok(result.evidence.some((item) => /mesma senha|retorno da integração|teste reproduzido/i.test(item)));
  assert.ok(result.evidence.length > 1);
});

test("classification uses causal evidence instead of the generic word funcionário", () => {
  const result = classifyTicketIssue({
    id: 6246,
    subject: "Senha incorreta na máquina",
    category: "2 - Erro Máquina",
    description: "Muitos funcionários não conseguem acessar a máquina porque a senha cadastrada é recusada.",
    actions: [{ description: "Teste reproduzido com senha incorreta." }],
  });
  assert.equal(result.category, "acesso e autenticação");
  assert.equal(result.officialCategory, "2 - Erro Máquina");
  assert.ok(!result.categories.includes("vínculo de funcionário"));
});

test("ticket without a resolution is not automatically incomplete", () => {
  const result = summarizeTicket({ id: 7, subject: "Falha", status: "Em atendimento", description: "A falha continua em investigação." });
  assert.equal(result.incomplete, false);
});

test("Phase 3A segments role-marked chat and ignores boilerplate for factual extraction", () => {
  const result = summarizeTicket({
    id: 6246,
    protocol: "20260812000000125",
    subject: "Senha incorreta",
    status: "Em atendimento",
    actions: [{
      id: 10,
      htmlDescription: '<div data-person-role="client">Olá! Muitos funcionários recebem senha incorreta.</div><div data-person-role="agent">Foi realizado teste com a mesma senha.</div><div data-person-role="system">Entrou na conversa</div>',
    }],
  });
  assert.match(result.reportedProblem ?? "", /Muitos funcionários/);
  assert.ok(result.actionsTaken.some((value) => /teste/i.test(value)));
  assert.ok(!result.actionsTaken.some((value) => /entrou na conversa|olá/i.test(value)));
});

test("Phase 3A does not infer categories from isolated terms", () => {
  const result = classifyTicketIssue({ id: 6264, subject: "Biometria e RFID", description: "O fluxo menciona biometria e RFID, sem relatar falha de acesso." });
  assert.equal(result.category, "não classificado");
  assert.deepEqual(result.categories, []);
});

test("Phase 3A preserves explicit official category and only explicit hypotheses", () => {
  const result = classifyTicketIssue({ id: 6277, category: "2 - Erro Máquina", subject: "GHE divergente", description: "Funcionário está no Apollus e ausente na Cenci. RFID citado posteriormente." });
  assert.equal(result.officialCategory, "2 - Erro Máquina");
  assert.equal(result.category, "não classificado");
  assert.deepEqual(summarizeTicket({ id: 6252, description: "Estamos analisando e aguardamos retorno." }).hypotheses, []);
});
