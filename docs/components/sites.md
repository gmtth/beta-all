# Sites e publicação do runtime

O código do Site e do endpoint MCP HTTP está em `mcp/movidesk/`. A raiz publicada anteriormente era `https://movidesk-oauth-proxy-pkce.thngrns.chatgpt.site/`; o endpoint MCP configurado pelo plugin termina em `/mcp/`.

Atualização de 2026-10-22: `Beta MCP` está público na versão 112, deployment `appgdep_6ada1a55b3448191b8ded7030c05209e` (`succeeded`), URL `https://movidesk-oauth-proxy-pkce.thngrns.chatgpt.site`. A PR #34 foi integrada ao `main` no commit `ec09154d9c5ab25b37f7abb2216525afc8a6f407`; a fonte Sites correspondente foi sincronizada no commit `b3914d074793e0d13e8fab00c851debbe167dbd7`. A alteração remove da lista de contas a repetição dos escopos do token e a mensagem redundante `Sem autorização ativa`, preservando o contador, a expiração e os controles individuais de permissões. A audiência pública existente foi mantida.

Verificação de estado em 2026-11-18: `Beta MCP` está ativo e público; versão 113, deployment `appgdep_6adaa8703b6881918a33d8220e18b5a3` (`succeeded`), fonte `9107d5fc00e186bef22cb20265a1d4495febb9a0`, URL `https://movidesk-oauth-proxy-pkce.thngrns.chatgpt.site`. A revisão do ambiente é 14. O inventário lista `SUPABASE_URL` e `SUPABASE_SECRET_KEY`, mas o valor da chave é ocultado. Uma chamada autenticada a `knowledge_list_sources` retornou as três fontes. O deployment reporta `has_mcp: false` para integração MCP nativa do Sites; a rota customizada `/mcp/` do Worker é uma superfície distinta e foi validada pela chamada.

## Histórico de publicações do Site

Marco histórico de 2026-10-22 — **versão 103**: deployment `appgdep_6ad9a91b13348191a90ffdf03e0bdc56` (`succeeded`). A fonte Sites (`65fcddae9735eb0f1edebde79dc15cd055462362`) foi sincronizada após a PR #17 entrar na `main` do GitHub pelo commit `50741c392293f004ad5cf1154e9d46738bb9cd59`. A versão incluiu o campo `protocol` no retorno de `movidesk_get_ticket`; o smoke pelo conector para o ticket 5835 confirmou `20260702000000016`. A audiência pública foi preservada. O helper de build/empacotamento falhou no Windows ao resolver npm e `tar.exe`; o build direto e o empacotador oficial concluíram aquela publicação.

Marco histórico de 2026-10-22 — **versão 107**: deployment `appgdep_6ad9c1a145cc8191aa8b2ddcf9c04370` (`succeeded`), a partir do commit-fonte Sites `734b4684b44d5c58c833ae379e683b7cf8b14064`, após a PR #23 ser integrada ao GitHub no commit `f61e3ecdbb34078aae5c03f491b9e852f26c6c0e`. A migration de ingestão longa estava aplicada. O registro da PR #31 documenta a importação autenticada do protocolo `20260918000000203` com 54 trechos e consultas às interações inicial/final; veja [`infra/supabase/DOSSIER.md`](../../infra/supabase/DOSSIER.md) para a evidência registrada. A audiência pública foi mantida; a publicação não foi repetida nesta atualização.

Em 2026-10-21, a integração Sites confirmou o projeto `Beta MCP` ativo e público, com versão publicada 81 e deployment `appgdep_6ad8ad335d608191813118e780180e4d`. A versão 81 registra o commit-fonte Sites `a231c84b31124890aec03f03c6d92daa93d7db86`; o deploy foi confirmado como `succeeded` e a audiência permaneceu pública. Ela inclui a implementação de reconexão OAuth descrita em `mcp/movidesk/DOSSIER.md`. A migration D1 de refresh tokens foi empacotada, mas o schema D1 não foi inspecionado depois da publicação e o ciclo de reconexão não foi validado em conversa real do ChatGPT.

O armazenamento de fonte usado pela publicação do Sites é separado do GitHub e não veio vinculado como remote ao resultado de leitura do projeto. A versão publicada continua disponível como versão Sites para rollback. O runtime foi sincronizado do monorepo para um checkout isolado, empacotado e publicado; o commit-fonte Sites é separado do commit GitHub.

## Ambientes de Produção e Homologação (2026-11-27)

O runtime canônico permanece em `mcp/movidesk/`. Existem dois projetos Sites independentes para cadastrar como servidores MCP separados:

| Ambiente | Project ID | Manifesto canônico | URL | Estado |
|---|---|---|---|---|
| Produção | `appgprj_6a7e4b46e0488191bf0e58066ab738d6` | `mcp/movidesk/.openai/hosting.json` | `https://movidesk-oauth-proxy-pkce.thngrns.chatgpt.site` | Ativo, público; a instância publicada existente foi confirmada na versão 115 em 2026-11-27. |
| Homologação | `appgprj_6b0979d5f1e081918325fab3e8b962c6` | `mcp/movidesk-environments/homolog/.openai/hosting.json` | `https://beta-mcp-homolog.thngrns.chatgpt.site` | Público; v2 implantada em 2026-11-27, deployment `appgdep_6b0981067b6881919b7efa493d88e7d3` (`succeeded`), fonte `d7ebd79bf043b3ea02d7ae553c8e72c34cf165d2`. |

As duas publicações executam o mesmo runtime. A diferença é a identidade/origem do Site e sua infraestrutura: OAuth, tokens, permissões e D1 são isolados por origem. Não manter branches funcionais divergentes nem condicionar ferramentas ao ambiente. Não copiar segredos automaticamente. Homologação tem `OAUTH_MASTER_EMAILS=matheusgregoviski@gmail.com`; ainda precisa dos próprios valores `MOVIDESK_TOKEN`, `SUPABASE_URL` e `SUPABASE_SECRET_KEY` para validar operações externas. D1 é independente e ligado ao binding `DB` do Site de Homologação.

Smokes live da Homologação v2 em 2026-11-27: `/` e `/docs` retornaram 200; discovery OAuth e protected-resource retornaram 200; `POST /mcp/` sem bearer retornou 401 com challenge apontando para os metadados de Homologação. Isso confirma publicação e roteamento OAuth, mas não confirma chamadas autenticadas às ferramentas enquanto os segredos de serviço estiverem ausentes.

O sincronizador seleciona o destino por flag: o padrão permanece `production`; para Homologação use `npm run sites:sync -- <checkout_path> --target homolog [--dry-run]`. O checkout Sites continua devendo corresponder ao ID do manifesto do alvo e ser limpo antes da sincronização. Após implementar e validar uma alteração, a autorização permanente do usuário é publicá-la primeiro na Homologação. Só um pedido explícito de merge no GitHub autoriza o merge pela PR e a publicação automática do estado integrado no Site Produção. Um push isolado não atualiza Produção.

As URLs dos endpoints para cadastrar as conexões estão no [`README do MCP`](../../mcp/movidesk/README.md#conexões-mcp). A criação do Sites não equivale a implantação ou a um MCP pronto para uso: confirme fonte/SHA, versão, deployment, variáveis e smokes por ambiente.

## Snapshots e origens antigas

O checkout MCP local continha snapshots Git das versões do Site e um pacote `work/oauth-proxy` sem histórico Git. Os históricos das árvores `work/sites-beta-mcp-20261020*` e do antigo projeto `work/movidesk-site` foram importados em `legacy/source-archives/`; o pacote `work/oauth-proxy` e os artefatos exclusivos de preservação do antigo `source-bundle` ficavam em `legacy/artifacts/site-snapshots/` até o commit `fd7c090bb25b7b9086de9ebea38a1680df6bddb4`. A pasta `legacy/` foi removida da árvore ativa e esses itens podem ser recuperados desse commit. O build `dist/` do snapshot `oauth-20261020` foi preservado em `dist.tar.gz`, após o checkout do marketplace no Windows falhar por nomes de arquivos gerados longos; o pacote foi verificado arquivo a arquivo contra o manifesto SHA-256 original. O manifesto de migração registra os commits e hashes.

A origem `work/movidesk-site` refere-se a outro projeto Sites (`appgprj_6a7e285d4458819182045de12c19a44a`), diferente do projeto `Beta MCP` atual. Seu código consta na árvore histórica em `fd7c090bb25b7b9086de9ebea38a1680df6bddb4`; não substituir uma origem pela outra.

## Fluxo de publicação

### Telemetria operacional do MCP

O painel `/admin/users` mantém as métricas de uso e falhas no D1 vinculado ao Worker Sites. A rota `/api/admin/tool-metrics` exige conta master e consulta eventos agregados do MCP; ela é independente da rota de indicadores Supabase. Os dados registrados são ferramenta, resultado (sucesso/erro), código de erro de uma lista segura e horário. Não são persistidos usuário, argumentos, resultado ou mensagem de erro original. A retenção automática é de 90 dias; os gráficos exibem os últimos 30 dias e os dez erros recentes. A migration `mcp/movidesk/drizzle/0001_mcp_tool_events.sql` documenta a tabela e índices; o Worker também garante a criação da tabela. Essa implementação foi publicada na v80, pelo commit Sites `f0e56004251435d2b3b07b8c516857c7f3a4f4de`; ainda não confirmei o recebimento de eventos reais nos gráficos.

A importação para o monorepo não publica alterações. A origem do Sites segue separada do GitHub; `mcp/movidesk/.openai/hosting.json` associa o código canônico ao mesmo projeto, mas não muda o remote gerenciado pelo Sites.

Use este fluxo somente depois do merge da mudança MCP na `main` e com publicação solicitada. Primeiro confirme o projeto e a audiência atuais, versão publicada, configuração de `mcp/movidesk/.openai/hosting.json` e ausência de alterações não relacionadas. Crie/abra o checkout de fonte do Sites com `npm run sites:workflow -- --helper "<caminho-absoluto-site-workflow.mjs>" --project-id "<project_id>"`; o helper oficial fornece o JSON de abertura (`source`) e orienta o `archivePath`. O wrapper executa em workspace isolado, recebe credenciais apenas por stdin e não as grava em argumentos, arquivos ou logs. Preserve o checkout retornado.

Antes de copiar arquivos, rode `npm run sites:sync -- "<checkout_path>" --dry-run` a partir da raiz do monorepo e inspecione os caminhos gerenciados no relatório. O sincronizador confere o `project_id`, recusa alterações rastreadas locais e limita a sincronização aos diretórios gerenciados de runtime/build; preserve `.git`, `.openai/`, documentação, testes e históricos. Confira também arquivos não rastreados/ignorados que colidam com os caminhos gerenciados; se houver colisão, pare e preserve os dados antes de sincronizar. Só então execute `npm run sites:sync -- "<checkout_path>"` e revise o diff completo do checkout isolado.

Abra o helper novamente com o `source` retornado, `archivePath` absoluto novo, fora do checkout, e `--project-id` igual ao do projeto. O wrapper valida os caminhos, executa o build via `cmd.exe /c "npm.cmd run build"` no Windows e garante dependências compatíveis sem substituir um `node_modules` junction. Em Windows, mantém caminhos Windows nativos e usa `tar.exe` do sistema; não requer Git Bash. Envie a solicitação estruturada ao helper por stdin; ele executa comandos aprovados, faz commit/push na origem do Sites e gera o pacote. Revise a saída e o pacote antes de salvar uma nova versão pelo conector Sites. Preserve a audiência atual e só implante após confirmar a versão e o pacote correspondentes ao SHA integrado.

Depois do deploy, confirme versão salva, SHA-fonte, deployment concluído, URL e audiência diretamente no Sites. Rode smokes apropriados para raiz, OAuth e `/mcp/`, conforme os caminhos afetados; atualize PR e dossier com a evidência. Não remova checkout ou pacote antes da validação final. Em 2026-10-20, o dry-run e a sincronização passaram; 61 arquivos foram copiados e nenhum rastreado obsoleto foi removido. O build Vinext passou e a versão 80 foi implantada com sucesso.

### Pré-voo de publicação

Ao receber `source` e `archivePath`, o wrapper valida que o resultado de abertura e `.openai/hosting.json` correspondem ao `project_id` selecionado, que o caminho é a raiz Git do checkout e fica fora do monorepo, que o helper de empacotamento está presente e que a pasta de destino existe, permite gravação, ainda não contém o arquivo e fica fora do checkout (inclusive após resolver symlinks no diretório pai). No Windows, exige `tar.exe` disponível no sistema e conserva o caminho nativo do arquivo; não verifica Git Bash. Para builds Vinext, compara `package.json`, `package-lock.json` e a versão principal do Node; se a instalação não estiver compatível, executa `npm ci` dentro do checkout isolado. Se `node_modules` for symlink/junction, não executa instalação destrutiva; reutiliza o Vinext disponível ou bloqueia com orientação. O wrapper chama `npm.cmd run build` via `cmd.exe` e inclui o comando oficial de build apenas quando necessário. Falha em qualquer pré-voo, instalação ou comando impede commit/push na origem Sites.

Antes de publicar, preservar a audiência atual e registrar SHA, versão e deployment. Manter a configuração de produção atual até confirmar o novo fluxo e a compatibilidade do cliente MCP.
