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

const stopWords = new Set("a ao aos as com da das de do dos e em entre o os ou para por que se sem uma um no na nas nos sua seu suas seus sobre foi são ser está este esta isso isso como mais menos muito muito pelo pela pelos pelas ticket chamado problema erro sistema".split(" "));
const asArray = (value: unknown): unknown[] => Array.isArray(value) ? value : value && typeof value === "object" && Array.isArray((value as { results?: unknown }).results) ? (value as { results: unknown[] }).results : value && typeof value === "object" ? [value] : [];
const objectOf = (value: unknown) => value && typeof value === "object" ? value as Record<string, unknown> : {};
const clean = (value: string) => value.replace(/<[^>]*>/g, " ").replace(/&nbsp;/gi, " ").replace(/&amp;/gi, "&").replace(/\s+/g, " ").trim();
const comparable = (value: string) => clean(value).toLocaleLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
const terms = (value: string) => new Set(comparable(value).split(/[^a-z0-9]+/).filter((term) => term.length >= 4 && !stopWords.has(term)));

function textOf(value: unknown): string {
  if (typeof value === "string") return clean(value);
  if (Array.isArray(value)) return value.map(textOf).filter(Boolean).join(" ");
  if (!value || typeof value !== "object") return "";
  return Object.entries(value as Record<string, unknown>).map(([key, item]) => key.toLowerCase().includes("url") ? "" : textOf(item)).filter(Boolean).join(" ");
}

function field(object: Record<string, unknown>, ...keys: string[]) {
  for (const key of keys) if (object[key] !== undefined && object[key] !== null && String(object[key]).trim()) return String(object[key]);
  return "";
}

export async function findSimilarTickets(client: MovideskReader, args: SimilarityArgs, accessToken: string) {
  let referenceTicket: Record<string, unknown> | undefined;
  if (args.ticket_id) referenceTicket = objectOf(asArray(await client.getTicket(args.ticket_id, accessToken))[0]);
  const referenceText = args.keyword || textOf(referenceTicket);
  const referenceTerms = terms(referenceText);
  const referenceCategory = field(referenceTicket ?? {}, "category", "categoria");
  const referenceService = field(referenceTicket ?? {}, "service", "servico", "serviço");
  const referenceTeam = field(referenceTicket ?? {}, "ownerTeam", "owner_team", "team", "equipe");
  // Never send the full ticket transcript in the candidate query. Movidesk
  // serializes keyword into the OData URL and long descriptions can produce 414.
  // Full content is still fetched below for the actual similarity comparison.
  const referenceSearchText = args.keyword || [
    field(referenceTicket ?? {}, "subject", "assunto"),
    field(referenceTicket ?? {}, "initialDescription", "description", "descricao"),
  ].filter(Boolean).join(" ");
  const queryTerms = args.ticket_id ? [...terms(referenceSearchText)].slice(0, 6) : [clean(args.keyword ?? "").slice(0, 180)];
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
    return { reference: args.ticket_id ? (referenceTicket?.protocol ?? args.ticket_id) : (args.keyword ?? ""), results: [], total: 0, returned: 0, top: args.top, skip: args.skip, error: { code: "upstream_search_failed", message: message.slice(0, 300) } };
  }
  const results: Record<string, unknown>[] = [];
  const referenceId = args.ticket_id ?? String(referenceTicket?.id ?? "");
  for (const candidateValue of candidates) {
    const candidateSummary = objectOf(candidateValue);
    const candidateId = candidateSummary.id ?? candidateSummary.ticket_id ?? candidateSummary.protocol;
    if (candidateId === undefined || String(candidateId) === referenceId) continue;
    const detail = objectOf(asArray(await client.getTicket(String(candidateId), accessToken))[0] ?? candidateSummary);
    const candidateText = textOf(detail);
    const candidateTerms = terms(candidateText);
    const shared = [...referenceTerms].filter((term) => candidateTerms.has(term));
    const candidateCategory = field(detail, "category", "categoria");
    const candidateService = field(detail, "service", "servico", "serviço");
    const candidateTeam = field(detail, "ownerTeam", "owner_team", "team", "equipe");
    const signals: string[] = [];
    if (shared.length) signals.push(`termos compartilhados: ${shared.slice(0, 8).join(", ")}`);
    if (referenceCategory && candidateCategory && comparable(referenceCategory) === comparable(candidateCategory)) signals.push("categoria compatível");
    if (referenceService && candidateService && comparable(referenceService) === comparable(candidateService)) signals.push("serviço compatível");
    if (referenceTeam && candidateTeam && comparable(referenceTeam) === comparable(candidateTeam)) signals.push("equipe compatível");
    const lexical = referenceTerms.size ? shared.length / referenceTerms.size : 0;
    const structural = (signals.filter((signal) => /compatível$/.test(signal)).length) / 3;
    const score = Math.min(1, lexical * 0.7 + structural * 0.3);
    if (!shared.length && !structural) continue;
    if (score < 0.2) continue;
    const similarityScore = Math.round(score * 100) / 100;
    results.push({ id: detail.id ?? candidateSummary.id, protocol: detail.protocol ?? candidateSummary.protocol, subject: field(detail, "subject", "assunto") || undefined, similarityScore, matchedSignals: signals, confidence: similarityScore >= 0.75 ? "high" : similarityScore >= 0.45 ? "medium" : "low" });
  }
  results.sort((a, b) => Number(b.similarityScore) - Number(a.similarityScore));
  const limited = results.slice(0, args.top);
  return { reference: args.ticket_id ? (referenceTicket?.protocol ?? args.ticket_id) : (args.keyword ?? ""), results: limited, total: limited.length, returned: limited.length, top: args.top, skip: args.skip };
}
