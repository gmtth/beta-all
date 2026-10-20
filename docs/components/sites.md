# Sites e publicação do runtime

O código do Site e do endpoint MCP HTTP está em `mcp/movidesk/`. A raiz publicada anteriormente era `https://movidesk-oauth-proxy-pkce.thngrns.chatgpt.site/`; o endpoint MCP configurado pelo plugin termina em `/mcp/`.

## Site em produção

Em 2026-10-20, a integração Sites retornou o projeto `Beta MCP` ativo, com versão publicada 73 e deployment `appgdep_6ad73a9f28388191bb62480b2b452ec5`. A versão 73 registra o commit-fonte `5c26eac6ca78b2eb71093b246efc7b9afe0e0efb`, arquivo de publicação de 98 arquivos e 1.894.400 bytes. O dossier MCP registra que esse commit da origem Cloudflare Artifact contém os arquivos de runtime/documentação do `main` GitHub observado naquela publicação.

O armazenamento de fonte usado pela publicação do Sites é separado do GitHub e não veio vinculado como remote ao resultado de leitura do projeto. A versão publicada continua disponível como versão Sites para rollback. O conteúdo-fonte equivalente do `main` está em `mcp/movidesk/`; a publicação não foi alterada durante esta consolidação.

## Snapshots e origens antigas

O checkout MCP local contém snapshots Git das versões do Site e um pacote `work/oauth-proxy` sem histórico Git. Os históricos das árvores `work/sites-beta-mcp-20261020*` e do antigo projeto `work/movidesk-site` foram importados em `legacy/source-archives/`. O pacote `work/oauth-proxy` e os artefatos exclusivos de preservação do antigo `source-bundle` ficam em `legacy/artifacts/site-snapshots/`, excluindo dependências e caches reproduzíveis. O manifesto de migração registra os commits e hashes.

A origem `work/movidesk-site` refere-se a outro projeto Sites (`appgprj_6a7e285d4458819182045de12c19a44a`), diferente do projeto `Beta MCP` atual. Seu código fica no legado; não substituir uma origem pela outra.

## Próxima publicação

A importação para o monorepo não publica alterações. Antes de mudar a origem de publicação, verificar o empacotamento a partir do diretório canônico, preservar a audiência atual e registrar SHA e versão publicada. Manter a configuração de produção atual até confirmar o novo fluxo e a compatibilidade do cliente MCP.
