export type InsightTicket = Record<string, unknown>;
import { semanticCatalog } from "./semantic-catalog";

type Actor = "client" | "agent" | "system" | "unknown";
type AnalysisMessage = { text: string; actor: Actor; visibility: "public" | "internal"; timestamp: string | null; sourceIndex: number; actionId: string | null; boilerplate: boolean };
type AnalysisContext = { id: unknown; protocol: unknown; subject: string | null; status: string | null; officialCategory: string | null; messages: AnalysisMessage[]; actions: Record<string, unknown>[] };

const objectOf = (value: unknown) => value && typeof value === "object" ? value as Record<string, unknown> : {};
const firstValue = (object: Record<string, unknown>, keys: string[]) => keys.map((key) => object[key]).find((value) => value !== undefined && value !== null && value !== "");
const decodeHtml = (value: string) => value.replace(/&lt;/gi, "<").replace(/&gt;/gi, ">").replace(/&quot;/gi, '"').replace(/&#39;|&apos;/gi, "'").replace(/&nbsp;/gi, " ").replace(/&amp;/gi, "&");
const text = (value: unknown) => typeof value === "string" && value.trim() ? decodeHtml(value).replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim() : null;
const valueText = (object: Record<string, unknown>, keys: string[]) => text(firstValue(object, keys));
const actionsOf = (ticket: InsightTicket) => { const value = firstValue(ticket, ["actions", "acoes", "interactions", "interacoes", "history", "historico"]); return Array.isArray(value) ? value.map(objectOf) : []; };
const subjectOf = (ticket: InsightTicket) => valueText(ticket, ["subject", "assunto", "title", "titulo"]);
const initialDescriptionOf = (ticket: InsightTicket) => valueText(ticket, ["initialDescription", "description", "descriptionHtml", "descricao"]);
const actionTextOf = (action: Record<string, unknown>) => valueText(action, ["htmlDescription", "description", "text", "message", "content", "observation", "observacao", "descricao"]);
const actionDateOf = (action: Record<string, unknown>) => valueText(action, ["createdDate", "date", "timestamp", "createdAt", "data", "dataCriacao"]);
const unique = (values: Array<string | null>) => [...new Set(values.filter((value): value is string => Boolean(value)))];
const ticketIdentity = (ticket: InsightTicket) => ({ id: firstValue(ticket, ["id", "ticketId"]), protocol: firstValue(ticket, ["protocol", "protocolo"]) });
const stripHtml = (value: string) => decodeHtml(value).replace(/<br\s*\/?>/gi, "\n").replace(/<\/p\s*>/gi, "\n").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
const cleanForAnalysis = (value: string) => value.replace(/https?:\/\/\S+/gi, " ").replace(/\b(?:telefone|whatsapp|e-mail|email)\s*[:=-]?\s*\S+/gi, " ").replace(/\s+/g, " ").trim();
const catalogFilters = semanticCatalog.filters as Record<string, any>;
const configuredBoilerplate = [
  ...(((catalogFilters.automatic_messages?.contains ?? []) as unknown[]).filter((item): item is string => typeof item === "string")),
  ...(((catalogFilters.greetings_and_smalltalk?.patterns ?? []) as unknown[]).filter((item): item is string => typeof item === "string")),
  ...(((catalogFilters.signatures?.start_markers ?? []) as unknown[]).filter((item): item is string => typeof item === "string")),
];
const configuredSignatureMarkers = (((catalogFilters.signatures?.start_markers ?? []) as unknown[]).filter((item): item is string => typeof item === "string"));
const stripTrailingConfiguredNoise = (value: string) => {
  const lower = value.toLocaleLowerCase();
  const positions = configuredSignatureMarkers.map((marker) => lower.indexOf(marker.toLocaleLowerCase())).filter((position) => position > 20);
  const start = positions.length ? Math.min(...positions) : -1;
  return start >= 0 ? value.slice(0, start).trim() : value.trim();
};
const boilerplate = (value: string) => {
  const normalized = value.trim();
  const lower = normalized.toLocaleLowerCase();
  const hasTechnicalContent = /\b(?:erro|falha|problema|offline|reinici|sensor|máquina|maquina|senha|acesso|produto|venc|integra|cadastro|relat|entrega|duplic|biometr|500|502|503|504)\b/i.test(normalized);
  if (!hasTechnicalContent && configuredBoilerplate.some((pattern) => lower === pattern.toLocaleLowerCase() || lower.startsWith(`${pattern.toLocaleLowerCase()} `))) return true;
  return !hasTechnicalContent && (/^(?:ol[aá]|bom dia|boa tarde|boa noite|obrigad[oa]|att\.?|atenciosamente|entrou na conversa|finalizou a conversa|estamos encerrando este chat|estamos analisando|estamos verificando|aguardamos retorno|caso encaminhado para desenvolvimento)\b/i.test(normalized) || /(?:canais oficiais|horário de atendimento|horario de atendimento|e-mail sac|whatsapp)/i.test(value));
};

const actorFrom = (action: Record<string, unknown>, role?: string): Actor => {
  const author = objectOf(firstValue(action, ["createdBy", "author", "user", "usuario"]));
  const profile = String(firstValue(author, ["profileType", "profile", "personType"]) ?? "").toLocaleLowerCase();
  const email = String(firstValue(author, ["email", "userName", "username"]) ?? firstValue(action, ["authorEmail", "email"]) ?? "").toLocaleLowerCase();
  if (/system|sistema|automát|automatic|bot/i.test(role ?? "")) return "system";
  if (["1", "agent", "atendente", "team", "equipe"].includes(profile) || email.endsWith("@cencicia.com.br") || email.startsWith("service")) return "agent";
  if (["2", "client", "cliente", "requester", "solicitante"].includes(profile) || email.includes("@")) return "client";
  if (role && /agent|atendente|team|equipe/i.test(role)) return "agent";
  if (role && /client|cliente|solicitante/i.test(role)) return "client";
  const origin = String(firstValue(action, ["origin", "origem"]) ?? "");
  if (origin === "2") return "agent";
  if (origin === "3") return "client";
  return "unknown";
};
const visibilityOf = (action: Record<string, unknown>) => String(firstValue(action, ["type", "tipo", "actionType"]) ?? "") === "1" ? "internal" as const : "public" as const;

/** Split structured chat HTML on role markers; otherwise keep one factual message per action. */
const messagesFromAction = (action: Record<string, unknown>, sourceIndex: number): AnalysisMessage[] => {
  const raw = actionTextOf(action);
  if (!raw) return [];
  const html = firstValue(action, ["htmlDescription"]);
  const chunks: Array<{ role?: string; text: string }> = [];
  const decodedHtml = typeof html === "string" ? decodeHtml(html) : null;
  if (decodedHtml && /data-person-role|message-container|message-ids/i.test(decodedHtml)) {
    const markers = [...decodedHtml.matchAll(/data-person-role\s*=\s*["']([^"']+)["']/gi)];
    markers.forEach((marker, index) => { const markerStart = decodedHtml.lastIndexOf("<", marker.index ?? 0); const nextMarker = markers[index + 1]?.index; const next = nextMarker === undefined ? decodedHtml.length : Math.max(0, decodedHtml.lastIndexOf("<", nextMarker)); const chunk = stripHtml(decodedHtml.slice(markerStart >= 0 ? markerStart : (marker.index ?? 0), next)); if (chunk) chunks.push({ role: marker[1], text: chunk }); });
  }
  if (!chunks.length) chunks.push({ text: stripHtml(raw) });
  return chunks.map((chunk) => { const normalized = stripTrailingConfiguredNoise(cleanForAnalysis(chunk.text)); return { text: normalized, actor: actorFrom(action, chunk.role), visibility: visibilityOf(action), timestamp: actionDateOf(action), sourceIndex, actionId: text(firstValue(action, ["id", "actionId"])), boilerplate: boilerplate(normalized) }; }).filter((message) => Boolean(message.text));
};

const normalizeTicket = (ticketValue: unknown): AnalysisContext => {
  const ticket = objectOf(Array.isArray(ticketValue) ? ticketValue[0] : ticketValue);
  const actions = actionsOf(ticket);
  return { ...ticketIdentity(ticket), subject: subjectOf(ticket), status: valueText(ticket, ["status", "baseStatus"]), officialCategory: valueText(ticket, ["category", "categoria"]), actions, messages: actions.flatMap(messagesFromAction) };
};
const usefulMessages = (context: AnalysisContext) => context.messages.filter((message) => message.visibility === "public" && !message.boilerplate && message.text.length > 8);
const explicitHypothesis = (value: string) => /\b(?:pode ser|poderia ser|poss[ií]vel|possivelmente|suspeita(?:-se)?|hip[oó]tese|rela[çc][aã]o com|causa pode|provavelmente|maybe|possibly|suspect)\b/i.test(value);
const completedAction = (value: string) => /\b(?:foi|foram|realizad[oa]|verificad[oa]|verificamos|consultad[oa]|consultamos|testad[oa]|reproduzid[oa]|reiniciad[oa]|alterad[oa]|configurad[oa]|encaminhad[oa]|encaminhamos|criad[oa]|abert[oa]|enviad[oa]|coletad[oa]|corrigid[oa]|ajustad[oa]|obtivemos|identificamos|retornou|analisad[oa]|analisamos|compar[ae]mos)\b/i.test(value) || /\b(?:reinício|reinicio|teste|consulta|verificação|verificacao|log)\s+(?:realizado|realizada|feito|feita|concluído|concluída)/i.test(value);
const futureOrQuestion = (value: string) => /\?\s*$/.test(value) || /^(?:vou|iremos|vamos|pode|poderia|favor|aguarde|será|sera|pretendemos)\b/i.test(value);
const isAnsweredLater = (candidate: string, later: string[]) => { const terms = candidate.toLocaleLowerCase().split(/[^\p{L}\p{N}]+/u).filter((term) => term.length > 4); const corpus = later.join(" ").toLocaleLowerCase(); return /\b(?:não|nao|sim|respondeu|informou|confirmou|realizado|realizada|retornado|obtido|conclu[ií]d|resolvido|fechado)\b/i.test(corpus) && terms.filter((term) => corpus.includes(term)).length >= Math.min(2, terms.length); };

export function summarizeTicket(ticketValue: unknown) {
  const context = normalizeTicket(ticketValue);
  const sourceTicket = objectOf(Array.isArray(ticketValue) ? ticketValue[0] : ticketValue);
  const messages = usefulMessages(context);
  const firstClient = messages.find((message) => message.actor === "client");
  const rawInitial = firstValue(sourceTicket, ["description", "initialDescription", "descriptionHtml"]);
  const initial = typeof rawInitial === "string" && /data-person-role\s*=\s*["']?bot|systemMessage/i.test(decodeHtml(rawInitial)) ? null : initialDescriptionOf(sourceTicket);
  const reportedProblem = firstClient?.text ?? initial ?? context.subject;
  const actionsTaken = unique(messages.filter((message) => message.actor !== "client" && completedAction(message.text) && !futureOrQuestion(message.text) && !explicitHypothesis(message.text)).map((message) => message.text.slice(0, 500))).slice(0, 20);
  const pendingCandidates = messages.filter((message) => /\b(?:aguardando|aguardar|pendente|pendência|confirmar|validar|retorno|investigar|analisar|verificar|abrir\s+(?:um\s+)?card|acompanhar)\b/i.test(message.text) && !futureOrQuestion(message.text));
  const terminal = /^(?:resolvido|fechado|closed|resolved|canceled|cancelado)$/i.test(context.status ?? "");
  const pendingItems = terminal ? [] : unique(pendingCandidates.filter((candidate) => !isAnsweredLater(candidate.text, messages.filter((message) => message.sourceIndex > candidate.sourceIndex).map((message) => message.text))).map((message) => message.text.slice(0, 500))).slice(0, 20);
  const hypotheses = unique(messages.filter((message) => explicitHypothesis(message.text)).map((message) => message.text.slice(0, 500))).slice(0, 20);
  const evidence = unique([firstClient ? `Cliente: ${firstClient.text.slice(0, 500)}` : null, initial ? `Descrição inicial: ${initial.slice(0, 500)}` : null, ...messages.filter((message) => message.actor !== "system" && /\b(?:teste|testado|reproduz|log|retorno|integração|integracao|tentativa|aceita|aceitou|incorreta|senha|funcionário|funcionario|máquina|maquina|registro|compar|erro|offline|inoperante)\b/i.test(message.text)).map((message) => message.text.slice(0, 500)), context.subject ? `Assunto: ${context.subject}` : null]).slice(0, 20);
  const summary = [reportedProblem, context.status ? `Status atual: ${context.status}.` : null].filter(Boolean).join(" ") || "Histórico sem texto suficiente para extração factual.";
  const incomplete = Boolean(firstValue(sourceTicket, ["historyIncomplete", "historicoIncompleto"])) || (!initial && !context.actions.length);
  const confidence = messages.length >= 3 && evidence.length >= 2 ? "high" : messages.length || evidence.length ? "medium" : "low";
  return { ...ticketIdentity(sourceTicket), summary, reportedProblem, actionsTaken, pendingItems, evidence, hypotheses, confidence, incomplete };
}

const escapePattern = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const catalogCategories = Object.values(semanticCatalog.classification.categories).flatMap((definition) => {
  const label = typeof definition.label === "string" ? definition.label : null;
  const weakTerms = new Set((semanticCatalog.classification.universal_weak_terms ?? []).map((term) => term.toLocaleLowerCase()));
  const signals = Array.isArray(definition.strong_signals) ? definition.strong_signals.filter((signal): signal is string => typeof signal === "string" && signal.trim() && signal.trim().length > 6 && !weakTerms.has(signal.trim().toLocaleLowerCase())) : [];
  return label ? signals.map((signal) => ({ category: label, pattern: new RegExp(escapePattern(signal), "i") })) : [];
});
const catalogContextCategories = Object.values(semanticCatalog.classification.categories).flatMap((definition) => {
  const label = typeof definition.label === "string" ? definition.label : null;
  const groups = Array.isArray(definition.contextual_groups) ? definition.contextual_groups : [];
  return label ? groups.flatMap((group) => {
    const all = objectOf(group).all;
    if (!Array.isArray(all) || !all.every((alternatives) => Array.isArray(alternatives) && alternatives.every((term) => typeof term === "string"))) return [];
    const terms = all.flatMap((alternatives) => alternatives as string[]);
    return [{ category: label, pattern: new RegExp(terms.map(escapePattern).join("|"), "i"), requiredGroups: all as string[][], points: Number(objectOf(group).points ?? 0) }];
  }) : [];
});
const explicitCategories: Array<{ category: string; pattern: RegExp }> = [
  ...catalogCategories,
  { category: "acesso e autenticação", pattern: /\b(?:senha|login|autentica[çc][aã]o|acesso)\b.{0,80}\b(?:incorreta|recusad[ao]|rejeitad[ao]|bloquead[ao]|falh[ao]|não funciona|nao funciona)\b|\b(?:incorreta|recusad[ao]|rejeitad[ao]|bloquead[ao]|falh[ao])\b.{0,80}\b(?:senha|login|acesso)\b/i },
  { category: "máquina offline", pattern: /\b(?:máquina|maquina)\b.{0,50}\b(?:offline|sem conexão|sem conexao|desconectad[ao])\b/i },
  { category: "máquina inoperante", pattern: /\b(?:máquina|maquina)\b.{0,50}\b(?:inoperante|parad[ao]|não liga|nao liga)\b|\b(?:inoperante|parad[ao]|não liga|nao liga)\b.{0,50}\b(?:máquina|maquina)\b/i },
  { category: "falha de dispensação", pattern: /\b(?:não dispensa|nao dispensa|falha de dispensação|falha de dispensacao)\b/i },
  { category: "integração parada", pattern: /\b(?:integração parada|integracao parada|não sincroniza|nao sincroniza)\b/i },
];

export function classifyTicketIssue(ticketValue: unknown) {
  const ticket = objectOf(Array.isArray(ticketValue) ? ticketValue[0] : ticketValue);
  const summary = summarizeTicket(ticket);
  const factualText = [summary.reportedProblem ?? "", ...summary.evidence, ...summary.actionsTaken].join(" ");
  const negated = /\b(?:sem|não|nao)\s+(?:(?:relatar|haver|há|existe|apresentar|indicar)\b.{0,60}\b)?(?:falha|problema|erro)\b/i.test(factualText);
  const contextualMatch = catalogContextCategories.find((candidate) => candidate.points >= 6 && candidate.requiredGroups.every((group) => group.some((term) => factualText.toLocaleLowerCase().includes(term.toLocaleLowerCase()))));
  const match = negated ? undefined : contextualMatch ?? explicitCategories.find((candidate) => candidate.pattern.test(factualText));
  const subject = valueText(ticket, ["subject", "assunto", "title", "titulo"]);
  const evidence = match ? unique([subject && match.pattern.test(subject) ? `Assunto: ${subject}` : null, summary.reportedProblem, ...summary.evidence].filter((value) => value && match.pattern.test(value))) : [];
  const evidenceSources = new Set(evidence.map((item) => item.split(":", 1)[0]));
  const strongEvidence = evidence.filter((item) => /\b(?:não|nao|incorreta|falha|erro|offline|inoperante|não reconhece|não aparece|retornou erro|reproduzido|constatado|identificado)\b/i.test(item)).length;
  const confidence = !match ? "low" : strongEvidence >= 2 && evidenceSources.size >= 2 ? "high" : "medium";
  return { ...ticketIdentity(ticket), category: match?.category ?? "não classificado", categories: match ? [match.category] : [], officialCategory: valueText(ticket, ["category", "categoria"]), evidence, confidence };
}
