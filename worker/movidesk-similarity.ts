import type { MovideskReader } from "./mcp-tools";

type SimilarityArgs = {
  ticket_id?: string;
  keyword?: string;
  from_date?: string;
  to_date?: string;
  date_field?: string;
  owner_team?: string;
  category?: string;
  service?: string;
  client_id?: string;
  top: number;
  skip: number;
};

const stopWords = new Set("a ao aos as com da das de do dos e em entre o os ou para por que se sem uma um no na nas nos sua seu suas seus sobre foi são ser está este esta isso isso como mais menos muito muito pelo pela pelos pelas ticket chamado problema sistema fechado fechada closed resolved resolvido cencicia cencihub cenci suporte atendimento equipe atendente service bot tudo novo hoje pessoal durante cliente mail whatsapp telefone ramal criar realizar somente cada relatado técnico segue demanda análise horário contatos voce você sera será pode podem poderia precisa precisam junto essa esse essas esses seja tenha certo estamos analistas nome nomes dados eric ribeiro".split(" "));
const asArray = (value: unknown): unknown[] => Array.isArray(value) ? value : value && typeof value === "object" && Array.isArray((value as { results?: unknown }).results) ? (value as { results: unknown[] }).results : value && typeof value === "object" ? [value] : [];
const objectOf = (value: unknown) => value && typeof value === "object" ? value as Record<string, unknown> : {};
const clean = (value: string) => value.replace(/<[^>]*>/g, " ").replace(/&nbsp;/gi, " ").replace(/&amp;/gi, "&").replace(/https?:\/\/\S+/gi, " ").replace(/[\w.+-]+@[\w.-]+\.\w+/gi, " ").replace(/\+?\d[\d\s().-]{7,}\d/g, " ").replace(/\b[0-9a-f]{8}-[0-9a-f-]{27,}\b/gi, " ").replace(/\bservice\d+\b/gi, " ").replace(/\bimage\d*\b/gi, " ").replace(/\b\d{1,4}[\/:.-]\d{1,2}[\/:.-]\d{1,4}(?:[ T]\d{1,2}:\d{2}(?::\d{2})?)?\b/g, " ").replace(/\s+/g, " ").trim();
const comparable = (value: string) => clean(value).toLocaleLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
const terms = (value: string) => new Set(comparable(value).split(/[^a-z0-9]+/).filter((term) => term.length >= 4 && !stopWords.has(term) && !/^\d+$/.test(term) && !/^20\d{2}$/.test(term)));
const weighted = (value: string, weight: number, output = new Map<string, number>()) => { for (const term of terms(value)) output.set(term, Math.max(output.get(term) ?? 0, weight)); return output; };

function textOf(value: unknown): string {
  if (typeof value === "string") return clean(value);
  if (Array.isArray(value)) return value.map(textOf).filter(Boolean).join(" ");
  if (!value || typeof value !== "object") return "";
  return Object.entries(value as Record<string, unknown>).map(([key, item]) => key.toLowerCase().includes("url") ? "" : textOf(item)).filter(Boolean).join(" ");
}

function actionText(value: unknown): string {
  if (Array.isArray(value)) return value.map(actionText).filter(Boolean).join(" ");
  if (!value || typeof value !== "object") return typeof value === "string" ? clean(value) : "";
  const object = value as Record<string, unknown>;
  const raw = ["description", "summary", "text", "justification", "observation", "note", "content", "descricao", "resumo", "texto"].map((key) => typeof object[key] === "string" ? String(object[key]) : "").filter(Boolean).join("\n");
  return raw.split(/\r?\n+/).map(clean).filter((line) => line && !/^(?:att(?:entiously)?|atenciosamente|regards|confidential|confidencial|disclosure|recipient|copying|distribution|delete|transmission)/i.test(line) && !/(?:service\d+|uuid|cencicia|cencihub|hor[aá]rio de atendimento|estamos [àa] disposi[cç][aã]o)/i.test(line) && !/^(?:ol[aá]|bom dia|boa tarde|boa noite|obrigad[oa]|agradecemos|favor|seja bem-vindo|informe seus dados|nome[:\s])/i.test(line)).join(" ");
}

type ActionClass = "technical" | "operational" | "noise";
function classifyAction(value: string): ActionClass {
  const text = comparable(value);
  if (!text || /confidential|confidencial|disclosure|recipient|copying|distribution|delete|transmission|atenciosamente|regards/.test(text)) return "noise";
  if (/^(ola|olá|bom dia|boa tarde|boa noite|obrigad|agradecemos|seja bem|favor|informe seus dados)/.test(text) || /estamos a disposicao|horario de atendimento/.test(text)) return "operational";
  if (/(erro|falha|problema|indispon|offline|reinici|sensor|maquina|senha|acesso|produto|venc|integra|cadastro|relat|entrega|duplic|configur|impress|biometr|500|502|503|504|validar|verificar|corrigir|ajustar|testar)/.test(text)) return "technical";
  return "operational";
}

function featureWeights(ticket: Record<string, unknown>) {
  const weights = new Map<string, { weight: number; field: string }>();
  const add = (value: string, weight: number, fieldName: string) => { for (const term of terms(value)) { const previous = weights.get(term); if (!previous || weight > previous.weight) weights.set(term, { weight, field: fieldName }); } };
  add(field(ticket, "subject", "assunto"), 12, "subject");
  add(field(ticket, "initialDescription", "description", "descricao"), 12, "description");
  const actions = field(ticket, "actions", "acoes", "interactions", "interacoes");
  for (const action of actions.split(/(?<=[.!?])\s+/)) { const kind = classifyAction(action); if (kind === "technical") add(action, 14, "actions.technical"); }
  add(field(ticket, "category", "categoria"), 6, "category");
  add(field(ticket, "service", "servico", "serviço"), 6, "service");
  add(field(ticket, "ownerTeam", "owner_team", "team", "equipe"), 3, "team");
  return weights;
}

function field(object: Record<string, unknown>, ...keys: string[]) {
  for (const key of keys) {
    const value = object[key];
    const text = key === "actions" || key === "acoes" || key === "interactions" || key === "interacoes" ? actionText(value) : typeof value === "string" ? clean(value) : textOf(value);
    if (text) return text;
  }
  return "";
}

export async function findSimilarTickets(client: MovideskReader, args: SimilarityArgs, accessToken: string) {
  let referenceTicket: Record<string, unknown> | undefined;
  if (args.ticket_id) referenceTicket = objectOf(asArray(await client.getTicket(args.ticket_id, accessToken))[0]);
  const referenceText = args.keyword || textOf(referenceTicket);
  const referenceSubject = field(referenceTicket ?? {}, "subject", "assunto");
  const referenceDescription = field(referenceTicket ?? {}, "initialDescription", "description", "descricao");
  const referenceWeights = args.keyword ? new Map([...terms(args.keyword)].map((term) => [term, { weight: 12, field: "keyword" }])) : featureWeights(referenceTicket ?? {});
  const referenceTerms = new Set(referenceWeights.keys());
  const referenceCategory = field(referenceTicket ?? {}, "category", "categoria");
  const referenceService = field(referenceTicket ?? {}, "service", "servico", "serviço");
  const referenceTeam = field(referenceTicket ?? {}, "ownerTeam", "owner_team", "team", "equipe");
  // Never send the full ticket transcript in the candidate query. Movidesk
  // serializes keyword into the OData URL and long descriptions can produce 414.
  // Full content is still fetched below for the actual similarity comparison.
  const referenceSearchText = args.keyword || [
    referenceSubject,
    referenceDescription,
  ].filter(Boolean).join(" ");
  const queryTerms = args.ticket_id
    ? [...terms(referenceSearchText)].slice(0, 6)
    : [...new Set([clean(args.keyword ?? "").slice(0, 180), comparable(args.keyword ?? "").slice(0, 180)].filter(Boolean))];
  const baseParams: Record<string, string | number | undefined> = {
    from_date: args.from_date, to_date: args.to_date, date_field: args.date_field,
    owner_team: args.owner_team, category: args.category, service: args.service,
    client_id: args.client_id, top: Math.min(args.top + 1, 100), skip: args.skip,
  };
  let candidates: unknown[] = [];
  try {
    const uniqueCandidates = new Map<string, unknown>();
    for (const queryTerm of queryTerms) {
      const page = asArray(await client.searchTickets({ ...baseParams, keyword: queryTerm || undefined }, accessToken));
      for (const candidate of page) {
        const object = objectOf(candidate);
        const id = object.id ?? object.ticket_id ?? object.protocol;
        if (id !== undefined) uniqueCandidates.set(String(id), candidate);
      }
    }
    candidates = [...uniqueCandidates.values()];
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const status = /HTTP\s+(\d{3})/i.exec(message)?.[1];
    return { reference: args.ticket_id ? (referenceTicket?.protocol ?? args.ticket_id) : (args.keyword ?? ""), results: [], total: 0, returned: 0, top: args.top, skip: args.skip, error: { code: "upstream_search_failed", ...(status ? { status: Number(status) } : {}), message: message.slice(0, 300) } };
  }
  const results: Record<string, unknown>[] = [];
  const referenceId = args.ticket_id ?? String(referenceTicket?.id ?? "");
  for (const candidateValue of candidates) {
    const candidateSummary = objectOf(candidateValue);
    const candidateId = candidateSummary.id ?? candidateSummary.ticket_id ?? candidateSummary.protocol;
    if (candidateId === undefined || String(candidateId) === referenceId) continue;
    const detail = objectOf(asArray(await client.getTicket(String(candidateId), accessToken))[0] ?? candidateSummary);
    const candidateSubject = field(detail, "subject", "assunto");
    const candidateDescription = field(detail, "initialDescription", "description", "descricao");
    const candidateWeights = featureWeights(detail);
    const candidateTerms = new Set(candidateWeights.keys());
    const shared = [...referenceTerms].filter((term) => candidateTerms.has(term));
    const candidateCategory = field(detail, "category", "categoria");
    const candidateService = field(detail, "service", "servico", "serviço");
    const candidateTeam = field(detail, "ownerTeam", "owner_team", "team", "equipe");
    const signals: string[] = [];
    if (shared.length) signals.push(`termos compartilhados: ${shared.slice(0, 8).join(", ")}`);
    if (referenceCategory && candidateCategory && comparable(referenceCategory) === comparable(candidateCategory)) signals.push("categoria compatível");
    if (referenceService && candidateService && comparable(referenceService) === comparable(candidateService)) signals.push("serviço compatível");
    if (referenceTeam && candidateTeam && comparable(referenceTeam) === comparable(candidateTeam)) signals.push("equipe compatível");
    const signalDetails = shared.map((term) => {
      const candidateSignal = candidateWeights.get(term);
      const referenceSignal = referenceWeights.get(term);
      return { term, field: candidateSignal?.field ?? "actions.technical", weight: candidateSignal && referenceSignal ? Math.max(candidateSignal.weight, referenceSignal.weight) : 0 };
    }).sort((a, b) => b.weight - a.weight).slice(0, 10);
    if (signalDetails.length) {
      signals.splice(0, 1, ...["subject", "description", "actions.technical"].flatMap((fieldName) => {
        const values = signalDetails.filter((signal) => signal.field === fieldName).map((signal) => signal.term);
        return values.length ? [`termos do ${fieldName}: ${values.slice(0, 8).join(", ")}`] : [];
      }));
    }
    const sharedWeight = shared.reduce((sum, term) => sum + Math.min(referenceWeights.get(term)?.weight ?? 0, candidateWeights.get(term)?.weight ?? 0), 0);
    const referenceWeight = [...referenceWeights.values()].reduce((sum, signal) => sum + signal.weight, 0);
    const lexical = referenceWeight ? Math.min(1, sharedWeight / referenceWeight) : 0;
    const structural = (signals.filter((signal) => /compatível$/.test(signal)).length) / 3;
    const score = Math.min(1, lexical * 0.88 + structural * 0.12);
    // An ID reference needs at least two meaningful shared terms unless
    // multiple independent structured signals corroborate the match.
    if (args.ticket_id && shared.length < 2 && structural < 0.66) continue;
    if (!shared.length && !structural) continue;
    if (score < 0.2) continue;
    const similarityScore = Math.round(score * 100) / 100;
    const strongEvidence = signalDetails.some((signal) => signal.field === "subject") || signals.some((signal) => signal === "categoria compatível" || signal === "serviço compatível");
    results.push({ id: detail.id ?? candidateSummary.id, protocol: detail.protocol ?? candidateSummary.protocol, subject: field(detail, "subject", "assunto") || undefined, similarityScore, matchedSignals: signals, signalDetails, confidence: similarityScore >= 0.75 && strongEvidence ? "high" : similarityScore >= 0.45 ? "medium" : "low" });
  }
  results.sort((a, b) => Number(b.similarityScore) - Number(a.similarityScore));
  const limited = results.slice(0, args.top);
  return { reference: args.ticket_id ? (referenceTicket?.protocol ?? args.ticket_id) : (args.keyword ?? ""), results: limited, total: limited.length, returned: limited.length, top: args.top, skip: args.skip };
}
