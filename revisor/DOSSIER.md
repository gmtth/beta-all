# Dossier do Revisor Oficial — Beta All

Atualizado em 2026-10-22. Este dossier registra as regras de contexto, evidências, cobertura e pendências do revisor oficial de `gmtth/beta-all`. Ele segue o padrão dos dossiers ativos do monorepo e não substitui o estado canônico dos componentes. As regras completas estão em [`AGENTS.md`](AGENTS.md), subordinadas ao [`AGENTS.md` mestre](../AGENTS.md).

## Resumo e escopo

- **Componente:** revisão de pull requests, branches e mudanças do monorepo Beta All.
- **Responsabilidade:** detectar perda de comportamento esperado, incompatibilidade com contratos/dossiers, defeitos, riscos e validações faltantes; entregar parecer técnico acionável ao usuário.
- **Escopo GitHub:** somente [`gmtth/beta-all`](https://github.com/gmtth/beta-all).
- **Modo:** somente leitura no produto, dados, serviços e PRs. O usuário autorizou o revisor a manter este dossier, suas instruções e uma referência no `AGENTS.md` mestre por commit direto sem PR. Isso não autoriza push, alteração de produto, merge ou deploy.
- **Princípio:** ausência de achado no escopo verificado não é garantia de ausência total de regressão.

## Estado atual

Snapshot remoto consultado em 2026-10-22:

| Item | Estado observado | Evidência/limite |
|---|---|---|
| Repositório e branch padrão | `gmtth/beta-all`, `main` | Consulta GitHub e remote do clone oficial. |
| `main` | `d3ee3fd42884402e725b4248a1917c8275bcfc7f` — `feat(supabase): rank knowledge search by query coverage` | SHA observado após fetch; estado pode mudar depois do snapshot. |
| Checkout usado nesta revisão documental | Em `main`, limpo antes das alterações, avançado por fast-forward de `32b3f0b` | Commit de preparação `2c961f1` criou os documentos; detalhes no histórico desta tarefa. Existem outros clones locais e worktrees; não presumir que sejam o oficial nem que estejam limpos. |
| PRs abertas | #25 e #31; ambas documentais; ambas `mergeable: false` no retorno GitHub | Busca remota em 2026-10-22. Reconsultar antes de repetir. |
| Cobertura merged | #26, #28–#30 e #32–#36 revisadas em parecer anterior | Proveniência é a conversa de 2026-10-22; inventário total/paginação ainda não reconciliado. |

### PRs abertas no snapshot

| PR | Conteúdo e evidência observados | Estado funcional conhecido | Parecer registrado |
|---|---|---|---|
| [#25 — registrar publicação da página de feedback](https://github.com/gmtth/beta-all/pull/25) | Registra merge da #24, sincronização e publicação Sites v108/smoke visual. Head `5ebbf560b8e9c1dee423ac2481fc9422b0248d81`; base reportada `91de48874808cd09fb53a21e82f1ce5bbcd2ac24`; `open`, `mergeable: false`. | Página/painel já implementado e publicado segundo evidência documentada pela PR; o dossier raiz ainda precisava corrigir o registro. | **Merge recomendado após atualizar/reconciliar a branch.** Parecer executivo; reabrir diff/checks antes de nova decisão. Nada foi mesclado pelo revisor. |
| [#31 — baseline de avaliação da busca](https://github.com/gmtth/beta-all/pull/31) | Registra 11 consultas naturais e controles exatos, estado de importação/publicação v107 e plano de avaliação. Head `1ebae29eddedfc4e9e1850535734dbb083c78aa7`; base `74c034e6dbc673e78b9a54e3a8dfef6e4b2293bd`; `open`, `mergeable: false`. | Baseline está nesta PR; ranking relacionado entrou na #36. Aplicação de migration e reavaliação live não estavam confirmadas no parecer. | **Merge recomendado após atualizar e reconciliar dossiers com mudanças posteriores.** Confirmar arquivo de avaliação, referências e migration atual. Nenhum merge feito. |

Os pareceres são snapshots da conversa de 2026-10-22, não reviews formais submetidos ao GitHub nem substituto da leitura dos diffs atuais.

## Decisões vigentes

- Revisar apenas `gmtth/beta-all`; não estender a outros repositórios Beta.
- Revisar cada PR merged ao menos uma vez e manter cobertura cumulativa. Pedidos genéricos incluem PRs abertas e branches sem PR relevantes além da cobertura merged nova.
- Recuperar expectativas nos dossiers/contratos atuais dos componentes. Não avaliar comportamento apenas pelo diff ou supor que o `main` atual representa todo comportamento esperado.
- O revisor não altera produto, não comenta/submete review, não faz merge nem exclui branch. Recomendações de merge ou exclusão são pareceres, não ações.
- Os próprios arquivos do revisor e a referência no `AGENTS.md` raiz podem ser mantidos por commits diretos autorizados, sem PR. Push e publicação são decisões separadas e seguem o `AGENTS.md` mestre.
- O nível de atuação esperado é o de parceiro técnico sênior, com profundidade ampla e rigor em problemas complexos. A expressão “20 anos/todas as linguagens” é metáfora de qualidade, não credencial factual.
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
