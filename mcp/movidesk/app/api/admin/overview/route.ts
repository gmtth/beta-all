import { getChatGPTUser } from "../../../chatgpt-auth";
import { ensureSchema, getUserRole, isMaster, json } from "../../../oauth/_lib";
import { checkSupabaseConnection } from "../../../integration-status";
import { KnowledgeOverviewError, SupabaseKnowledgeStore } from "../../../../worker/supabase-knowledge";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getChatGPTUser();
  await ensureSchema();
  if (!user) return json({ error: "unauthorized" }, { status: 401 });
  if (!isMaster(await getUserRole(user.email))) return json({ error: "forbidden" }, { status: 403 });

  const connectionPromise = checkSupabaseConnection();
  const overviewPromise = new SupabaseKnowledgeStore().getAdminOverview().then(
    (data) => ({ status: "available" as const, diagnostic: "available" as const, data }),
    (error: unknown) => ({
      status: "unavailable" as const,
      diagnostic: error instanceof KnowledgeOverviewError ? error.diagnostic : "request_rejected" as const,
      data: null,
    }),
  );
  const [connection, knowledge] = await Promise.all([connectionPromise, overviewPromise]);
  return json({ connection, knowledge });
}
