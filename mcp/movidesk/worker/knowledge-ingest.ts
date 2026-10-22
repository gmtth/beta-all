import { KnowledgeImportError } from "./knowledge-import-errors";

export type KnowledgeChunkInput = { ordinal: number; section_title: string; content: string };
export type MovideskKnowledgeRecord = {
  external_id: string;
  title: string;
  status: string | null;
  source_created_at: string | null;
  source_updated_at: string | null;
  attributes: Record<string, string>;
  chunks: KnowledgeChunkInput[];
  content_hash: string;
};

const MAX_RECORD_CHARACTERS = 50_000;
const MAX_CHUNKS = 50;
const MAX_CHUNK_CHARACTERS = 1_500;

const objectOf = (value: unknown): Record<string, unknown> => value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
const firstValue = (object: Record<string, unknown>, keys: string[]) => keys.map((key) => object[key]).find((value) => value !== undefined && value !== null && value !== "");
const scalarText = (value: unknown): string | null => {
  if (typeof value === "string" || typeof value === "number") return String(value).trim() || null;
  if (value && typeof value === "object") return scalarText(firstValue(objectOf(value), ["name", "displayName", "label", "value"]));
  return null;
};

export function cleanKnowledgeText(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const cleaned = value
    .replace(/&lt;/gi, "<").replace(/&gt;/gi, ">").replace(/&quot;/gi, '"').replace(/&#39;|&apos;/gi, "'").replace(/&nbsp;/gi, " ").replace(/&amp;/gi, "&")
    .replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi, " ")
    .replace(/<br\s*\/?\s*>|<\/(?:p|div|li|tr|h[1-6])\s*>/gi, "\n")
    .replace(/<[^>]*>/g, " ")
    .replace(/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi, "[e-mail removido]")
    .replace(/\b(?:telefone|celular|whatsapp|fone)\s*[:#-]?\s*(?:\+?\d[\d\s().-]{7,}\d)/gi, "[telefone removido]")
    .replace(/\b\d{3}\.?\d{3}\.?\d{3}-?\d{2}\b|\b\d{2}\.?\d{3}\.?\d{3}\/?\d{4}-?\d{2}\b/g, "[documento removido]")
    .replace(/https?:\/\/\S+/gi, "[link removido]")
    .replace(/[ \t]+/g, " ").replace(/ *\n */g, "\n").replace(/\n{3,}/g, "\n\n").trim();
  return cleaned || null;
}

function splitText(sectionTitle: string, content: string, ordinalStart: number): KnowledgeChunkInput[] {
  const chunks: KnowledgeChunkInput[] = [];
  let current = "";
  const flush = () => {
    const text = current.trim();
    if (text) chunks.push({ ordinal: ordinalStart + chunks.length, section_title: sectionTitle, content: text });
    current = "";
  };
  for (const paragraph of content.split(/\n+/).map((part) => part.trim()).filter(Boolean)) {
    let remainder = paragraph;
    while (remainder.length > MAX_CHUNK_CHARACTERS) {
      const boundary = remainder.lastIndexOf(" ", MAX_CHUNK_CHARACTERS);
      const cut = boundary > MAX_CHUNK_CHARACTERS * 0.55 ? boundary : MAX_CHUNK_CHARACTERS;
      const piece = remainder.slice(0, cut).trim();
      const next = remainder.slice(cut).trim();
      if (current && current.length + piece.length + 1 > MAX_CHUNK_CHARACTERS) flush();
      current = current ? `${current}\n${piece}` : piece;
      flush();
      remainder = next;
    }
    if (current && current.length + remainder.length + 1 > MAX_CHUNK_CHARACTERS) flush();
    current = current ? `${current}\n${remainder}` : remainder;
  }
  flush();
  return chunks;
}

const dateValue = (value: unknown) => {
  const text = scalarText(value);
  if (!text) return null;
  const timestamp = Date.parse(text);
  return Number.isNaN(timestamp) ? null : new Date(timestamp).toISOString();
};

function ticketCandidates(value: unknown): Record<string, unknown>[] {
  const candidates = Array.isArray(value) ? value : value && typeof value === "object" && Array.isArray((value as { results?: unknown }).results)
    ? (value as { results: unknown[] }).results : [value];
  return candidates.map(objectOf).filter((ticket) => Object.keys(ticket).length > 0);
}

/** Movidesk accepts both its internal ticket ID and its protocol as identifiers. */
export function movideskTicketMatchesIdentifier(value: unknown, identifier: string): boolean {
  return ticketCandidates(value).some((ticket) =>
    ["id", "ticketId", "ticket_id", "protocol"].some((key) => scalarText(ticket[key]) === identifier),
  );
}

export async function resolveMovideskTicketIdentifier(
  identifier: string,
  lookup: (kind: "id" | "protocol", value: string) => Promise<unknown | null>,
): Promise<unknown> {
  const byInternalId = await lookup("id", identifier);
  const byProtocol = await lookup("protocol", identifier);
  const internalIdMatches = Boolean(byInternalId && movideskTicketMatchesIdentifier(byInternalId, identifier));
  const protocolMatches = Boolean(byProtocol && movideskTicketMatchesIdentifier(byProtocol, identifier));

  if (internalIdMatches && protocolMatches) {
    const internalRecord = ticketCandidates(byInternalId).find((ticket) =>
      ["id", "ticketId", "ticket_id", "protocol"].some((key) => scalarText(ticket[key]) === identifier),
    );
    const protocolRecord = ticketCandidates(byProtocol).find((ticket) =>
      ["id", "ticketId", "ticket_id", "protocol"].some((key) => scalarText(ticket[key]) === identifier),
    );
    const internalId = internalRecord && scalarText(firstValue(internalRecord, ["id", "ticketId", "ticket_id"]));
    const protocolId = protocolRecord && scalarText(firstValue(protocolRecord, ["id", "ticketId", "ticket_id"]));
    if (internalId && protocolId && internalId !== protocolId) throw new KnowledgeImportError("ticket_mismatch");
  }
  if (internalIdMatches) return byInternalId;
  if (protocolMatches) return byProtocol;
  if (byInternalId || byProtocol) throw new KnowledgeImportError("ticket_mismatch");
  throw new KnowledgeImportError("ticket_not_found");
}

export async function buildMovideskKnowledgeRecord(ticketValue: unknown, expectedTicketId: string): Promise<MovideskKnowledgeRecord> {
  const ticket = ticketCandidates(ticketValue).find((candidate) =>
    ["id", "ticketId", "ticket_id", "protocol"].some((key) => scalarText(candidate[key]) === expectedTicketId),
  ) ?? {};
  const actualId = scalarText(firstValue(ticket, ["id", "ticketId", "ticket_id"]));
  if (!actualId || !movideskTicketMatchesIdentifier(ticket, expectedTicketId)) throw new KnowledgeImportError("ticket_mismatch");

  const title = cleanKnowledgeText(firstValue(ticket, ["subject", "assunto", "title", "titulo"]))?.slice(0, 500);
  if (!title) throw new KnowledgeImportError("ticket_missing_title");

  const sections: Array<{ title: string; content: string }> = [];
  const description = cleanKnowledgeText(firstValue(ticket, ["initialDescription", "description", "descriptionHtml", "descricao"]));
  if (description) sections.push({ title: "Descrição inicial", content: description });
  const actions = firstValue(ticket, ["actions", "acoes", "interactions", "interacoes", "history", "historico"]);
  if (Array.isArray(actions)) {
    actions.forEach((value, index) => {
      const action = objectOf(value);
      const text = cleanKnowledgeText(firstValue(action, ["htmlDescription", "description", "text", "message", "content", "observation", "observacao", "descricao"]));
      if (text) sections.push({ title: `Interação ${index + 1}`, content: text });
    });
  }
  if (!sections.length) throw new KnowledgeImportError("ticket_missing_content");

  const attributes: Record<string, string> = {};
  const protocolValue = scalarText(firstValue(ticket, ["protocol", "protocolo"]));
  if (protocolValue && /^\d{1,30}$/.test(protocolValue)) attributes.protocol = protocolValue;
  const attributeKeys: Array<[string, string[]]> = [
    ["category", ["category", "categoria"]], ["service", ["service", "serviceFirstLevel", "servico"]],
    ["urgency", ["urgency", "urgencyName", "urgencia"]], ["owner_team", ["ownerTeam", "owner_team"]],
    ["equipment_model", ["equipmentModel", "machineModel", "model", "modelo"]],
  ];
  for (const [key, keys] of attributeKeys) {
    const value = scalarText(firstValue(ticket, keys));
    const cleaned = value ? cleanKnowledgeText(value)?.slice(0, 200) : null;
    if (cleaned) attributes[key] = cleaned;
  }

  const status = cleanKnowledgeText(scalarText(firstValue(ticket, ["status", "baseStatus"])))?.slice(0, 128) ?? null;
  const chunks = sections.flatMap((section) => splitText(section.title, section.content, 0));
  chunks.forEach((chunk, index) => { chunk.ordinal = index; });
  if (chunks.length > MAX_CHUNKS || sections.reduce((sum, section) => sum + section.content.length, title.length) > MAX_RECORD_CHARACTERS) {
    throw new KnowledgeImportError("ticket_too_large");
  }
  const sourceCreatedAt = dateValue(firstValue(ticket, ["createdDate", "created_at"]));
  const sourceUpdatedAt = dateValue(firstValue(ticket, ["lastUpdate", "updatedDate", "updated_at"]));
  const canonical = JSON.stringify({ title, status, sourceCreatedAt, sourceUpdatedAt, attributes, chunks });
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(canonical));
  const contentHash = [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
  return { external_id: actualId, title, status, source_created_at: sourceCreatedAt, source_updated_at: sourceUpdatedAt, attributes, chunks, content_hash: contentHash };
}
