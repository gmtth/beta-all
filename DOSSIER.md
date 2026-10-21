# Dossier da Beta — índice do contexto

Atualizado em 2026-10-21. Este dossier é o índice executivo; dossiers completos e instruções específicas continuam junto aos respectivos componentes e nas cópias documentais de migração.

## Objetivo do produto

A Beta é uma assistente compartilhada por quatro analistas. Deve diagnosticar problemas de máquinas usando principalmente chamados históricos do Movidesk, complementar casos de erro do programa no ClickUp e responder sobre processos administrativos aprovados. A consulta diária deve usar uma cópia sincronizada, indexada no Supabase/PostgreSQL com `pgvector`, com busca lexical e semântica, proveniência, filtragem de acesso e perguntas de esclarecimento quando faltarem dados.

Deve analisar com rigor de analista sênior e responder em linguagem funcional, natural e profissional. Não revela raciocínio privado, ferramentas, arquitetura privilegiada ou informação interna a usuários sem autorização. Hipóteses e recorrência não se tornam fatos ou procedimentos sem validação humana.

## Componentes e fontes de verdade

| Componente | Local canônico | Origem da importação | Estado |
|---|---|---|---|
| Plugin e skills | `plugins/beta/` | `gmtth/plugin-beta` | Ativo; regras em `AGENTS.md` e histórico/estado em `DOSSIER.md` |
| MCP/OAuth e runtime Sites | `mcp/movidesk/` | `gmtth/movidesk-mcp-oauth` | Ativo; dossier completo junto ao componente |
| Banco e API Supabase | `infra/supabase/` e integração MCP | Projeto Supabase e integração MCP | Listagem MCP e hardening validados; migration de ingestão aplicada; painel admin com diagnósticos Supabase publicado no Sites v79; gráficos MCP no D1 publicados na v80; migration dos indicadores ainda pendente; importação piloto pendente de reautorização |
| Publicação Sites | `mcp/movidesk/` e `docs/components/sites.md` | Sites/Cloudflare Artifact e snapshots | Fonte Sites é separada do GitHub; versão 82 publicada com sucesso; correção permanente do helper Windows continua pendente |
| Dossiês e arquitetura | `docs/`, `DOSSIER.md` | workspace Beta, MCP, plugin e suite histórica | Ativos separados de snapshots e arquivos históricos |
| Agregador antigo/subskills históricas | `legacy/` | `gmtth/suite-beta` e submódulos | Preservados para comparação e recuperação |

## Decisões importantes

- `gmtth/beta-all` é o único repositório de trabalho desejado. Componentes continuam organizados por diretório e podem ser trabalhados/publicados separadamente.
- O marketplace GitHub do plugin Beta está definido em `.agents/plugins/marketplace.json` e referencia o pacote canônico `plugins/beta/`. A configuração/importação no workspace e o teste de uso pelos quatro analistas ainda estão pendentes; ver [`docs/components/plugin-marketplace.md`](docs/components/plugin-marketplace.md).
- Plugin e MCP ficam como arquivos editáveis no monorepo; submódulos não são dependências de desenvolvimento.
- Supabase é a base compartilhada para catálogo, registros de origem e trechos pesquisáveis; a chave de serviço fica apenas no ambiente seguro do servidor.
- `movidesk:read`, `knowledge:read` e `knowledge:write` são capacidades separadas. O usuário autorizou importar para a base interna apenas chamados explicitamente indicados; alterações em tickets do Movidesk e ingestão em massa continuam fora do escopo.
- `beta-all` é o repositório de trabalho ativo. As origens relacionadas foram preservadas e arquivadas conforme o inventário; não presumir que Sites ou integrações externas já publiquem a partir do monorepo.

### Telemetria do painel no Sites (2026-10-20)

- Decisão do usuário: gráficos e métricas de uso/erros devem contabilizar chamadas das ferramentas MCP no ambiente Sites; não usar Supabase para esse fim.
- Implementação publicada no Sites v80: eventos mínimos no D1, endpoint administrativo separado dos indicadores Supabase, gráfico de chamadas por ferramenta, erros diários em 30 dias e lista dos dez erros mais recentes. Retenção de até 90 dias.
- Os eventos não contêm identidade, argumentos, conteúdo de retorno nem mensagens brutas de erro. A tabela é declarada em Drizzle e possui migration própria; o Worker também garante criação idempotente.
- Estado: commit GitHub `f013830` enviado à branch `codex/knowledge-ticket-ingestion`; fonte Sites `f0e56004251435d2b3b07b8c516857c7f3a4f4de`; versão 80 implantada com sucesso em deployment `appgdep_6ad7ffa179f88191bf045ab6570e161c`. Ainda não confirmado que chamadas reais estejam aparecendo nos gráficos. Ver `mcp/movidesk/DOSSIER.md` para detalhes.
- O commit `2d05b69` corrige o `PATH` enviado pelo wrapper Sites no Windows, incluindo Node para o empacotador Bash. O workflow completo foi concluído com esse ajuste.

### Reconexão OAuth publicada no MCP/Sites (2026-10-21)

- O GitHub PR #2 foi mesclado em `main` por squash. Commit: `aaf93342c211d74d24a54f9be43722d1374a8952`.
- O runtime foi sincronizado a partir do monorepo e publicado no Site Beta MCP como versão 81, deployment `appgdep_6ad8ad335d608191813118e780180e4d`, status `succeeded`, URL `https://movidesk-oauth-proxy-pkce.thngrns.chatgpt.site`.
- O commit de fonte independente do Sites é `a231c84b31124890aec03f03c6d92daa93d7db86`; o build Vinext passou antes de empacotar e publicar. A migration D1 `0002_oauth_refresh_tokens.sql` foi incluída no pacote; a presença das tabelas no D1 não foi inspecionada separadamente após o deploy.
- A versão adiciona `securitySchemes` por ferramenta, metadados OAuth, desafio de reconexão e refresh token rotativo. O ciclo de reconexão em uma conversa real do ChatGPT continua sem validação.
- O helper Sites instalado teve incompatibilidade no Windows ao montar o comando npm e localizar `tar.exe`. Para concluir a publicação foi usada uma cópia temporária dos helpers com ajustes de quoting e caminho do tar; nada foi alterado no plugin instalado. Corrigir esse caminho no workflow do monorepo antes da próxima publicação.

### Validade de access token configurável (2026-10-21)

- A PR #3 foi aberta na branch `codex/admin-access-token-expiration`; commit GitHub `efec8f8b8d4468141ce633377785f706be66af27`. A PR continua aberta, não mesclada.
- O painel master permite configurar em milissegundos a validade de access tokens novos e renovados. O padrão permanece em 30 dias, com limites de um minuto a 30 dias. Tokens já emitidos preservam sua expiração gravada; refresh tokens mantêm a validade própria de até 90 dias.
- A migration D1 `0003_oauth_settings.sql` e a inicialização idempotente da tabela `oauth_settings` fazem parte do runtime. Testes de migration, padrão, gravação e limites passaram; `npm test` passou (build e 10 testes do projeto) e 11 testes OAuth focados passaram.
- Publicação Sites v82 concluída com status `succeeded`, deployment `appgdep_6ad8cdba69188191ada8c3b847a86f7f`, fonte Sites `1c8a611c656c2582dcc87a4b17d93422fe58f464`, URL `https://movidesk-oauth-proxy-pkce.thngrns.chatgpt.site`. A audiência pública existente foi preservada.
- O envio e empacotamento exigiram cópia temporária isolada do helper: o build Vinext passou, mas o helper instalado falhou no quoting do npm, caminho auxiliar do pacote e localização do tar no Windows. Nenhum arquivo do plugin instalado foi alterado. A correção permanente do workflow segue pendente no dossier MCP.
- Falta mesclar a PR #3 e executar smoke test autenticado como master no painel publicado; ainda não foi testada uma alteração real do TTL na interface em produção.

## Migração e rastreabilidade

`docs/migration/` registra repositórios, SHAs, comparação documental, estado local não reconciliado e critérios de corte. A tabela acima encaminha para cada fonte operacional canônica. `legacy/` e `docs/migration/source-documents/` são evidência histórica, não instruções atuais. O dossier do plugin foi reconstruído retroativamente com base no snapshot importado, nas instruções e nos arquivos históricos disponíveis; não é uma transcrição integral das conversas originais.

## Estado da consolidação (2026-10-20)

- Plugin, MCP, agregador legado e repositórios históricos relacionados foram importados em `plugins/`, `mcp/` e `legacy/`, com proveniência em `docs/migration/SOURCE_IMPORTS.tsv`. As instruções originais do plugin foram preservadas; seu dossier retroativo agora acompanha o componente e informa limites de reconstrução.
- A branch remota `feat/supabase-knowledge-read-scope` foi preservada integralmente em `legacy/source-archives/mcp-feature-supabase-scope/`. Como divergiu e ficou 28 commits atrás do `main`, sua versão antiga não substitui o MCP canônico; as capacidades de `knowledge:read` e `knowledge_list_sources` já estão no componente ativo.
- O estado local não enviado do checkout MCP original foi preservado como história/patch/snapshot em `legacy/`; o checkout de origem não foi alterado.
- Os snapshots do Sites e artefatos locais sem Git têm manifestos SHA-256. O Site publicado `Beta MCP` permanece na versão 73 (deployment `appgdep_6ad73a9f28388191bb62480b2b452ec5`). A revisão 13 do ambiente inclui `SUPABASE_URL` e `SUPABASE_SECRET_KEY`; o usuário confirmou a rotação/substituição da chave. Após reautorizar `knowledge:read`, confirmou que a listagem MCP retornou as três fontes. Isso valida essa leitura via Sites/Supabase; busca diagnóstica continua pendente. Não houve republicação durante a consolidação.
- Verificações registradas em `AGENTS.md`: validadores do plugin e catálogo semântico passaram; build MCP passou; suíte MCP teve 71 de 72 casos aprovados, com uma expectativa de texto já divergente da página na origem importada. A instalação reportou 35 vulnerabilidades na árvore de dependências, sem correções automáticas.
- O catálogo real do Supabase foi compartilhado sem linhas de dados e usado para preparar baseline e hardening de grants. O usuário registrou/aplicou essas duas migrations e confirmou que a listagem MCP continuou funcionando. A migration `20261020140000` para RPC de ingestão foi aplicada remotamente conforme screenshot do usuário em 2026-10-20.

## Primeira alteração controlada de ACLs e implementação da ingestão (2026-10-20)

- O usuário compartilhou a saída de `supabase migration list` mostrando `20261020120000` e `20261020130000` registrados em Local e Remote. Após a migração de grants, confirmou novamente que o MCP lista Movidesk, ClickUp e Documentos administrativos. Isso comprova a leitura do catálogo após o hardening.
- A implementação local adiciona `knowledge:write` e a ferramenta `knowledge_import_movidesk_ticket`, que também exige `movidesk:read`, usa a identidade autenticada para auditoria e importa somente o ID explicitamente informado. O código remove padrões detectáveis de e-mail, CPF/CNPJ, telefone rotulado e URL, limita tamanho e campos estruturados e grava a classificação `internal`.
- A migration `20261020140000_enable_movidesk_knowledge_ingestion.sql` foi aplicada remotamente conforme confirmação do usuário em 2026-10-20. Cria RPC transacional com upsert e substituição atômica de trechos, sem conceder DML direto ao `service_role`; registra eventos com e-mail autenticado. Existe rollback que desativa a função e preserva registros/auditoria.
- A versão 74 do runtime MCP foi publicada com sucesso em 2026-10-20 no Sites; GET aos metadados OAuth confirmou os três scopes. Reautorização por analista e importação piloto ainda pendentes.
- **Estado:** código, migration e verificações locais em andamento nesta branch; nenhuma publicação Sites, alteração remota dessa nova migration nem importação do chamado `20260702000000016` foi realizada nesta implementação local. O teste pedido para o chamado depende da revisão/aplicação da migration, publicação do runtime, nova autorização `knowledge:write` e invocação explícita da ferramenta.

## Painel administrativo e refinamento da conexão (2026-10-20)

- Foi preparado localmente um painel master de controle em `/admin/users` que agrega disponibilidade/latência do Supabase, contagens da base, fontes, importações recentes e escopos realmente presentes nos tokens ativos de cada analista.
- A conexão foi alinhada à variável server-side `SUPABASE_SECRET_KEY` e valida o endpoint `beta.source_system`. Nenhuma chave ou erro bruto é devolvido à interface.
- A RPC agregada `beta.get_knowledge_admin_overview()` e migration `20261020150000` ainda não foram aplicadas ao banco. A conexão pode estar disponível, mas os indicadores agregados aguardam a migration.
- O painel e o fluxo OAuth atualizado foram publicados no Sites v75; commit GitHub `53a0fc0` na branch `codex/knowledge-ticket-ingestion`; deployment `appgdep_6ad7c07e1d548191a4f3ff1283f93926`. A audiência permaneceu pública.
- Na página de consentimento OAuth, o envio ocorre automaticamente após dez segundos; o usuário também pode autorizar antes ou cancelar.

## Corte operacional concluído e pendências técnicas

- O corte do GitHub foi concluído: `gmtth/beta-all` está privado e ativo; `plugin-beta` foi tornado privado e arquivado; `movidesk-mcp-oauth`, `skill-clickup-checklist` e `skill-clickup-sprint-export` foram arquivados (já privados). Repositórios históricos anteriormente privados/arquivados continuam assim.
- O push foi validado por clone limpo no Windows. Não há gitlinks/submódulos ativos; os 400 itens cobertos pelos quatro manifestos SHA-256 conferem com os bytes preservados.
- A configuração do plugin aponta para o endpoint publicado do MCP/Sites. O Site `Beta MCP` continua na versão 73; nenhuma publicação foi feita durante o corte. A publicação futura deve partir do diretório apropriado no monorepo.
- O catálogo real Supabase foi fornecido sem linhas de dados e usado para preparar baseline e hardening de grants em `infra/supabase/migrations/`, mais um rollback. Nada foi aplicado; ainda falta definir o fluxo de baseline para o banco existente e revisar/aplicar a migration incremental com controle de rollback.

### Verificação da branch de reconexão OAuth — 2026-10-21

Na branch `codex/oauth-reconnection-step-1`, `npm test` passou (build e 10 testes), os testes TypeScript e lint direcionado passaram conforme registrado no dossier MCP. A branch foi integrada à `main` pela PR #2; o runtime foi publicado como Sites v81 com sucesso. `tsc --noEmit` e o lint completo continuam com falhas preexistentes de tipos Worker e outras áreas; o ciclo nativo de reconexão no ChatGPT e a aplicação da migration D1 ainda precisam de confirmação direta.

## Próximos passos

| Prioridade | Item | Estado / condição para conclusão |
|---|---|---|
| Alta | Mesclar a PR #3 da configuração da validade de access tokens e validar o campo como master. | Código publicado no Sites v82 (`1c8a611c656c2582dcc87a4b17d93422fe58f464`); branch GitHub `codex/admin-access-token-expiration`, PR #3 aberta. Após merge, conferir que o painel carrega o valor, salvar um TTL de teste e confirmar resposta persistida; restaurar o valor desejado pelo master. Ver [`mcp/movidesk/DOSSIER.md`](mcp/movidesk/DOSSIER.md#próximos-passos). |
| Alta | Validar o ciclo nativo de reconexão OAuth no ChatGPT. | Etapas 1–5 foram mescladas pela PR #2 e publicadas no Sites v81; falta testar expiração, refresh, revogação, reconexão e repetição da operação em conversa real. Ver [`mcp/movidesk/DOSSIER.md`](mcp/movidesk/DOSSIER.md#próximos-passos). |
| Média | Corrigir a confiabilidade das verificações de tipos e lint do MCP. | `tsc --noEmit` e lint completo ainda falham; causas e condição de conclusão estão registradas no dossier MCP. Não bloqueia os testes/build OAuth que passaram. |
| Média | Corrigir o workflow Windows de build/empacotamento do Sites. | A publicação v81 exigiu ajustes temporários no helper copiado para resolver quoting do `npm` e encontrar `tar.exe`; fazer o wrapper do monorepo concluir build, pacote e publicação sem editar a instalação do plugin. |
| Alta | Retomar piloto e busca da base compartilhada. | Importação piloto, busca híbrida e validação de permissões continuam pendentes; ver [`infra/supabase/DOSSIER.md`](infra/supabase/DOSSIER.md#próximos-passos) e o dossier MCP. |
| Média | Confirmar disponibilidade do marketplace Beta e conexão ClickUp do plugin. | Pendências mantidas no [`plugins/beta/DOSSIER.md`](plugins/beta/DOSSIER.md#próximos-passos). |

Este é o índice transversal do backlog. As condições de conclusão e evidências detalhadas permanecem nos dossiers canônicos dos componentes; itens resolvidos devem sair daqui e da lista do componente na mesma atualização.
