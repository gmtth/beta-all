import { z } from "zod";
import type { MovideskClient } from "../movidesk-client.js";

const ticketSchema = z.object({ ticket_id: z.coerce.string().trim().min(1).max(100) });
const first = (value: unknown) => Array.isArray(value) ? value[0] : value;
const pick = (value: unknown, keys: string[]) => { const object = (value && typeof value === "object" ? value : {}) as Record<string, unknown>; return Object.fromEntries(keys.map((key) => [key, object[key]]).filter(([, item]) => item !== undefined && item !== null)); };

export function registerTools(server: any, client: MovideskClient, accessToken: string) {
  server.registerTool("movidesk_get_ticket", { description: "Consulta um ticket autorizado no Movidesk.", inputSchema: ticketSchema, annotations: { readOnlyHint: true } }, async (args: z.infer<typeof ticketSchema>) => {
    const ticket = first(await client.getTicket(args.ticket_id, accessToken));
    return { content: [{ type: "text" as const, text: "Ticket consultado com sucesso." }], structuredContent: pick(ticket, ["id", "subject", "assunto", "status", "requester", "solicitante", "client", "cliente", "owner", "responsavel", "priority", "prioridade", "urgency", "urgencia", "createdDate", "dataCriacao", "lastUpdate", "ultimaAtualizacao", "actions", "acoes", "interactions", "interacoes"]) };
  });
}
