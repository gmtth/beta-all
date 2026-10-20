import type { KnowledgeStore, KnowledgeSourceSummary } from "./knowledge-tools";
import type { MovideskKnowledgeRecord } from "./knowledge-ingest";

const safeText = (value: unknown) => typeof value === "string" && value.trim() ? value.trim().slice(0, 120) : null;
const sourceNameKeys = ["display_name", "displayName", "name", "source_name", "sourceName", "system_name", "systemName", "source_system", "source", "system", "slug", "code", "key"];

export class SupabaseKnowledgeStore implements KnowledgeStore {
  private configuration() {
    const projectUrl = process.env.SUPABASE_URL?.trim();
    const secretKey = process.env.SUPABASE_SECRET_KEY?.trim();
    if (!projectUrl || !secretKey) throw new Error("Supabase is not configured.");
    try {
      const base = new URL(projectUrl);
      if (base.protocol !== "https:" || !base.hostname.endsWith(".supabase.co")) throw new Error("Invalid Supabase URL.");
      return { base, secretKey };
    } catch {
      throw new Error("Invalid Supabase URL.");
    }
  }

  async listSources(): Promise<KnowledgeSourceSummary[]> {
    const { base, secretKey } = this.configuration();
    const endpoint = new URL("/rest/v1/source_system", base);
    endpoint.searchParams.set("select", "id,name");
    endpoint.searchParams.set("limit", "10");

    const response = await fetch(endpoint, {
      method: "GET",
      headers: {
        apikey: secretKey,
        Authorization: `Bearer ${secretKey}`,
        Accept: "application/json",
        "Accept-Profile": "beta",
      },
      signal: AbortSignal.timeout(10_000),
    });
    if (!response.ok) throw new Error(`Supabase request failed with HTTP ${response.status}.`);
    const payload: unknown = await response.json();
    if (!Array.isArray(payload)) throw new Error("Supabase returned an unexpected response.");

    return payload.slice(0, 10).map((item) => {
      const row = item && typeof item === "object" ? item as Record<string, unknown> : {};
      const id = safeText(row.id ?? row.source_system_id ?? row.key);
      const name = sourceNameKeys.map((key) => safeText(row[key])).find((value) => value !== null) ?? id;
      return { id, name };
    });
  }

  async importMovideskTicket(record: MovideskKnowledgeRecord, actorEmail: string): Promise<{ recordId: string; chunkCount: number }> {
    const { base, secretKey } = this.configuration();
    const endpoint = new URL("/rest/v1/rpc/upsert_movidesk_knowledge_record", base);
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        apikey: secretKey,
        Authorization: `Bearer ${secretKey}`,
        Accept: "application/json",
        "Content-Type": "application/json",
        "Content-Profile": "beta",
      },
      body: JSON.stringify({
        p_external_id: record.external_id,
        p_title: record.title,
        p_status: record.status,
        p_source_created_at: record.source_created_at,
        p_source_updated_at: record.source_updated_at,
        p_content_hash: record.content_hash,
        p_attributes: record.attributes,
        p_chunks: record.chunks,
        p_actor_email: actorEmail,
      }),
      signal: AbortSignal.timeout(15_000),
    });
    if (!response.ok) throw new Error(`Supabase import failed with HTTP ${response.status}.`);
    const payload: unknown = await response.json();
    const row = payload && typeof payload === "object" && !Array.isArray(payload) ? payload as Record<string, unknown> : {};
    const recordId = safeText(row.record_id);
    const chunkCount = Number(row.chunk_count);
    if (!recordId || !Number.isInteger(chunkCount) || chunkCount < 1 || chunkCount > 50) throw new Error("Supabase returned an unexpected import response.");
    return { recordId, chunkCount };
  }
}
