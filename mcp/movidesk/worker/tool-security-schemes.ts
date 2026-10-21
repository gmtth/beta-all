import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

export type ToolSecurityScheme = { type: "oauth2"; scopes: string[] } | { type: "noauth" };

/**
 * The pinned MCP SDK version omits the OpenAI `securitySchemes` extension when
 * it serializes tools/list. Wrap that single response so the wire manifest
 * keeps the per-tool authorization contract configured by each tool.
 */
export function exposeToolSecuritySchemes(
  server: McpServer,
  schemesByTool: ReadonlyMap<string, ToolSecurityScheme[]>,
) {
  const handlers = (server.server as unknown as {
    _requestHandlers: Map<string, (request: unknown, extra: unknown) => Promise<unknown>>;
  })._requestHandlers;
  const original = handlers?.get("tools/list");
  if (!original) throw new Error("MCP SDK did not register the tools/list handler");

  handlers.set("tools/list", async (request, extra) => {
    const result = await original(request, extra) as { tools?: Array<Record<string, unknown>> };
    return {
      ...result,
      tools: (result.tools ?? []).map((tool) => {
        const schemes = schemesByTool.get(String(tool.name));
        return schemes ? { ...tool, securitySchemes: schemes } : tool;
      }),
    };
  });
}
