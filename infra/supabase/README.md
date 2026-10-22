# Supabase da base de conhecimento

O projeto Supabase escolhido para o piloto usa PostgreSQL e `pgvector`. A integração do MCP acessa a Data API/PostgREST por HTTPS a partir do servidor; o runtime Workers não abre conexão TCP direta ao PostgreSQL.

Para o estado, decisões, evidências e ordem de prontidão, consulte [`DOSSIER.md`](./DOSSIER.md). Este README é o guia operacional resumido; instruções do runtime MCP permanecem em [`mcp/movidesk/AGENTS.md`](../../mcp/movidesk/AGENTS.md).

## Estado confirmado pela documentação e pelo código

- Schema `beta` com `source_system`, `source_record` e `record_chunk`.
- Estado observado: `pgvector` está instalado; RLS ativo nas três tabelas. A busca lexical usa `record_chunk.search_vector` (`tsvector` + GIN) e a RPC `beta.search_knowledge()` aplicada em 2026-10-22. Ainda não há coluna/índice vetorial, modelo de embedding ou geração de vetores.
- ACLs antes observadas: `service_role`, `anon` e `authenticated` tinham grants de tabela amplos, embora somente `service_role` tivesse `USAGE` no schema. O usuário executou as migrations baseline e hardening e mostrou ambas em Local/Remote; confirmou que `knowledge_list_sources` continuou funcionando.
- Após o hardening, `service_role` lê `source_system`, sem DML direto em tabelas do schema `beta`. A migration `20261020140000_enable_movidesk_knowledge_ingestion.sql` foi aplicada remotamente conforme confirmação do usuário em 2026-10-20; concede ao `service_role` somente execução da RPC transacional.
- A Data API expõe o schema `beta` e as tabelas. Isso não substitui a autorização OAuth no MCP.
- A ferramenta inicial `knowledge_list_sources` exige `knowledge:read`, limita a resposta a dez fontes e consulta `beta.source_system`.
- O usuário confirmou que a chamada `knowledge_list_sources` via MCP/Sites retornou Movidesk, ClickUp e Documentos administrativos.
- A migration `20261022100000_add_knowledge_search.sql` criou `beta.search_knowledge()`, RPC somente leitura com limite de 10 resultados e filtro para registros não excluídos classificados como `internal` ou `shareable`. Só `service_role` pode executá-la; o MCP valida OAuth `knowledge:read`.
- A migration `20261022110000_rank_one_chunk_per_record.sql` limita cada resposta ao melhor trecho de cada registro, para que vários trechos de um chamado não ocultem outros casos. Foi aplicada remotamente em 2026-10-22.
- A migration `20261022120000_add_movidesk_protocol_search.sql` persiste o protocolo do Movidesk em `source_record.attributes.protocol` e adiciona busca exata/retorno desse identificador. Foi aplicada no projeto remoto em 2026-10-22. O usuário confirmou o registro `external_id = 5835` → `protocol = 20260702000000016`, com 14 trechos. O runtime MCP com suporte ao metadado está publicado no Site versão 104; a busca live pelo protocolo ainda precisa de teste ponta a ponta.
- A migration `20261022160000_expand_movidesk_ticket_ingestion.sql` amplia o teto coordenado de ingestão de chamados longos para 250 trechos auditados, mantendo no máximo 1.500 caracteres por trecho. Foi aplicada no projeto `ywqoanfqcbcdecmkguze` em 2026-10-22; a migration list confirmou `20261022160000` em Local e Remote. Foi preparada para o chamado `20260918000000203` (aproximadamente 295.715 caracteres textuais nos campos consultados). O rollback limita novas importações novamente a 50 trechos e preserva a restrição ampliada se já houver auditorias acima de 50.
- A busca usa `tsvector`/GIN e termos prefixados em OR para tolerar consultas em linguagem natural. Ainda não é busca semântica; não há coluna de embedding, modelo escolhido ou geração de vetores.
- A proposta `20261022170000_rank_knowledge_by_query_coverage.sql` ordena candidatos por cobertura dos termos da consulta (conteúdo 70%, título 20%, sinal de proximidade 10%), com relevância normalizada entre 0 e 1; consultas exatas por ID/protocolo permanecem com score 1. A migration e o rollback estão versionados, mas não foram aplicados nem verificados contra o corpus real. O teste SQL sintético está em `tests/knowledge_search_ranking.test.sql`.

## Migrações reproduzíveis

[`migrations/20261020120000_initial_knowledge_schema.sql`](./migrations/20261020120000_initial_knowledge_schema.sql) reproduz o baseline estrutural observado e não inclui dados. No projeto existente, o usuário registrou esse baseline como aplicado sem reexecutar seu DDL. [`migrations/20261020130000_harden_knowledge_read_grants.sql`](./migrations/20261020130000_harden_knowledge_read_grants.sql) foi aplicada pelo usuário e consta no histórico remoto; seu rollback está em [`rollback/20261020130000_restore_observed_knowledge_grants.sql`](./rollback/20261020130000_restore_observed_knowledge_grants.sql). A migration `20261020140000` adiciona a RPC `upsert_movidesk_knowledge_record`, tabela de auditoria e grants restritos e foi aplicada remotamente conforme confirmação do usuário; seu rollback remove a RPC e mantém dados e auditoria.

### Adoção no projeto já existente

O workspace local do Supabase CLI está em `infra/supabase/`; execute a partir da raiz do monorepo com `--workdir infra`. A configuração persistente não contém credenciais. Em 2026-10-22, o CLI confirmou as versões `20261020120000` a `20261022120000` em Local e Remote.

Histórico de adoção do banco existente:

1. Instalar/usar o Supabase CLI e autenticar-se localmente; não copiar senha do banco ou token pessoal para o chat, Git ou arquivo de configuração.
2. Vincular o workspace ao projeto ref `ywqoanfqcbcdecmkguze` e consultar `supabase migration list` para descobrir a história remota atual.
3. O baseline foi registrado como aplicado via `migration repair`, sem reexecutar o DDL; o usuário aplicou o hardening após prévia que mostrava somente a migration `20261020130000`.
4. Migration `20261020140000` aplicada em 2026-10-20 após prévia do usuário mostrar somente esse arquivo. O rollback correspondente desativa a RPC e preserva registros/auditoria.

Não usar `supabase db reset --linked` no projeto existente: esse comando pode apagar o schema/dados remotos. A referência do Supabase documenta `migration list` e `migration repair` para reconciliar os arquivos locais com a história remota; `repair` muda apenas o registro de migrations ([CLI reference](https://supabase.com/docs/reference/cli/supabase-migration-list), [database migrations guide](https://supabase.com/docs/guides/deployment/database-migrations)).

### Painel administrativo (migration aplicada)

A migration `20261020150000_admin_knowledge_overview.sql` adiciona uma RPC somente de leitura para o painel master do MCP. A migration `20261022130000_expand_recent_imports.sql` limita a resposta a no máximo 30 importações recentes, sem conteúdo dos trechos. A execução fica concedida somente a `service_role`; o backend continua exigindo sessão ChatGPT e papel master. O rollback de cada migration está em `rollback/`.

Esta migration foi aplicada remotamente em 2026-10-22. A validação ponta a ponta do painel e da rota correspondente ainda está pendente.

### Feedback e autodiagnóstico (migrations aplicadas)

A migration `migrations/20261022140000_feedback_diagnostics_schema.sql` cria o schema separado para feedback, palavras ofensivas, clusters revisáveis, auditoria mínima e agregados mensais por analista. Inclui RLS sem grants diretos e 10 RPCs restritas para gravação idempotente, listagem paginada, resumo, revisão, correção sem guardar valor anterior, remoção individual, remoção do histórico identificado (incluindo agregados) e limpeza/rollup. Foi aplicada ao Supabase em 2026-10-22; a execução confirmou a sintaxe/DDL, mas não substitui testes funcionais das RPCs. O Worker ainda precisa validar OAuth `feedback:write` para gravar e papel master para leitura/revisão/remoção. A versão vem após `expand_recent_imports` (`20261022130000`). A captura permanece desligada.

As migrations foram aplicadas com captura desligada. A criação do schema não inicia gravação de eventos; mantenha a captura desabilitada até a publicação/revisão de `/privacy` e `/terms` e a designação do contato organizacional. Veja o estado canônico em [`DOSSIER.md`](./DOSSIER.md#modelagem-local-de-feedbackautodiagnóstico-2026-10-22).

A migration separada `20261022150000_schedule_feedback_retention.sql` registra no Supabase Cron uma execução horária da limpeza/rollup e remove diariamente somente o histórico dos dois jobs da Beta com mais de sete dias. `pg_cron` foi habilitado pelo usuário e confirmado por consulta somente leitura em 2026-10-22; as migrations foram aplicadas e ambos os jobs constam ativos. Ainda não há execução registrada; consultar o histórico para confirmar a primeira execução bem-sucedida. O rollback `rollback/20261022150000_unschedule_feedback_retention.sql` remove somente os dois jobs da Beta, sem desativar a extensão compartilhada.

## Segredos e configuração

Configurar no ambiente do servidor apenas `SUPABASE_URL` e `SUPABASE_SECRET_KEY`, com valores guardados no gerenciador de segredos do host. Nunca colocar a chave secreta em arquivos do plugin, navegador, commits ou contexto retornado ao modelo. Uma chave compartilhada anteriormente na conversa foi considerada comprometida; usar apenas uma chave rotacionada e ativa.

O acesso service-role ignora RLS. A autorização do usuário, classificação, filtros por cliente e limites de contexto devem ser aplicados pelo backend antes de responder. Manter operações estreitas e seleção explícita de colunas.

## Próximos passos

A lista ativa de tarefas, suas prioridades e condições de conclusão fica em [`DOSSIER.md#próximos-passos`](./DOSSIER.md#próximos-passos). Atualize esse backlog ao identificar trabalho novo e retire itens somente após confirmar a resolução.
4. Implementar busca lexical/híbrida de trechos, filtros de acesso e citações antes de usar a base para diagnósticos.
5. Definir política de ingestão em lote, atualização/removação de origem, retenção, backups e recuperação.
