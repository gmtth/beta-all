# Inventário de migração

Data do inventário: 2026-10-20. A importação preserva os repositórios-fonte intactos. Os commits foram importados no histórico deste monorepo por `git subtree`; snapshots legados não são dependências dos componentes ativos.

## Componentes ativos importados

| Origem | Commit importado | Destino |
|---|---|---|
| `gmtth/plugin-beta` (`main`) | `f63afd20d346cd666c2f2b7908683be76eb16ea5` | `plugins/beta/` |
| `gmtth/movidesk-mcp-oauth` (`main`) | `271dbdd8e0995a19b8e4debb88b5ec5db16372a9` | `mcp/movidesk/` |
| `gmtth/suite-beta` (`main`) | `ad32de455c9de06901f9bf6711a5a66f53ea9971` | `legacy/suite-beta/` |

O plugin contém manifesto, instruções, skills e referências, assets, testes e scripts versionados na origem. O MCP contém OAuth, API, ferramentas MCP, runtime do Sites e documentação versionada.

## Projetos históricos e skills independentes

O antigo `suite-beta` listava 14 submódulos. Cada repositório foi importado com seu histórico em `legacy/source-archives/`: `plugin-beta-mov` (`56619920`), `skill-beta-clk-checklist` (`07107e92`), `skill-beta-mod` (`db36d5c1`), `skill-beta-mod-artefatos` (`17842cb4`), `skill-beta-mod-dossie` (`b1d90d37`), `skill-beta-mod-figma` (`f5b66046`), `skill-beta-mod-fluxos` (`877a09b0`), `skill-beta-mod-fontes` (`c4d465f7`), `skill-beta-mod-permissoes` (`51f09293`), `skill-beta-mod-processamento` (`71f44ccc`), `skill-beta-mod-qa` (`2f895707`), `skill-beta-mod-regras` (`2d9ffd39`), `skill-beta-mod-relatorios` (`1893d872`) e `skill-beta-sites` (`f3d85b0e`). Para `skill-beta-sites`, `main` era mais novo que o commit fixado `80d858a0`; ambos permanecem alcançáveis na história importada.

Também foram trazidos para `legacy/source-archives/` `legacy-movimcp`, `skill-clickup-checklist` e `skill-clickup-sprint-export`. As duas skills ClickUp não constavam do manifesto nem da árvore ativa do `plugin-beta` importado; foram preservadas como skills independentes, sem alterar o roteamento nesta consolidação.

## Estado local MCP preservado

O checkout `D:\Google Drive\Documents\ChatGPT\MCP Movidesk` tinha cinco commits locais exclusivos e mudanças não commitadas. O remoto avançara e já continha funcionalidades que faltavam ao `main` local. O branch local foi preservado em `legacy/source-archives/mcp-local-branch/`; o patch das mudanças rastreadas foi guardado em `legacy/local-snapshots/mcp-2026-10-20/working-tree.patch`; seis arquivos não rastreados foram copiados para `untracked/`. As cópias originais continuam intactas no checkout anterior.

## Artefatos de release do workspace

Os ZIPs RC1/RC2, os diretórios extraídos e o pacote de staging `_suite-beta-package-rc2` foram copiados sem mover os originais para `legacy/artifacts/releases/`. `SHA256SUMS.txt` registra hashes para conferência.

## Limites

- Dados reais do Movidesk/ClickUp e credenciais Supabase não foram exportados ao Git.
- Nenhuma alteração de visibilidade, arquivamento, branch, publicação ou dados do Supabase foi feita durante a importação.
- Os repositórios ativos/legados originais ficam intactos até validar o clone limpo, publicação por componente e dependências externas.
