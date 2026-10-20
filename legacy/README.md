# Conteúdo legado

`legacy/` guarda versões e projetos substituídos como fonte ativa que precisam continuar disponíveis para auditoria e recuperação. Os componentes ativos ficam em `plugins/beta/`, `mcp/movidesk/` e `infra/supabase/`.

- `source-archives/`: repositórios antigos importados com `git subtree`, sem dependência de submódulos. Consulte como histórico, não como destino do trabalho diário.
- `suite-beta/`: árvore do agregador antigo, sem gitlinks ativos. As fontes de seus antigos submódulos estão em `source-archives/`.
- `source-archives/movidesk-site-artifact/` e `sites-beta-mcp-snapshot-*`: históricos de Sites locais. O projeto antigo `movidesk-site-artifact` é distinto do Site ativo `Beta MCP`.
- `local-snapshots/mcp-2026-10-20/`: patch das alterações rastreadas não commitadas e cópia dos arquivos não rastreados do checkout MCP daquela data.
- `artifacts/releases/`: pacotes locais originais, com proveniência e hashes.
- `artifacts/site-snapshots/` e `artifacts/source-bundle-preservation-*`: cópias de código/artefatos locais sem histórico Git, excluindo caches e dependências reproduzíveis; cada snapshot tem `SHA256SUMS.txt`.

Não excluir conteúdo desta área sem confirmar que seus arquivos e história estão preservados em outro caminho do próprio `beta-all`.
