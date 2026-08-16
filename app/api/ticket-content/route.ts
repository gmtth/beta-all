import { authorizeMovidesk } from "../_movidesk";
import { json } from "../../oauth/_lib";

const textFields = new Set(["subject", "assunto", "category", "categoria", "description", "descricao", "initialDescription", "descriptionHtml", "actions", "acoes", "interactions", "interacoes", "justification", "justificativa", "observation", "observacao", "text"]);
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
const findMatches = (value: unknown, keyword: string, caseSensitive: boolean, path = "ticket", matches: { matchedIn: string; matchedText: string }[] = []) => {
  if (matches.length >= 8) return matches;
  if (typeof value === "string") {
    const text = stripHtml(value);
    const haystack = caseSensitive ? text : text.toLocaleLowerCase();
    if (haystack.includes(keyword)) matches.push({ matchedIn: path.startsWith("initialDescription") ? "initialDescription" : path.startsWith("actions") ? "actions" : path, matchedText: text.slice(0, 500) });
  } else if (Array.isArray(value)) value.forEach((item, index) => findMatches(item, keyword, caseSensitive, `${path}[${index}]`, matches));
  else if (value && typeof value === "object") for (const [key, item] of Object.entries(value as Record<string, unknown>)) {
    if (typeof item === "string" && !textFields.has(key)) continue;
    const label = /description|descricao/i.test(key) ? "initialDescription" : /actions|acoes|interactions|interacoes/i.test(key) ? "actions" : key;
    findMatches(item, keyword, caseSensitive, label, matches);
  }
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
  target.searchParams.set("$expand", incoming.searchParams.get("expand")?.trim() || "actions");
  target.searchParams.set("$orderby", incoming.searchParams.get("orderby")?.trim() || "createdDate desc");
  target.searchParams.set("$top", String(top));
  target.searchParams.set("$skip", String(skip));
  target.searchParams.set("token", auth.token);
  try {
    const upstream = await fetch(target, { headers: { Accept: "application/json" } });
    const body = await upstream.text();
    let data: unknown;
    try { data = body ? JSON.parse(body) : null; } catch { data = { error: "Movidesk returned a non-JSON response." }; }
    if (!upstream.ok) return json(data, { status: upstream.status });
    const tickets = Array.isArray(data) ? data : [];
    const caseSensitive = incoming.searchParams.get("case_sensitive") === "true";
    const needle = caseSensitive ? keywordInput : keywordInput.toLocaleLowerCase();
    const results = tickets.flatMap((ticket) => {
      const matches = findMatches(ticket, needle, caseSensitive);
      if (!matches.length || !ticket || typeof ticket !== "object") return [];
      const item = ticket as Record<string, unknown>;
      return [{ id: item.id, protocol: item.protocol, subject: item.subject ?? item.assunto, status: item.status, matchedIn: [...new Set(matches.map((match) => match.matchedIn))], matchedText: matches.map((match) => match.matchedText).join(" … ").slice(0, 1000) }];
    });
    return json({ keyword: keywordInput, results, total: results.length });
  } catch { return json({ error: "Movidesk indisponível." }, { status: 502 }); }
}
