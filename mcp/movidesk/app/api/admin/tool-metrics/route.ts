import { getChatGPTUser } from "../../../chatgpt-auth";
import { ensureSchema, getUserRole, isMaster, json } from "../../../oauth/_lib";
import { getAdminToolMetrics } from "../../../admin-tool-metrics";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getChatGPTUser();
  await ensureSchema();
  if (!user) return json({ error: "unauthorized" }, { status: 401 });
  if (!isMaster(await getUserRole(user.email))) return json({ error: "forbidden" }, { status: 403 });
  try {
    return json({ status: "available", data: await getAdminToolMetrics() });
  } catch {
    return json({ status: "unavailable", data: null }, { status: 503 });
  }
}
