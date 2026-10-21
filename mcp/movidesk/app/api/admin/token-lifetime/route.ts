import { getChatGPTUser } from "../../../chatgpt-auth";
import { db, ensureSchema, getUserRole, isMaster, json } from "../../../oauth/_lib";
import { DEFAULT_ACCESS_TOKEN_LIFETIME_MS, getAccessTokenLifetimeMs, isAccessTokenLifetimeMs, setAccessTokenLifetimeMs } from "../../../oauth/token-lifetime";

export const dynamic = "force-dynamic";

async function authorizedMaster() {
  const user = await getChatGPTUser();
  await ensureSchema();
  if (!user) return { status: 401 as const };
  if (!isMaster(await getUserRole(user.email))) return { status: 403 as const };
  return { status: 200 as const };
}

export async function GET() {
  const authorization = await authorizedMaster();
  if (authorization.status !== 200) return json({ error: authorization.status === 401 ? "unauthorized" : "forbidden" }, { status: authorization.status });
  return json({
    accessTokenLifetimeMs: await getAccessTokenLifetimeMs(db()),
    defaultAccessTokenLifetimeMs: DEFAULT_ACCESS_TOKEN_LIFETIME_MS,
  });
}

export async function PUT(request: Request) {
  const authorization = await authorizedMaster();
  if (authorization.status !== 200) return json({ error: authorization.status === 401 ? "unauthorized" : "forbidden" }, { status: authorization.status });
  const body = await request.json().catch(() => null) as { accessTokenLifetimeMs?: unknown } | null;
  if (!body || !isAccessTokenLifetimeMs(body.accessTokenLifetimeMs)) {
    return json({ error: "Informe um número inteiro entre 60000 e 2592000000 milissegundos." }, { status: 400 });
  }
  await setAccessTokenLifetimeMs(db(), body.accessTokenLifetimeMs);
  return json({ accessTokenLifetimeMs: body.accessTokenLifetimeMs });
}
