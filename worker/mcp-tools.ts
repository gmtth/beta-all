import { z } from "zod";
import { MovideskAnalysisSession } from "./movidesk-analysis";
import { buildTicketTimeline } from "./movidesk-timeline";

export interface MovideskReader {
  getTicket(id: string, accessToken: string): Promise<unknown>;
  searchTickets(params: Record<string, string | number | boolean | undefined>, accessToken: string): Promise<unknown>;
  searchPeople(params: Record<string, string | number | boolean | undefined>, accessToken: string): Promise<unknown>;
  listServices(params: Record<string, string | number | boolean | undefined>, accessToken: string): Promise<unknown>;
}

const ticketSchema = z.object({ ticket_id: z.coerce.string().trim().regex(/^\d{1,30}$/, "ticket_id deve conter apenas números") });
const timelineSchema = z.object({ ticket_id: z.coerce.string().trim().regex(/^\d{1,30}$/, "ticket_id deve conter apenas números").optional(), protocol: z.string().trim().min(1).max(128).regex(/^[A-Za-z0-9_-]+$/, "protocol inválido").optional() }).refine((value) => Boolean(value.ticket_id) !== Boolean(value.protocol), { message: "Informe ticket_id ou protocol, mas não ambos." });
const searchSchema = z.object({
  id: z.coerce.string().trim().regex(/^\d{1,30}$/, "id deve conter apenas números").optional(),
  protocol: z.string().trim().regex(/^[A-Za-z0-9_-]{1,30}$/, "protocol inválido").optional(),
  filter: z.string().trim().max(1000).optional(), keyword: z.string().trim().max(200).optional(),
  from_date: z.string().trim().max(40).optional(), to_date: z.string().trim().max(40).optional(),
  created_date: z.string().trim().max(40).optional(), last_update: z.string().trim().max(40).optional(),
  date_field: z.enum(["createdDate", "lastUpdate", "resolvedIn", "closedIn"]).default("createdDate"),
  responsible_id: z.string().trim().max(100).optional(), responsible_email: z.string().email().max(200).optional(),
  owner_team: z.string().trim().max(200).optional(), status: z.string().trim().max(128).optional(),
  base_status: z.string().trim().max(128).optional(), urgency: z.string().trim().max(128).optional(),
  category: z.string().trim().max(128).optional(), service: z.string().trim().max(200).optional(),
  client_id: z.string().trim().max(100).optional(), include_past: z.coerce.boolean().default(false),
  select: z.string().trim().max(500).optional(), expand: z.string().trim().max(500).optional(),
  orderby: z.string().trim().max(200).optional(), top: z.coerce.number().int().min(1).max(100).default(25),
  skip: z.coerce.number().int().min(0).max(10000).default(0),
});
const openTicketsSchema = z.object({ created_date: z.string().trim().min(1).max(100), filter: z.string().trim().max(1000).optional(), orderby: z.string().trim().max(200).optional(), top: z.coerce.number().int().min(1).max(100).optional(), skip: z.coerce.number().int().min(0).max(10000).optional() });
const contentSearchSchema = searchSchema.extend({
  keyword: z.string().trim().min(1).max(200),
  case_sensitive: z.coerce.boolean().default(false),
});
const peopleSchema = searchSchema.extend({ active: z.coerce.boolean().optional() });
const servicesSchema = searchSchema.extend({ active: z.coerce.boolean().optional(), page: z.coerce.number().int().min(1).max(1000).optional(), page_size: z.coerce.number().int().min(1).max(100).optional() });
const readOnlyAnnotations = { readOnlyHint: true, destructiveHint: false, openWorldHint: false } as const;
const first = (value: unknown) => Array.isArray(value) ? value[0] : value;
const pick = (value: unknown, keys: string[]) => { const object = (value && typeof value === "object" ? value : {}) as Record<string, unknown>; return Object.fromEntries(keys.map((key) => [key, object[key]]).filter(([, item]) => item !== undefined && item !== null)); };
const apiParams = (args: z.infer<typeof searchSchema>) => ({ id: args.id, protocol: args.protocol, filter: args.filter, keyword: args.keyword, from_date: args.from_date ?? args.created_date, to_date: args.to_date, date_field: args.last_update ? "lastUpdate" : args.date_field, responsible_id: args.responsible_id, responsible_email: args.responsible_email, owner_team: args.owner_team, status: args.status, base_status: args.base_status, urgency: args.urgency, category: args.category, service: args.service, client_id: args.client_id, include_past: args.include_past, select: args.select, expand: args.expand, orderby: args.orderby, top: args.top, skip: args.skip });
const collectionResult = (label: string, value: unknown) => { const results = Array.isArray(value) ? value : value && typeof value === "object" && Array.isArray((value as { results?: unknown }).results) ? (value as { results: unknown[] }).results : []; return { content: [{ type: "text" as const, text: `${label}: ${results.length} registro(s) encontrado(s).` }], structuredContent: { results } }; };
const asArray = (value: unknown) => Array.isArray(value) ? value : value && typeof value === "object" && Array.isArray((value as { results?: unknown }).results) ? (value as { results: unknown[] }).results : [];
const stripHtml = (value: string) => value.replace(/<[^>]*>/g, " ").replace(/&nbsp;/gi, " ").replace(/&amp;/gi, "&").replace(/\s+/g, " ").trim();
const normalizeText = (value: string, caseSensitive: boolean) => { const text = stripHtml(value); return caseSensitive ? text : text.toLocaleLowerCase(); };
const textFields = new Set(["subject", "assunto", "category", "categoria", "description", "descricao", "initialDescription", "descriptionHtml", "actions", "acoes", "interactions", "interacoes", "justification", "justificativa", "observation", "observacao", "text"]);
const findMatches = (value: unknown, keyword: string, caseSensitive: boolean, path = "ticket", matches: { matchedIn: string; matchedText: string }[] = []) => {
  if (matches.length >= 8) return matches;
  if (typeof value === "string") {
    const normalized = normalizeText(value, caseSensitive);
    if (normalized.includes(keyword)) matches.push({ matchedIn: path.startsWith("initialDescription") ? "initialDescription" : path.startsWith("actions") ? "actions" : path === "ticket" ? "ticket" : path, matchedText: stripHtml(value).slice(0, 500) });
  } else if (Array.isArray(value)) {
    value.forEach((item, index) => findMatches(item, keyword, caseSensitive, `${path}[${index}]`, matches));
  } else if (value && typeof value === "object") {
    for (const [key, item] of Object.entries(value as Record<string, unknown>)) {
      if (typeof item === "string" && !textFields.has(key)) continue;
      const label = key === "description" || key === "descricao" || key === "initialDescription" || key === "descriptionHtml" ? "initialDescription" : key === "actions" || key === "acoes" || key === "interactions" || key === "interacoes" ? "actions" : key;
      findMatches(item, keyword, caseSensitive, label, matches);
    }
  }
  return matches;
};
const contentSearch = async (client: MovideskReader, args: z.infer<typeof contentSearchSchema>, accessToken: string) => {
  if (!(args.id || args.protocol || args.filter || args.from_date || args.to_date || args.created_date || args.last_update || args.responsible_id || args.responsible_email || args.owner_team || args.status || args.base_status || args.urgency || args.category || args.service || args.client_id)) throw new Error("Informe ao menos um critério de escopo além de keyword.");
  const candidates = asArray(await client.searchTickets({ ...apiParams(args), keyword: undefined, top: args.top, skip: args.skip, expand: undefined }, accessToken));
  const keyword = normalizeText(args.keyword, args.case_sensitive);
  const results: Record<string, unknown>[] = [];
  const seen = new Set<string>();
  for (const candidate of candidates) {
    const summary = candidate && typeof candidate === "object" ? candidate as Record<string, unknown> : {};
    const id = summary.id ?? summary.protocol;
    if (id === undefined || id === null) continue;
    const key = String(id);
    if (seen.has(key)) continue;
    seen.add(key);
    const ticket = first(await client.getTicket(key, accessToken));
    const matches = findMatches(ticket, keyword, args.case_sensitive);
    if (!matches.length) continue;
    const detail = ticket && typeof ticket === "object" ? ticket as Record<string, unknown> : {};
    results.push({ id: detail.id ?? summary.id, protocol: detail.protocol ?? summary.protocol, subject: detail.subject ?? detail.assunto ?? summary.subject, status: detail.status ?? summary.status, matchedIn: [...new Set(matches.map((match) => match.matchedIn))], matchedText: matches.map((match) => match.matchedText).join(" … ").slice(0, 1000) });
  }
  return { keyword: args.keyword, results, total: results.length };
};

export function registerMovideskTools(server: any, client: MovideskReader, accessToken: string) {
  server.registerTool("movidesk_get_ticket", { title: "Consultar ticket", description: "Consulta um ticket autorizado no Movidesk.", inputSchema: ticketSchema, outputSchema: { ticket: z.record(z.string(), z.unknown()) }, annotations: readOnlyAnnotations }, async (args: z.infer<typeof ticketSchema>) => {
    const ticket = first(await client.getTicket(args.ticket_id, accessToken));
    return { content: [{ type: "text" as const, text: "Ticket consultado com sucesso." }], structuredContent: { ticket: pick(ticket, ["id", "subject", "assunto", "status", "requester", "solicitante", "client", "cliente", "owner", "responsavel", "priority", "prioridade", "urgency", "urgencia", "createdDate", "dataCriacao", "lastUpdate", "ultimaAtualizacao", "actions", "acoes", "interactions", "interacoes"]) } };
  });
  server.registerTool("movidesk_get_ticket_timeline", { title: "Obter linha do tempo do ticket", description: "Transforma as ações e interações de um ticket em uma linha do tempo cronológica. Em cada evento, summary contém o texto integral da ação.", inputSchema: timelineSchema, outputSchema: { events: z.array(z.record(z.string(), z.unknown())), firstClientManifestation: z.record(z.string(), z.unknown()).nullable(), lastTeamResponse: z.record(z.string(), z.unknown()).nullable(), terminalStatus: z.string().nullable() }, annotations: readOnlyAnnotations }, async (args: z.infer<typeof timelineSchema>) => {
    const session = new MovideskAnalysisSession(client, accessToken, { maxTickets: 1 });
    let ticket: unknown;
    if (args.ticket_id) ticket = await session.getTicket(args.ticket_id);
    else {
      const searched = await session.searchTickets({ protocol: args.protocol, top: 1, skip: 0 });
      const candidate = first(searched);
      if (!candidate) throw new Error("ticket_not_found");
      const candidateObject = candidate && typeof candidate === "object" ? candidate as Record<string, unknown> : {};
      ticket = candidateObject.id === undefined ? candidate : await session.getTicket(String(candidateObject.id));
    }
    session.registerAnalyzed();
    const timeline = buildTicketTimeline(ticket);
    return { content: [{ type: "text" as const, text: `${timeline.events.length} evento(s) encontrado(s) na linha do tempo.` }], structuredContent: timeline };
  });
  server.registerTool("movidesk_search_tickets", { title: "Pesquisar tickets", description: "Pesquisa tickets autorizados no Movidesk usando filtros e paginação.", inputSchema: searchSchema, outputSchema: { results: z.array(z.unknown()) }, annotations: readOnlyAnnotations }, async (args: z.infer<typeof searchSchema>) => collectionResult("Tickets", await client.searchTickets(apiParams(args), accessToken)));
  server.registerTool("movidesk_list_open_tickets", { title: "Listar tickets abertos", description: "Lista tickets em aberto na data informada. Aceita YYYY-MM-DD, DD/MM/AAAA ou DD/MM.", inputSchema: openTicketsSchema, outputSchema: { results: z.array(z.unknown()) }, annotations: readOnlyAnnotations }, async (args: z.infer<typeof openTicketsSchema>) => collectionResult("Tickets", await client.searchTickets({ from_date: args.created_date, to_date: args.created_date, date_field: "createdDate", filter: args.filter ?? "baseStatus ne 'Resolved' and baseStatus ne 'Closed' and baseStatus ne 'Canceled'", orderby: args.orderby ?? "createdDate desc", top: args.top ?? 25, skip: args.skip ?? 0 }, accessToken)));
  server.registerTool("movidesk_search_ticket_content", { title: "Pesquisar conteúdo dos tickets", description: "Pesquisa uma palavra ou expressão no assunto, descrição inicial e interações dos tickets. Informe keyword e ao menos um critério de escopo.", inputSchema: contentSearchSchema, outputSchema: { keyword: z.string(), results: z.array(z.unknown()), total: z.number() }, annotations: readOnlyAnnotations }, async (args: z.infer<typeof contentSearchSchema>) => { const result = await contentSearch(client, args, accessToken); return { content: [{ type: "text" as const, text: `${result.total} ticket(s) encontrado(s) para ${result.keyword}.` }], structuredContent: result }; });
  server.registerTool("movidesk_search_people", { title: "Pesquisar pessoas", description: "Pesquisa pessoas autorizadas no Movidesk.", inputSchema: peopleSchema, outputSchema: { results: z.array(z.unknown()) }, annotations: readOnlyAnnotations }, async (args: z.infer<typeof peopleSchema>) => collectionResult("Pessoas", await client.searchPeople({ ...apiParams(args), active: args.active }, accessToken)));
  server.registerTool("movidesk_list_services", { title: "Listar serviços", description: "Lista serviços autorizados no Movidesk.", inputSchema: servicesSchema, outputSchema: { results: z.array(z.unknown()) }, annotations: readOnlyAnnotations }, async (args: z.infer<typeof servicesSchema>) => collectionResult("Serviços", await client.listServices({ ...apiParams(args), active: args.active, top: args.page_size ?? args.top, skip: args.page ? (args.page - 1) * (args.page_size ?? args.top ?? 25) : args.skip }, accessToken)));
}
