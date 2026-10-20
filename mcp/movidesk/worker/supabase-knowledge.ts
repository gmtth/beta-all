import type { KnowledgeReader, KnowledgeSourceSummary } from "./knowledge-tools";

const safeText = (value: unknown) => typeof value === "string" && value.trim() ? value.trim().slice(0, 120) : null;
const sourceNameKeys = ["display_name", "displayName", "name", "source_name", "sourceName", "system_name", "systemName", "source_system", "source", "system", "slug", "code", "key"];

export class SupabaseKnowledgeReader implements KnowledgeReader {
  async listSources(): Promise<KnowledgeSourceSummary[]> {
    const projectUrl = process.env.SUPABASE_URL?.trim();
    const secretKey = process.env.SUPABASE_SECRET_KEY?.trim();
    if (!projectUrl || !secretKey) throw new Error("Supabase is not configured.");

    let endpoint: URL;
    try {
      const base = new URL(projectUrl);
      if (base.protocol !== "https:" || !base.hostname.endsWith(".supabase.co")) throw new Error("Invalid Supabase URL.");
      endpoint = new URL("/rest/v1/source_system", base);
    } catch {
      throw new Error("Invalid Supabase URL.");
    }
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
}
