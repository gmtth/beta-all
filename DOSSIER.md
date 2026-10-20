# Dossier da Beta — índice do contexto

Atualizado em 2026-10-20. Este dossier é o índice executivo; dossiers completos e instruções específicas continuam junto aos respectivos componentes e nas cópias documentais de migração.

## Objetivo do produto

A Beta é uma assistente compartilhada por quatro analistas. Deve diagnosticar problemas de máquinas usando principalmente chamados históricos do Movidesk, complementar casos de erro do programa no ClickUp e responder sobre processos administrativos aprovados. A consulta diária deve usar uma cópia sincronizada, indexada no Supabase/PostgreSQL com `pgvector`, com busca lexical e semântica, proveniência, filtragem de acesso e perguntas de esclarecimento quando faltarem dados.

Deve analisar com rigor de analista sênior e responder em linguagem funcional, natural e profissional. Não revela raciocínio privado, ferramentas, arquitetura privilegiada ou informação interna a usuários sem autorização. Hipóteses e recorrência não se tornam fatos ou procedimentos sem validação humana.

## Componentes e fontes de verdade

| Componente | Local canônico | Origem da importação | Estado |
|---|---|---|---|
| Plugin e skills | `plugins/beta/` | `gmtth/plugin-beta` | Ativo; regras em `AGENTS.md` e histórico/estado em `DOSSIER.md` |
| MCP/OAuth e runtime Sites | `mcp/movidesk/` | `gmtth/movidesk-mcp-oauth` | Ativo; dossier completo junto ao componente |
| Banco e API Supabase | `infra/supabase/` e integração MCP | Projeto Supabase e integração MCP | Listagem MCP e hardening validados; migration de ingestão aplicada; painel admin com diagnósticos ampliados publicado no Sites v79; migration dos indicadores ainda pendente; importação piloto pendente de reautorização |
| Publicação Sites | `mcp/movidesk/` e `docs/components/sites.md` | Sites/Cloudflare Artifact e snapshots | Fonte Sites é separada do GitHub; `sites:workflow` isola o helper e faz pré-voo de projeto, dependências, build e pacote antes do commit/push; versão 79 publicada |
| Dossiês e arquitetura | `docs/`, `DOSSIER.md` | workspace Beta, MCP, plugin e suite histórica | Ativos separados de snapshots e arquivos históricos |
| Agregador antigo/subskills históricas | `legacy/` | `gmtth/suite-beta` e submódulos | Preservados para comparação e recuperação |

## Decisões importantes

- `gmtth/beta-all` é o único repositório de trabalho desejado. Componentes continuam organizados por diretório e podem ser trabalhados/publicados separadamente.
- O marketplace GitHub do plugin Beta está definido em `.agents/plugins/marketplace.json` e referencia o pacote canônico `plugins/beta/`. A configuração/importação no workspace e o teste de uso pelos quatro analistas ainda estão pendentes; ver [`docs/components/plugin-marketplace.md`](docs/components/plugin-marketplace.md).
- Plugin e MCP ficam como arquivos editáveis no monorepo; submódulos não são dependências de desenvolvimento.
- Supabase é a base compartilhada para catálogo, registros de origem e trechos pesquisáveis; a chave de serviço fica apenas no ambiente seguro do servidor.
- `movidesk:read`, `knowledge:read` e `knowledge:write` são capacidades separadas. O usuário autorizou importar para a base interna apenas chamados explicitamente indicados; alterações em tickets do Movidesk e ingestão em massa continuam fora do escopo.
- `beta-all` é o repositório de trabalho ativo. As origens relacionadas foram preservadas e arquivadas conforme o inventário; não presumir que Sites ou integrações externas já publiquem a partir do monorepo.

### Telemetria do painel no Sites (2026-10-20)

- Decisão do usuário: gráficos e métricas de uso/erros devem contabilizar chamadas das ferramentas MCP no ambiente Sites; não usar Supabase para esse fim.
- Implementação local em `mcp/movidesk/`: eventos mínimos no D1 do Sites, endpoint administrativo separado dos indicadores Supabase, gráfico de chamadas por ferramenta, erros diários em 30 dias e lista dos dez erros mais recentes. Retenção de até 90 dias.
- Os eventos não contêm identidade, argumentos, conteúdo de retorno nem mensagens brutas de erro. A tabela é declarada em Drizzle e possui migration própria; o Worker também garante criação idempotente.
- Estado: implementação local nesta branch; build, publicação e confirmação de métricas reais ainda pendentes. Ver `mcp/movidesk/DOSSIER.md` para detalhes.

## Migração e rastreabilidade

`docs/migration/` registra repositórios, SHAs, comparação documental, estado local não reconciliado e critérios de corte. A tabela acima encaminha para cada fonte operacional canônica. `legacy/` e `docs/migration/source-documents/` são evidência histórica, não instruções atuais. O dossier do plugin foi reconstruído retroativamente com base no snapshot importado, nas instruções e nos arquivos históricos disponíveis; não é uma transcrição integral das conversas originais.

## Estado da consolidação (2026-10-20)

- Plugin, MCP, agregador legado e repositórios históricos relacionados foram importados em `plugins/`, `mcp/` e `legacy/`, com proveniência em `docs/migration/SOURCE_IMPORTS.tsv`. As instruções originais do plugin foram preservadas; seu dossier retroativo agora acompanha o componente e informa limites de reconstrução.
- A branch remota `feat/supabase-knowledge-read-scope` foi preservada integralmente em `legacy/source-archives/mcp-feature-supabase-scope/`. Como divergiu e ficou 28 commits atrás do `main`, sua versão antiga não substitui o MCP canônico; as capacidades de `knowledge:read` e `knowledge_list_sources` já estão no componente ativo.
- O estado local não enviado do checkout MCP original foi preservado como história/patch/snapshot em `legacy/`; o checkout de origem não foi alterado.
- Os snapshots do Sites e artefatos locais sem Git têm manifestos SHA-256. O Site publicado `Beta MCP` permanece na versão 73 (deployment `appgdep_6ad73a9f28388191bb62480b2b452ec5`). A revisão 13 do ambiente inclui `SUPABASE_URL` e `SUPABASE_SECRET_KEY`; o usuário confirmou a rotação/substituição da chave. Após reautorizar `knowledge:read`, confirmou que a listagem MCP retornou as três fontes. Isso valida essa leitura via Sites/Supabase; busca diagnóstica continua pendente. Não houve republicação durante a consolidação.
- Verificações registradas em `AGENTS.md`: validadores do plugin e catálogo semântico passaram; build MCP passou; suíte MCP teve 71 de 72 casos aprovados, com uma expectativa de texto já divergente da página na origem importada. A instalação reportou 35 vulnerabilidades na árvore de dependências, sem correções automáticas.
- O catálogo real do Supabase foi compartilhado sem linhas de dados e usado para preparar baseline e hardening de grants. O usuário registrou/aplicou essas duas migrations e confirmou que a listagem MCP continuou funcionando. A migration `20261020140000` para RPC de ingestão foi aplicada remotamente conforme screenshot do usuário em 2026-10-20.

## Primeira alteração controlada de ACLs e implementação da ingestão (2026-10-20)

- O usuário compartilhou a saída de `supabase migration list` mostrando `20261020120000` e `20261020130000` registrados em Local e Remote. Após a migração de grants, confirmou novamente que o MCP lista Movidesk, ClickUp e Documentos administrativos. Isso comprova a leitura do catálogo após o hardening.
- A implementação local adiciona `knowledge:write` e a ferramenta `knowledge_import_movidesk_ticket`, que também exige `movidesk:read`, usa a identidade autenticada para auditoria e importa somente o ID explicitamente informado. O código remove padrões detectáveis de e-mail, CPF/CNPJ, telefone rotulado e URL, limita tamanho e campos estruturados e grava a classificação `internal`.
- A migration `20261020140000_enable_movidesk_knowledge_ingestion.sql` foi aplicada remotamente conforme confirmação do usuário em 2026-10-20. Cria RPC transacional com upsert e substituição atômica de trechos, sem conceder DML direto ao `service_role`; registra eventos com e-mail autenticado. Existe rollback que desativa a função e preserva registros/auditoria.
- A versão 74 do runtime MCP foi publicada com sucesso em 2026-10-20 no Sites; GET aos metadados OAuth confirmou os três scopes. Reautorização por analista e importação piloto ainda pendentes.
- **Estado:** código, migration e verificações locais em andamento nesta branch; nenhuma publicação Sites, alteração remota dessa nova migration nem importação do chamado `20260702000000016` foi realizada nesta implementação local. O teste pedido para o chamado depende da revisão/aplicação da migration, publicação do runtime, nova autorização `knowledge:write` e invocação explícita da ferramenta.

## Painel administrativo e refinamento da conexão (2026-10-20)

- Foi preparado localmente um painel master de controle em `/admin/users` que agrega disponibilidade/latência do Supabase, contagens da base, fontes, importações recentes e escopos realmente presentes nos tokens ativos de cada analista.
- A conexão foi alinhada à variável server-side `SUPABASE_SECRET_KEY` e valida o endpoint `beta.source_system`. Nenhuma chave ou erro bruto é devolvido à interface.
- A RPC agregada `beta.get_knowledge_admin_overview()` e migration `20261020150000` ainda não foram aplicadas ao banco. A conexão pode estar disponível, mas os indicadores agregados aguardam a migration.
- O painel e o fluxo OAuth atualizado foram publicados no Sites v75; commit GitHub `53a0fc0` na branch `codex/knowledge-ticket-ingestion`; deployment `appgdep_6ad7c07e1d548191a4f3ff1283f93926`. A audiência permaneceu pública.
- Na página de consentimento OAuth, o envio ocorre automaticamente após dez segundos; o usuário também pode autorizar antes ou cancelar.

## Corte operacional concluído e pendências técnicas

- O corte do GitHub foi concluído: `gmtth/beta-all` está privado e ativo; `plugin-beta` foi tornado privado e arquivado; `movidesk-mcp-oauth`, `skill-clickup-checklist` e `skill-clickup-sprint-export` foram arquivados (já privados). Repositórios históricos anteriormente privados/arquivados continuam assim.
- O push foi validado por clone limpo no Windows. Não há gitlinks/submódulos ativos; os 400 itens cobertos pelos quatro manifestos SHA-256 conferem com os bytes preservados.
- A configuração do plugin aponta para o endpoint publicado do MCP/Sites. O Site `Beta MCP` continua na versão 73; nenhuma publicação foi feita durante o corte. A publicação futura deve partir do diretório apropriado no monorepo.
- O catálogo real Supabase foi fornecido sem linhas de dados e usado para preparar baseline e hardening de grants em `infra/supabase/migrations/`, mais um rollback. Nada foi aplicado; ainda falta definir o fluxo de baseline para o banco existente e revisar/aplicar a migration incremental com controle de rollback.
