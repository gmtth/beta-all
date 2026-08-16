import { env } from "cloudflare:workers";
import { ensureSchema, getUserRole, hash, json } from "../../oauth/_lib";

export async function GET(request: Request) {
  const access = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!access) return json({ error: "unauthorized" }, { status: 401 });
  await ensureSchema();
  const row = await env.DB.prepare("SELECT scope, expires_at, user_email FROM oauth_tokens WHERE token_hash = ?").bind(await hash(access)).first<{ scope: string; expires_at: number; user_email: string | null }>();
  if (!row || row.expires_at < Date.now() || !row.scope.split(" ").includes("movidesk:read")) return json({ error: "invalid_token" }, { status: 401 });
  if (!row.user_email || !(await getUserRole(row.user_email))) return json({ error: "forbidden" }, { status: 403 });
  const token = process.env.MOVIDESK_TOKEN;
  if (!token) return json({ error: "Proxy não configurado." }, { status: 503 });
  const incoming = new URL(request.url);
  const id = incoming.searchParams.get("id")?.trim() ?? "";
  if (id && !/^\d{1,30}$/.test(id)) return json({ error: "invalid_ticket_id" }, { status: 400 });
  const top = Number(incoming.searchParams.get("top") ?? "25");
  const skip = Number(incoming.searchParams.get("skip") ?? "0");
  if (!Number.isInteger(top) || top < 1 || top > 100 || !Number.isInteger(skip) || skip < 0 || skip > 10000) return json({ error: "invalid_pagination" }, { status: 400 });
  const allowedDateFields = new Set(["createdDate", "lastUpdate", "resolvedIn", "closedIn"]);
  const dateField = incoming.searchParams.get("date_field") ?? "createdDate";
  if (!allowedDateFields.has(dateField)) return json({ error: "invalid_date_field" }, { status: 400 });
  const from = normalizeDate(incoming.searchParams.get("from_date"), false);
  const to = normalizeDate(incoming.searchParams.get("to_date"), true);
  if ((incoming.searchParams.get("from_date") && !from) || (incoming.searchParams.get("to_date") && !to)) return json({ error: "invalid_date" }, { status: 400 });
  const rawFilter = incoming.searchParams.get("filter")?.trim() ?? "";
  if (rawFilter.length > 1000 || /[;\r\n]/.test(rawFilter)) return json({ error: "invalid_filter" }, { status: 400 });
  const filters = [
    id ? `id eq ${id}` : "",
    from ? `${dateField} ge ${from}` : "",
    to ? `${dateField} le ${to}` : "",
    keywordFilter(incoming.searchParams.get("keyword")),
    textFilter("owner/id", incoming.searchParams.get("responsible_id")),
    textFilter("owner/email", incoming.searchParams.get("responsible_email")),
    textFilter("ownerTeam", incoming.searchParams.get("owner_team")),
    textFilter("status", incoming.searchParams.get("status")),
    textFilter("baseStatus", incoming.searchParams.get("base_status")),
    textFilter("urgency", incoming.searchParams.get("urgency")),
    textFilter("category", incoming.searchParams.get("category")),
    textFilter("serviceFirstLevel", incoming.searchParams.get("service")),
    incoming.searchParams.get("client_id")?.trim() ? `clients/any(c: c/id eq '${escapeOData(incoming.searchParams.get("client_id")!.trim())}')` : "",
    rawFilter ? `(${rawFilter})` : "",
  ].filter(Boolean);
  if (!id && !filters.length) return json({ error: "search_criteria_required", message: "Informe ao menos um filtro para pesquisar tickets." }, { status: 400 });
  const target = new URL(`https://api.movidesk.com/public/v1/${incoming.searchParams.get("include_past") === "true" ? "tickets/past" : "tickets"}`);
  // Movidesk's public API accepts ticket IDs through OData, not an `id`
  // query parameter. Sending `id=...` is rejected as INVALID_ARGUMENT.
  target.searchParams.set("$filter", filters.join(" and "));
  for (const key of ["select", "expand", "orderby"]) { const value = incoming.searchParams.get(key); if (value) target.searchParams.set(`$${key}`, value); }
  if (!id) { target.searchParams.set("$top", String(top)); target.searchParams.set("$skip", String(skip)); }
  target.searchParams.set("token", token);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);
  try {
    const upstream = await fetch(target, { headers: { Accept: "application/json" }, signal: controller.signal });
    const text = await upstream.text();
    let data: unknown;
    try { data = text ? JSON.parse(text) : null; } catch { data = { error: "Movidesk returned a non-JSON response." }; }
    if (upstream.status === 404 || (id && upstream.ok && Array.isArray(data) && data.length === 0) || (id && upstream.ok && data === null)) return json({ error: "ticket_not_found" }, { status: 404 });
    return json(data, { status: upstream.status });
  } catch {
    return json({ error: "Movidesk indisponível." }, { status: 502 });
  } finally {
    clearTimeout(timeout);
  }
}

function escapeOData(value: string) { return value.replace(/'/g, "''"); }
function textFilter(field: string, value: string | null) { const text = value?.trim(); return text ? `${field} eq '${escapeOData(text)}'` : ""; }
function keywordFilter(value: string | null) { const text = value?.trim(); return text ? `(contains(subject, '${escapeOData(text)}') or contains(category, '${escapeOData(text)}'))` : ""; }
function normalizeDate(value: string | null, endOfDay: boolean) {
  if (!value) return "";
  const text = value.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) return `${text}T${endOfDay ? "23:59:59.999" : "00:00:00.000"}Z`;
  const parsed = Date.parse(text);
  return Number.isNaN(parsed) ? "" : new Date(parsed).toISOString();
}
