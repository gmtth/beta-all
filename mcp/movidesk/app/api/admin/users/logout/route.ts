import { getChatGPTUser } from "../../../../chatgpt-auth";
import { db, ensureSchema, getUserRole, isMaster, json } from "../../../../oauth/_lib";
import { revokeUserTokens, type TokenGrantDatabase } from "../../../../oauth/token-grants";

export async function POST(request: Request) {
  const user = await getChatGPTUser();
  await ensureSchema();
  if (!user) return json({ error: "unauthorized" }, { status: 401 });
  if (!isMaster(await getUserRole(user.email))) return json({ error: "forbidden" }, { status: 403 });

  const body = await request.json().catch(() => null) as { email?: string } | null;
  const email = body?.email?.trim().toLowerCase() ?? "";
  if (!/^\S+@\S+\.\S+$/.test(email)) return json({ error: "Informe um e-mail válido." }, { status: 400 });

  const target = await db().prepare("SELECT email FROM oauth_users WHERE lower(trim(email)) = ? AND active = 1").bind(email).first<{ email: string }>();
  if (!target) return json({ error: "Usuário não encontrado ou já removido." }, { status: 404 });

  const revoked = await revokeUserTokens(db() as unknown as TokenGrantDatabase, target.email, Date.now());
  return json({ email: target.email, ...revoked });
}
