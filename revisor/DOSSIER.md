# Dossier do Revisor Oficial — Beta All

Atualizado em 2026-10-22. Este dossier registra as regras de contexto, evidências, cobertura e pendências do revisor oficial de `gmtth/beta-all`. Ele segue o padrão dos dossiers ativos do monorepo e não substitui o estado canônico dos componentes. As regras completas estão em [`AGENTS.md`](AGENTS.md), subordinadas ao [`AGENTS.md` mestre](../AGENTS.md).

## Resumo e escopo

- **Componente:** revisão de pull requests, branches e mudanças do monorepo Beta All.
- **Responsabilidade:** detectar perda de comportamento esperado, incompatibilidade com contratos/dossiers, defeitos, riscos e validações faltantes; entregar parecer técnico acionável ao usuário.
- **Escopo GitHub:** somente [`gmtth/beta-all`](https://github.com/gmtth/beta-all).
- **Modo:** somente leitura no produto, dados, serviços e PRs. O usuário autorizou manter e commitar diretamente este dossier, suas instruções e a referência no `AGENTS.md` mestre, sem PR; conforme a regra raiz, esses commits documentais são enviados ao GitHub. Isso não autoriza alteração de produto, merge, PR ou deploy.
- **Princípio:** ausência de achado no escopo verificado não é garantia de ausência total de regressão.

## Estado atual

Snapshot remoto consultado em 2026-10-22:

| Item | Estado observado | Evidência/limite |
|---|---|---|
| Repositório e branch padrão | `gmtth/beta-all`, `main` | Consulta GitHub e remote do clone oficial. |
| `main` | `d3ee3fd42884402e725b4248a1917c8275bcfc7f` é a base funcional do snapshot de PRs abaixo. | Depois, os commits somente documentais do revisor foram enviados ao GitHub; o head retornado pelo `git push` foi `7d8797e0f0c29b1f5b8231ad82f9fd13db95a889`. Um commit adicional de atualização deste dossier poderá avançar o head; consulte o remoto para o SHA atual. |
| Checkout usado nesta revisão documental | Clone limpo em `main`, avançado por fast-forward de `32b3f0b`; os documentos do revisor foram commitados e enviados diretamente. | A última sincronização confirmada incluiu somente `AGENTS.md`, `revisor/AGENTS.md` e `revisor/DOSSIER.md`. Existem outros clones/worktrees; não presumir que sejam oficiais nem que estejam limpos. |
| PRs abertas | #25 e #31; ambas documentais; ambas `mergeable: false` mesmo após o push documental do revisor | Busca GitHub refeita após `7d8797e`, em 2026-10-22; reconsultar antes de repetir. |
| Cobertura merged | #26, #28–#30 e #32–#36 revisadas em parecer anterior | Proveniência é a conversa de 2026-10-22; inventário total/paginação ainda não reconciliado. |

### PRs abertas no snapshot

| PR | Conteúdo e evidência observados | Estado funcional conhecido | Parecer registrado |
|---|---|---|---|
| [#25 — registrar publicação da página de feedback](https://github.com/gmtth/beta-all/pull/25) | Mudança documental: registra merge da #24, sincronização para Sites, publicação v108 e smoke visual autenticado. Head `5ebbf560b8e9c1dee423ac2481fc9422b0248d81`; base reportada `91de48874808cd09fb53a21e82f1ce5bbcd2ac24`; `open`, `mergeable: false`. | Página/painel já estava implementada e publicada segundo a evidência registrada; `main` dizia incorretamente que a mudança não teve PR, merge ou publicação. A PR corrige esse fato no dossier. | **Merge recomendado após atualizar/reconciliar a branch**; sem merge direto porque a base era antiga e o GitHub não a marcava mergeable. |
| [#31 — baseline de avaliação da busca](https://github.com/gmtth/beta-all/pull/31) | Mudança documental: registra 11 consultas naturais reais e controles exatos, atualização da importação longa, estado de publicação/importação e plano para avaliar ranking. Head `1ebae29eddedfc4e9e1850535734dbb083c78aa7`; base `74c034e6dbc673e78b9a54e3a8dfef6e4b2293bd`; `open`, `mergeable: false`. | A baseline só existia na PR; a #36 já referenciava um artefato de avaliação ausente do `main`. A migration de ranking não estava aplicada e as buscas não tinham sido reavaliadas em produção segundo o registro consultado. | **Merge recomendado após rebase/atualização e reconciliação dos dossiers com mudanças posteriores**; não declarar a busca validada em produção. |

Os pareceres são snapshots da conversa de 2026-10-22, não reviews formais submetidos ao GitHub nem substituto da leitura dos diffs atuais.

## Decisões vigentes

- Revisar apenas `gmtth/beta-all`; não estender a outros repositórios Beta.
- Revisar cada PR merged ao menos uma vez e manter cobertura cumulativa. Pedidos genéricos incluem PRs abertas e branches sem PR relevantes além da cobertura merged nova.
- Recuperar expectativas nos dossiers/contratos atuais dos componentes. Não avaliar comportamento apenas pelo diff ou supor que o `main` atual representa todo comportamento esperado.
- O revisor não altera produto, não comenta/submete review, não faz merge nem exclui branch. Recomendações de merge ou exclusão são pareceres, não ações.
- Os próprios arquivos do revisor e a referência no `AGENTS.md` raiz podem ser mantidos por commits diretos autorizados, sem PR. Push e publicação são decisões separadas e seguem o `AGENTS.md` mestre.
- O nível de atuação esperado é o de parceiro técnico sênior, com profundidade ampla e rigor em problemas complexos. A expressão “20 anos/todas as linguagens” é metáfora de qualidade, não credencial factual.
- A comunicação com o usuário deve ser em português natural, próxima e profissional; apresentar primeiro a conclusão, depois evidência e recomendação; preferir tabelas comparativas e links diretos. Em revisões, separar a decisão executiva, cada PR, achados, validações e limites sem esconder que testes/deploys foram apenas reportados ou não foram feitos nesta sessão.
- Sempre distinguir código merged, migration aplicada, Sites implantado, teste local e smoke autenticado. Uma dessas etapas não comprova as demais.
- Consultas GitHub e dados de produção são temporais; nova resposta de status exige consulta nova.

## Mapa dos componentes de revisão

| Superfície | Fonte canônica a ler | Foco de revisão |
|---|---|---|
| Regras e estado transversal | [`../AGENTS.md`](../AGENTS.md), [`../DOSSIER.md`](../DOSSIER.md) | Autoridade, arquitetura entre componentes, decisões globais, sincronização GitHub/Sites, backlog transversal. |
| Plugin e skills | [`../plugins/beta/AGENTS.md`](../plugins/beta/AGENTS.md), [`../plugins/beta/DOSSIER.md`](../plugins/beta/DOSSIER.md) | Contratos de roteamento, metadados, versões, invocação, conteúdo esperado e pacote. |
| MCP/OAuth/Sites | [`../mcp/movidesk/AGENTS.md`](../mcp/movidesk/AGENTS.md), [`../mcp/movidesk/DOSSIER.md`](../mcp/movidesk/DOSSIER.md) | Ferramentas públicas, scopes, erros, armazenamento, APIs, compatibilidade, publication/smoke e invariantes por ferramenta. |
| Supabase | [`../infra/supabase/AGENTS.md`](../infra/supabase/AGENTS.md), [`../infra/supabase/DOSSIER.md`](../infra/supabase/DOSSIER.md), README e migrations | Schema, grants/RLS, limites de leitura, conteúdo permitido, idempotência, rollback e estado remoto. |
| Arquitetura/decisões | [`../docs/architecture/`](../docs/architecture/) e ADRs pertinentes | Fluxos, limites de confiança, requisitos cross-component, decisões confirmadas/pendentes. |
| Integração/publicação | [`../docs/components/sites.md`](../docs/components/sites.md), workflows e instruções do componente | SHA de fonte, build, pacote, deployment, endpoint, audience e smoke. |
| Histórico de migração | [`../docs/migration/`](../docs/migration/) e `legacy/` somente quando necessário | Proveniência, origem, lacunas e diferenças históricas; não usar como regra vigente automaticamente. |

## Histórico de revisões

### 2026-10-22 — rodada anterior de PRs merged

O parecer entregue ao usuário cobriu as PRs merged **#26, #28–#30 e #32–#36**. A #25 e a #31 estavam abertas; a #27 estava fechada sem merge e não contou como código integrado.

| PR(s) | Resultado da revisão apresentado |
|---|---|
| #26 — permissões OAuth | Foram apontados dois defeitos: refresh token substituto poderia conservar scopes desativados e reintroduzi-los após reativação sem reconexão; falha `insufficient_scope` era reduzida a `null`, levando a resposta `401 invalid_token`. |
| #28, #30, #33, #35 — documentação | Nenhuma regressão runtime identificada nos diffs então consultados. |
| #29 — controles compactos de scopes | Controles e descrições preservados; sem perda identificada naquele diff. |
| #32 — seções recolhíveis | Busca ao expandir, cancelamento ao recolher e retry após falha; sem perda identificada. A PR registrava testes automatizados e inspeção visual autenticada pendentes. |
| #34 — resumo de scopes | Perda de visibilidade: a interface deixou de exibir scopes realmente presentes nos tokens e exibia apenas os scopes habilitados pelo admin. |
| #36 — ranking lexical | Estrutura da resposta, filtros e busca exata por ID/protocolo preservados. Teste SQL não executado, migration não aplicada e benchmark live não confirmado naquele momento. |

**Evidência reportada:** o parecer usou diffs/resultados das PRs; não executou testes locais. #26 reportava 29 testes OAuth focados e 10 de renderização aprovados; #36 reportava teste SQL, aplicação da migration e benchmark pendentes. Isso não prova o estado atual.

**Arquivos citados no parecer:** [`token/route.ts`](https://github.com/gmtth/beta-all/blob/main/mcp/movidesk/app/oauth/token/route.ts), [`token-grants.ts`](https://github.com/gmtth/beta-all/blob/main/mcp/movidesk/app/oauth/token-grants.ts), [`_lib.ts`](https://github.com/gmtth/beta-all/blob/main/mcp/movidesk/app/oauth/_lib.ts), [`_movidesk.ts`](https://github.com/gmtth/beta-all/blob/main/mcp/movidesk/app/api/_movidesk.ts), [`user-admin-panel.tsx`](https://github.com/gmtth/beta-all/blob/main/mcp/movidesk/app/user-admin-panel.tsx) e migration citada na #36. Links são para consulta; verificar arquivo e linhas atuais antes de afirmar que o achado persiste.

### 2026-10-22 — formalização do papel

Criados `revisor/AGENTS.md` e este dossier, com referência no `AGENTS.md` mestre. Commit local `2c961f1bb599c71c7f65d35a564cc3b7c0d647dd` (`docs: establish official beta-all reviewer`).

### 2026-10-22 — diretriz de atuação sênior

O usuário reforçou que espera um parceiro técnico sênior, ambicioso e rigoroso. Diretriz registrada no AGENTS raiz e do revisor; metáforas de experiência e domínio total não são credenciais literais. Commit local `5b7a2c58349281733dbac3f46b0de6b91d207025` (`docs: record senior reviewer expectations`).

### 2026-10-22 — padronização da comunicação

O usuário esclareceu que a padronização solicitada também cobre o modo de responder: conclusão executiva primeiro, português natural e profissional, tabelas comparativas, achados explicados por expectativa/evidência/impacto, links diretos e separação explícita entre recomendação, prontidão e validação. A diretriz foi incluída no `revisor/AGENTS.md` e resumida em `Decisões vigentes`.

### 2026-10-22 — reconstrução retroativa do mandato

O usuário pediu que a conversa inteira fosse relida e que as instruções acumuladas fossem consolidadas retroativamente tanto neste dossier quanto no `revisor/AGENTS.md`. A reconstrução abaixo preserva sequência, intenção e evidências disponíveis; não converte histórico em estado GitHub atual.

| Momento/pedido | Diretriz ou fato durável | Registro e limite |
|---|---|---|
| Início do mandato | Ser revisor de código implementado; verificar cada branch merged ao menos uma vez; não salvar alterações no projeto. | Regras permanentes de cobertura e modo somente leitura. Depois, o usuário autorizou exceção estreita para documentos próprios do revisor e commits diretos. |
| Restrição de escopo | Revisar somente PRs de `gmtth/beta-all`. | Não revisar repositórios irmãos sem solicitação explícita. |
| Revisões reiteradas | Pedidos curtos como “revise” significam continuar a rotina já estabelecida, não começar do zero nem perder cobertura anterior. | Consultar estado atual, ledger e mudanças posteriores; não inferir que a cobertura histórica é exaustiva sem inventário remoto completo. |
| Comportamento esperado | O usuário perguntou se o código perdido poderia ser identificado lendo os dossiers de cada projeto. | Sim: dossiers e instruções ativas dos componentes, arquitetura, contratos e testes são essenciais para recuperar expectativas; cruzar com código atual e histórico para identificar remoção/regressão e também documentação desatualizada. |
| Escopo de merges | O usuário pediu revisão de todas as PRs merged. | Cada merged revisada ao menos uma vez; manter ledger e dizer claramente quando a cobertura ainda for parcial. |
| Qualidade e formato aprovados | O usuário elogiou análise “disso pra mais” e formato tabular. | Resposta deve ser aprofundada, mas legível; tabela comparativa, evidência direta, impacto, recomendação e limites; manter o estilo aprovado nas revisões futuras. |
| Branches órfãs | O usuário pediu examinar branches sem PR, verificar se foram aplicadas e se podiam ser excluídas; citou `feat/site-loading-spinners` e `docs/knowledge-search-publication-status`. | Depois informou que excluiu ambas. É histórico relatado pelo usuário, não confirmação independente dos refs ou da segurança das exclusões. Não excluir branch em revisões futuras. |
| PRs pendentes | O usuário perguntou sobre duas PRs abertas, se já estavam implementadas e se deveriam ser merged. | Snapshot de 2026-10-22: #25 e #31. O parecer foi que ambas eram documentais e recomendáveis após atualizar/reconciliar branches antigas; o retorno GitHub as marcou não mergeable. Revalidar antes de repetir ou recomendar merge. |
| #25 | Registro da PR dizia que documenta merge da #24, sincronização/publicação Sites v108 e smoke visual autenticado. | Parecer: funcionalidade já implementada/publicada conforme evidência nela registrada; dossier precisava corrigir afirmação stale. Merge recomendado após atualização. Não foi feito merge pelo revisor. |
| #31 | Baseline documental de 11 consultas reais e controles exatos; estado da importação longa e plano de avaliação. A #36 já referenciava artefato ainda ausente no main no parecer. | Parecer: merge recomendado após atualização e reconciliação dos dossiers; não afirmar que ranking/migration foi validado em produção sem evidência de aplicação e benchmark live. Não foi feito merge pelo revisor. |
| Revisão merged apresentada | Cobertura relatada: #26, #28–#30 e #32–#36; #25 e #31 abertas e #27 fechada sem merge. | Achados e limitações preservados abaixo e na seção de findings. São resultados apresentados na conversa, não prova de que os defeitos ainda existam. |
| PR #26 | Refresh token poderia conservar scopes desativados e reintroduzi-los após reativação sem nova autorização; `insufficient_scope` poderia ser convertido em `null` e `401 invalid_token`. | Achados de risco/contrato a revalidar no código atual e em mudanças posteriores. |
| PR #32 | Seções recolhíveis buscavam ao expandir, cancelavam ao recolher e permitiam retry. | Sem perda identificada no diff então consultado; testes automatizados e inspeção visual autenticada estavam pendentes segundo a PR. |
| PR #34 | Remoção do resumo visual de scopes. | Perda de visibilidade operacional dos scopes realmente concedidos no token, diferente dos habilitados pelo administrador; confirmar se posterior mudança corrigiu. |
| PR #36 | Ranking lexical da busca; resposta, filtros e busca exata ID/protocolo preservados. | O teste SQL não foi executado, migration não aplicada e benchmark das 11 consultas pendente naquele parecer. Estado atual precisa ser refeito com migrations posteriores/deploys. |
| Evidência dos testes merged | #26 reportava 29 testes OAuth focados e 10 renderizações aprovados; #36 reportava pendências acima. | Resultados reportados nas PRs não foram execução local do revisor. Nenhum teste local foi executado na rodada merged registrada. |
| Oficialização e diretivas técnicas | O usuário pediu pasta `revisor/`, `AGENTS.md`, dossier e identificação perante o mestre; depois definiu atuação como senior developer de amplitude excepcional. | Documentos criados, root AGENTS ligado ao papel; metáforas de 20 anos/domínio total significam padrão de qualidade, não credenciais literais. |
| Consulta aos padrões do monorepo | O usuário pediu que os outros `AGENTS.md` e dossiers fossem consultados para elevar a qualidade dos documentos do revisor. | Foram consultados os arquivos ativos da raiz, MCP, plugin e Supabase. A estrutura do dossier foi ajustada para padrão canônico e o AGENT ampliado. |
| Comunicação | O usuário esclareceu que a solicitação original também pedia padronizar o modo de responder, não apenas o processo técnico. | Regra registrada: conclusão executiva primeiro, português natural/próximo/profissional, tabelas, evidência, impacto, links, recomendação e separação entre merge recomendável e merge pronto. |

#### Modelo de resposta aprovado pelo usuário

Para PRs abertas, o modelo elogiado foi: “as duas PRs abertas são documentais; nenhuma adiciona código de aplicação”, seguido de tabela com **PR**, **o que é**, **já está implementado?** e **recomendação**. A síntese deve dizer se as branches estão mergeáveis e explicar o impedimento; fechar com resumo do que cada PR corrige/preserva e “merge recomendado após atualizar”, quando apropriado. Recomendação de merge não equivale a prontidão para merge.

Para PRs merged em lote, começar com “Revisão das PRs merged — `gmtth/beta-all`”, declarar o intervalo coberto e identificar PRs abertas/fechadas sem merge que não contam como integradas. Usar tabela por PR com revisão e findings por comportamento. O parecer aprovado apontou separadamente: (1) na #26, scope desativado podia sobreviver no refresh token e voltar após reativação sem nova autorização; (2) `insufficient_scope` podia ser convertido em `401 invalid_token`; (3) #34 removeu a exibição dos scopes realmente presentes no token. Agrupou #28/#30/#33/#35 como documentação sem regressão; descreveu o comportamento #29 e #32 e suas validações pendentes; na #36 distinguiu código preservado de ranking ainda sem validação de produção. Encerrar com **achados de código** e **verificações**, incluindo testes reportados (#26: 29 OAuth e 10 renderização), teste SQL não executado e migration não aplicada na #36, e confirmação de leitura apenas, sem publicação.

Este modelo é uma transcrição funcional do padrão pedido, não uma exigência de repetir literalmente a resposta ou usar as mesmas PRs como estado atual.

### 2026-10-22 — preservação dos exemplos e sincronização

Após conferir a solicitação original ponto a ponto, foram detalhados os fatos específicos da #25 e da #31, o formato tabular de PRs abertas e merged e os achados/limites de validação da revisão anterior. Os commits documentais acumulados foram enviados diretamente a `main`, sem PR; o push confirmou `7d8797e0f0c29b1f5b8231ad82f9fd13db95a889`. A consulta GitHub posterior ainda retornou #25 e #31 abertas e não mergeable. Nenhum runtime foi alterado ou publicado. O head remoto atual deve ser lido novamente, pois este adendo também altera o dossier.

## Achados que exigem revalidação

Estes são achados do parecer histórico, não afirmações de que ainda persistem no `main` atual. Reconsultar o código e commits posteriores antes de confirmar/encerrar.

| Origem | Achado registrado | Revalidação necessária |
|---|---|---|
| #26 | Scope desativado poderia sobreviver em refresh token e voltar sem nova autorização; `insufficient_scope` poderia virar `401 invalid_token`. | Rastrear persistência/rotação de scopes e mapeamento de erros nas implementações atuais e testes de regressão. |
| #34 | Painel não mostraria scopes efetivamente contidos nos tokens. | Conferir painel e dossier; confirmar distinção entre habilitados pelo admin e concedidos no token. |
| #36 | Ranking não tinha validação SQL/live nem benchmark repetido. | Conferir migrations de aplicação/rollback, queries, teste SQL, deployment e baseline; separar validação de código e de produção. |

## Cobertura de PRs e branches

| Identificador | Estado no ledger | Limite |
|---|---|---|
| #26, #28–#30, #32–#36 | Merged e revisadas uma vez no parecer registrado acima. | Cobertura histórica; reler caso mudanças posteriores alterem o comportamento. |
| #25, #31 | Abertas no snapshot de 2026-10-22; análise executiva registrada. | Diff/checks precisam de reconsulta antes de nova recomendação. |
| #27 | Fechada sem merge no snapshot da revisão anterior. | Não conta como merged/revisada. |
| Demais PRs merged | Cobertura ainda não reconciliada por inventário paginado. | Enumerar todas e comparar com conversa/ledger antes de declarar cobertura completa. |
| Demais PRs abertas | Não inventariadas neste dossier. | Listar na próxima revisão genérica e avaliar estado atual. |
| Branches remotas sem PR | Nenhuma conclusão registrada neste snapshot. | Listar refs, comparar com `main`, procurar integração posterior e identificar commits exclusivos. |

## Próximos passos

| Prioridade | Trabalho | Contexto/evidência | Condição de conclusão |
|---|---|---|---|
| Alta | Completar inventário de PRs merged, abertas e branches sem PR. | Cobertura conhecida neste ledger é parcial. | Inventário remoto paginado reconciliado com revisões anteriores; cada PR merged coberta uma vez e cada branch relevante classificada. |
| Alta | Revisar integralmente #25 e #31 atualizadas. | Ambas eram não mergeable no snapshot; recomendação exigia atualização/reconciliação. | Diff/head/base/checks e dossiers consultados em SHAs atuais; registrar recomendação separando valor e prontidão. |
| Alta | Revalidar achados de #26, #34 e #36 contra `main`. | Achados históricos listados acima; merges posteriores podem tê-los corrigido ou alterado. | Confirmar com diff/código/testes e, para produção, deployment/smoke diretamente verificados. |
| Média | Revisar branches antigas sem PR apontadas pelo usuário ou destacadas pelo inventário. | Não há classificação completa no snapshot. | Comparação merge-base/diff e histórico de integração registrados; parecer de exclusão sem executar exclusão. |

## Fontes de verdade

1. Pedido atual do usuário e autorização desta tarefa.
2. [`../AGENTS.md`](../AGENTS.md) e `AGENTS.md` ativo do componente afetado.
3. Contratos, arquitetura/ADRs, testes e critérios de aceite canônicos.
4. Código e estado remoto atual; checks/CI e evidência direta de execução/deploy, sempre identificados por SHA/data.
5. Dossiers ativos atualizados com proveniência.
6. Histórico de PRs, comentários, snapshots, branches antigas e legado, somente como evidência contextual.

PR mergeada não prova deployment. Status verde não prova teste de contrato não incluído. Arquivo de migration não prova aplicação. Ausência de teste não prova defeito, mas limita a confiança. Quando as fontes não permitirem conclusão, registrar como inconclusivo e indicar a evidência exata que falta.
