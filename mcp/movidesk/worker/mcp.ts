import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { acceptedContent, createMcpHandler, fromJsonSchema, inputRequired, McpServer as McpServerV2, type CallToolResult, type ToolAnnotations as ToolAnnotationsV2 } from "@modelcontextprotocol/server";
import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js";
import { z as zodV4 } from "zod/v4";
import { GET as getTickets } from "../app/api/tickets/route";
import { GET as getPersons } from "../app/api/persons/route";
import { GET as getServices } from "../app/api/services/route";
import { authorizeOAuthPrincipal, canonicalResource, FEEDBACK_WRITE_SCOPE, KNOWLEDGE_READ_SCOPE, KNOWLEDGE_WRITE_SCOPE, OAUTH_SCOPE, recordMcpToolEvent, SUPPORTED_RESOURCE_SCOPES } from "../app/oauth/_lib";
import { registerKnowledgeTools } from "./knowledge-tools";
import { SupabaseKnowledgeStore } from "./supabase-knowledge";
import { registerFeedbackTools } from "./feedback-tools";
import { SupabaseFeedbackStore } from "./supabase-feedback";
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

function toolHttpStatus(value: unknown): number | null {
  const error = value && typeof value === "object" ? value as { message?: unknown; content?: unknown; structuredContent?: unknown; error?: unknown } : {};
  const structured = error.structuredContent && typeof error.structuredContent === "object"
    ? error.structuredContent as { error?: unknown }
    : error;
  const details = structured.error && typeof structured.error === "object"
    ? structured.error as { status?: unknown }
    : {};
  if (typeof details.status === "number" && Number.isInteger(details.status) && details.status >= 400 && details.status <= 599) return details.status;
  const text = typeof error.message === "string" ? error.message : Array.isArray(error.content)
    ? error.content.map((item) => item && typeof item === "object" && typeof (item as { text?: unknown }).text === "string" ? (item as { text: string }).text : "").join(" ")
    : "";
  const status = /\bHTTP\s+([45]\d{2})\b/i.exec(text)?.[1];
  return status ? Number(status) : null;
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
        let httpStatus: number | null = null;
        let userEmail: string | null = null;
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
            userEmail = authorization.principal.email;
          }
          const result = await handler(...args);
          if (result?.isError) {
            outcome = "error";
            errorCode = toolErrorCode(result);
            httpStatus = toolHttpStatus(result);
          }
          return result;
        } catch (error) {
          outcome = "error";
          errorCode = toolErrorCode(error);
          httpStatus = toolHttpStatus(error);
          if (error instanceof McpAuthorizationFailure) return mcpAuthorizationError(error.reason, resource, requiredScopes);
          throw error;
        } finally {
          const persistence = recordMcpToolEvent(name, outcome, errorCode, performance.now() - startedAt, httpStatus, userEmail);
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
  registerFeedbackTools(instrumentedServer, new SupabaseFeedbackStore(), {
    resource,
    authorizeWrite: () => authorizeOAuthPrincipal(accessToken, [FEEDBACK_WRITE_SCOPE], resource, "mcp"),
  });
  instrumentedServer.exposeSecuritySchemes();
  const transport = new WebStandardStreamableHTTPServerTransport({ sessionIdGenerator: undefined });
  await server.connect(transport);
  return transport.handleRequest(request);
}

/** Experimental, read-only MCP v2 route. Kept separate and disabled by default. */
export async function handleMcpV2Spike(request: Request, context?: TelemetryContext, enabled = false): Promise<Response | null> {
  const url = new URL(request.url);
  if ((url.pathname.replace(/\/+$/, "") || "/") !== "/mcp-v2-spike") return null;
  if (!enabled) return json({ error: "MCP v2 spike is disabled." }, { status: 404 });
  if (request.method !== "POST") return json({ error: "Method not allowed." }, { status: 405, headers: { allow: "POST" } });

  const accessToken = bearerToken(request.headers.get("authorization"));
  const resource = canonicalResource(url.origin);
  if (!accessToken) return missingMcpAuthorizationResponse(resource);

  const handler = createMcpHandler(async ({ requestInfo }) => {
    const requestToken = bearerToken(requestInfo?.headers.get("authorization") ?? null);
    if (!requestToken) throw new Error("MCP authorization is required.");

    // Register the current, read-only Movidesk contracts with v1 first so its
    // existing Zod 3 schemas can be exported as JSON Schema for the v2 SDK.
    const registry = new McpServer({ name: "movidesk-mcp", version: "1.1.0" });
    const instrumented = instrumentToolUsage(registry, requestToken, resource, context);
    const movideskClient = new LocalMovideskClient(url.origin);
    registerMovideskTools(instrumented, movideskClient, requestToken);
    instrumented.exposeSecuritySchemes();

    const handlers = (registry.server as unknown as { _requestHandlers: Map<string, (request: unknown, extra: unknown) => Promise<unknown>> })._requestHandlers;
    const listTools = handlers.get("tools/list");
    if (!listTools) throw new Error("MCP v1 tool-list handler is unavailable.");
    const manifest = await listTools({ method: "tools/list", params: {} }, {}) as { tools?: Array<Record<string, unknown>> };
    const registeredTools = (registry as unknown as { _registeredTools: Record<string, { inputSchema?: { safeParseAsync(value: unknown): Promise<{ success: boolean; data?: unknown }> }; handler: (args: unknown, extra: unknown) => Promise<unknown> }> })._registeredTools;

    const modernServer = new McpServerV2({ name: "movidesk-mcp", version: "1.1.0" });
    const schemesByTool = new Map<string, ToolSecurityScheme[]>();
    const schemasByTool = new Map<string, { inputSchema?: unknown; outputSchema?: unknown }>();
    for (const tool of manifest.tools ?? []) {
      const name = String(tool.name);
      const registered = registeredTools[name];
      if (!registered) continue;
      const schemes = tool.securitySchemes as ToolSecurityScheme[] | undefined;
      if (schemes) schemesByTool.set(name, schemes);
      schemasByTool.set(name, { inputSchema: tool.inputSchema, outputSchema: tool.outputSchema });
      const outputSchema = tool.outputSchema && typeof tool.outputSchema === "object"
        ? fromJsonSchema(tool.outputSchema as Record<string, unknown>)
        : undefined;

      modernServer.registerTool(name, {
        title: typeof tool.title === "string" ? tool.title : undefined,
        description: typeof tool.description === "string" ? tool.description : undefined,
        inputSchema: fromJsonSchema({ type: "object" }),
        outputSchema,
        annotations: tool.annotations as ToolAnnotationsV2 | undefined,
        _meta: tool._meta as Record<string, unknown> | undefined,
      }, async (args, extra) => {
        const parsed = await registered.inputSchema?.safeParseAsync(args);
        if (parsed && !parsed.success) return { isError: true, content: [{ type: "text", text: "Os parâmetros informados não são válidos para esta ferramenta." }] };
        return await registered.handler(parsed?.data ?? args, extra) as CallToolResult;
      });
    }

    // Safe, temporary production probe for real-client elicitation support.
    // It never calls Movidesk and returns only whether the client accepted.
    const probeName = "mcp_v2_elicitation_probe";
    const probeResponseSchema = zodV4.object({ confirmed: zodV4.boolean() });
    modernServer.registerTool(probeName, {
      title: "Teste de confirmação MCP",
      description: "Teste temporário de confirmação. Não altera chamados nem chama o Movidesk.",
      inputSchema: fromJsonSchema({ type: "object" }),
    }, async (_args, extra) => {
      const startedAt = performance.now();
      let outcome: "success" | "error" = "success";
      let errorCode: string | null = null;
      let httpStatus: number | null = null;
      let userEmail: string | null = null;
      try {
        const authorization = await authorizeOAuthPrincipal(accessToken, [OAUTH_SCOPE], resource, "mcp");
        if (!authorization.authorized) {
          outcome = "error";
          errorCode = "authorization";
          return mcpAuthorizationError(authorization.error, resource, [OAUTH_SCOPE]);
        }
        userEmail = authorization.principal.email;

        const accepted = acceptedContent(extra.mcpReq.inputResponses, "confirm", probeResponseSchema);
        if (accepted?.confirmed === true) {
          return { content: [{ type: "text", text: "Confirmação recebida. Nenhum chamado foi alterado." }] };
        }

        const response = extra.mcpReq.inputResponses?.confirm;
        const responseAction = response && typeof response === "object" && "action" in response
          && (response.action === "decline" || response.action === "cancel")
          ? response.action
          : undefined;
        if (responseAction) {
          outcome = "error";
          errorCode = "tool_error";
          return { isError: true, content: [{ type: "text", text: `Teste ${responseAction === "decline" ? "recusado" : "cancelado"}. Nenhum chamado foi alterado.` }] };
        }

        return inputRequired({
          inputRequests: {
            confirm: inputRequired.elicit({
              message: "Confirme apenas a simulação. Nenhum chamado será alterado.",
              requestedSchema: {
                type: "object",
                properties: { confirmed: { type: "boolean", description: "Confirmar simulação" } },
                required: ["confirmed"],
                additionalProperties: false,
              },
            }),
          },
        });
      } catch (error) {
        outcome = "error";
        errorCode = toolErrorCode(error);
        httpStatus = toolHttpStatus(error);
        if (error instanceof McpAuthorizationFailure) return mcpAuthorizationError(error.reason, resource, [OAUTH_SCOPE]);
        throw error;
      } finally {
        const persistence = recordMcpToolEvent(probeName, outcome, errorCode, performance.now() - startedAt, httpStatus, userEmail);
        if (context) context.waitUntil(persistence);
        else await persistence;
      }
    });
    schemesByTool.set(probeName, [{ type: "oauth2", scopes: [OAUTH_SCOPE] }]);
    schemasByTool.set(probeName, { inputSchema: { type: "object", properties: {}, additionalProperties: false } });

    // Restore the established input/output JSON Schemas and OpenAI OAuth
    // extension at the wire boundary; SDK v2's registered input schema stays
    // permissive so the existing Zod 3 parser can retain coercion/defaults.
    const modernHandlers = (modernServer.server as unknown as { _requestHandlers: Map<string, (request: unknown, extra: unknown) => Promise<unknown>> })._requestHandlers;
    const originalListTools = modernHandlers.get("tools/list");
    if (!originalListTools) throw new Error("MCP v2 tool-list handler is unavailable.");
    modernHandlers.set("tools/list", async (listRequest, extra) => {
      const result = await originalListTools(listRequest, extra) as { tools?: Array<Record<string, unknown>> };
      return {
        ...result,
        tools: (result.tools ?? []).map((tool) => {
          const schemas = schemasByTool.get(String(tool.name));
          const schemes = schemesByTool.get(String(tool.name));
          return {
            ...tool,
            ...(schemas?.inputSchema ? { inputSchema: schemas.inputSchema } : {}),
            ...(schemas?.outputSchema ? { outputSchema: schemas.outputSchema } : {}),
            ...(schemes ? { securitySchemes: schemes } : {}),
          };
        }),
      };
    });
    return modernServer;
  }, { legacy: "reject" });

  return handler.fetch(request);
}
