import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js";
import { GET as getTickets } from "../app/api/tickets/route";
import { GET as getPersons } from "../app/api/persons/route";
import { GET as getServices } from "../app/api/services/route";
import { authorizeOAuthPrincipal, canonicalResource, KNOWLEDGE_READ_SCOPE, KNOWLEDGE_WRITE_SCOPE, OAUTH_SCOPE, recordMcpToolEvent, SUPPORTED_RESOURCE_SCOPES } from "../app/oauth/_lib";
import { registerKnowledgeTools } from "./knowledge-tools";
import { SupabaseKnowledgeStore } from "./supabase-knowledge";
import { registerMovideskTools, type MovideskReader } from "./mcp-tools";
import { exposeToolSecuritySchemes, type ToolSecurityScheme } from "./tool-security-schemes";
import { McpAuthorizationFailure, mcpAuthorizationError, missingMcpAuthorizationResponse } from "./oauth-auth-challenge";
import { protectedResourceMetadata as buildProtectedResourceMetadata } from "../app/oauth/metadata";
import { KnowledgeImportError } from "./knowledge-import-errors";
import { resolveMovideskTicketIdentifier } from "./knowledge-ingest";

const bearerToken = (authorization: string | null) => authorization?.match(/^Bearer\s+([^\s]+)$/i)?.[1];
const json = (data: unknown, init: ResponseInit = {}) => new Response(JSON.stringify(data), { ...init, headers: { "content-type": "application/json", ...(init.headers ?? {}) } });
type TelemetryContext = { waitUntil(promise: Promise<unknown>): void };
const knowledgeImportDiagnostics = new Set([
  "ticket_not_found", "movidesk_unavailable", "ticket_mismatch", "ticket_missing_title", "ticket_missing_content", "ticket_too_large",
  "supabase_configuration", "supabase_rpc_unavailable", "supabase_permission_denied", "supabase_source_not_configured",
  "supabase_payload_rejected", "supabase_rate_limited", "supabase_unavailable", "supabase_timeout", "supabase_network_error",
  "supabase_invalid_response", "unexpected",
]);

function toolErrorCode(value: unknown): string {
  const error = value && typeof value === "object" ? value as { name?: unknown; message?: unknown; content?: unknown } : {};
  const name = typeof error.name === "string" ? error.name : "";
  const text = typeof error.message === "string" ? error.message : Array.isArray(error.content)
    ? error.content.map((item) => item && typeof item === "object" && typeof (item as { text?: unknown }).text === "string" ? (item as { text: string }).text : "").join(" ")
    : "";
  const importDiagnostic = /\(diagnóstico: ([a-z_]+)\)/i.exec(text)?.[1];
  if (importDiagnostic && knowledgeImportDiagnostics.has(importDiagnostic)) return importDiagnostic;
  if (/timeout|timed out|tempo limite/i.test(`${name} ${text}`)) return "timeout";
  if (/autorização|autorizacao|insuficiente|invalid_token|forbidden/i.test(text)) return "authorization";
  if (/inválid|invalid|informe|obrigatório|obrigatoria/i.test(text)) return "validation";
  const status = /\bHTTP\s+([45]\d{2})\b/i.exec(text)?.[1];
  if (status) return Number(status) >= 500 ? "upstream_5xx" : "upstream_4xx";
  return value && typeof value === "object" && (value as { isError?: unknown }).isError === true ? "tool_error" : "handler_exception";
}

function instrumentToolUsage(server: McpServer, accessToken: string, resource: string, context?: TelemetryContext) {
  const schemesByTool = new Map<string, ToolSecurityScheme[]>();
  return {
    registerTool(name: string, config: unknown, handler: (...args: any[]) => Promise<any>) {
      const schemes = (config as { securitySchemes?: ToolSecurityScheme[] }).securitySchemes;
      if (schemes) schemesByTool.set(name, schemes);
      const requiredScopes = schemes?.flatMap((scheme) => scheme.type === "oauth2" ? scheme.scopes : []) ?? [];
      const explicitlyPublic = Boolean(schemes?.length && schemes.every((scheme) => scheme.type === "noauth"));
      return server.registerTool(name, config as any, async (...args: any[]) => {
        const startedAt = performance.now();
        let outcome: "success" | "error" = "success";
        let errorCode: string | null = null;
        try {
          if (!schemes?.length) {
            outcome = "error";
            errorCode = "authorization";
            return mcpAuthorizationError("invalid_token", resource, []);
          }
          if (!explicitlyPublic) {
            const authorization = await authorizeOAuthPrincipal(accessToken, requiredScopes, resource, "mcp");
            if (!authorization.authorized) {
              outcome = "error";
              errorCode = "authorization";
              return mcpAuthorizationError(authorization.error, resource, requiredScopes);
            }
          }
          const result = await handler(...args);
          if (result?.isError) {
            outcome = "error";
            errorCode = toolErrorCode(result);
          }
          return result;
        } catch (error) {
          outcome = "error";
          errorCode = toolErrorCode(error);
          if (error instanceof McpAuthorizationFailure) return mcpAuthorizationError(error.reason, resource, requiredScopes);
          throw error;
        } finally {
          const persistence = recordMcpToolEvent(name, outcome, errorCode, performance.now() - startedAt);
          if (context) context.waitUntil(persistence);
          else await persistence;
        }
      });
    },
    exposeSecuritySchemes() { exposeToolSecuritySchemes(server, schemesByTool); },
  };
}

class LocalMovideskClient implements MovideskReader {
  constructor(private readonly resourceOrigin: string) {}

  private async get(resource: "tickets" | "persons" | "services", params: Record<string, string | number | boolean | undefined>, accessToken: string, signal?: AbortSignal) {
    const url = new URL(`/api/${resource}`, this.resourceOrigin);
    for (const [key, value] of Object.entries(params)) if (value !== undefined) url.searchParams.set(key, String(value));
    const request = new Request(url, { headers: { Authorization: `Bearer ${accessToken}`, Accept: "application/json" }, signal });
    const response = resource === "tickets" ? await getTickets(request) : resource === "persons" ? await getPersons(request) : await getServices(request);
    if (!response) throw new Error("Movidesk route returned no response");
    const text = await response.text();
    const data = text ? JSON.parse(text) : null;
    if (data && typeof data === "object" && (data as { error?: unknown }).error === "invalid_token") throw new McpAuthorizationFailure("invalid_token");
    if (data && typeof data === "object" && (data as { error?: unknown }).error === "forbidden") throw new McpAuthorizationFailure("invalid_token");
    if (!response.ok) throw new Error(`Movidesk request failed with HTTP ${response.status}: ${text.slice(0, 500)}`);
    return data;
  }
  getTicket(id: string, accessToken: string, signal?: AbortSignal) { return this.get("tickets", { id }, accessToken, signal); }
  async getTicketForKnowledge(id: string, accessToken: string) {
    const lookup = async (kind: "id" | "protocol", value: string): Promise<unknown | null> => {
      const params = { [kind]: value };
      try { return await this.get("tickets", params, accessToken); }
      catch (error) {
        if (error instanceof McpAuthorizationFailure) throw error;
        if (!(error instanceof Error) || !error.message.includes("HTTP 404")) throw new KnowledgeImportError("movidesk_unavailable");
        try { return await this.get("tickets", { ...params, include_past: true }, accessToken); }
        catch (pastError) {
          if (pastError instanceof McpAuthorizationFailure) throw pastError;
          if (pastError instanceof Error && pastError.message.includes("HTTP 404")) return null;
          throw new KnowledgeImportError("movidesk_unavailable");
        }
      }
    };
    // A numeric identifier may be a protocol; try internal ID first, then protocol.
    return resolveMovideskTicketIdentifier(id, lookup);
  }
  searchTickets(params: Record<string, string | number | boolean | undefined>, accessToken: string, signal?: AbortSignal) { return this.get("tickets", params, accessToken, signal); }
  searchPeople(params: Record<string, string | number | boolean | undefined>, accessToken: string) { return this.get("persons", params, accessToken); }
  listServices(params: Record<string, string | number | boolean | undefined>, accessToken: string) { return this.get("services", params, accessToken); }
}

export function protectedResourceMetadata(origin: string) {
  return buildProtectedResourceMetadata(origin, [...SUPPORTED_RESOURCE_SCOPES]);
}

export async function handleMcp(request: Request, context?: TelemetryContext): Promise<Response | null> {
  const url = new URL(request.url);
  const pathname = url.pathname.replace(/\/+$/, "") || "/";
  if (request.method === "GET" && new Set(["/.well-known/oauth-protected-resource", "/.well-known/oauth-protected-resource/mcp", "/mcp/.well-known/oauth-protected-resource"]).has(pathname)) {
    return json(protectedResourceMetadata(url.origin), { headers: { "cache-control": "public, max-age=300" } });
  }
  if (pathname !== "/mcp" || request.method !== "POST") return null;
  const accessToken = bearerToken(request.headers.get("authorization"));
  if (!accessToken) return missingMcpAuthorizationResponse(canonicalResource(url.origin));
  if (request.headers.get("mcp-method") === "server/discover") {
    let id: string | number | null = null;
    try { id = ((await request.clone().json()) as { id?: string | number | null }).id ?? null; } catch { /* SDK will handle malformed JSON below. */ }
    return json({ jsonrpc: "2.0", id, error: { code: -32601, message: "Method not found: server/discover" } }, { status: 404 });
  }
  const server = new McpServer({ name: "movidesk-mcp", version: "1.1.0" });
  const resource = canonicalResource(url.origin);
  const instrumentedServer = instrumentToolUsage(server, accessToken, resource, context);
  const movideskClient = new LocalMovideskClient(url.origin);
  registerMovideskTools(instrumentedServer, movideskClient, accessToken);
  registerKnowledgeTools(instrumentedServer, new SupabaseKnowledgeStore(), {
    resource,
    authorizeRead: () => authorizeOAuthPrincipal(accessToken, [KNOWLEDGE_READ_SCOPE], resource, "mcp"),
    authorizeImport: () => authorizeOAuthPrincipal(accessToken, [OAUTH_SCOPE, KNOWLEDGE_WRITE_SCOPE], resource, "mcp"),
    getMovideskTicket: (id) => movideskClient.getTicketForKnowledge(id, accessToken),
  });
  instrumentedServer.exposeSecuritySchemes();
  const transport = new WebStandardStreamableHTTPServerTransport({ sessionIdGenerator: undefined });
  await server.connect(transport);
  return transport.handleRequest(request);
}
