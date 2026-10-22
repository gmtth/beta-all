import { getChatGPTUser } from "../../../../chatgpt-auth";
import { ensureSchema, getUserRole, isMaster } from "../../../../oauth/_lib";
import { SupabaseKnowledgeStore } from "../../../../../worker/supabase-knowledge";
import { getDatabaseSchema } from "../handlers";

export const dynamic = "force-dynamic";

export async function GET() {
  return getDatabaseSchema({ getUser: getChatGPTUser, ensureSchema, getUserRole, isMaster, store: () => new SupabaseKnowledgeStore() });
}
