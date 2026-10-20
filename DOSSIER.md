# Dossier da Beta — índice do contexto

Atualizado em 2026-10-20. Este dossier é o índice executivo; dossiers completos e instruções específicas continuam junto aos respectivos componentes e nas cópias documentais de migração.

## Objetivo do produto

A Beta é uma assistente compartilhada por quatro analistas. Deve diagnosticar problemas de máquinas usando principalmente chamados históricos do Movidesk, complementar casos de erro do programa no ClickUp e responder sobre processos administrativos aprovados. A consulta diária deve usar uma cópia sincronizada, indexada no Supabase/PostgreSQL com `pgvector`, com busca lexical e semântica, proveniência, filtragem de acesso e perguntas de esclarecimento quando faltarem dados.

Deve analisar com rigor de analista sênior e responder em linguagem funcional, natural e profissional. Não revela raciocínio privado, ferramentas, arquitetura privilegiada ou informação interna a usuários sem autorização. Hipóteses e recorrência não se tornam fatos ou procedimentos sem validação humana.

## Componentes e fontes de verdade

| Componente | Local canônico | Origem da importação | Estado |
|---|---|---|---|
| Plugin e skills | `plugins/beta/` | `gmtth/plugin-beta` | Importado nesta consolidação |
| MCP/OAuth e runtime Sites | `mcp/movidesk/` | `gmtth/movidesk-mcp-oauth` | Importado nesta consolidação |
| Banco e API Supabase | `infra/supabase/` e integração MCP | MCP remoto e documentos de arquitetura | Migrações/configuração ainda precisam de reconciliação |
| Dossiês e arquitetura | `docs/`, `DOSSIER.md` | workspace Beta, MCP, plugin e suite histórica | Fontes preservadas e consolidadas |
| Agregador antigo/subskills históricas | `legacy/` | `gmtth/suite-beta` e submódulos | Preservados para comparação e recuperação |

## Decisões importantes

- `gmtth/beta-all` é o único repositório de trabalho desejado. Componentes continuam organizados por diretório e podem ser trabalhados/publicados separadamente.
- Plugin e MCP ficam como arquivos editáveis no monorepo; submódulos não são dependências de desenvolvimento.
- Supabase é a base compartilhada para catálogo, registros de origem e trechos pesquisáveis; a chave de serviço fica apenas no ambiente seguro do servidor.
- `movidesk:read` permanece separado de `knowledge:read`; escrita no conhecimento exige escopo e aprovação específicos.
- Repositórios de origem permanecem intactos até a verificação do monorepo e das dependências externas. Arquivamento/privatização só ocorre no corte final, após confirmar que publicação e integrações apontam para o novo fluxo.

## Migração e rastreabilidade

`docs/migration/` registra repositórios, SHAs, comparação documental, estado local não reconciliado e critérios de corte. A história Git dos componentes deve ser mantida por importação subtree sempre que possível. `mcp/movidesk/DOSSIER.md`, AGENTS dos componentes e versões documentais preservadas continuam como fontes completas, sem substituição por este resumo.

## Estado da consolidação (2026-10-20)

- Plugin, MCP, agregador legado e repositórios históricos relacionados foram importados em `plugins/`, `mcp/` e `legacy/`, com proveniência em `docs/migration/SOURCE_IMPORTS.tsv`. Dossiers e instruções completos foram preservados junto aos componentes e em `docs/migration/source-documents/`.
- A branch remota `feat/supabase-knowledge-read-scope` foi preservada integralmente em `legacy/source-archives/mcp-feature-supabase-scope/`. Como divergiu e ficou 28 commits atrás do `main`, sua versão antiga não substitui o MCP canônico; as capacidades de `knowledge:read` e `knowledge_list_sources` já estão no componente ativo.
- O estado local não enviado do checkout MCP original foi preservado como história/patch/snapshot em `legacy/`; o checkout de origem não foi alterado.
- Os snapshots do Sites e artefatos locais sem Git têm manifestos SHA-256. O Site publicado `Beta MCP` permanece na versão 73; não houve republicação durante a consolidação.
- Verificações registradas em `AGENTS.md`: validadores do plugin e catálogo semântico passaram; build MCP passou; suíte MCP teve 71 de 72 casos aprovados, com uma expectativa de texto já divergente da página na origem importada. A instalação reportou 35 vulnerabilidades na árvore de dependências, sem correções automáticas.
- Não há DDL Supabase suficiente no material disponível para reconstruir migrações com segurança. `infra/supabase/migrations/` permanece sem migrações inventadas.

## Pendências para o corte operacional

- O corte do GitHub foi concluído: `gmtth/beta-all` está privado e ativo; `plugin-beta` foi tornado privado e arquivado; `movidesk-mcp-oauth`, `skill-clickup-checklist` e `skill-clickup-sprint-export` foram arquivados (já privados). Repositórios históricos anteriormente privados/arquivados continuam assim.
- O push foi validado por clone limpo no Windows. Não há gitlinks/submódulos ativos; os 400 itens cobertos pelos quatro manifestos SHA-256 conferem com os bytes preservados.
- A configuração do plugin aponta para o endpoint publicado do MCP/Sites. O Site `Beta MCP` continua na versão 73; nenhuma publicação foi feita durante o corte. A publicação futura deve partir do diretório apropriado no monorepo.
- Pendência técnica separada: obter e registrar o DDL/políticas reais do Supabase para criar migrações reproduzíveis. `infra/supabase/migrations/` não contém migrações inventadas; não afirmar que a infraestrutura pode ser recriada até obter essa fonte.
