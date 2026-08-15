import { z } from "zod";
import type { MovideskClient } from "../movidesk-client.js";

const ticketSchema = z.object({ ticket_id: z.coerce.string().trim().regex(/^\d{1,30}$/, "ticket_id deve conter apenas números") });
const searchTicketsSchema = z.object({
  protocol: z.string().trim().min(1).max(100).optional(),
  status: z.string().trim().min(1).max(100).optional(),
  created_date: z.string().trim().min(1).max(100).optional(),
  last_update: z.string().trim().min(1).max(100).optional(),
  filter: z.string().trim().min(1).max(1000).optional(),
  orderby: z.string().trim().min(1).max(200).optional(),
  top: z.coerce.number().int().min(1).max(100).optional(),
  skip: z.coerce.number().int().min(0).max(100000).optional()
});
const openTicketsSchema = z.object({
  created_date: z.string().trim().min(1).max(100),
  filter: z.string().trim().min(1).max(1000).optional(),
  orderby: z.string().trim().min(1).max(200).optional(),
  top: z.coerce.number().int().min(1).max(100).optional(),
  skip: z.coerce.number().int().min(0).max(100000).optional()
});
const servicesSchema = z.object({
  active: z.coerce.boolean().optional(),
  page: z.coerce.number().int().min(1).max(1000).optional(),
  page_size: z.coerce.number().int().min(1).max(100).optional()
});
const readOnlyAnnotations = { readOnlyHint: true, destructiveHint: false, openWorldHint: false } as const;
const first = (value: unknown) => Array.isArray(value) ? value[0] : value;
const pick = (value: unknown, keys: string[]) => { const object = (value && typeof value === "object" ? value : {}) as Record<string, unknown>; return Object.fromEntries(keys.map((key) => [key, object[key]]).filter(([, item]) => item !== undefined && item !== null)); };
const jsonResult = (value: unknown) => ({ content: [{ type: "text" as const, text: JSON.stringify(value) }], structuredContent: value });

export function registerTools(server: any, client: MovideskClient, accessToken: string) {
  server.registerTool("movidesk_get_ticket", { title: "Consultar ticket", description: "Consulta um ticket autorizado no Movidesk.", inputSchema: ticketSchema, outputSchema: { ticket: z.record(z.string(), z.unknown()) }, annotations: readOnlyAnnotations }, async (args: z.infer<typeof ticketSchema>) => {
    const ticket = first(await client.getTicket(args.ticket_id, accessToken));
    return { content: [{ type: "text" as const, text: "Ticket consultado com sucesso." }], structuredContent: { ticket: pick(ticket, ["id", "subject", "assunto", "status", "requester", "solicitante", "client", "cliente", "owner", "responsavel", "priority", "prioridade", "urgency", "urgencia", "createdDate", "dataCriacao", "lastUpdate", "ultimaAtualizacao", "actions", "acoes", "interactions", "interacoes"]) } };
  });

  server.registerTool("movidesk_search_tickets", { title: "Pesquisar tickets", description: "Busca tickets autorizados no Movidesk por protocolo, assunto, status ou período de criação.", inputSchema: searchTicketsSchema, outputSchema: { results: z.array(z.unknown()) }, annotations: readOnlyAnnotations }, async (args: z.infer<typeof searchTicketsSchema>) => {
    return jsonResult(await client.searchTickets({ protocol: args.protocol, status: args.status, createdDate: args.created_date, lastUpdate: args.last_update, "$filter": args.filter, "$orderby": args.orderby, "$top": args.top, "$skip": args.skip }, accessToken));
  });

  server.registerTool("movidesk_list_open_tickets", { description: "Lista tickets em aberto no Movidesk dentro de um período de criação. Não altera dados.", inputSchema: openTicketsSchema, annotations: { readOnlyHint: true } }, async (args: z.infer<typeof openTicketsSchema>) => {
    return jsonResult(await client.searchTickets({ createdDate: args.created_date, "$filter": args.filter ?? "baseStatus ne 'Resolved' and baseStatus ne 'Closed' and baseStatus ne 'Canceled'", "$orderby": args.orderby ?? "createdDate desc", "$top": args.top, "$skip": args.skip }, accessToken));
  });

  server.registerTool("movidesk_list_services", { description: "Lista serviços disponíveis no Movidesk.", inputSchema: servicesSchema, annotations: { readOnlyHint: true } }, async (args: z.infer<typeof servicesSchema>) => {
    return jsonResult(await client.listServices({ "$filter": args.active === undefined ? undefined : `isActive eq ${args.active}`, "$top": args.page_size, "$skip": args.page ? (args.page - 1) * (args.page_size ?? 25) : undefined }, accessToken));
  });
}
