import { acceptedContent, inputRequired, McpServer, createMcpHandler } from "@modelcontextprotocol/server";
import { z } from "zod";

const securitySchemes = [{ type: "oauth2", scopes: ["movidesk:read"] }];

function registerToolWithSecuritySchemes(server, schemesByTool, name, config, callback) {
  schemesByTool.set(name, config.securitySchemes);
  const sdkConfig = { ...config };
  delete sdkConfig.securitySchemes;
  return server.registerTool(name, sdkConfig, callback);
}

function exposeSecuritySchemes(server, schemesByTool) {
  // SDK v2 does not currently serialize this OpenAI extension from registerTool config.
  const handlers = server.server._requestHandlers;
  const original = handlers.get("tools/list");
  if (!original) throw new Error("SDK v2 tools/list handler missing");
  handlers.set("tools/list", async (request, extra) => {
    const result = await original(request, extra);
    return {
      ...result,
      tools: (result.tools ?? []).map((tool) => {
        const schemes = schemesByTool.get(tool.name);
        return schemes ? { ...tool, securitySchemes: schemes } : tool;
      }),
    };
  });
}

export function createSpikeHandler(authorize = async (token) => token === "valid-test-token") {
  return createMcpHandler(({ requestInfo }) => {
    const token = /^Bearer (.+)$/i.exec(requestInfo?.headers.get("authorization") ?? "")?.[1];
    const server = new McpServer({ name: "beta-mcp-v2-spike", version: "0.0.1" });
    const schemesByTool = new Map();
    registerToolWithSecuritySchemes(server, schemesByTool, "spike_read", {
      title: "Leitura de demonstração",
      description: "Ferramenta local sem acesso ao Movidesk.",
      inputSchema: z.object({}),
      securitySchemes,
    }, async () => {
      if (!token || !await authorize(token, ["movidesk:read"])) {
        return { isError: true, content: [{ type: "text", text: "Não autorizado." }] };
      }
      return { content: [{ type: "text", text: "leitura autorizada" }] };
    });
    registerToolWithSecuritySchemes(server, schemesByTool, "spike_confirm", {
      title: "Confirmação de demonstração",
      description: "Solicita confirmação sem executar qualquer escrita.",
      inputSchema: z.object({}),
      securitySchemes: [{ type: "oauth2", scopes: ["movidesk:write"] }],
    }, async (_args, context) => {
      if (!token || !await authorize(token, ["movidesk:write"])) {
        return { isError: true, content: [{ type: "text", text: "Não autorizado." }] };
      }
      const answer = acceptedContent(context.mcpReq.inputResponses, "confirm", z.object({ confirmed: z.boolean() }));
      if (answer?.confirmed === true) return { content: [{ type: "text", text: "confirmação aceita; nenhuma escrita executada" }] };
      const response = context.mcpReq.inputResponses?.confirm;
      if (response?.action === "decline" || response?.action === "cancel") {
        return { isError: true, content: [{ type: "text", text: `Usuário ${response.action === "decline" ? "recusou" : "cancelou"} a simulação.` }] };
      }
      return inputRequired({
        inputRequests: {
          confirm: inputRequired.elicit({
            message: "Autoriza apenas a simulação local?",
            requestedSchema: z.object({ confirmed: z.boolean().describe("Confirmar simulação") }),
          }),
        },
      });
    });
    exposeSecuritySchemes(server, schemesByTool);
    return server;
  }, { legacy: "reject" });
}

export function authorizedSpikeRequest(url, token) {
  return new Request(url, { method: "POST", headers: { authorization: `Bearer ${token}`, "content-type": "application/json" } });
}
