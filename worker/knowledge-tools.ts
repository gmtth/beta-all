import { z } from "zod";

export interface KnowledgeSourceSummary {
  id: string | null;
  name: string | null;
}

export interface KnowledgeReader {
  listSources(): Promise<KnowledgeSourceSummary[]>;
}

const readOnlyAnnotations = { readOnlyHint: true, destructiveHint: false, openWorldHint: false } as const;

export function registerKnowledgeTools(server: any, reader: KnowledgeReader, authorizeRead: () => Promise<boolean>) {
  server.registerTool(
    "knowledge_list_sources",
    {
      title: "Listar fontes da base de conhecimento",
      description: "Lista até 10 fontes cadastradas na base compartilhada. Retorna somente identificador e nome da fonte. Requer autorização knowledge:read.",
      inputSchema: {},
      outputSchema: { sources: z.array(z.object({ id: z.string().nullable(), name: z.string().nullable() })), total: z.number() },
      annotations: readOnlyAnnotations,
    },
    async () => {
      let authorized = false;
      try { authorized = await authorizeRead(); } catch { /* Fail closed. */ }
      if (!authorized) {
        return { isError: true, content: [{ type: "text" as const, text: "Autorização ausente, expirada ou insuficiente para consultar a base de conhecimento." }] };
      }
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
}
