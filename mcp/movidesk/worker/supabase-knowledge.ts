import type { KnowledgeStore, KnowledgeSourceSummary } from "./knowledge-tools";
import type { MovideskKnowledgeRecord } from "./knowledge-ingest";
import { KnowledgeImportError } from "./knowledge-import-errors";

const safeText = (value: unknown) => typeof value === "string" && value.trim() ? value.trim().slice(0, 120) : null;
const safeAdminText = (value: unknown) => typeof value === "string" || typeof value === "number" ? String(value).trim().slice(0, 180) || null : null;
const safeCount = (value: unknown) => typeof value === "number" && Number.isSafeInteger(value) && value >= 0 ? value : 0;
const safeIsoDate = (value: unknown) => typeof value === "string" && Number.isFinite(Date.parse(value)) ? new Date(value).toISOString() : null;
const sourceNameKeys = ["display_name", "displayName", "name", "source_name", "sourceName", "system_name", "systemName", "source_system", "source", "system", "slug", "code", "key"];

export type KnowledgeAdminOverview = {
  sources: Array<{ id: string | null; code: string | null; name: string | null; active: boolean; recordCount: number; chunkCount: number }>;
  recordCount: number;
  chunkCount: number;
  recentImports: Array<{ ticketId: string | null; title: string | null; actorEmail: string | null; chunkCount: number; createdAt: string | null }>;
};

export type KnowledgeOverviewDiagnostic = "available" | "configuration_missing" | "rpc_not_found" | "permission_denied" | "rate_limited" | "service_error" | "request_rejected" | "timeout" | "network_error" | "invalid_response";

export class KnowledgeOverviewError extends Error {
  constructor(readonly diagnostic: Exclude<KnowledgeOverviewDiagnostic, "available">) {
    super("Supabase admin overview is unavailable.");
  }
}

export class SupabaseKnowledgeStore implements KnowledgeStore {
  private configuration() {
    const projectUrl = process.env.SUPABASE_URL?.trim();
    const secretKey = process.env.SUPABASE_SECRET_KEY?.trim();
    if (!projectUrl || !secretKey) throw new KnowledgeImportError("supabase_configuration");
    try {
      const base = new URL(projectUrl);
      if (base.protocol !== "https:" || !base.hostname.endsWith(".supabase.co")) throw new KnowledgeImportError("supabase_configuration");
      return { base, secretKey };
    } catch {
      throw new KnowledgeImportError("supabase_configuration");
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

  async getAdminOverview(): Promise<KnowledgeAdminOverview> {
    let base: URL;
    let secretKey: string;
    try {
      ({ base, secretKey } = this.configuration());
    } catch {
      throw new KnowledgeOverviewError("configuration_missing");
    }
    const endpoint = new URL("/rest/v1/rpc/get_knowledge_admin_overview", base);
    let response: Response;
    try {
      response = await fetch(endpoint, {
        method: "POST",
        headers: {
          apikey: secretKey,
          Authorization: `Bearer ${secretKey}`,
          Accept: "application/json",
          "Content-Type": "application/json",
          "Content-Profile": "beta",
        },
        body: "{}",
        signal: AbortSignal.timeout(10_000),
      });
    } catch (error) {
      const diagnostic = error instanceof Error && (error.name === "TimeoutError" || error.name === "AbortError") ? "timeout" : "network_error";
      throw new KnowledgeOverviewError(diagnostic);
    }
    if (!response.ok) {
      const diagnostic = response.status === 404 ? "rpc_not_found"
        : response.status === 401 || response.status === 403 ? "permission_denied"
          : response.status === 429 ? "rate_limited"
            : response.status >= 500 ? "service_error" : "request_rejected";
      await response.body?.cancel();
      throw new KnowledgeOverviewError(diagnostic);
    }
    let payload: unknown;
    try {
      payload = await response.json();
    } catch {
      throw new KnowledgeOverviewError("invalid_response");
    }
    if (!payload || typeof payload !== "object" || Array.isArray(payload)) throw new KnowledgeOverviewError("invalid_response");
    const data = payload as Record<string, unknown>;
    const sources = Array.isArray(data.sources) ? data.sources.slice(0, 10).map((value) => {
      const row = value && typeof value === "object" ? value as Record<string, unknown> : {};
      return {
        id: safeAdminText(row.id),
        code: safeAdminText(row.code),
        name: safeAdminText(row.name),
        active: row.active === true,
        recordCount: safeCount(row.record_count),
        chunkCount: safeCount(row.chunk_count),
      };
    }) : [];
    const recentImports = Array.isArray(data.recent_imports) ? data.recent_imports.slice(0, 10).map((value) => {
      const row = value && typeof value === "object" ? value as Record<string, unknown> : {};
      return {
        ticketId: safeAdminText(row.ticket_id),
        title: safeAdminText(row.title),
        actorEmail: safeAdminText(row.actor_email),
        chunkCount: safeCount(row.chunk_count),
        createdAt: safeIsoDate(row.created_at),
      };
    }) : [];
    return {
      sources,
      recordCount: safeCount(data.record_count),
      chunkCount: safeCount(data.chunk_count),
      recentImports,
    };
  }

  async importMovideskTicket(record: MovideskKnowledgeRecord, actorEmail: string): Promise<{ recordId: string; chunkCount: number }> {
    const { base, secretKey } = this.configuration();
    const endpoint = new URL("/rest/v1/rpc/upsert_movidesk_knowledge_record", base);
    let response: Response;
    try {
      response = await fetch(endpoint, {
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
    } catch (error) {
      if (error instanceof Error && (error.name === "TimeoutError" || error.name === "AbortError")) throw new KnowledgeImportError("supabase_timeout");
      throw new KnowledgeImportError("supabase_network_error");
    }
    if (!response.ok) {
      let errorPayload: Record<string, unknown> = {};
      try {
        const body: unknown = await response.json();
        if (body && typeof body === "object" && !Array.isArray(body)) errorPayload = body as Record<string, unknown>;
      } catch { /* Do not expose or retain a raw provider response. */ }
      const code = typeof errorPayload.code === "string" ? errorPayload.code : "";
      const message = typeof errorPayload.message === "string" ? errorPayload.message.toLowerCase() : "";
      if (response.status === 404 || code === "PGRST202" || code === "PGRST204" || code === "42883") throw new KnowledgeImportError("supabase_rpc_unavailable");
      if (response.status === 401 || response.status === 403 || code === "42501") throw new KnowledgeImportError("supabase_permission_denied");
      if (response.status === 429) throw new KnowledgeImportError("supabase_rate_limited");
      if (response.status >= 500) throw new KnowledgeImportError("supabase_unavailable");
      if (code === "22023" && message.includes("movidesk source system is missing or ambiguous")) throw new KnowledgeImportError("supabase_source_not_configured");
      if (response.status >= 400) throw new KnowledgeImportError("supabase_payload_rejected");
      throw new KnowledgeImportError("unexpected");
    }
    let payload: unknown;
    try { payload = await response.json(); }
    catch { throw new KnowledgeImportError("supabase_invalid_response"); }
    const row = payload && typeof payload === "object" && !Array.isArray(payload) ? payload as Record<string, unknown> : {};
    const recordId = safeText(row.record_id);
    const chunkCount = Number(row.chunk_count);
    if (!recordId || !Number.isInteger(chunkCount) || chunkCount < 1 || chunkCount > 50) throw new KnowledgeImportError("supabase_invalid_response");
    return { recordId, chunkCount };
  }
}
