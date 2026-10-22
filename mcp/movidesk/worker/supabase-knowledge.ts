import type { KnowledgeStore, KnowledgeSearchResult, KnowledgeSourceSummary } from "./knowledge-tools";
import type { MovideskKnowledgeRecord } from "./knowledge-ingest";
import {
  DATABASE_BROWSER_TABLES,
  isDatabaseBrowserTable,
  isDatabasePreviewTable,
  parseDatabaseCursor,
  parseDatabasePageSize,
  sanitizeDatabasePreviewRows,
  type DatabaseBrowserTable,
  type DatabasePreviewTable,
} from "./database-browser-contract";
import { KnowledgeImportError } from "./knowledge-import-errors";

const safeText = (value: unknown) => typeof value === "string" && value.trim() ? value.trim().slice(0, 120) : null;
const safeSearchText = (value: unknown, max: number) => typeof value === "string" && value.trim() && value.length <= max ? value.trim() : null;
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

export type DatabasePrivilege = { role: string; privileges: string[] };
export type DatabaseBrowserSchema = {
  schema: { name: "beta"; grants: DatabasePrivilege[] };
  missingTables: DatabaseBrowserTable[];
  tables: Array<{
    key: DatabaseBrowserTable;
    previewAllowed: boolean;
    columns: Array<{ name: string; position: number; type: string; nullable: boolean; generated: boolean }>;
    constraints: Array<{ name: string; type: "PRIMARY KEY" | "FOREIGN KEY" | "UNIQUE"; columns: string[]; referencedTable: string | null; referencedColumns: string[] | null }>;
    indexes: Array<{ name: string; method: string; unique: boolean; columns: string[] }>;
    rls: { enabled: boolean; policies: Array<{ name: string; command: "SELECT" | "INSERT" | "UPDATE" | "DELETE" | "ALL" }> };
    grants: DatabasePrivilege[];
  }>;
  rpcs: Array<{ name: string; securityDefiner: boolean; executeRoles: string[] }>;
};
export type DatabaseBrowserPage = { table: DatabasePreviewTable; rows: Array<Record<string, string | number | boolean | null>>; nextCursor: string | null; pageSize: number };
export type DatabaseBrowserDiagnostic = "configuration_missing" | "rpc_not_found" | "permission_denied" | "rate_limited" | "service_error" | "request_rejected" | "timeout" | "network_error" | "invalid_response";

export class KnowledgeOverviewError extends Error {
  constructor(readonly diagnostic: Exclude<KnowledgeOverviewDiagnostic, "available">) {
    super("Supabase admin overview is unavailable.");
  }
}

export class DatabaseBrowserError extends Error {
  constructor(readonly diagnostic: DatabaseBrowserDiagnostic) {
    super("Supabase database browser is unavailable.");
  }
}

function databaseBrowserDiagnosticForStatus(status: number): DatabaseBrowserDiagnostic {
  return status === 404 ? "rpc_not_found"
    : status === 401 || status === 403 ? "permission_denied"
      : status === 429 ? "rate_limited"
        : status >= 500 ? "service_error" : "request_rejected";
}

const boundedCatalogText = (value: unknown, max = 120): string | null => typeof value === "string" && value.length > 0 && value.length <= max ? value : null;
const isObject = (value: unknown): value is Record<string, unknown> => Boolean(value) && typeof value === "object" && !Array.isArray(value);
const parsePrivileges = (value: unknown): DatabasePrivilege[] | null => {
  if (!Array.isArray(value)) return null;
  const result: DatabasePrivilege[] = [];
  for (const item of value) {
    if (!isObject(item) || !Array.isArray(item.privileges)) return null;
    const role = boundedCatalogText(item.role, 63);
    const privileges = item.privileges.map((privilege) => boundedCatalogText(privilege, 32));
    if (!role || privileges.some((privilege) => !privilege)) return null;
    result.push({ role, privileges: privileges as string[] });
  }
  return result;
};

function parseDatabaseBrowserSchema(value: unknown): DatabaseBrowserSchema | null {
  if (!isObject(value) || !isObject(value.schema) || value.schema.name !== "beta" || !Array.isArray(value.missing_tables) || !Array.isArray(value.tables) || !Array.isArray(value.rpcs)) return null;
  const schemaGrants = parsePrivileges(value.schema.grants);
  if (!schemaGrants) return null;
  const missingTables = value.missing_tables.map((table) => isDatabaseBrowserTable(table) ? table : null);
  if (missingTables.some((table) => !table) || new Set(missingTables).size !== missingTables.length) return null;
  const tables: DatabaseBrowserSchema["tables"] = [];
  const seen = new Set<DatabaseBrowserTable>();
  for (const item of value.tables) {
    if (!isObject(item) || !isDatabaseBrowserTable(item.key) || seen.has(item.key) || typeof item.preview_allowed !== "boolean" || !Array.isArray(item.columns) || !Array.isArray(item.constraints) || !Array.isArray(item.indexes) || !isObject(item.rls) || typeof item.rls.enabled !== "boolean") return null;
    const tableKey = item.key;
    const expectedPreview = tableKey !== "record_chunk";
    if (item.preview_allowed !== expectedPreview) return null;
    const grants = parsePrivileges(item.grants);
    if (!grants) return null;
    const columns: DatabaseBrowserSchema["tables"][number]["columns"] = [];
    for (const column of item.columns) {
      if (!isObject(column)) return null;
      const name = boundedCatalogText(column.name, 63);
      const type = boundedCatalogText(column.type, 128);
      if (!name || !type || !Number.isInteger(column.position) || typeof column.nullable !== "boolean" || typeof column.generated !== "boolean") return null;
      columns.push({ name, position: column.position as number, type, nullable: column.nullable, generated: column.generated });
    }
    const constraints: DatabaseBrowserSchema["tables"][number]["constraints"] = [];
    for (const constraint of item.constraints) {
      if (!isObject(constraint) || !Array.isArray(constraint.columns)) return null;
      const name = boundedCatalogText(constraint.name, 120);
      const type = constraint.type;
      const columns = constraint.columns.map((column) => boundedCatalogText(column, 63));
      const referencedTable = constraint.referenced_table === null ? null : boundedCatalogText(constraint.referenced_table, 128);
      const referencedColumns = constraint.referenced_columns === null ? null : Array.isArray(constraint.referenced_columns) ? constraint.referenced_columns.map((column) => boundedCatalogText(column, 63)) : undefined;
      if (!name || (type !== "PRIMARY KEY" && type !== "FOREIGN KEY" && type !== "UNIQUE") || columns.some((column) => !column) || referencedTable === undefined || referencedColumns === undefined || referencedColumns?.some((column) => !column)) return null;
      constraints.push({ name, type, columns: columns as string[], referencedTable, referencedColumns: referencedColumns as string[] | null });
    }
    const indexes: DatabaseBrowserSchema["tables"][number]["indexes"] = [];
    for (const index of item.indexes) {
      if (!isObject(index) || !Array.isArray(index.columns)) return null;
      const name = boundedCatalogText(index.name, 120);
      const method = boundedCatalogText(index.method, 32);
      const columns = index.columns.map((column) => boundedCatalogText(column, 63));
      if (!name || !method || typeof index.unique !== "boolean" || columns.some((column) => !column)) return null;
      indexes.push({ name, method, unique: index.unique, columns: columns as string[] });
    }
    if (!Array.isArray(item.rls.policies)) return null;
    const policies: DatabaseBrowserSchema["tables"][number]["rls"]["policies"] = [];
    for (const policy of item.rls.policies) {
      if (!isObject(policy)) return null;
      const name = boundedCatalogText(policy.name, 120);
      const command = policy.command;
      if (!name || (command !== "SELECT" && command !== "INSERT" && command !== "UPDATE" && command !== "DELETE" && command !== "ALL")) return null;
      policies.push({ name, command });
    }
    seen.add(tableKey);
    tables.push({ key: tableKey, previewAllowed: expectedPreview, columns, constraints, indexes, rls: { enabled: item.rls.enabled, policies }, grants });
  }
  if (seen.size + missingTables.length !== DATABASE_BROWSER_TABLES.length || DATABASE_BROWSER_TABLES.some(({ key }) => seen.has(key) === missingTables.includes(key))) return null;
  const rpcs: DatabaseBrowserSchema["rpcs"] = [];
  for (const item of value.rpcs) {
    if (!isObject(item) || !Array.isArray(item.execute_roles)) return null;
    const name = boundedCatalogText(item.name, 100);
    const executeRoles = item.execute_roles.map((role) => boundedCatalogText(role, 63));
    if (!name || typeof item.security_definer !== "boolean" || executeRoles.some((role) => !role)) return null;
    rpcs.push({ name, securityDefiner: item.security_definer, executeRoles: executeRoles as string[] });
  }
  return { schema: { name: "beta", grants: schemaGrants }, missingTables: missingTables as DatabaseBrowserTable[], tables, rpcs };
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

  async searchRecords(query: string, limit: number): Promise<KnowledgeSearchResult[]> {
    const { base, secretKey } = this.configuration();
    const endpoint = new URL("/rest/v1/rpc/search_knowledge", base);
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
        body: JSON.stringify({ p_query: query, p_limit: limit }),
        signal: AbortSignal.timeout(10_000),
      });
    } catch {
      throw new Error("Knowledge search request failed.");
    }
    if (!response.ok) {
      await response.body?.cancel();
      throw new Error("Knowledge search RPC is unavailable.");
    }
    let payload: unknown;
    try { payload = await response.json(); }
    catch { throw new Error("Knowledge search returned an invalid response."); }
    if (!Array.isArray(payload) || payload.length > limit) throw new Error("Knowledge search returned an invalid response.");
    const results: KnowledgeSearchResult[] = [];
    for (const value of payload) {
      if (!isObject(value)) throw new Error("Knowledge search returned an invalid response.");
      const recordId = safeText(value.record_id);
      const externalId = safeText(value.external_id);
      const recordType = safeText(value.record_type);
      const title = safeSearchText(value.title, 500);
      const sourceName = safeText(value.source_name);
      const sectionTitle = safeText(value.section_title);
      const excerpt = safeSearchText(value.excerpt, 1600);
      const relevance = typeof value.relevance === "number" && Number.isFinite(value.relevance) ? value.relevance : null;
      const sourceCreatedAt = value.source_created_at === null ? null : safeIsoDate(value.source_created_at);
      if (!recordId || !externalId || !recordType || !title || !sourceName || !sectionTitle || !excerpt || relevance === null
          || (value.source_created_at !== null && sourceCreatedAt === null)) {
        throw new Error("Knowledge search returned an invalid response.");
      }
      results.push({ recordId, externalId, recordType, title, sourceName, sourceCreatedAt, sectionTitle, excerpt, relevance });
    }
    return results;
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

  async getAdminDatabaseSchema(): Promise<DatabaseBrowserSchema> {
    let base: URL;
    let secretKey: string;
    try {
      ({ base, secretKey } = this.configuration());
    } catch {
      throw new DatabaseBrowserError("configuration_missing");
    }
    const endpoint = new URL("/rest/v1/rpc/get_admin_database_schema", base);
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
      throw new DatabaseBrowserError(diagnostic);
    }
    if (!response.ok) {
      const diagnostic = databaseBrowserDiagnosticForStatus(response.status);
      await response.body?.cancel();
      throw new DatabaseBrowserError(diagnostic);
    }
    let payload: unknown;
    try {
      payload = await response.json();
    } catch {
      throw new DatabaseBrowserError("invalid_response");
    }
    const schema = parseDatabaseBrowserSchema(payload);
    if (!schema) throw new DatabaseBrowserError("invalid_response");
    return schema;
  }

  async getAdminDatabasePage(tableValue: unknown, pageSizeValue: string | null, cursorValue: string | null): Promise<DatabaseBrowserPage> {
    if (!isDatabasePreviewTable(tableValue)) throw new DatabaseBrowserError("request_rejected");
    const pageSize = parseDatabasePageSize(pageSizeValue);
    const cursor = parseDatabaseCursor(cursorValue);
    if (pageSize === null || cursor === undefined) throw new DatabaseBrowserError("request_rejected");
    let base: URL;
    let secretKey: string;
    try {
      ({ base, secretKey } = this.configuration());
    } catch {
      throw new DatabaseBrowserError("configuration_missing");
    }
    const endpoint = new URL("/rest/v1/rpc/get_admin_database_page", base);
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
        body: JSON.stringify({ p_table_key: tableValue, p_page_size: pageSize, p_after_id: cursor }),
        signal: AbortSignal.timeout(10_000),
      });
    } catch (error) {
      const diagnostic = error instanceof Error && (error.name === "TimeoutError" || error.name === "AbortError") ? "timeout" : "network_error";
      throw new DatabaseBrowserError(diagnostic);
    }
    if (!response.ok) {
      const diagnostic = databaseBrowserDiagnosticForStatus(response.status);
      await response.body?.cancel();
      throw new DatabaseBrowserError(diagnostic);
    }
    let payload: unknown;
    try {
      payload = await response.json();
    } catch {
      throw new DatabaseBrowserError("invalid_response");
    }
    if (!isObject(payload) || payload.table !== tableValue || payload.page_size !== pageSize) throw new DatabaseBrowserError("invalid_response");
    const rows = sanitizeDatabasePreviewRows(tableValue, payload.rows);
    const nextCursor = payload.next_cursor === null ? null : parseDatabaseCursor(String(payload.next_cursor));
    if (!rows || rows.length > pageSize || nextCursor === undefined || (nextCursor !== null && rows.length !== pageSize)) throw new DatabaseBrowserError("invalid_response");
    return { table: tableValue, rows, nextCursor, pageSize };
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
