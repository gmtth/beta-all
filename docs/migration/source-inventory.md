# Inventário de migração

Data do inventário: 2026-10-20. A importação preserva os repositórios-fonte intactos. Os commits foram importados no histórico deste monorepo por `git subtree`; snapshots legados não são dependências dos componentes ativos.

Atualização de 2026-10-22: o diretório `legacy/` foi removido da árvore ativa a pedido do usuário. Os destinos `legacy/...` abaixo registram onde os artefatos estavam na árvore do commit `fd7c090bb25b7b9086de9ebea38a1680df6bddb4` e continuam recuperáveis pelo histórico Git. `SOURCE_IMPORTS.tsv` permanece como manifesto histórico de proveniência.

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

A branch remota `feat/supabase-knowledge-read-scope` também foi preservada com seu histórico completo em `legacy/source-archives/mcp-feature-supabase-scope/` (HEAD `7b63eb62`). Ela contém 16 commits exclusivos em relação ao `main` observado na migração, incluindo a implementação inicial do escopo `knowledge:read`, ferramenta `knowledge_list_sources`, testes e documentação. A versão importada do `main` já contém a funcionalidade de leitura e o escopo; a branch divergiu e está 28 commits atrás do `main`, então sua versão antiga não foi aplicada sobre o componente canônico. Use-a como fonte histórica para comparar decisões e requisitos.

## Artefatos de release do workspace

Os ZIPs RC1/RC2, os diretórios extraídos e o pacote de staging `_suite-beta-package-rc2` foram copiados sem mover os originais para `legacy/artifacts/releases/`. `SHA256SUMS.txt` registra hashes para conferência.

## Snapshots locais do Sites

O `work/movidesk-site` é uma origem Sites antiga, distinta do projeto Beta MCP publicado, e foi importado com seu histórico como `legacy/source-archives/movidesk-site-artifact/`. Os dois snapshots locais `work/sites-beta-mcp-20261020` e `work/sites-beta-mcp-20261020-v2` também foram importados como históricos subtree em `legacy/source-archives/sites-beta-mcp-snapshot-v1/` e `...-v2/`. O pacote local sem `.git` em `work/oauth-proxy` foi copiado para `legacy/artifacts/site-snapshots/oauth-20261020/`; artefatos locais de `source-bundle` ficaram em `legacy/artifacts/source-bundle-preservation-2026-10-20/`. Ambos excluem dependências/caches reproduzíveis. Após o clone do marketplace falhar no checkout do Windows por nomes gerados longos em `dist/`, esse diretório foi arquivado como `dist.tar.gz`; seus 96 arquivos foram comparados com o manifesto original antes de retirar a árvore expandida do repositório. O hash do pacote está em `SHA256SUMS.package.txt`, e as instruções de restauração estão no README do snapshot.

O projeto Sites `Beta MCP` permanece publicado na versão 73 (commit de fonte `5c26eac6ca78b2eb71093b246efc7b9afe0e0efb`). A versão Sites arquivada tem 98 arquivos e 1.894.400 bytes. O clone local do snapshot `work/oauth-proxy` não contém a funcionalidade `knowledge_list_sources` e, portanto, não foi tratado como fonte ativa; o runtime atual foi importado do `main` GitHub em `mcp/movidesk/`.

O arquivo `SOURCE_IMPORTS.tsv` registra o SHA completo e o prefixo de destino para cada subtree. Os manifestos de `legacy/artifacts/releases/`, `legacy/artifacts/site-snapshots/` e `legacy/artifacts/source-bundle-preservation-2026-10-20/` registram hashes dos artefatos sem Git.

Os dois snapshots `sites-beta-mcp-snapshot-*` tinham um gitlink sem `.gitmodules` para `source-bundle` no commit `5c789e553424d0938649e7433fcb94c11de78ae1`, e o checkout não materializava seus arquivos. Os gitlinks foram removidos das árvores atuais para que o monorepo não dependa de um clone oculto; o conteúdo-fonte vendorizado do source-bundle está preservado em `legacy/source-archives/mcp-local-branch/source-bundle/` e os artefatos locais em `legacy/artifacts/source-bundle-preservation-2026-10-20/`.

## Limites

- Dados reais do Movidesk/ClickUp e credenciais Supabase não foram exportados ao Git.
- Nenhuma alteração de visibilidade, arquivamento, branch, publicação ou dados do Supabase foi feita durante a importação.
- Os repositórios ativos/legados originais ficam intactos até validar o clone limpo, publicação por componente e dependências externas.

## Corte operacional (2026-10-20)

O push de `main` de `gmtth/beta-all` foi validado por um clone limpo no Windows. A árvore não contém gitlinks ativos e os 400 arquivos listados nos manifestos SHA-256 conferem byte a byte. `gmtth/beta-all` permanece privado e ativo. `gmtth/plugin-beta` foi tornado privado e arquivado; `gmtth/movidesk-mcp-oauth`, `gmtth/skill-clickup-checklist` e `gmtth/skill-clickup-sprint-export` foram arquivados e já eram privados. Outros repositórios relacionados já estavam arquivados/privados no inventário.

O repositório MCP arquivado conserva branches remotas não importadas individualmente, além dos históricos explicitamente importados em `legacy/`; esses refs permanecem recuperáveis no GitHub. O endpoint do plugin continua apontando para o Site `Beta MCP` publicado na versão 73. A consolidação não alterou publicação ou dados do Supabase. A reconstrução do banco aguarda o DDL e as políticas reais.
