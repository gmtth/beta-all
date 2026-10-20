import { getChatGPTUser } from "../../../chatgpt-auth";
import { db, ensureSchema, getUserRole, isMaster, json } from "../../../oauth/_lib";
export async function GET() {
  const user = await getChatGPTUser(); await ensureSchema();
  if (!user) return json({ error: "unauthorized" }, { status: 401 });
  if (!isMaster(await getUserRole(user.email))) return json({ error: "forbidden" }, { status: 403 });
  const users = (await db().prepare("SELECT email, role, active, created_at FROM oauth_users WHERE active = 1 ORDER BY role, email").all<{ email: string; role: string; active: number; created_at: number }>()).results ?? [];
  const tokens = (await db().prepare("SELECT user_email, scope, expires_at FROM oauth_tokens WHERE expires_at > ? AND user_email IS NOT NULL").bind(Date.now()).all<{ user_email: string; scope: string; expires_at: number }>()).results ?? [];
  const byEmail = new Map<string, { scopes: Set<string>; tokenCount: number; latestExpiry: number }>();
  for (const token of tokens) {
    const key = token.user_email.trim().toLowerCase();
    const entry = byEmail.get(key) ?? { scopes: new Set<string>(), tokenCount: 0, latestExpiry: 0 };
    token.scope.split(" ").filter(Boolean).forEach((scope) => entry.scopes.add(scope));
    entry.tokenCount += 1; entry.latestExpiry = Math.max(entry.latestExpiry, token.expires_at); byEmail.set(key, entry);
  }
  return json(users.map((item) => {
    const token = byEmail.get(item.email.trim().toLowerCase());
    return { ...item, scopes: token ? [...token.scopes].sort() : [], activeTokenCount: token?.tokenCount ?? 0, latestTokenExpiry: token?.latestExpiry ?? null };
  }));
}
export async function POST(request: Request) { const user = await getChatGPTUser(); await ensureSchema(); if (!user || !isMaster(await getUserRole(user.email))) return json({ error: "forbidden" }, { status: 403 }); const body = await request.json().catch(() => null) as { email?: string } | null; const email = body?.email?.trim().toLowerCase() ?? ""; if (!/^\S+@\S+\.\S+$/.test(email)) return json({ error: "Informe um e-mail válido." }, { status: 400 }); await db().prepare("INSERT INTO oauth_users (email, role, active, created_at) VALUES (?, 'support', 1, ?) ON CONFLICT(email) DO UPDATE SET role = CASE WHEN oauth_users.role = 'master' THEN 'master' ELSE 'support' END, active = 1").bind(email, Date.now()).run(); const role = await getUserRole(email); return json({ email, role, active: true }, { status: 201 }); }
export async function DELETE(request: Request) { const user = await getChatGPTUser(); await ensureSchema(); if (!user || !isMaster(await getUserRole(user.email))) return json({ error: "forbidden" }, { status: 403 }); const body = await request.json().catch(() => null) as { email?: string } | null; const email = body?.email?.trim().toLowerCase() ?? ""; if (!/^\S+@\S+\.\S+$/.test(email)) return json({ error: "Informe um e-mail válido." }, { status: 400 }); if (email === user.email.trim().toLowerCase()) return json({ error: "A conta atualmente conectada não pode ser removida." }, { status: 400 }); const target = await db().prepare("SELECT role FROM oauth_users WHERE email = ? AND active = 1").bind(email).first<{ role: string }>(); if (!target) return json({ error: "Usuário não encontrado ou já removido." }, { status: 404 }); await db().prepare("UPDATE oauth_users SET active = 0 WHERE email = ?").bind(email).run(); return json({ email, active: false }); }
