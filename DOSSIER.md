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
| Banco e API Supabase | `infra/supabase/` e integração MCP | Projeto Supabase e integração MCP | Schema inicial confirmado; DDL/migrações reproduzíveis e ingestão ainda pendentes |
| Publicação Sites | `mcp/movidesk/` e `docs/components/sites.md` | Sites/Cloudflare Artifact e snapshots | Publicação atual documentada; origem de publicação a partir do monorepo precisa ser validada |
| Dossiês e arquitetura | `docs/`, `DOSSIER.md` | workspace Beta, MCP, plugin e suite histórica | Ativos separados de snapshots e arquivos históricos |
| Agregador antigo/subskills históricas | `legacy/` | `gmtth/suite-beta` e submódulos | Preservados para comparação e recuperação |

## Decisões importantes

- `gmtth/beta-all` é o único repositório de trabalho desejado. Componentes continuam organizados por diretório e podem ser trabalhados/publicados separadamente.
- O marketplace GitHub do plugin Beta está definido em `.agents/plugins/marketplace.json` e referencia o pacote canônico `plugins/beta/`. A configuração/importação no workspace e o teste de uso pelos quatro analistas ainda estão pendentes; ver [`docs/components/plugin-marketplace.md`](docs/components/plugin-marketplace.md).
- Plugin e MCP ficam como arquivos editáveis no monorepo; submódulos não são dependências de desenvolvimento.
- Supabase é a base compartilhada para catálogo, registros de origem e trechos pesquisáveis; a chave de serviço fica apenas no ambiente seguro do servidor.
- `movidesk:read` permanece separado de `knowledge:read`; escrita no conhecimento exige escopo e aprovação específicos.
- `beta-all` é o repositório de trabalho ativo. As origens relacionadas foram preservadas e arquivadas conforme o inventário; não presumir que Sites ou integrações externas já publiquem a partir do monorepo.

## Migração e rastreabilidade

`docs/migration/` registra repositórios, SHAs, comparação documental, estado local não reconciliado e critérios de corte. A tabela acima encaminha para cada fonte operacional canônica. `legacy/` e `docs/migration/source-documents/` são evidência histórica, não instruções atuais. O dossier do plugin foi reconstruído retroativamente com base no snapshot importado, nas instruções e nos arquivos históricos disponíveis; não é uma transcrição integral das conversas originais.

## Estado da consolidação (2026-10-20)

- Plugin, MCP, agregador legado e repositórios históricos relacionados foram importados em `plugins/`, `mcp/` e `legacy/`, com proveniência em `docs/migration/SOURCE_IMPORTS.tsv`. As instruções originais do plugin foram preservadas; seu dossier retroativo agora acompanha o componente e informa limites de reconstrução.
- A branch remota `feat/supabase-knowledge-read-scope` foi preservada integralmente em `legacy/source-archives/mcp-feature-supabase-scope/`. Como divergiu e ficou 28 commits atrás do `main`, sua versão antiga não substitui o MCP canônico; as capacidades de `knowledge:read` e `knowledge_list_sources` já estão no componente ativo.
- O estado local não enviado do checkout MCP original foi preservado como história/patch/snapshot em `legacy/`; o checkout de origem não foi alterado.
- Os snapshots do Sites e artefatos locais sem Git têm manifestos SHA-256. O Site publicado `Beta MCP` permanece na versão 73 (deployment `appgdep_6ad73a9f28388191bb62480b2b452ec5`). A revisão 13 do ambiente inclui os nomes `SUPABASE_URL` e `SUPABASE_SECRET_KEY`; valores secretos são mascarados e a validade/rotação da chave não pôde ser confirmada. Não houve republicação durante a consolidação.
- Verificações registradas em `AGENTS.md`: validadores do plugin e catálogo semântico passaram; build MCP passou; suíte MCP teve 71 de 72 casos aprovados, com uma expectativa de texto já divergente da página na origem importada. A instalação reportou 35 vulnerabilidades na árvore de dependências, sem correções automáticas.
- Não há DDL Supabase suficiente no material disponível para reconstruir migrações com segurança. `infra/supabase/migrations/` permanece sem migrações inventadas.

## Corte operacional concluído e pendências técnicas

- O corte do GitHub foi concluído: `gmtth/beta-all` está privado e ativo; `plugin-beta` foi tornado privado e arquivado; `movidesk-mcp-oauth`, `skill-clickup-checklist` e `skill-clickup-sprint-export` foram arquivados (já privados). Repositórios históricos anteriormente privados/arquivados continuam assim.
- O push foi validado por clone limpo no Windows. Não há gitlinks/submódulos ativos; os 400 itens cobertos pelos quatro manifestos SHA-256 conferem com os bytes preservados.
- A configuração do plugin aponta para o endpoint publicado do MCP/Sites. O Site `Beta MCP` continua na versão 73; nenhuma publicação foi feita durante o corte. A publicação futura deve partir do diretório apropriado no monorepo.
- Pendência técnica separada: obter e registrar o DDL/políticas reais do Supabase para criar migrações reproduzíveis. `infra/supabase/migrations/` não contém migrações inventadas; não afirmar que a infraestrutura pode ser recriada até obter essa fonte.
