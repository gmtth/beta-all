# Contrato técnico da página `/admin/database`

**Estado:** contrato da Etapa 1 definido; execução da implementação ainda não iniciada.
**Atualizado:** 2026-10-21
**Branch de trabalho:** `feat/supabase-database-browser`

## Objetivo e limites

Criar um navegador administrativo Supabase, somente leitura, que exponha metadados de estrutura e prévias paginadas apenas das tabelas aprovadas em [`AGENTS.md`](./AGENTS.md). Não oferecer SQL genérico, escrita, KPIs, gráficos ou linhas de `record_chunk`. As métricas agregadas permanecem no painel de controle.

## Decisões já confirmadas

- Página administrativa `/admin/database`, protegida server-side para contas master.
- Tabelas e campos exibíveis seguem a política allowlist em `infra/supabase/AGENTS.md`; tabelas futuras são negadas por padrão.
- `source_system`: prévia dos campos `id`, `code`, `name`, `active`, `created_at`.
- `source_record`: prévia restrita a `id`, `source_system_id`, `external_id`, `record_type`, `status`, `classification`, `source_created_at`, `source_updated_at`, `imported_at`, `deleted_at`.
- `knowledge_ingest_audit`: prévia restrita a `id`, `source_record_id`, `operation`, `chunk_count`, `created_at`.
- `record_chunk`: metadados de estrutura apenas; nenhuma linha.
- Cada página retorna no máximo 25 linhas. Ordenação estável por ID: `source_system` em ordem crescente; registros e auditorias do ID mais alto para o mais baixo.
- `external_id` permanece na prévia restrita de `source_record`, para correlacionar o registro com a origem.
- A estrutura mostra estado de RLS e, por tabela, nomes e comandos das políticas. Nunca retorna expressões `USING`/`WITH CHECK` nem SQL das políticas.
- A página deve facilitar diagnóstico entre camadas: apresentar em conjunto o controle de acesso do Site/MCP e os privilégios/RLS do Supabase, sem fundir D1 com Supabase nem expor dados de tokens, credenciais ou regras SQL.
- A tela pode indicar faixa/número de linhas retornadas nesta página e estado da consulta, mas não totais, métricas ou gráficos.
- D1 do Sites não pertence a esta página.

## Contrato de acesso proposto

### Fronteira de autorização

1. Cada rota HTTP exige sessão ChatGPT válida e confirma o papel `master` no servidor usando o mecanismo existente.
2. A chave Supabase de servidor permanece no Worker; nunca chega ao navegador.
3. Como `service_role` ignora RLS e as tabelas têm privilégios diretos limitados/revogados, não fazer consultas diretas arbitrárias à Data API. Usar RPCs estreitas autorizadas somente a `service_role`; a checagem OAuth master continua obrigatória antes de invocá-las.
4. Respostas e logs não incluem credenciais, SQL interno, dados além da allowlist nem mensagens brutas do Supabase.

### RPCs previstas

- **RPC de schema, sem parâmetros:** retorna metadados somente de `beta.source_system`, `beta.source_record`, `beta.record_chunk` e `beta.knowledge_ingest_audit`. Permite colunas e tipos; PK/FK/unique; índices; estado RLS e informação de política definida pela decisão abaixo. Implementação fixa em `pg_catalog`, schema `beta` e nomes allowlisted; não aceita schema/tabela/coluna do cliente.
- **RPC de prévia:** recebe apenas `table_key`, `page_size` e `after_id`. `table_key` passa por enum estrito das três tabelas autorizadas para linhas. A implementação usa ramos SQL estáticos por tabela e projeções explícitas; proíbe interpolação de identificadores ou `SELECT *`. `page_size` é validado entre 1 e 25. O cursor é o último ID retornado; a resposta contém linhas autorizadas e `next_cursor` quando houver mais resultados.
- As funções usam `SECURITY DEFINER` com `search_path` fixo (`pg_catalog`), referências plenamente qualificadas, `REVOKE` de `PUBLIC`, `anon` e `authenticated`, e `GRANT EXECUTE` apenas para `service_role`. Revisar owner, privilégios e comportamento no projeto antes de aplicar migration.
- Não alterar `get_knowledge_admin_overview()` nem reutilizar seu payload para renderizar a tabela: ele existe para métricas do painel e retorna campos de auditoria (como identidade e título) que não pertencem à prévia genérica.

### API HTTP prevista

- `GET /api/admin/database/schema`: sessão + master; chama a RPC de schema e adapta o resultado para o contrato de interface.
- `GET /api/admin/database/preview?table=<key>&page_size=25&after_id=<id>`: sessão + master; valida enum/limites/cursor e chama a RPC de prévia.
- Chaves válidas no parâmetro são nomes lógicos fixos, não nomes SQL arbitrários. Valores inválidos retornam erro 400 sanitizado; falta de sessão/role retorna 401/403.
- Nenhum filtro/ordenador arbitrário na primeira entrega. A navegação para próxima página usa cursor; voltar usa a pilha de cursores já visitados no cliente, sem confiar nela para autorização.

## Desenho dos metadados estruturais

- **Colunas/tipos:** mostrar todas as colunas estruturais das quatro tabelas aprovadas, inclusive colunas de conteúdo de `record_chunk`, pois o schema é distinto dos valores das linhas. Evitar mostrar defaults SQL longos ou expressões geradas se não forem necessários para entender a estrutura.
- **Chaves:** identificar primary key, foreign key e unique constraints, com tabela/coluna de destino para relações dentro do schema `beta`.
- **Índices:** nome, método e colunas do índice; sem exibir expressões arbitrárias ou predicados SQL na primeira versão.
- **RLS:** estado habilitado/desabilitado, nomes das políticas e comandos (`SELECT`, `INSERT`, `UPDATE`, `DELETE`, `ALL`), sem `USING`/`WITH CHECK` ou expressões SQL.
- Metadados só de tabelas explicitamente enumeradas. O endpoint não deve virar uma listagem geral dos schemas internos do Supabase.

## Visão consolidada de permissões para diagnóstico

A tela deve explicar o caminho de autorização em camadas, não apresentar uma união de dados das bases:

1. **Site/MCP (aplicação):** exibir a exigência da página/API (`sessão ChatGPT + papel master`) e, na camada de ferramentas MCP, os papéis/scopes necessários quando forem relevantes. A lista individual de contas e tokens continua no painel de controle existente; evitar duplicar e-mails, estado de tokens ou segredos nesta rota.
2. **Supabase (banco):** para cada tabela mostrada, exibir privilégios efetivos/catalogados por papel PostgreSQL e estado RLS com nomes/comandos das políticas. Não exibir condição SQL, credencial, chave, token ou dados de usuário.
3. **Relação entre camadas:** indicar que o Worker usa credencial `service_role`, que ignora RLS; portanto, o gate master da rota é essencial e os privilégios/RPCs do banco continuam sendo defesa adicional. Não sugerir que RLS esteja autorizando a conta ChatGPT.
4. **Fontes distintas:** o D1 do Sites contém contas OAuth, tokens e telemetria operacional; o Supabase contém schema `beta` e conhecimento. A rota não lê nem lista tabelas D1. Pode oferecer link ao painel de controle para consultar usuários/scopes quando necessário.

Para grants, apresentar somente o papel PostgreSQL, tabela/objeto e privilégios em formato normalizado (por exemplo, `service_role: EXECUTE` na RPC); nunca mostrar `service_role` key, credenciais ou configuração de conexão. A coleta deve ser restrita às quatro relações allowlisted e às RPCs associadas ao navegador.

## Autotestes da Etapa 2 (API/RPC)

- Conta sem sessão e papel não master não chegam às RPCs.
- Conta master pode obter schema e prévias permitidas.
- Nome de tabela desconhecido, `record_chunk` como prévia, page size inválido, cursor inválido e parâmetros extras não ampliam a consulta.
- As projeções não retornam `title`, `source_url`, `content_hash`, `attributes`, `actor_email`, `section_title`, `content` ou `search_vector`.
- Cursor/página não repete nem pula linhas estáveis em sequência sem alteração concorrente; contrato documenta que inserções concorrentes podem mudar as páginas seguintes por serem ordenadas por ID.
- Erros do Supabase são mapeados para categorias sanitizadas.
- Migração: funções existem, `search_path` é fixo, permissões são restritas e nenhuma tabela/linha é modificada.

## Testes manuais previstos para o usuário

Não pedir validação manual ainda. Quando houver um preview testável, solicitar que o usuário:

1. Abra a rota com uma conta master e confirme as quatro tabelas e a estrutura.
2. Abra prévias de `source_system`, `source_record` e `knowledge_ingest_audit`; confira nomes/ordem dos campos e 25 linhas no máximo.
3. Avance e volte páginas; confira que não há repetição entre páginas sem alterações concorrentes.
4. Confirme que `record_chunk` mostra estrutura, sem botão/rota/dados de prévia.
5. Teste a rota com conta analista (deve negar acesso), se houver uma sessão de teste disponível.
6. Confirme que não aparecem KPIs/gráficos nesta página e que o painel de controle continua igual.

## Bloqueio de execução remota

Este contrato não aplica migração no Supabase, não chama o banco de produção, não altera privilégios e não publica o Site. A migration só será escrita após revisar o mecanismo de metadados e apresentar o SQL para avaliação. Aplicação remota exige autorização explícita do usuário.
