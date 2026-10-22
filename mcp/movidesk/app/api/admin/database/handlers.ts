import { isDatabaseBrowserTable, isDatabasePreviewTable, parseDatabaseCursor, parseDatabasePageSize } from "../../../../worker/database-browser-contract";
import { DatabaseBrowserError, type SupabaseKnowledgeStore } from "../../../../worker/supabase-knowledge";

type DatabaseRouteDependencies = {
  getUser: () => Promise<{ email: string } | null>;
  ensureSchema: () => Promise<void>;
  getUserRole: (email: string) => Promise<string | null>;
  isMaster: (role: string | null) => boolean;
  store: () => SupabaseKnowledgeStore;
};

const noStoreJson = (body: unknown, status = 200) => Response.json(body, { status, headers: { "Cache-Control": "no-store" } });
const diagnostics = new Set(["configuration_missing", "rpc_not_found", "permission_denied", "rate_limited", "service_error", "request_rejected", "timeout", "network_error", "invalid_response"]);

async function authorize(deps: DatabaseRouteDependencies) {
  const user = await deps.getUser();
  if (!user) return { response: noStoreJson({ error: "unauthorized" }, 401) };
  await deps.ensureSchema();
  if (!deps.isMaster(await deps.getUserRole(user.email))) return { response: noStoreJson({ error: "forbidden" }, 403) };
  return { response: null };
}

function unavailable(error: unknown) {
  const diagnostic = error instanceof DatabaseBrowserError && diagnostics.has(error.diagnostic) ? error.diagnostic : "request_rejected";
  return noStoreJson({ error: "database_unavailable", diagnostic }, 503);
}

export async function getDatabaseSchema(deps: DatabaseRouteDependencies) {
  const auth = await authorize(deps);
  if (auth.response) return auth.response;
  try {
    return noStoreJson(await deps.store().getAdminDatabaseSchema());
  } catch (error) {
    return unavailable(error);
  }
}

export async function getDatabasePreview(request: Request, deps: DatabaseRouteDependencies) {
  const url = new URL(request.url);
  const allowedParams = new Set(["table", "page_size", "after_id"]);
  if ([...url.searchParams.keys()].some((key) => !allowedParams.has(key)) || [...allowedParams].some((key) => url.searchParams.getAll(key).length > 1)) {
    return noStoreJson({ error: "invalid_request" }, 400);
  }
  const table = url.searchParams.get("table");
  const pageSize = parseDatabasePageSize(url.searchParams.get("page_size"));
  const cursor = parseDatabaseCursor(url.searchParams.get("after_id"));
  if (!isDatabaseBrowserTable(table) || !isDatabasePreviewTable(table) || pageSize === null || cursor === undefined) {
    return noStoreJson({ error: "invalid_request" }, 400);
  }
  const auth = await authorize(deps);
  if (auth.response) return auth.response;
  try {
    return noStoreJson(await deps.store().getAdminDatabasePage(table, String(pageSize), cursor));
  } catch (error) {
    return unavailable(error);
  }
}
