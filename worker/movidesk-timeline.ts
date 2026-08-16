export type TimelineEvent = {
  date: string | null;
  author: string | null;
  origin: string | null;
  type: string | null;
  status: string | null;
  justification: string | null;
  summary: string | null;
  hasAttachments: boolean;
  sourceIndex: number;
};

export type TicketTimeline = {
  events: TimelineEvent[];
  firstClientManifestation: TimelineEvent | null;
  lastTeamResponse: TimelineEvent | null;
  terminalStatus: string | null;
};

const objectOf = (value: unknown) => value && typeof value === "object" ? value as Record<string, unknown> : {};
const firstValue = (object: Record<string, unknown>, keys: string[]) => keys.map((key) => object[key]).find((value) => value !== undefined && value !== null && value !== "");
const textValue = (value: unknown) => typeof value === "string" && value.trim() ? value.trim() : value === undefined || value === null ? null : String(value);
const dateValue = (object: Record<string, unknown>) => textValue(firstValue(object, ["createdDate", "date", "timestamp", "createdAt", "data", "dataCriacao"]));
const authorValue = (object: Record<string, unknown>) => textValue(firstValue(object, ["createdBy", "createdByName", "author", "authorName", "responsible", "responsavel", "owner", "user", "usuario"]));
const originValue = (object: Record<string, unknown>) => textValue(firstValue(object, ["origin", "origem", "originName", "channel", "source"]));
const typeValue = (object: Record<string, unknown>) => textValue(firstValue(object, ["type", "tipo", "actionType", "interactionType", "eventType"]));
const statusValue = (object: Record<string, unknown>) => textValue(firstValue(object, ["status", "statusName", "baseStatus", "statusDescription"]));
const justificationValue = (object: Record<string, unknown>) => textValue(firstValue(object, ["justification", "justificativa", "reason", "motivo"]));
const summaryValue = (object: Record<string, unknown>) => textValue(firstValue(object, ["description", "text", "message", "content", "observation", "observacao", "descricao"]));
const hasAttachments = (object: Record<string, unknown>) => {
  const attachments = firstValue(object, ["attachments", "anexos", "files", "arquivos"]);
  return Array.isArray(attachments) ? attachments.length > 0 : Boolean(attachments);
};

const dateSortValue = (date: string | null) => {
  if (!date) return Number.POSITIVE_INFINITY;
  const parsed = Date.parse(date);
  return Number.isNaN(parsed) ? Number.POSITIVE_INFINITY : parsed;
};

const isClientEvent = (event: TimelineEvent) => {
  const value = `${event.origin ?? ""} ${event.type ?? ""}`.toLocaleLowerCase();
  return value.includes("client") || value.includes("cliente") || value.includes("requester") || value.includes("solicitante");
};

const isTeamEvent = (event: TimelineEvent) => {
  const value = `${event.origin ?? ""} ${event.type ?? ""}`.toLocaleLowerCase();
  return value.includes("team") || value.includes("equipe") || value.includes("agent") || value.includes("atendente") || value.includes("operator") || value.includes("intern");
};

const eventList = (ticket: unknown) => {
  const object = objectOf(Array.isArray(ticket) ? ticket[0] : ticket);
  const actions = firstValue(object, ["actions", "acoes", "interactions", "interacoes", "history", "historico"]);
  return Array.isArray(actions) ? actions : [];
};

export function buildTicketTimeline(ticket: unknown): TicketTimeline {
  const events = eventList(ticket).map((value, sourceIndex) => {
    const object = objectOf(value);
    return {
      date: dateValue(object), author: authorValue(object), origin: originValue(object), type: typeValue(object),
      status: statusValue(object), justification: justificationValue(object), summary: summaryValue(object),
      hasAttachments: hasAttachments(object), sourceIndex,
    } satisfies TimelineEvent;
  });
  const sorted = [...events].sort((left, right) => dateSortValue(left.date) - dateSortValue(right.date) || left.sourceIndex - right.sourceIndex);
  const firstClientManifestation = sorted.find(isClientEvent) ?? null;
  const teamEvents = sorted.filter(isTeamEvent);
  const lastTeamResponse = teamEvents.length ? teamEvents[teamEvents.length - 1] : null;
  const ticketObject = objectOf(Array.isArray(ticket) ? ticket[0] : ticket);
  return { events: sorted, firstClientManifestation, lastTeamResponse, terminalStatus: statusValue(ticketObject) ?? (sorted.length ? sorted[sorted.length - 1].status : null) };
}
