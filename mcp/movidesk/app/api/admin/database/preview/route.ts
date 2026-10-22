import { getChatGPTUser } from "../../../../chatgpt-auth";
import { ensureSchema, getUserRole, isMaster } from "../../../../oauth/_lib";
import { SupabaseKnowledgeStore } from "../../../../../worker/supabase-knowledge";
import { getDatabasePreview } from "../handlers";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  return getDatabasePreview(request, { getUser: getChatGPTUser, ensureSchema, getUserRole, isMaster, store: () => new SupabaseKnowledgeStore() });
}
