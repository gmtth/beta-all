import { z } from "zod";

export interface MovideskReader {
  getTicket(id: string, accessToken: string): Promise<unknown>;
  searchTickets(params: Record<string, string | number | boolean | undefined>, accessToken: string): Promise<unknown>;
  searchPeople(params: Record<string, string | number | boolean | undefined>, accessToken: string): Promise<unknown>;
  listServices(params: Record<string, string | number | boolean | undefined>, accessToken: string): Promise<unknown>;
}

const ticketSchema = z.object({ ticket_id: z.coerce.string().trim().regex(/^\d{1,30}$/, "ticket_id deve conter apenas números") });
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
const peopleSchema = searchSchema.extend({ active: z.coerce.boolean().optional() });
const servicesSchema = searchSchema.extend({ active: z.coerce.boolean().optional(), page: z.coerce.number().int().min(1).max(1000).optional(), page_size: z.coerce.number().int().min(1).max(100).optional() });
const readOnlyAnnotations = { readOnlyHint: true, destructiveHint: false, openWorldHint: false } as const;
const first = (value: unknown) => Array.isArray(value) ? value[0] : value;
const pick = (value: unknown, keys: string[]) => { const object = (value && typeof value === "object" ? value : {}) as Record<string, unknown>; return Object.fromEntries(keys.map((key) => [key, object[key]]).filter(([, item]) => item !== undefined && item !== null)); };
const apiParams = (args: z.infer<typeof searchSchema>) => ({ id: args.id, protocol: args.protocol, filter: args.filter, keyword: args.keyword, from_date: args.from_date ?? args.created_date, to_date: args.to_date, date_field: args.last_update ? "lastUpdate" : args.date_field, responsible_id: args.responsible_id, responsible_email: args.responsible_email, owner_team: args.owner_team, status: args.status, base_status: args.base_status, urgency: args.urgency, category: args.category, service: args.service, client_id: args.client_id, include_past: args.include_past, select: args.select, expand: args.expand, orderby: args.orderby, top: args.top, skip: args.skip });
const collectionResult = (label: string, value: unknown) => ({ content: [{ type: "text" as const, text: `${label}: ${Array.isArray(value) ? value.length : 0} registro(s) encontrado(s).` }], structuredContent: { results: Array.isArray(value) ? value : [] } });
const jsonResult = (value: unknown) => ({ content: [{ type: "text" as const, text: JSON.stringify(value) }], structuredContent: value });

export function registerMovideskTools(server: any, client: MovideskReader, accessToken: string) {
  server.registerTool("movidesk_get_ticket", { title: "Consultar ticket", description: "Consulta um ticket autorizado no Movidesk.", inputSchema: ticketSchema, outputSchema: { ticket: z.record(z.string(), z.unknown()) }, annotations: readOnlyAnnotations }, async (args: z.infer<typeof ticketSchema>) => {
    const ticket = first(await client.getTicket(args.ticket_id, accessToken));
    return { content: [{ type: "text" as const, text: "Ticket consultado com sucesso." }], structuredContent: { ticket: pick(ticket, ["id", "subject", "assunto", "status", "requester", "solicitante", "client", "cliente", "owner", "responsavel", "priority", "prioridade", "urgency", "urgencia", "createdDate", "dataCriacao", "lastUpdate", "ultimaAtualizacao", "actions", "acoes", "interactions", "interacoes"]) } };
  });
  server.registerTool("movidesk_search_tickets", { title: "Pesquisar tickets", description: "Pesquisa tickets autorizados no Movidesk usando filtros e paginação.", inputSchema: searchSchema, outputSchema: { results: z.array(z.unknown()) }, annotations: readOnlyAnnotations }, async (args: z.infer<typeof searchSchema>) => collectionResult("Tickets", await client.searchTickets(apiParams(args), accessToken)));
  server.registerTool("movidesk_list_open_tickets", { title: "Listar tickets abertos", description: "Lista tickets em aberto na data informada. Aceita YYYY-MM-DD, DD/MM/AAAA ou DD/MM.", inputSchema: openTicketsSchema, annotations: readOnlyAnnotations }, async (args: z.infer<typeof openTicketsSchema>) => jsonResult(await client.searchTickets({ from_date: args.created_date, to_date: args.created_date, date_field: "createdDate", filter: args.filter ?? "baseStatus ne 'Resolved' and baseStatus ne 'Closed' and baseStatus ne 'Canceled'", orderby: args.orderby ?? "createdDate desc", top: args.top ?? 25, skip: args.skip ?? 0 }, accessToken)));
  server.registerTool("movidesk_search_people", { title: "Pesquisar pessoas", description: "Pesquisa pessoas autorizadas no Movidesk.", inputSchema: peopleSchema, outputSchema: { results: z.array(z.unknown()) }, annotations: readOnlyAnnotations }, async (args: z.infer<typeof peopleSchema>) => collectionResult("Pessoas", await client.searchPeople({ ...apiParams(args), active: args.active }, accessToken)));
  server.registerTool("movidesk_list_services", { title: "Listar serviços", description: "Lista serviços autorizados no Movidesk.", inputSchema: servicesSchema, outputSchema: { results: z.array(z.unknown()) }, annotations: readOnlyAnnotations }, async (args: z.infer<typeof servicesSchema>) => collectionResult("Serviços", await client.listServices({ ...apiParams(args), active: args.active, top: args.page_size ?? args.top, skip: args.page ? (args.page - 1) * (args.page_size ?? args.top ?? 25) : args.skip }, accessToken)));
}
