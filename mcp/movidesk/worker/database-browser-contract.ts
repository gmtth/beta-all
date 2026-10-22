export const DATABASE_BROWSER_PAGE_SIZE = 25;

export const DATABASE_BROWSER_TABLES = [
  { key: "source_system", previewAllowed: true, sortDirection: "asc" },
  { key: "source_record", previewAllowed: true, sortDirection: "desc" },
  { key: "knowledge_ingest_audit", previewAllowed: true, sortDirection: "desc" },
  { key: "record_chunk", previewAllowed: false, sortDirection: "desc" },
] as const;

export type DatabaseBrowserTable = typeof DATABASE_BROWSER_TABLES[number]["key"];
export type DatabasePreviewTable = Exclude<DatabaseBrowserTable, "record_chunk">;

export const DATABASE_PREVIEW_FIELDS: Record<DatabasePreviewTable, readonly string[]> = {
  source_system: ["id", "code", "name", "active", "created_at"],
  source_record: ["id", "source_system_id", "external_id", "record_type", "status", "classification", "source_created_at", "source_updated_at", "imported_at", "deleted_at"],
  knowledge_ingest_audit: ["id", "source_record_id", "operation", "chunk_count", "created_at"],
};

const MAX_INT8 = 9_223_372_036_854_775_807n;

export function isDatabaseBrowserTable(value: unknown): value is DatabaseBrowserTable {
  return typeof value === "string" && DATABASE_BROWSER_TABLES.some((table) => table.key === value);
}

export function isDatabasePreviewTable(value: unknown): value is DatabasePreviewTable {
  return isDatabaseBrowserTable(value) && value !== "record_chunk";
}

export function parseDatabasePageSize(value: string | null): number | null {
  if (value === null) return DATABASE_BROWSER_PAGE_SIZE;
  if (!/^[1-9]\d*$/.test(value)) return null;
  const parsed = Number(value);
  return Number.isSafeInteger(parsed) && parsed <= DATABASE_BROWSER_PAGE_SIZE ? parsed : null;
}

export function parseDatabaseCursor(value: string | null): string | null | undefined {
  if (value === null) return null;
  if (!/^\d{1,19}$/.test(value)) return undefined;
  try {
    const parsed = BigInt(value);
    return parsed > 0n && parsed <= MAX_INT8 ? parsed.toString() : undefined;
  } catch {
    return undefined;
  }
}

export function sanitizeDatabasePreviewRows(table: DatabasePreviewTable, value: unknown): Array<Record<string, string | number | boolean | null>> | null {
  if (!Array.isArray(value)) return null;
  const fields = DATABASE_PREVIEW_FIELDS[table];
  const rows: Array<Record<string, string | number | boolean | null>> = [];
  for (const item of value) {
    if (!item || typeof item !== "object" || Array.isArray(item)) return null;
    const source = item as Record<string, unknown>;
    const row: Record<string, string | number | boolean | null> = {};
    for (const field of fields) {
      const cell = source[field];
      if (cell !== null && typeof cell !== "string" && typeof cell !== "number" && typeof cell !== "boolean") return null;
      if (typeof cell === "number" && !Number.isFinite(cell)) return null;
      row[field] = cell;
    }
    rows.push(row);
  }
  return rows;
}
