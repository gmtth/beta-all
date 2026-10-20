# Supabase da base de conhecimento

O projeto Supabase escolhido para o piloto usa PostgreSQL e `pgvector`. A integração do MCP acessa a Data API/PostgREST por HTTPS a partir do servidor; o runtime Workers não abre conexão TCP direta ao PostgreSQL.

Para o estado, decisões, evidências e ordem de prontidão, consulte [`DOSSIER.md`](./DOSSIER.md). Este README é o guia operacional resumido; instruções do runtime MCP permanecem em [`mcp/movidesk/AGENTS.md`](../../mcp/movidesk/AGENTS.md).

## Estado confirmado pela documentação e pelo código

- Schema `beta` com `source_system`, `source_record` e `record_chunk`.
- Estado implantado observado: `pgvector` está instalado; RLS ativo nas três tabelas. Não foram encontradas políticas, coluna/índice vetorial, RPC ou trigger. A busca atual no banco é lexical via `tsvector` + GIN.
- ACLs antes observadas: `service_role`, `anon` e `authenticated` tinham grants de tabela amplos, embora somente `service_role` tivesse `USAGE` no schema. O usuário executou as migrations baseline e hardening e mostrou ambas em Local/Remote; confirmou que `knowledge_list_sources` continuou funcionando.
- Após o hardening, `service_role` lê `source_system`, sem DML direto em tabelas do schema `beta`. A migration `20261020140000_enable_movidesk_knowledge_ingestion.sql` foi aplicada remotamente conforme confirmação do usuário em 2026-10-20; concede ao `service_role` somente execução da RPC transacional.
- A Data API expõe o schema `beta` e as tabelas. Isso não substitui a autorização OAuth no MCP.
- A ferramenta inicial `knowledge_list_sources` exige `knowledge:read`, limita a resposta a dez fontes e consulta `beta.source_system`.
- O usuário confirmou que a chamada `knowledge_list_sources` via MCP/Sites retornou Movidesk, ClickUp e Documentos administrativos.

## Migrações reproduzíveis

[`migrations/20261020120000_initial_knowledge_schema.sql`](./migrations/20261020120000_initial_knowledge_schema.sql) reproduz o baseline estrutural observado e não inclui dados. No projeto existente, o usuário registrou esse baseline como aplicado sem reexecutar seu DDL. [`migrations/20261020130000_harden_knowledge_read_grants.sql`](./migrations/20261020130000_harden_knowledge_read_grants.sql) foi aplicada pelo usuário e consta no histórico remoto; seu rollback está em [`rollback/20261020130000_restore_observed_knowledge_grants.sql`](./rollback/20261020130000_restore_observed_knowledge_grants.sql). A migration `20261020140000` adiciona a RPC `upsert_movidesk_knowledge_record`, tabela de auditoria e grants restritos e foi aplicada remotamente conforme confirmação do usuário; seu rollback remove a RPC e mantém dados e auditoria.

### Adoção no projeto já existente

O workspace local do Supabase CLI está em `infra/supabase/`; execute a partir da raiz do monorepo com `--workdir infra`. A configuração usa um `project_id` local e não contém credenciais. A saída do CLI fornecida pelo usuário confirmou as versões `20261020120000` e `20261020130000` no histórico remoto.

Fluxo para a migration de ingestão, ainda sem aplicar ao remoto:

1. Instalar/usar o Supabase CLI e autenticar-se localmente; não copiar senha do banco ou token pessoal para o chat, Git ou arquivo de configuração.
2. Vincular o workspace ao projeto ref `ywqoanfqcbcdecmkguze` e consultar `supabase migration list` para descobrir a história remota atual.
3. O baseline foi registrado como aplicado via `migration repair`, sem reexecutar o DDL; o usuário aplicou o hardening após prévia que mostrava somente a migration `20261020130000`.
4. Migration `20261020140000` aplicada em 2026-10-20 após prévia do usuário mostrar somente esse arquivo. O rollback correspondente desativa a RPC e preserva registros/auditoria.

Não usar `supabase db reset --linked` no projeto existente: esse comando pode apagar o schema/dados remotos. A referência do Supabase documenta `migration list` e `migration repair` para reconciliar os arquivos locais com a história remota; `repair` muda apenas o registro de migrations ([CLI reference](https://supabase.com/docs/reference/cli/supabase-migration-list), [database migrations guide](https://supabase.com/docs/guides/deployment/database-migrations)).

### Painel administrativo (preparação local)

A migration `20261020150000_admin_knowledge_overview.sql` adiciona uma RPC somente de leitura para o painel master do MCP. Ela retorna contagens por fonte e até dez importações recentes, sem conteúdo dos trechos. A execução fica concedida somente a `service_role`; o backend continua exigindo sessão ChatGPT e papel master. O rollback remove apenas a função.

Esta migration está preparada no repositório, mas ainda não foi aplicada ao Supabase. Até sua aplicação e publicação do runtime correspondente, o painel pode mostrar a conexão online e os indicadores de conhecimento indisponíveis.

## Segredos e configuração

Configurar no ambiente do servidor apenas `SUPABASE_URL` e `SUPABASE_SECRET_KEY`, com valores guardados no gerenciador de segredos do host. Nunca colocar a chave secreta em arquivos do plugin, navegador, commits ou contexto retornado ao modelo. Uma chave compartilhada anteriormente na conversa foi considerada comprometida; usar apenas uma chave rotacionada e ativa.

O acesso service-role ignora RLS. A autorização do usuário, classificação, filtros por cliente e limites de contexto devem ser aplicados pelo backend antes de responder. Manter operações estreitas e seleção explícita de colunas.

## Próximas etapas

1. Publicar o runtime do MCP que implementa a RPC e as ferramentas de conhecimento; confirmar versão/deployment.
2. Reautorizar a conexão MCP com `movidesk:read`, `knowledge:read` e `knowledge:write`.
3. Importar explicitamente o chamado piloto `20260702000000016`; conferir o resumo de importação e a presença do registro/trechos no Supabase sem expor conteúdo pessoal.
4. Implementar busca lexical/híbrida de trechos, filtros de acesso e citações antes de usar a base para diagnósticos.
5. Definir política de ingestão em lote, atualização/removação de origem, retenção, backups e recuperação.
