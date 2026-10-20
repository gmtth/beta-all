# Supabase da base de conhecimento

O projeto Supabase escolhido para o piloto usa PostgreSQL e `pgvector`. A integração do MCP acessa a Data API/PostgREST por HTTPS a partir do servidor; o runtime Workers não abre conexão TCP direta ao PostgreSQL.

Para o estado, decisões, evidências e ordem de prontidão, consulte [`DOSSIER.md`](./DOSSIER.md). Este README é o guia operacional resumido; instruções do runtime MCP permanecem em [`mcp/movidesk/AGENTS.md`](../../mcp/movidesk/AGENTS.md).

## Estado confirmado pela documentação e pelo código

- Schema `beta` com `source_system`, `source_record` e `record_chunk`.
- `pgvector` está instalado; RLS ativo nas três tabelas. A inspeção do catálogo não encontrou políticas, coluna/índice vetorial, RPC ou trigger. A busca atual no banco é lexical via `tsvector` + GIN.
- ACLs observadas: `service_role` tem todos os privilégios DML nas três tabelas; `anon` e `authenticated` também têm ACLs DML, mas não têm `USAGE` no schema `beta`. Reduzir privilégios desnecessários antes de ampliar o acesso e manter o schema fora do alcance desses papéis.
- A Data API expõe o schema `beta` e as tabelas. Isso não substitui a autorização OAuth no MCP.
- A ferramenta inicial `knowledge_list_sources` exige `knowledge:read`, limita a resposta a dez fontes e consulta `beta.source_system`.
- O teste manual registrado anteriormente encontrou Movidesk, ClickUp e Documentos administrativos.

## Migrações reproduzíveis

Ainda não há migração versionada. O catálogo foi inspecionado em 2026-10-20, mas o resultado detalhado ainda precisa ser revisado e convertido em DDL reproduzível. O estado observado tem quatro índices, incluindo GIN para busca textual, porém não tem índice vetorial, políticas RLS, funções/RPCs ou triggers. Não criar migração de produção a partir de screenshots ou nomes de tabela; revisar o DDL e planejar explicitamente o endurecimento das ACLs antes de versionar.

## Segredos e configuração

Configurar no ambiente do servidor apenas `SUPABASE_URL` e `SUPABASE_SECRET_KEY`, com valores guardados no gerenciador de segredos do host. Nunca colocar a chave secreta em arquivos do plugin, navegador, commits ou contexto retornado ao modelo. Uma chave compartilhada anteriormente na conversa foi considerada comprometida; usar apenas uma chave rotacionada e ativa.

O acesso service-role ignora RLS. A autorização do usuário, classificação, filtros por cliente e limites de contexto devem ser aplicados pelo backend antes de responder. Manter operações estreitas e seleção explícita de colunas.

## Próximas etapas

1. Revisar o resultado do catálogo recebido em 2026-10-20 e reconciliar todos os grants; não aplicar DDL de correção até decidir o papel de leitura e o papel futuro de ingestão.
2. Registrar migrações versionadas e caminho de rollback, incluindo privilégios mínimos, busca lexical e futura busca vetorial, sem dados sensíveis.
3. Implementar ingestão idempotente, busca lexical e vetorial, filtros de autorização, reranking e citações.
4. Manter histórico de conversas separado do conhecimento validado, sem chain-of-thought.
5. Validar limites do plano, backup, retenção e recuperação antes de produção.
