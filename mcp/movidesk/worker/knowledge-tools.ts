import { z } from "zod";
import { buildMovideskKnowledgeRecord, type MovideskKnowledgeRecord } from "./knowledge-ingest";
import { KNOWLEDGE_READ_SCOPE, KNOWLEDGE_WRITE_SCOPE, OAUTH_SCOPE } from "../app/oauth/clients";
import type { OAuthPrincipalAuthorization } from "../app/oauth/_lib";
import { McpAuthorizationFailure, mcpAuthorizationError } from "./oauth-auth-challenge";
import { knowledgeImportFailure } from "./knowledge-import-errors";

export interface KnowledgeSourceSummary {
  id: string | null;
  name: string | null;
}

export interface KnowledgeStore {
  listSources(): Promise<KnowledgeSourceSummary[]>;
  importMovideskTicket(record: MovideskKnowledgeRecord, actorEmail: string): Promise<{ recordId: string; chunkCount: number }>;
}

const readOnlyAnnotations = { readOnlyHint: true, destructiveHint: false, openWorldHint: false } as const;
const importAnnotations = { readOnlyHint: false, destructiveHint: false, openWorldHint: true } as const;
const importSchema = z.object({ ticket_id: z.string().trim().regex(/^\d{1,30}$/, "ticket_id deve conter apenas números") });
type KnowledgeToolOptions = {
  resource: string;
  authorizeRead: () => Promise<OAuthPrincipalAuthorization>;
  authorizeImport: () => Promise<OAuthPrincipalAuthorization>;
  getMovideskTicket: (id: string) => Promise<unknown>;
};

export function registerKnowledgeTools(server: any, reader: KnowledgeStore, options: KnowledgeToolOptions) {
  server.registerTool(
    "knowledge_list_sources",
    {
      title: "Listar fontes da base de conhecimento",
      description: "Lista até 10 fontes cadastradas na base compartilhada. Retorna somente identificador e nome da fonte. Requer autorização knowledge:read.",
      inputSchema: {},
      outputSchema: { sources: z.array(z.object({ id: z.string().nullable(), name: z.string().nullable() })), total: z.number() },
      securitySchemes: [{ type: "oauth2" as const, scopes: [KNOWLEDGE_READ_SCOPE] }],
      annotations: readOnlyAnnotations,
    },
    async () => {
      let authorization: OAuthPrincipalAuthorization;
      try { authorization = await options.authorizeRead(); }
      catch { return { isError: true, content: [{ type: "text" as const, text: "Não foi possível validar a autorização para consultar a base de conhecimento." }] }; }
      if (!authorization.authorized) return mcpAuthorizationError(authorization.error, options.resource, [KNOWLEDGE_READ_SCOPE]);
      try {
        const sources = await reader.listSources();
        return {
          content: [{ type: "text" as const, text: `${sources.length} fonte(s) listada(s).` }],
          structuredContent: { sources, total: sources.length },
        };
      } catch {
        return { isError: true, content: [{ type: "text" as const, text: "A base de conhecimento está indisponível ou não configurada." }] };
      }
    },
  );

  server.registerTool(
    "knowledge_import_movidesk_ticket",
    {
      title: "Adicionar chamado do Movidesk à base compartilhada",
      description: "Importa um chamado do Movidesk para a base interna compartilhada, aceitando o ID interno ou o protocolo numérico e preservando o ID interno canônico como identificador de origem. Indexa descrição e interações. Use somente quando o analista pedir explicitamente para adicionar/importar o chamado à base; não use durante uma consulta ou diagnóstico comum. Requer movidesk:read e knowledge:write. A importação é idempotente e pode atualizar um registro já existente.",
      inputSchema: { ticket_id: importSchema.shape.ticket_id },
      outputSchema: { imported: z.boolean(), ticket_id: z.string(), chunks: z.number() },
      securitySchemes: [{ type: "oauth2" as const, scopes: [OAUTH_SCOPE, KNOWLEDGE_WRITE_SCOPE] }],
      annotations: importAnnotations,
    },
    async (rawArgs: unknown) => {
      const parsed = importSchema.safeParse(rawArgs);
      if (!parsed.success) return { isError: true, content: [{ type: "text" as const, text: "Informe um identificador numérico válido para o chamado." }] };
      let authorization: OAuthPrincipalAuthorization;
      try { authorization = await options.authorizeImport(); }
      catch { return { isError: true, content: [{ type: "text" as const, text: "Não foi possível validar a autorização para importar conhecimento." }] }; }
      if (!authorization.authorized) return mcpAuthorizationError(authorization.error, options.resource, [OAUTH_SCOPE, KNOWLEDGE_WRITE_SCOPE]);
      const principal = authorization.principal;
      try {
        const ticket = await options.getMovideskTicket(parsed.data.ticket_id);
        const record = await buildMovideskKnowledgeRecord(ticket, parsed.data.ticket_id);
        const result = await reader.importMovideskTicket(record, principal.email);
        return {
          content: [{ type: "text" as const, text: `Chamado ${parsed.data.ticket_id} adicionado à base interna em ${result.chunkCount} trecho(s).` }],
          structuredContent: { imported: true, ticket_id: parsed.data.ticket_id, chunks: result.chunkCount },
        };
      } catch (error) {
        if (error instanceof McpAuthorizationFailure) return mcpAuthorizationError(error.reason, options.resource, [OAUTH_SCOPE, KNOWLEDGE_WRITE_SCOPE]);
        const failure = knowledgeImportFailure(error);
        return { isError: true, content: [{ type: "text" as const, text: `${failure.message} (diagnóstico: ${failure.diagnostic})` }] };
      }
    },
  );
}
