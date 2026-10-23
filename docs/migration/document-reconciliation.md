# Reconciliação de AGENTS, dossiers e documentos

O objetivo é manter instruções ativas junto ao componente e preservar as versões históricas completas sem fundir regras incompatíveis silenciosamente.

Atualização de 2026-10-22: referências `legacy/...` nesta reconciliação descrevem a árvore histórica no commit `fd7c090bb25b7b9086de9ebea38a1680df6bddb4`. A pasta foi removida da árvore ativa; recupere esses arquivos pelo histórico Git.

| Documento de origem | Preservação no monorepo | Uso atual |
|---|---|---|
| AGENTS do workspace Beta | `AGENTS.md` revisado; original idêntico em `docs/migration/source-documents/beta-workspace/AGENTS.md` | Regras globais e mapa do monorepo |
| Arquitetura compartilhada do workspace Beta | `docs/architecture/arquitetura-base-compartilhada-beta.md`; original também em `docs/migration/source-documents/beta-workspace/` | Fonte de decisões da base compartilhada |
| AGENTS, DOSSIER, README, CONVERSA_LEGADA e arquitetura do MCP remoto | `mcp/movidesk/` pela história subtree | Operação atual do MCP; dossier histórico/probatório |
| Versões locais desses documentos no checkout MCP | `docs/migration/source-documents/mcp-local/` e, para todo o diff, snapshot histórico em `legacy/local-snapshots/` no commit `fd7c090bb25b7b9086de9ebea38a1680df6bddb4` | Referência para reconciliar conteúdo recente local ainda não enviado; recuperável pelo histórico Git |
| AGENTS do plugin | `plugins/beta/AGENTS.md` pela história subtree | Regras de plugin e skills |
| Documentação do suite antigo | `legacy/suite-beta/` e seus componentes em `legacy/source-archives/` no commit `fd7c090bb25b7b9086de9ebea38a1680df6bddb4` | Recuperação pelo histórico Git e comparação histórica |

O `DOSSIER.md` raiz resume as decisões entre componentes; ele não substitui os dossiers do MCP nem as fontes completas do plugin. `source-inventory.md` e o histórico Git registram proveniência. Uma divergência entre a versão local MCP e `main` não foi aplicada automaticamente ao runtime: as versões locais foram preservadas para revisão e a versão remota mais recente é a base ativa.

## Contexto documental incremental

1. Antes de uma alteração, ler `AGENTS.md` da raiz e o AGENTS do componente; ler o DOSSIER do componente para evidência histórica.
2. Atualizar instruções quando uma regra operacional mudar e o dossier quando mudar estado, decisão, publicação ou evidência.
3. Conservar a formulação histórica em `docs/migration/source-documents/` e no histórico Git; registrar novas decisões com data e estado sem reescrever decisões antigas.
4. Se um conflito não puder ser resolvido a partir do código ou da autorização do usuário, registrar a divergência e deixar a decisão pendente.
