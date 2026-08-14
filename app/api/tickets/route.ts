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
  const incoming = new URL(request.url); const id = incoming.searchParams.get("id") ?? ""; if (!/^\d{1,30}$/.test(id)) return json({ error: "invalid_ticket_id" }, { status: 400 });
  const target = new URL("https://api.movidesk.com/public/v1/tickets");
  for (const [key, value] of incoming.searchParams) target.searchParams.set(key, value);
  target.searchParams.set("token", token);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);
  try {
    const upstream = await fetch(target, { headers: { Accept: "application/json" }, signal: controller.signal });
    const text = await upstream.text();
    let data: unknown;
    try { data = text ? JSON.parse(text) : null; } catch { data = { error: "Movidesk returned a non-JSON response." }; }
    if (upstream.status === 404 || (upstream.ok && Array.isArray(data) && data.length === 0) || (upstream.ok && data === null)) return json({ error: "ticket_not_found" }, { status: 404 });
    return json(data, { status: upstream.status });
  } catch {
    return json({ error: "Movidesk indisponível." }, { status: 502 });
  } finally {
    clearTimeout(timeout);
  }
}
