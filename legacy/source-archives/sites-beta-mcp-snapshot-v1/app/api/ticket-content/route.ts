import { authorizeMovidesk, fetchMovideskText, MovideskTimeoutError } from "../_movidesk";
import { json } from "../../oauth/_lib";

const CONTENT_SEARCH_TIMEOUT_MS = 60_000;

const escapeOData = (value: string) => value.replace(/'/g, "''");
const stripHtml = (value: string) => value.replace(/<[^>]*>/g, " ").replace(/&nbsp;/gi, " ").replace(/&amp;/gi, "&").replace(/\s+/g, " ").trim();
const normalizeDate = (value: string | null, endOfDay: boolean) => {
  if (!value) return "";
  const text = value.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) return `${text}T${endOfDay ? "23:59:59" : "00:00:00"}Z`;
  const match = /^(\d{2})\/(\d{2})(?:\/(\d{4}))?$/.exec(text);
  if (!match) return "";
  const year = match[3] ?? String(new Date().getUTCFullYear());
  const date = new Date(Date.UTC(Number(year), Number(match[2]) - 1, Number(match[1])));
  if (date.getUTCFullYear() !== Number(year) || date.getUTCMonth() !== Number(match[2]) - 1 || date.getUTCDate() !== Number(match[1])) return "";
  return `${year}-${match[2]}-${match[1]}T${endOfDay ? "23:59:59" : "00:00:00"}Z`;
};
const findMatches = (ticket: unknown, keyword: string, caseSensitive: boolean) => {
  if (!ticket || typeof ticket !== "object") return [] as { matchedIn: string; matchedText: string; actionId?: unknown }[];
  const value = ticket as Record<string, unknown>;
  const matches: { matchedIn: string; matchedText: string; actionId?: unknown }[] = [];
  const matchesText = (value: unknown) => { const text = stripHtml(String(value ?? "")); return (caseSensitive ? text : text.toLocaleLowerCase()).includes(keyword); };
  if (matchesText(value.subject ?? value.assunto)) matches.push({ matchedIn: "subject", matchedText: stripHtml(String(value.subject ?? value.assunto)).slice(0, 500) });
  const actions = Array.isArray(value.actions) ? value.actions : [];
  actions.forEach((action, index) => {
    if (matches.length >= 8 || !action || typeof action !== "object") return;
    const item = action as Record<string, unknown>;
    const description = item.description;
    if (matchesText(description)) matches.push({ matchedIn: index === 0 ? "initial_action" : "action", actionId: item.id, matchedText: stripHtml(String(description ?? "")).slice(0, 500) });
  });
  return matches;
};

export async function GET(request: Request) {
  const auth = await authorizeMovidesk(request);
  if ("response" in auth) return auth.response;
  const incoming = new URL(request.url);
  const keywordInput = incoming.searchParams.get("keyword")?.trim() ?? "";
  if (!keywordInput || keywordInput.length > 200) return json({ error: "invalid_keyword", message: "Informe uma keyword de 1 a 200 caracteres." }, { status: 400 });
  const scopeFields = ["from_date", "to_date", "owner_team", "status", "base_status", "category", "service", "client_id", "responsible_id", "responsible_email", "filter"];
  if (!scopeFields.some((field) => incoming.searchParams.get(field)?.trim())) return json({ error: "search_criteria_required", message: "Informe ao menos um critério de escopo além de keyword." }, { status: 400 });
  const top = Number(incoming.searchParams.get("top") ?? "20");
  const skip = Number(incoming.searchParams.get("skip") ?? "0");
  if (!Number.isInteger(top) || top < 1 || top > 20 || !Number.isInteger(skip) || skip < 0 || skip > 10000) return json({ error: "invalid_pagination" }, { status: 400 });
  const dateField = incoming.searchParams.get("date_field") ?? "createdDate";
  if (!["createdDate", "lastUpdate", "resolvedIn", "closedIn"].includes(dateField)) return json({ error: "invalid_date_field" }, { status: 400 });
  const from = normalizeDate(incoming.searchParams.get("from_date"), false);
  const to = normalizeDate(incoming.searchParams.get("to_date"), true);
  if ((incoming.searchParams.get("from_date") && !from) || (incoming.searchParams.get("to_date") && !to)) return json({ error: "invalid_date" }, { status: 400 });
  const filters = [from ? `${dateField} ge ${from}` : "", to ? `${dateField} le ${to}` : "", ...["owner_team", "status", "base_status", "category", "service", "responsible_id", "responsible_email"].map((name) => { const value = incoming.searchParams.get(name)?.trim(); const field = ({ owner_team: "ownerTeam", base_status: "baseStatus", service: "serviceFirstLevel", responsible_id: "owner/id", responsible_email: "owner/email" } as Record<string, string>)[name] ?? name; return value ? `${field} eq '${escapeOData(value)}'` : ""; }), incoming.searchParams.get("client_id")?.trim() ? `clients/any(c: c/id eq '${escapeOData(incoming.searchParams.get("client_id")!.trim())}')` : ""].filter(Boolean);
  const rawFilter = incoming.searchParams.get("filter")?.trim() ?? "";
  if (rawFilter.length > 1000 || /[;\r\n]/.test(rawFilter)) return json({ error: "invalid_filter" }, { status: 400 });
  if (rawFilter) filters.push(`(${rawFilter})`);
  const target = new URL("https://api.movidesk.com/public/v1/tickets");
  target.searchParams.set("$filter", filters.join(" and "));
  target.searchParams.set("$select", "id,protocol,subject,status,category,urgency,baseStatus,createdDate,lastUpdate,ownerTeam");
  target.searchParams.set("$orderby", incoming.searchParams.get("orderby")?.trim() || "createdDate desc");
  target.searchParams.set("$top", String(top));
  target.searchParams.set("$skip", String(skip));
  target.searchParams.set("token", auth.token);
  const operationController = new AbortController();
  const operationTimeout = setTimeout(() => operationController.abort(new DOMException("Content search timed out.", "TimeoutError")), CONTENT_SEARCH_TIMEOUT_MS);
  try {
    const { response: upstream, text: body } = await fetchMovideskText(target, { headers: { Accept: "application/json" } }, operationController.signal);
    let data: unknown;
    try { data = body ? JSON.parse(body) : null; } catch { data = { error: "Movidesk returned a non-JSON response." }; }
    if (!upstream.ok) return json(data, { status: upstream.status });
    const tickets = Array.isArray(data) ? data : [];
    const caseSensitive = incoming.searchParams.get("case_sensitive") === "true";
    const needle = caseSensitive ? keywordInput : keywordInput.toLocaleLowerCase();
    const results: Record<string, unknown>[] = [];
    for (const ticket of tickets) {
      if (!ticket || typeof ticket !== "object") continue;
      const candidate = ticket as Record<string, unknown>;
      if (candidate.id === undefined || candidate.id === null) continue;
      const detailUrl = new URL("https://api.movidesk.com/public/v1/tickets");
      detailUrl.searchParams.set("id", String(candidate.id));
      detailUrl.searchParams.set("$select", "id,protocol,subject,status,category,urgency,baseStatus,createdDate,lastUpdate,ownerTeam");
      detailUrl.searchParams.set("$expand", "actions($select=id,description,createdDate,type,origin)");
      detailUrl.searchParams.set("token", auth.token);
      const { response: detailResponse, text: detailBody } = await fetchMovideskText(detailUrl, { headers: { Accept: "application/json" } }, operationController.signal);
      if (!detailResponse.ok) continue;
      let detailData: unknown;
      try { detailData = detailBody ? JSON.parse(detailBody) : null; } catch { continue; }
      const detail = Array.isArray(detailData) ? detailData[0] : detailData;
      const matches = findMatches(detail, needle, caseSensitive);
      if (!matches.length) continue;
      const item = detail && typeof detail === "object" ? detail as Record<string, unknown> : candidate;
      results.push({ id: item.id ?? candidate.id, protocol: item.protocol ?? candidate.protocol, subject: item.subject ?? item.assunto ?? candidate.subject, status: item.status ?? candidate.status, category: item.category ?? candidate.category, urgency: item.urgency ?? candidate.urgency, ownerTeam: item.ownerTeam ?? candidate.ownerTeam, createdDate: item.createdDate ?? candidate.createdDate, lastUpdate: item.lastUpdate ?? candidate.lastUpdate, matchedIn: [...new Set(matches.map((match) => match.matchedIn))], matchedActionIds: matches.map((match) => match.actionId).filter((id) => id !== undefined), matchedText: matches.map((match) => match.matchedText).join(" … ").slice(0, 1000) });
    }
    if (operationController.signal.aborted) throw new MovideskTimeoutError();
    return json({ keyword: keywordInput, results, total: results.length });
  } catch (error) {
    if (error instanceof MovideskTimeoutError) return json({ error: "A busca de conteúdo excedeu o limite de tempo." }, { status: 504 });
    return json({ error: "Movidesk indisponível." }, { status: 502 });
  } finally {
    clearTimeout(operationTimeout);
  }
}
