export type TimelineEvent = {
  date: string | null;
  author: string | null;
  origin: string | null;
  type: string | null;
  status: string | null;
  justification: string | null;
  /** Full action text; kept as summary for compatibility with the Phase 2 contract. */
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
const textValue = (value: unknown): string | null => {
  if (typeof value === "string" && value.trim()) return value.trim();
  if (value === undefined || value === null || value === "") return null;
  if (typeof value === "object") {
    const object = objectOf(value);
    const nested = firstValue(object, ["name", "fullName", "displayName", "email", "id", "Id", "codigo", "code"]);
    return nested === value ? null : textValue(nested);
  }
  return String(value);
};
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

type ActorType = "client" | "team" | "system" | "unknown";
const actionAuthor = (value: unknown): Record<string, unknown> => {
  const object = objectOf(value);
  const nested = firstValue(object, ["person", "Person", "user", "User", "createdBy", "CreatedBy"]);
  return nested && typeof nested === "object" ? objectOf(nested) : object;
};
const actorEmail = (author: Record<string, unknown>) => textValue(firstValue(author, ["email", "Email", "userName", "username", "login"]));
const normalizedActorValue = (value: unknown) => (textValue(value) ?? "").toLocaleLowerCase();
const actorTypeFromValue = (value: unknown): ActorType => {
  const normalized = normalizedActorValue(value);
  if (["1", "agent", "atendente", "operator", "operatoria", "team", "equipe"].includes(normalized)) return "team";
  if (["2", "client", "cliente", "requester", "solicitante"].includes(normalized)) return "client";
  if (["3", "agent and client", "agent e cliente", "both", "ambos"].includes(normalized)) return "unknown";
  return "unknown";
};
const classifyActor = (source: unknown): ActorType => {
  const action = objectOf(source);
  const author = actionAuthor(firstValue(action, ["createdBy", "CreatedBy", "author", "Author", "user", "User", "usuario"]));
  const profile = actorTypeFromValue(firstValue(author, ["profileType", "ProfileType", "profile", "Profile"]));
  const person = actorTypeFromValue(firstValue(author, ["personType", "PersonType", "personTypeName", "PersonTypeName"]));
  if (profile !== "unknown") return profile;
  if (person !== "unknown") return person;
  const email = (actorEmail(author) ?? textValue(firstValue(action, ["authorEmail", "email", "Email"])))?.toLocaleLowerCase() ?? "";
  if (email.endsWith("@cencicia.com.br") || email.startsWith("service")) return "team";
  if (email.includes("@")) return "client";
  return "unknown";
};

const isPublicEvent = (event: TimelineEvent) => event.type !== "1";

const eventList = (ticket: unknown) => {
  const object = objectOf(Array.isArray(ticket) ? ticket[0] : ticket);
  const actions = firstValue(object, ["actions", "acoes", "interactions", "interacoes", "history", "historico"]);
  return Array.isArray(actions) ? actions : [];
};

export function buildTicketTimeline(ticket: unknown): TicketTimeline {
  const rawEvents = eventList(ticket);
  const events = rawEvents.map((value, sourceIndex) => {
    const object = objectOf(value);
    return {
      date: dateValue(object), author: authorValue(object), origin: originValue(object), type: typeValue(object),
      status: statusValue(object), justification: justificationValue(object), summary: summaryValue(object),
      hasAttachments: hasAttachments(object), sourceIndex,
    } satisfies TimelineEvent;
  });
  const sorted = [...events].sort((left, right) => dateSortValue(left.date) - dateSortValue(right.date) || left.sourceIndex - right.sourceIndex);
  const actorByIndex = new Map(rawEvents.map((value, index) => [index, classifyActor(value)]));
  const firstClientManifestation = sorted.find((event) => isPublicEvent(event) && actorByIndex.get(event.sourceIndex) === "client") ?? null;
  const publicTeamEvents = sorted.filter((event) => isPublicEvent(event) && actorByIndex.get(event.sourceIndex) === "team");
  const lastTeamResponse = publicTeamEvents.length ? publicTeamEvents[publicTeamEvents.length - 1] : null;
  const ticketObject = objectOf(Array.isArray(ticket) ? ticket[0] : ticket);
  return { events: sorted, firstClientManifestation, lastTeamResponse, terminalStatus: statusValue(ticketObject) ?? (sorted.length ? sorted[sorted.length - 1].status : null) };
}
