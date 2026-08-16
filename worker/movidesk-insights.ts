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
const analysisText = (value: string) => value.replace(/https?:\/\/\S+/gi, " ").replace(/\b(?:telefone|whatsapp|e-mail|email)\s*[:=-]?\s*\S+/gi, " ").replace(/\s+/g, " ").trim();
const isAdministrative = (value: string) => /^(olá|ola|oi|bom dia|boa tarde|boa noite|att\.?|atenciosamente|obrigad[oa]|entrou na conversa|finalizou a conversa|estamos analisando|estamos verificando|caso em análise|caso em analise|encaminhado para desenvolvimento|aguardamos retorno|será aberto um card|sera aberto um card)\b/i.test(value.trim()) || /(?:^|\s)(?:att|atenciosamente)\.?\s*$/i.test(value.trim());
const isQuestion = (value: string) => /\?\s*$/.test(value.trim()) || /^(?:poderia|pode|favor|consegue|conseguem|sabe|qual|quando|foi|é|e|há|tem)\b/i.test(value.trim());
const actionSignal = /\b(?:consult|verific|analis|test|rein[ií]ci|alter|configur|encaminh|criad?o?\s+card|abrir|reproduz|colet|corrig|ajust|valid|retorn|log|fornecedor|integra|servi[çc]o\s+rein[ií]ci|equipamento\s+analis)\w*/i;
const evidenceSignal = /\b(?:teste|testado|reproduz|log|retorno|integra[çc][aã]o|tentativa|aceita|aceitou|incorreta|senha|funcion[aá]rio|máquina|maquina|evid[eê]ncia|registro|compar|recorr[eê]ncia|erro)\b/i;
const causalSignal = /\b(?:pode ser|poderia ser|poss[ií]vel|possivelmente|suspeita(?:-se)?|hip[oó]tese|rela[çc][aã]o com|causa pode|provavelmente|maybe|possibly|suspect)\b/i;

const actionActor = (action: Record<string, unknown>) => {
  const author = objectOf(firstValue(action, ["createdBy", "author", "user", "usuario"]));
  const profile = String(firstValue(author, ["profileType", "profile", "personType"]) ?? "").toLocaleLowerCase();
  const origin = String(firstValue(action, ["origin", "origem"]) ?? "").toLocaleLowerCase();
  const email = String(firstValue(author, ["email", "userName", "username"]) ?? firstValue(action, ["authorEmail", "email"]) ?? "").toLocaleLowerCase();
  if (["1", "agent", "atendente", "team", "equipe"].includes(profile)) return "team";
  if (["2", "client", "cliente", "requester", "solicitante"].includes(profile)) return "client";
  if (email.endsWith("@cencicia.com.br") || email.startsWith("service")) return "team";
  if (email.includes("@")) return "client";
  if (origin === "2") return "team";
  if (origin === "3") return "client";
  return "unknown";
};

export function summarizeTicket(ticketValue: unknown) {
  const ticket = objectOf(Array.isArray(ticketValue) ? ticketValue[0] : ticketValue);
  const subject = subjectOf(ticket);
  const initialDescription = initialDescriptionOf(ticket);
  const actions = actionsOf(ticket);
  const entries = actions.map((action, index) => ({ action, index, text: actionDescription(action), actor: actionActor(action) })).filter((entry): entry is { action: Record<string, unknown>; index: number; text: string; actor: string } => Boolean(entry.text)).map((entry) => ({ ...entry, text: analysisText(entry.text) }));
  const firstClientText = entries.find((entry) => entry.actor === "client" && !isAdministrative(entry.text))?.text ?? null;
  const reportedProblem = firstClientText ?? firstSentence(initialDescription) ?? firstSentence(subject);
  const actionTexts = entries.map((entry) => entry.text);
  const actionsTaken = unique(entries.filter((entry) => actionSignal.test(entry.text) && !isAdministrative(entry.text) && !isQuestion(entry.text) && !causalSignal.test(entry.text)).map((entry) => entry.text.slice(0, 500))).slice(0, 20);
  const pendingCandidates = entries.filter((entry) => /(aguardar|pendente|pendência|pending|confirmar|validar|retorno|visita|investigar|analisar|verificar|abrir\s+(?:um\s+)?card|acompanhar)/i.test(entry.text) && !isAdministrative(entry.text));
  const pendingItems = unique(pendingCandidates.filter((entry) => {
    const terms = entry.text.toLocaleLowerCase().split(/[^\p{L}\p{N}]+/u).filter((term) => term.length > 4);
    const later = entries.filter((candidate) => candidate.index > entry.index).map((candidate) => candidate.text.toLocaleLowerCase()).join(" ");
    const answered = /\b(?:não|nao|sim|respondeu|informou|confirmou|realizado|realizada|retornado|obtido|conclu[ií]d|resolvido)\b/i.test(later) && terms.filter((term) => later.includes(term)).length >= Math.min(2, terms.length);
    return !answered;
  }).map((entry) => entry.text.slice(0, 500))).slice(0, 20);
  const hypotheses = unique(actionTexts.filter((value) => causalSignal.test(value) && !isAdministrative(value)).map((value) => value.slice(0, 500)));
  const evidence = unique([
    firstClientText ? `Manifestação do cliente: ${firstClientText.slice(0, 500)}` : null,
    initialDescription ? `Descrição inicial: ${initialDescription.slice(0, 500)}` : null,
    ...entries.filter((entry) => evidenceSignal.test(entry.text) && !isAdministrative(entry.text)).map((entry) => entry.text.slice(0, 500)),
    subject ? `Assunto: ${subject}` : null,
  ]).slice(0, 20);
  const status = valueText(ticket, ["status", "baseStatus"]);
  const summary = [reportedProblem, status ? `Status atual: ${status}.` : null].filter(Boolean).join(" ") || "Histórico sem texto suficiente para resumo.";
  // `incomplete` means missing structural history, not an unresolved ticket.
  const incomplete = !initialDescription && !actions.length || Boolean(firstValue(ticket, ["historyIncomplete", "historicoIncompleto"]));
  return { ...ticketIdentity(ticket), summary, reportedProblem, actionsTaken, pendingItems, evidence, hypotheses, confidence: confidence(evidence, actionsTaken), incomplete };
}

const rules: Array<{ category: string; terms: string[]; weight: number }> = [
  { category: "máquina inoperante", terms: ["inoperante", "não liga", "nao liga", "parada", "sem operação", "sem operacao"], weight: 4 },
  { category: "máquina offline", terms: ["offline", "sem conexão", "sem conexao", "desconectada"], weight: 4 },
  { category: "falha de dispensação", terms: ["dispensação", "dispensacao", "não dispensa", "nao dispensa"], weight: 4 },
  { category: "entrega registrada incorretamente", terms: ["entrega incorreta", "registrou errado", "baixa divergente"], weight: 4 },
  { category: "integração parada", terms: ["integração parada", "integracao parada", "não sincroniza", "nao sincroniza"], weight: 4 },
  { category: "estoque ou baixa divergente", terms: ["estoque", "baixa divergente", "saldo divergente"], weight: 3 },
  { category: "vínculo de funcionário", terms: ["vínculo de funcionário", "vinculo de funcionario", "cadastro de funcionário", "cadastro de funcionario"], weight: 3 },
  { category: "acesso e autenticação", terms: ["login", "senha", "autenticação", "autenticacao", "acesso"], weight: 5 },
  { category: "solicitação de melhoria", terms: ["melhoria", "sugestão", "sugestao", "feature"], weight: 3 },
  { category: "erro de relatório", terms: ["relatório", "relatorio", "dashboard"], weight: 3 },
];

export function classifyTicketIssue(ticketValue: unknown) {
  const ticket = objectOf(Array.isArray(ticketValue) ? ticketValue[0] : ticketValue);
  const summary = summarizeTicket(ticket);
  const weightedSources = [summary.reportedProblem ?? "", ...summary.evidence, ...summary.actionsTaken, ...summary.pendingItems];
  const matches = rules.map((rule) => ({ rule, matched: rule.terms.filter((term) => weightedSources.some((source, index) => source.toLocaleLowerCase().includes(term) && index < 3)), score: rule.terms.reduce((score, term) => score + (weightedSources[0].toLocaleLowerCase().includes(term) ? rule.weight : weightedSources.some((source) => source.toLocaleLowerCase().includes(term) ? 1 : 0)), 0) })).filter((entry) => entry.matched.length).sort((left, right) => right.score - left.score);
  const best = matches[0];
  const matchingEvidence = best ? weightedSources.filter((value) => best.rule.terms.some((term) => value.toLocaleLowerCase().includes(term))).map((value) => value.slice(0, 500)) : [];
  const subjectEvidence = subjectOf(ticket);
  const evidence = best ? unique([subjectEvidence && best.rule.terms.some((term) => subjectEvidence.toLocaleLowerCase().includes(term)) ? `Assunto: ${subjectEvidence}` : null, ...matchingEvidence]) : [];
  return { ...ticketIdentity(ticket), category: best?.rule.category ?? "não classificado", categories: matches.map((entry) => entry.rule.category), officialCategory: valueText(ticket, ["category", "categoria"]), evidence, confidence: best ? (best.score >= 5 ? "high" : "medium") : "low" };
}
