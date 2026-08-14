import { z } from "zod";
import type { MovideskClient } from "../movidesk-client.js";

const ticketSchema = z.object({ ticket_id: z.coerce.string().trim().regex(/^\d{1,30}$/, "ticket_id deve conter apenas números") });
const searchSchema = z.object({ filter: z.string().trim().max(500).optional(), select: z.string().trim().max(500).optional(), expand: z.string().trim().max(500).optional(), orderby: z.string().trim().max(200).optional(), top: z.coerce.number().int().min(1).max(100).default(25), skip: z.coerce.number().int().min(0).max(10000).default(0) });
const peopleSchema = searchSchema.extend({ active: z.coerce.boolean().optional() });
const servicesSchema = searchSchema.extend({ active: z.coerce.boolean().optional() });
const first = (value: unknown) => Array.isArray(value) ? value[0] : value;
const pick = (value: unknown, keys: string[]) => { const object = (value && typeof value === "object" ? value : {}) as Record<string, unknown>; return Object.fromEntries(keys.map((key) => [key, object[key]]).filter(([, item]) => item !== undefined && item !== null)); };
const apiParams = (args: z.infer<typeof searchSchema>) => ({ "$filter": args.filter, "$select": args.select, "$expand": args.expand, "$orderby": args.orderby, "$top": args.top, "$skip": args.skip });
const collectionResult = (label: string, value: unknown) => ({ content: [{ type: "text" as const, text: `${label}: ${Array.isArray(value) ? value.length : 0} registro(s) encontrado(s).` }], structuredContent: { results: value } });

export function registerTools(server: any, client: MovideskClient, accessToken: string) {
  server.registerTool("movidesk_get_ticket", { description: "Consulta um ticket autorizado no Movidesk.", inputSchema: ticketSchema, annotations: { readOnlyHint: true } }, async (args: z.infer<typeof ticketSchema>) => {
    const ticket = first(await client.getTicket(args.ticket_id, accessToken));
    return { content: [{ type: "text" as const, text: "Ticket consultado com sucesso." }], structuredContent: pick(ticket, ["id", "subject", "assunto", "status", "requester", "solicitante", "client", "cliente", "owner", "responsavel", "priority", "prioridade", "urgency", "urgencia", "createdDate", "dataCriacao", "lastUpdate", "ultimaAtualizacao", "actions", "acoes", "interactions", "interacoes"]) };
  });
  server.registerTool("movidesk_search_tickets", { description: "Pesquisa tickets autorizados no Movidesk usando filtros e paginação.", inputSchema: searchSchema, annotations: { readOnlyHint: true } }, async (args: z.infer<typeof searchSchema>) => collectionResult("Tickets", await client.searchTickets(apiParams(args), accessToken)));
  server.registerTool("movidesk_search_people", { description: "Pesquisa pessoas autorizadas no Movidesk usando filtros e paginação.", inputSchema: peopleSchema, annotations: { readOnlyHint: true } }, async (args: z.infer<typeof peopleSchema>) => collectionResult("Pessoas", await client.searchPeople({ ...apiParams(args), active: args.active }, accessToken)));
  server.registerTool("movidesk_list_services", { description: "Lista serviços autorizados no Movidesk usando filtros e paginação.", inputSchema: servicesSchema, annotations: { readOnlyHint: true } }, async (args: z.infer<typeof servicesSchema>) => collectionResult("Serviços", await client.listServices({ ...apiParams(args), active: args.active }, accessToken)));
}
