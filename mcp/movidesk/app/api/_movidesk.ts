import { canonicalResource, getAuthorizedOAuthPrincipal, json, OAUTH_SCOPE } from "../oauth/_lib";

const UPSTREAM_TIMEOUT_MS = 15_000;

export class MovideskTimeoutError extends Error {
  constructor() {
    super("Movidesk request timed out.");
    this.name = "MovideskTimeoutError";
  }
}

export async function fetchMovideskText(input: RequestInfo | URL, init: RequestInit = {}, operationSignal?: AbortSignal) {
  const controller = new AbortController();
  let upstreamTimedOut = false;
  const abortWithOperation = () => controller.abort(operationSignal?.reason);
  if (operationSignal?.aborted) abortWithOperation();
  else operationSignal?.addEventListener("abort", abortWithOperation, { once: true });
  const timeout = setTimeout(() => {
    upstreamTimedOut = true;
    controller.abort(new DOMException("Movidesk request timed out.", "TimeoutError"));
  }, UPSTREAM_TIMEOUT_MS);

  try {
    const response = await fetch(input, { ...init, signal: controller.signal });
    const text = await response.text();
    return { response, text };
  } catch (error) {
    if (upstreamTimedOut || operationSignal?.aborted) throw new MovideskTimeoutError();
    throw error;
  } finally {
    clearTimeout(timeout);
    operationSignal?.removeEventListener("abort", abortWithOperation);
  }
}

export async function authorizeMovidesk(request: Request) {
  const access = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!access) return { response: json({ error: "unauthorized" }, { status: 401 }) } as const;
  const requestUrl = new URL(request.url);
  const principal = await getAuthorizedOAuthPrincipal(access, [OAUTH_SCOPE], canonicalResource(requestUrl.origin));
  if (!principal) return { response: json({ error: "invalid_token" }, { status: 401 }) } as const;
  const token = process.env.MOVIDESK_TOKEN;
  if (!token) return { response: json({ error: "Proxy não configurado." }, { status: 503 }) } as const;
  return { access, token } as const;
}

export async function fetchMovidesk(resource: string, request: Request, token: string, filterFields: string[]) {
  const incoming = new URL(request.url);
  const target = new URL(`https://api.movidesk.com/public/v1/${resource}`);
  const filters = filterFields
    .map((field) => {
      const value = incoming.searchParams.get(field);
      return value?.trim() ? `${field} eq '${escapeOData(value.trim())}'` : "";
    })
    .filter(Boolean);
  const rawFilter = incoming.searchParams.get("filter")?.trim() ?? "";
  if (rawFilter.length > 1000 || /[;\r\n]/.test(rawFilter)) return json({ error: "invalid_filter" }, { status: 400 });
  if (rawFilter) filters.push(`(${rawFilter})`);
  if (!filters.length) return json({ error: "search_criteria_required", message: "Informe ao menos um filtro para pesquisar." }, { status: 400 });
  target.searchParams.set("$filter", filters.join(" and "));
  for (const key of ["select", "expand", "orderby"]) {
    const value = incoming.searchParams.get(key);
    if (value) target.searchParams.set(`$${key}`, value);
  }
  const top = Number(incoming.searchParams.get("top") ?? "25");
  const skip = Number(incoming.searchParams.get("skip") ?? "0");
  if (!Number.isInteger(top) || top < 1 || top > 100 || !Number.isInteger(skip) || skip < 0 || skip > 10000) return json({ error: "invalid_pagination" }, { status: 400 });
  target.searchParams.set("$top", String(top));
  target.searchParams.set("$skip", String(skip));
  target.searchParams.set("token", token);
  try {
    const { response: upstream, text } = await fetchMovideskText(target, { headers: { Accept: "application/json" } }, request.signal);
    let data: unknown;
    try { data = text ? JSON.parse(text) : null; } catch { data = { error: "Movidesk returned a non-JSON response." }; }
    return json(data, { status: upstream.status });
  } catch (error) {
    if (error instanceof MovideskTimeoutError) return json({ error: "Movidesk indisponível." }, { status: 504 });
    return json({ error: "Movidesk indisponível." }, { status: 502 });
  }
}

function escapeOData(value: string) { return value.replace(/'/g, "''"); }
