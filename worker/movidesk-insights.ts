export type InsightTicket = Record<string, unknown>;

const objectOf = (value: unknown) => value && typeof value === "object" ? value as Record<string, unknown> : {};
const firstValue = (object: Record<string, unknown>, keys: string[]) => keys.map((key) => object[key]).find((value) => value !== undefined && value !== null && value !== "");
const text = (value: unknown) => typeof value === "string" && value.trim() ? value.replace(/<[^>]*>/g, " ").replace(/&nbsp;/gi, " ").replace(/&amp;/gi, "&").replace(/\s+/g, " ").trim() : null;
const valueText = (object: Record<string, unknown>, keys: string[]) => text(firstValue(object, keys));
const actionsOf = (ticket: InsightTicket) => {
  const value = firstValue(ticket, ["actions", "acoes", "interactions", "interacoes", "history", "historico"]);
  return Array.isArray(value) ? value.map(objectOf) : [];
};
const subjectOf = (ticket: InsightTicket) => valueText(ticket, ["subject", "assunto", "title", "titulo"]);
const initialDescriptionOf = (ticket: InsightTicket) => valueText(ticket, ["initialDescription", "description", "descriptionHtml", "descricao"]);
const actionDescription = (action: Record<string, unknown>) => valueText(action, ["description", "htmlDescription", "text", "message", "content", "observation", "observacao", "descricao"]);
const firstSentence = (value: string | null) => value ? (value.split(/(?<=[.!?])\s+/)[0] ?? value).slice(0, 300) : null;
const unique = (values: Array<string | null>) => [...new Set(values.filter((value): value is string => Boolean(value)))];
const ticketIdentity = (ticket: InsightTicket) => ({ id: firstValue(ticket, ["id", "ticketId"]), protocol: firstValue(ticket, ["protocol", "protocolo"]) });
const confidence = (evidence: string[], actions: string[]) => evidence.length > 1 && actions.length > 0 ? "high" : evidence.length ? "medium" : "low";

export function summarizeTicket(ticketValue: unknown) {
  const ticket = objectOf(Array.isArray(ticketValue) ? ticketValue[0] : ticketValue);
  const subject = subjectOf(ticket);
  const initialDescription = initialDescriptionOf(ticket);
  const actions = actionsOf(ticket);
  const actionTexts = actions.map(actionDescription).filter((value): value is string => Boolean(value));
  const evidence = unique([
    subject ? `Assunto: ${subject}` : null,
    initialDescription ? `Descrição inicial: ${initialDescription.slice(0, 500)}` : null,
  ]);
  const actionsTaken = actionTexts.filter((value) => !/(aguardar|pendente|pendência|pending|confirmar|validar|retorno|visita|pode ser|provavelmente|possível|suspeita|hipótese|may be|probably|possible|suspect)/i.test(value)).slice(0, 20);
  const pendingItems = actionTexts.filter((value) => /(aguardar|pendente|pendência|pending|confirmar|validar|retorno|visita)/i.test(value)).slice(0, 20);
  const hypotheses = unique(actionTexts.filter((value) => /(pode ser|provavelmente|possível|suspeita|hipótese|may be|probably|possible|suspect)/i.test(value)).map((value) => value.slice(0, 500)));
  const reportedProblem = firstSentence(initialDescription) ?? firstSentence(subject);
  const status = valueText(ticket, ["status", "baseStatus"]);
  const summary = [reportedProblem, status ? `Status atual: ${status}.` : null].filter(Boolean).join(" ") || "Histórico sem texto suficiente para resumo.";
  return { ...ticketIdentity(ticket), summary, reportedProblem, actionsTaken, pendingItems, evidence, hypotheses, confidence: confidence(evidence, actionsTaken), incomplete: !initialDescription || !actions.length };
}

const rules: Array<{ category: string; terms: string[] }> = [
  { category: "máquina inoperante", terms: ["inoperante", "não liga", "nao liga", "parada", "sem operação", "sem operacao"] },
  { category: "máquina offline", terms: ["offline", "sem conexão", "sem conexao", "desconectada"] },
  { category: "falha de dispensação", terms: ["dispensação", "dispensacao", "não dispensa", "nao dispensa"] },
  { category: "entrega registrada incorretamente", terms: ["entrega incorreta", "registrou errado", "baixa divergente"] },
  { category: "integração parada", terms: ["integração parada", "integracao parada", "não sincroniza", "nao sincroniza"] },
  { category: "estoque ou baixa divergente", terms: ["estoque", "baixa divergente", "saldo divergente"] },
  { category: "vínculo de funcionário", terms: ["vínculo", "vinculo", "funcionário", "funcionario"] },
  { category: "acesso e autenticação", terms: ["login", "senha", "autenticação", "autenticacao", "acesso"] },
  { category: "solicitação de melhoria", terms: ["melhoria", "sugestão", "sugestao", "feature"] },
  { category: "erro de relatório", terms: ["relatório", "relatorio", "dashboard"] },
];

export function classifyTicketIssue(ticketValue: unknown) {
  const ticket = objectOf(Array.isArray(ticketValue) ? ticketValue[0] : ticketValue);
  const summary = summarizeTicket(ticket);
  const corpus = [summary.summary, ...summary.evidence, ...summary.actionsTaken, ...summary.pendingItems].join(" ").toLocaleLowerCase();
  const matches = rules.map((rule) => ({ rule, matched: rule.terms.filter((term) => corpus.includes(term)) })).filter((entry) => entry.matched.length);
  const best = matches.sort((left, right) => right.matched.length - left.matched.length)[0];
  const evidence = best ? unique([...summary.evidence, ...summary.actionsTaken, ...summary.pendingItems].filter((value) => best.matched.some((term) => value.toLocaleLowerCase().includes(term))).map((value) => value.slice(0, 500))) : [];
  return { ...ticketIdentity(ticket), category: best?.rule.category ?? "não classificado", categories: matches.map((entry) => entry.rule.category), officialCategory: valueText(ticket, ["category", "categoria"]), evidence, confidence: best ? (best.matched.length > 1 ? "high" : "medium") : "low" };
}
