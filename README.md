# Beta — monorepositório

Este é o repositório único de trabalho da Beta. O plugin e suas skills, o MCP/OAuth e runtime do Sites, a integração Supabase e a documentação ficam organizados aqui, preservando a autonomia de build e publicação de cada componente.

## Estrutura

- `plugins/beta/`: plugin, manifesto, skills, referências, assets e validações.
- `mcp/movidesk/`: servidor MCP/OAuth, runtime publicado pelo Sites e documentação operacional.
- `infra/supabase/`: migrações reproduzíveis e instruções de configuração; nunca dados de chamados nem segredos.
- `docs/`: arquitetura compartilhada, decisões, documentação dos componentes, operação e migração.
- O antigo `legacy/` foi removido da árvore ativa; snapshots dessa pasta continuam no histórico Git anterior ao commit `fd7c090bb25b7b9086de9ebea38a1680df6bddb4`. Proveniência e documentos de migração estão em `docs/migration/`.
- `AGENTS.md` e `DOSSIER.md`: instruções globais e índice de contexto do monorepo.

## Trabalhar nos componentes

Leia primeiro o `AGENTS.md` da raiz e depois as instruções do componente. As origens do plugin, MCP e agregador histórico foram mantidas sem alterações durante a importação. Build, publicação, permissões e configuração dos componentes seguem seus próprios ciclos; veja `docs/components/` e `docs/operations/`.

O conteúdo operacional de Movidesk/ClickUp deve ser sincronizado para Supabase pelo pipeline de conhecimento. Não versionar exportações reais, dados pessoais, credenciais, `.env` ou chaves.

## Estado da consolidação

Consulte `DOSSIER.md` e `docs/migration/` para commits de origem, proveniência, itens históricos importados, verificações realizadas e pendências.
