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

## Pendências de conclusão

- Preservar e comparar o estado local não enviado do checkout MCP, incorporando apenas diferenças únicas e úteis sem descartar a cópia original.
- Inventariar todos os repositórios antigos ligados ao `suite-beta`; manter conteúdo histórico que não esteja na versão atual do plugin.
- Comparar dossiers/AGENTS completos e registrar conflitos e proveniência.
- Confirmar migrações Supabase reproduzíveis, build e publicação por componente e dependências externas.
- Só após validação, fazer o corte operacional e arquivar/privatizar os repositórios antigos relacionados.
