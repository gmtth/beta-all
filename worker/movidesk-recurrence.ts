import type { MovideskReader } from "./mcp-tools";
import { semanticCatalog } from "./semantic-catalog";

type RecurrenceArgs = { from_date?: string; to_date?: string; date_field?: string; owner_team?: string; category?: string; service?: string; status?: string; min_occurrences: number; top: number; skip: number };
type Ticket = Record<string, unknown>;

const stopWords = new Set(semanticCatalog.semantic_policy!.stopwords);
const actionPolicy = semanticCatalog.semantic_policy!.action_classes;
const clean = (value: string) => value.replace(/<[^>]*>/g, " ").replace(/&nbsp;/gi, " ").replace(/&amp;/gi, "&").replace(/https?:\/\/\S+/gi, " ").replace(/[\w.+-]+@[\w.-]+\.\w+/gi, " ").replace(/\+?\d[\d\s().-]{7,}\d/g, " ").replace(/\s+/g, " ").trim();
const normalize = (value: string) => clean(value).toLocaleLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
const terms = (value: string) => {
  const normalized = normalize(value);
  const errorCodes = semanticCatalog.semantic_policy!.protected_numeric_patterns.flatMap((pattern) => [...normalized.matchAll(new RegExp(pattern, "gi"))].map((match) => match[0].replace(/\s+/g, " ")));
  const words = normalized.split(/[^a-z0-9]+/).filter((term) => term.length >= 4 && !stopWords.has(term) && !/^\d+$/.test(term) && !/^20\d{2}$/.test(term));
  return [...new Set([...words, ...errorCodes])];
};
const asArray = (value: unknown): unknown[] => Array.isArray(value) ? value : value && typeof value === "object" && Array.isArray((value as { results?: unknown }).results) ? (value as { results: unknown[] }).results : [];
const objectOf = (value: unknown) => value && typeof value === "object" ? value as Ticket : {};
const textField = (ticket: Ticket, ...keys: string[]) => keys.map((key) => typeof ticket[key] === "string" ? clean(ticket[key] as string) : "").find(Boolean) ?? "";
const classifyAction = (value: string) => {
  const normalized = normalize(value);
  if (!normalized || actionPolicy.noise_patterns.some((pattern) => normalized.includes(pattern))) return "noise";
  if (actionPolicy.operational_patterns.some((pattern) => new RegExp(pattern, "i").test(normalized))) return "operational";
  return actionPolicy.technical_patterns.some((pattern) => new RegExp(pattern, "i").test(normalized)) ? "technical" : "operational";
};
const actionText = (value: unknown): string => {
  const raw = Array.isArray(value) ? value.map(actionText).join(" ") : value && typeof value === "object" ? ["description", "summary", "text", "justification", "observation", "content", "descricao", "resumo", "texto"].map((key) => typeof (value as Ticket)[key] === "string" ? clean((value as Ticket)[key] as string) : "").filter(Boolean).join(" ") : typeof value === "string" ? clean(value) : "";
  return raw.split(/(?<=[.!?])\s+/).filter((sentence) => classifyAction(sentence) === "technical").join(" ");
};
const ticketId = (ticket: Ticket) => value(ticket, "id", "ticket_id", "protocol");

function problemTerms(ticket: Ticket) {
  const subject = textField(ticket, "subject", "assunto");
  const description = textField(ticket, "initialDescription", "description", "descricao");
  const actions = actionText(ticket.actions ?? ticket.acoes ?? ticket.interactions ?? ticket.interacoes);
  const weighted = new Map<string, number>();
  const add = (text: string, weight: number) => terms(text).forEach((term) => weighted.set(term, Math.max(weighted.get(term) ?? 0, weight)));
  add(subject, 3); add(description, 2); add(actions, 1);
  return [...weighted.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8).map(([term]) => term);
}

const value = (ticket: Ticket, ...keys: string[]) => keys.map((key) => ticket[key]).find((item) => item !== undefined && item !== null && String(item).trim() !== "");
const monthOf = (ticket: Ticket, dateField = "createdDate") => {
  const fieldAliases: Record<string, string[]> = {
    createdDate: ["createdDate", "created_date"],
    lastUpdate: ["lastUpdate", "last_update", "updatedDate", "updated_date"],
    resolvedIn: ["resolvedIn", "resolved_in", "resolvedDate", "resolved_date"],
    closedIn: ["closedIn", "closed_in", "closedDate", "closed_date"],
  };
  const raw = value(ticket, ...(fieldAliases[dateField] ?? fieldAliases.createdDate));
  const date = raw ? new Date(String(raw)) : null;
  return date && !Number.isNaN(date.valueOf()) ? date.toISOString().slice(0, 7) : null;
};

async function mapWithConcurrency<T, R>(items: T[], limit: number, worker: (item: T) => Promise<R>) {
  const output: R[] = new Array(items.length);
  let cursor = 0;
  const run = async () => { while (true) { const index = cursor++; if (index >= items.length) return; output[index] = await worker(items[index]); } };
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, run));
  return output;
}

export async function detectRecurrentIssues(client: MovideskReader, args: RecurrenceArgs, accessToken: string) {
  const today = new Date().toISOString().slice(0, 10);
  const fromDate = args.from_date ?? `${today.slice(0, 4)}-01-01`;
  const toDate = args.to_date ?? today;
  const params: Record<string, string | number | undefined> = { from_date: fromDate, to_date: toDate, date_field: args.date_field, owner_team: args.owner_team, category: args.category, service: args.service, status: args.status, top: 100, skip: 0 };
  let summaries: Ticket[];
  try { summaries = asArray(await client.searchTickets(params, accessToken)).map(objectOf); } catch (error) {
    const message = error instanceof Error ? error.message : String(error); const status = /HTTP\s+(\d{3})/i.exec(message)?.[1];
    return { groups: [], total: 0, returned: 0, top: args.top, skip: args.skip, error: { code: "upstream_search_failed", ...(status ? { status: Number(status) } : {}), message: message.slice(0, 300) } };
  }
  let enrichmentFailures = 0;
  const details = await mapWithConcurrency(summaries, 8, async (summary) => {
    const id = value(summary, "id", "ticket_id", "protocol");
    if (id === undefined) return null;
    try { return objectOf(asArray(await client.getTicket(String(id), accessToken))[0] ?? summary); } catch { enrichmentFailures += 1; return objectOf(summary); }
  });
  const tickets: Ticket[] = details.filter((ticket): ticket is Ticket => Boolean(ticket));
  const clusters: { tickets: Ticket[]; terms: Set<string> }[] = [];
  for (const ticket of tickets) {
    const ticketTerms = new Set(problemTerms(ticket)); if (!ticketTerms.size) continue;
    let cluster = clusters.find((candidate) => { const shared = [...ticketTerms].filter((term) => candidate.terms.has(term)).length; return shared >= 2 || shared / Math.max(ticketTerms.size, candidate.terms.size) >= 0.45; });
    if (!cluster) { cluster = { tickets: [], terms: ticketTerms }; clusters.push(cluster); }
    cluster.tickets.push(ticket); ticketTerms.forEach((term) => cluster!.terms.add(term));
  }
  const groups = clusters.filter((cluster) => cluster.tickets.length >= args.min_occurrences).map((cluster) => {
    const counts = new Map<string, number>(); cluster.tickets.forEach((ticket) => problemTerms(ticket).forEach((term) => counts.set(term, (counts.get(term) ?? 0) + 1)));
    const recurringTerms = [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6).map(([term]) => term);
    const months = new Map<string, number>(); const statuses = new Map<string, number>(); const urgencies = new Map<string, number>(); const categories = new Map<string, number>(); const services = new Map<string, number>(); const teams = new Map<string, number>(); const clientCounts = new Map<string, number>(); const clients = new Set<string>();
    cluster.tickets.forEach((ticket) => {
      const month = monthOf(ticket, args.date_field); if (month) months.set(month, (months.get(month) ?? 0) + 1);
      const status = String(value(ticket, "status", "baseStatus") ?? "unknown"); statuses.set(status, (statuses.get(status) ?? 0) + 1);
      const urgency = value(ticket, "urgency", "urgencyName", "urgency_name", "priority", "priorityName", "priority_name"); if (urgency) { const label = typeof urgency === "object" ? textField(objectOf(urgency), "name", "label", "value") : String(urgency); if (label) urgencies.set(label, (urgencies.get(label) ?? 0) + 1); }
      const category = value(ticket, "category", "categoria"); if (category) categories.set(String(category), (categories.get(String(category)) ?? 0) + 1);
      const service = value(ticket, "service", "servico", "serviço"); if (service) services.set(String(service), (services.get(String(service)) ?? 0) + 1);
      const team = value(ticket, "ownerTeam", "owner_team", "team", "equipe"); if (team) teams.set(String(team), (teams.get(String(team)) ?? 0) + 1);
      const client = value(ticket, "clientId", "client_id", "client", "cliente"); if (client) { const clientKey = String(typeof client === "object" ? value(objectOf(client), "id", "email", "name") ?? "unknown" : client); clients.add(clientKey); clientCounts.set(clientKey, (clientCounts.get(clientKey) ?? 0) + 1); }
    });
    const cohesion = recurringTerms.length ? recurringTerms.reduce((sum, term) => sum + (counts.get(term) ?? 0), 0) / (cluster.tickets.length * recurringTerms.length) : 0;
    const confidence = cluster.tickets.length >= 5 && cohesion >= 0.55 ? "high" : cluster.tickets.length >= 3 && cohesion >= 0.35 ? "medium" : "low";
    const trendEntries = [...months.entries()].sort();
    const firstHalf = trendEntries.slice(0, Math.max(1, Math.floor(trendEntries.length / 2))).reduce((sum, [, count]) => sum + count, 0);
    const secondHalf = trendEntries.slice(Math.max(1, Math.floor(trendEntries.length / 2))).reduce((sum, [, count]) => sum + count, 0);
    const trendDirection = trendEntries.length < 2 ? "insufficient_data" : secondHalf > firstHalf ? "rising" : secondHalf < firstHalf ? "falling" : "stable";
    const firstCount = trendEntries[0]?.[1] ?? 0; const lastCount = trendEntries[trendEntries.length - 1]?.[1] ?? 0;
    const deltaPercentage = firstCount ? Math.round(((lastCount - firstCount) / firstCount) * 100) : null;
    const signalDetails = recurringTerms.map((term) => {
      const fieldCounts = new Map<string, number>(); const examples = new Set<string>();
      cluster.tickets.forEach((ticket) => {
        const fields: Array<[string, string]> = [["subject", textField(ticket, "subject", "assunto")], ["initialDescription", textField(ticket, "initialDescription", "description", "descricao")], ["actions", actionText(ticket.actions ?? ticket.acoes ?? ticket.interactions ?? ticket.interacoes)]];
        const matched = fields.filter(([, fieldText]) => terms(fieldText).includes(term));
        matched.forEach(([fieldName]) => fieldCounts.set(fieldName, (fieldCounts.get(fieldName) ?? 0) + 1));
        if (matched.length && ticketId(ticket) !== undefined) examples.add(String(ticketId(ticket)));
      });
      return { term, occurrences: counts.get(term) ?? 0, fields: Object.fromEntries(fieldCounts), examples: [...examples].slice(0, 5) };
    });
    const sameClientDominant = [...clientCounts.values()].some((count) => count / cluster.tickets.length >= 0.6);
    const fieldBackedSignals = signalDetails.filter((signal) => Object.keys(signal.fields).some((field) => field === "subject" || field === "initialDescription")).length;
    const evidenceCoverage = recurringTerms.length ? Math.round((fieldBackedSignals / recurringTerms.length) * 100) / 100 : 0;
    const adjustedConfidence = confidence === "high" && (sameClientDominant || evidenceCoverage < 0.5) ? "medium" : confidence;
    return { issue: recurringTerms.join(", "), occurrences: cluster.tickets.length, uniqueClients: clients.size, clientRepeatRatio: clients.size ? Math.round((cluster.tickets.length / clients.size) * 100) / 100 : null, clientDistribution: Object.fromEntries([...clientCounts.entries()].sort((a, b) => b[1] - a[1])), sameClientDominant, trendByMonth: Object.fromEntries(trendEntries), trendDirection, trend: { direction: trendDirection, firstMonth: trendEntries[0]?.[0] ?? null, lastMonth: trendEntries.at(-1)?.[0] ?? null, firstCount, lastCount, deltaPercentage }, statusCounts: Object.fromEntries(statuses), urgencyCounts: Object.fromEntries(urgencies), categoryCounts: Object.fromEntries(categories), serviceCounts: Object.fromEntries(services), ownerTeamCounts: Object.fromEntries(teams), evidenceCoverage, signalDetails, examples: cluster.tickets.slice(0, 3).map((ticket) => ({ id: value(ticket, "id", "ticket_id"), protocol: value(ticket, "protocol"), subject: value(ticket, "subject", "assunto"), category: value(ticket, "category", "categoria"), service: value(ticket, "service", "servico", "serviço") })), confidence: adjustedConfidence };
  }).sort((a, b) => b.occurrences - a.occurrences || a.issue.localeCompare(b.issue));
  const limited = groups.slice(args.skip, args.skip + args.top);
  return { groups: limited, total: groups.length, returned: limited.length, top: args.top, skip: args.skip, meta: { fromDate, toDate, dateField: args.date_field ?? "createdDate", candidateCount: summaries.length, enrichedCount: tickets.length, enrichmentFailures, maxCandidates: 100, truncated: summaries.length >= 100 } };
}
