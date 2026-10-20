import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js";
import { GET as getTickets } from "../app/api/tickets/route";
import { GET as getPersons } from "../app/api/persons/route";
import { GET as getServices } from "../app/api/services/route";
import { authorizeOAuthScope, getAuthorizedOAuthPrincipal, KNOWLEDGE_READ_SCOPE, KNOWLEDGE_WRITE_SCOPE, OAUTH_SCOPE, recordMcpToolEvent, SUPPORTED_OAUTH_SCOPES } from "../app/oauth/_lib";
import { registerKnowledgeTools } from "./knowledge-tools";
import { SupabaseKnowledgeStore } from "./supabase-knowledge";
import { registerMovideskTools, type MovideskReader } from "./mcp-tools";

const bearerToken = (authorization: string | null) => authorization?.match(/^Bearer\s+([^\s]+)$/i)?.[1];
const json = (data: unknown, init: ResponseInit = {}) => new Response(JSON.stringify(data), { ...init, headers: { "content-type": "application/json", ...(init.headers ?? {}) } });
type TelemetryContext = { waitUntil(promise: Promise<unknown>): void };

function toolErrorCode(value: unknown): string {
  const error = value && typeof value === "object" ? value as { name?: unknown; message?: unknown; content?: unknown } : {};
  const name = typeof error.name === "string" ? error.name : "";
  const text = typeof error.message === "string" ? error.message : Array.isArray(error.content)
    ? error.content.map((item) => item && typeof item === "object" && typeof (item as { text?: unknown }).text === "string" ? (item as { text: string }).text : "").join(" ")
    : "";
  if (/timeout|timed out|tempo limite/i.test(`${name} ${text}`)) return "timeout";
  if (/autorização|autorizacao|insuficiente|invalid_token|forbidden/i.test(text)) return "authorization";
  if (/inválid|invalid|informe|obrigatório|obrigatoria/i.test(text)) return "validation";
  const status = /\bHTTP\s+([45]\d{2})\b/i.exec(text)?.[1];
  if (status) return Number(status) >= 500 ? "upstream_5xx" : "upstream_4xx";
  return value && typeof value === "object" && (value as { isError?: unknown }).isError === true ? "tool_error" : "handler_exception";
}

function instrumentToolUsage(server: McpServer, context?: TelemetryContext) {
  return {
    registerTool(name: string, config: unknown, handler: (...args: any[]) => Promise<any>) {
      return server.registerTool(name, config as any, async (...args: any[]) => {
        let outcome: "success" | "error" = "success";
        let errorCode: string | null = null;
        try {
          const result = await handler(...args);
          if (result?.isError) {
            outcome = "error";
            errorCode = toolErrorCode(result);
          }
          return result;
        } catch (error) {
          outcome = "error";
          errorCode = toolErrorCode(error);
          throw error;
        } finally {
          const persistence = recordMcpToolEvent(name, outcome, errorCode);
          if (context) context.waitUntil(persistence);
          else await persistence;
        }
      });
    },
  };
}

class LocalMovideskClient implements MovideskReader {
  private async get(resource: "tickets" | "persons" | "services", params: Record<string, string | number | boolean | undefined>, accessToken: string, signal?: AbortSignal) {
    const url = new URL(`https://movidesk-local.invalid/api/${resource}`);
    for (const [key, value] of Object.entries(params)) if (value !== undefined) url.searchParams.set(key, String(value));
    const request = new Request(url, { headers: { Authorization: `Bearer ${accessToken}`, Accept: "application/json" }, signal });
    const response = resource === "tickets" ? await getTickets(request) : resource === "persons" ? await getPersons(request) : await getServices(request);
    if (!response) throw new Error("Movidesk route returned no response");
    const text = await response.text();
    const data = text ? JSON.parse(text) : null;
    if (!response.ok) throw new Error(`Movidesk request failed with HTTP ${response.status}: ${text.slice(0, 500)}`);
    return data;
  }
  getTicket(id: string, accessToken: string, signal?: AbortSignal) { return this.get("tickets", { id }, accessToken, signal); }
  async getTicketForKnowledge(id: string, accessToken: string) {
    try { return await this.getTicket(id, accessToken); }
    catch (error) {
      if (!(error instanceof Error) || !error.message.includes("HTTP 404")) throw error;
      return this.get("tickets", { id, include_past: true }, accessToken);
    }
  }
  searchTickets(params: Record<string, string | number | boolean | undefined>, accessToken: string, signal?: AbortSignal) { return this.get("tickets", params, accessToken, signal); }
  searchPeople(params: Record<string, string | number | boolean | undefined>, accessToken: string) { return this.get("persons", params, accessToken); }
  listServices(params: Record<string, string | number | boolean | undefined>, accessToken: string) { return this.get("services", params, accessToken); }
}

export function protectedResourceMetadata(origin: string) {
  return { resource: `${origin}/mcp/`, authorization_servers: [origin], scopes_supported: [...SUPPORTED_OAUTH_SCOPES], bearer_methods_supported: ["header"] };
}

export async function handleMcp(request: Request, context?: TelemetryContext): Promise<Response | null> {
  const url = new URL(request.url);
  const pathname = url.pathname.replace(/\/+$/, "") || "/";
  if (request.method === "GET" && new Set(["/.well-known/oauth-protected-resource", "/.well-known/oauth-protected-resource/mcp", "/mcp/.well-known/oauth-protected-resource"]).has(pathname)) {
    return json(protectedResourceMetadata(url.origin), { headers: { "cache-control": "public, max-age=300" } });
  }
  if (pathname !== "/mcp" || request.method !== "POST") return null;
  const accessToken = bearerToken(request.headers.get("authorization"));
  if (!accessToken) return json({ error: "invalid_token" }, { status: 401, headers: { "www-authenticate": `Bearer resource_metadata="${url.origin}/.well-known/oauth-protected-resource", scope="${SUPPORTED_OAUTH_SCOPES.join(" ")}"` } });
  if (request.headers.get("mcp-method") === "server/discover") {
    let id: string | number | null = null;
    try { id = ((await request.clone().json()) as { id?: string | number | null }).id ?? null; } catch { /* SDK will handle malformed JSON below. */ }
    return json({ jsonrpc: "2.0", id, error: { code: -32601, message: "Method not found: server/discover" } }, { status: 404 });
  }
  const server = new McpServer({ name: "movidesk-mcp", version: "1.1.0" });
  const instrumentedServer = instrumentToolUsage(server, context);
  const movideskClient = new LocalMovideskClient();
  registerMovideskTools(instrumentedServer, movideskClient, accessToken);
  registerKnowledgeTools(instrumentedServer, new SupabaseKnowledgeStore(), {
    authorizeRead: () => authorizeOAuthScope(accessToken, KNOWLEDGE_READ_SCOPE),
    authorizeImport: () => getAuthorizedOAuthPrincipal(accessToken, [OAUTH_SCOPE, KNOWLEDGE_WRITE_SCOPE]),
    getMovideskTicket: (id) => movideskClient.getTicketForKnowledge(id, accessToken),
  });
  const transport = new WebStandardStreamableHTTPServerTransport({ sessionIdGenerator: undefined });
  await server.connect(transport);
  return transport.handleRequest(request);
}
