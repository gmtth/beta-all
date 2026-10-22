# Dossier do Revisor Oficial — Beta All

Atualizado em 2026-10-22. Ledger de cobertura e estado conhecido das revisões de `gmtth/beta-all`; não substitui dossiers canônicos de componentes. As regras estão em [`AGENTS.md`](AGENTS.md), subordinadas ao [`../AGENTS.md`](../AGENTS.md).

## Papel

O revisor compara PRs e branches com comportamentos esperados, contratos e decisões documentadas, além de testes e evidências de execução/publicação. Status GitHub é temporal e precisa ser consultado novamente antes de reapresentado como atual.

Não altera código de produto, não faz merge, deploy ou exclusão de branches e não envia comentários/reviews ao GitHub. O usuário autorizou manter estes documentos e a referência no `AGENTS.md` raiz com commits diretos, sem PR. O parecer é entregue no chat.

## Protocolo e formato

Em cada rodada: registre data/hora, SHA de `main`, PRs abertas, merges sem cobertura, branches sem PR relevantes e conclusão por item. Leia patch completo, contratos/consumidores, caminhos negativos/limítrofes, checks e dependências de migration/deploy. Achados levam prioridade, impacto, evidência e direção de correção; lacunas não viram aprovação.

Resposta preferida: tabela em português (**PR/branch**, **o que mudou/estado**, **revisão de comportamento**, **recomendação**), seguida de achados, cobertura, verificações e limitações. “Não identifiquei perda” limita-se ao patch/evidência examinados e não garante ausência absoluta de regressão.

## Snapshot consultado em 2026-10-22

- Repositório: [`gmtth/beta-all`](https://github.com/gmtth/beta-all), branch padrão `main`.
- SHA consultado: `d3ee3fd42884402e725b4248a1917c8275bcfc7f` (`feat(supabase): rank knowledge search by query coverage`). O clone usado avançou por fast-forward de `32b3f0b` e estava limpo antes destas alterações.
- Busca GitHub retornou duas PRs abertas: [#25](https://github.com/gmtth/beta-all/pull/25) e [#31](https://github.com/gmtth/beta-all/pull/31). Ambas são documentais e `mergeable: false` no snapshot.

| PR | Propósito e estado observado | Estado funcional conhecido | Parecer registrado |
|---|---|---|---|
| [#25 — registrar publicação da página de feedback](https://github.com/gmtth/beta-all/pull/25) | Registra merge da #24, sincronização e Sites v108/smoke visual. Head `5ebbf560b8e9c1dee423ac2481fc9422b0248d81`; base `91de48874808cd09fb53a21e82f1ce5bbcd2ac24`; aberta, não mergeable. | Página/painel já implementado e publicado conforme evidência registrada pela PR; faltava corrigir dossier. | **Merge recomendado após atualizar e reconciliar a branch.** Relê-la antes de nova recomendação. Nenhum merge feito. |
| [#31 — baseline da avaliação da busca](https://github.com/gmtth/beta-all/pull/31) | Baseline de 11 buscas/controles exatos, estado de importação/publicação v107 e plano de avaliação. Head `1ebae29eddedfc4e9e1850535734dbb083c78aa7`; base `74c034e6dbc673e78b9a54e3a8dfef6e4b2293bd`; aberta, não mergeable. | Baseline na PR; ranking relacionado entrou na #36. Aplicação da migration e reavaliação live não confirmadas no parecer anterior. | **Merge recomendado após atualizar e reconciliar dossiers com mudanças posteriores.** Verificar referências/migration na próxima análise. Nenhum merge feito. |

Esses pareceres são snapshots da conversa de 2026-10-22, não aprovação formal no GitHub nem substituto da leitura dos diffs atuais.

## Cobertura merged registrada anteriormente

Parecer entregue em 2026-10-22 cobriu as PRs merged **#26, #28–#30 e #32–#36**. #25 e #31 estavam abertas; #27 havia sido fechada sem merge.

| PR(s) | Parecer anterior registrado |
|---|---|
| #26 — permissões OAuth | Achados: refresh token substituto pode manter scopes desativados e reintroduzi-los após reativação sem reconexão; `insufficient_scope` é reduzido a `null` e a rota responde `401 invalid_token`. Verificar correções posteriores. |
| #28, #30, #33, #35 — documentação | Nenhuma regressão runtime identificada nos diffs consultados. |
| #29 — controles compactos de scopes | Controles e descrições preservados; sem perda identificada naquele diff. |
| #32 — seções recolhíveis | Busca ao expandir, cancelamento ao recolher e retry após falha; sem perda identificada. Testes automatizados e inspeção visual autenticada estavam pendentes segundo a PR. |
| #34 — resumo de scopes | Perda de visibilidade: a interface deixou de exibir scopes realmente presentes nos tokens e mostrava apenas os scopes habilitados pelo admin. Verificar mudanças posteriores. |
| #36 — ranking lexical | Resposta, filtros e busca exata por ID/protocolo preservados. Teste SQL não executado; migration/benchmark live não confirmados à época. Verificar migrations posteriores de rollback/restauração. |

### Evidência anterior

- Parecer baseado em diffs e resultados registrados nas PRs; testes locais não foram executados naquela rodada.
- #26 registrava 29 testes OAuth focados e 10 de renderização aprovados; resultados reportados pela PR, não executados pelo revisor.
- #36 registrava teste SQL não executado, migration não aplicada e benchmark de 11 consultas pendente.
- Arquivos citados: [`token/route.ts`](https://github.com/gmtth/beta-all/blob/main/mcp/movidesk/app/oauth/token/route.ts), [`token-grants.ts`](https://github.com/gmtth/beta-all/blob/main/mcp/movidesk/app/oauth/token-grants.ts), [`_lib.ts`](https://github.com/gmtth/beta-all/blob/main/mcp/movidesk/app/oauth/_lib.ts), [`_movidesk.ts`](https://github.com/gmtth/beta-all/blob/main/mcp/movidesk/app/api/_movidesk.ts), [`user-admin-panel.tsx`](https://github.com/gmtth/beta-all/blob/main/mcp/movidesk/app/user-admin-panel.tsx) e migration mencionada na #36.

## Ledger cumulativo

| PR/branch | Cobertura | Evidência registrada |
|---|---|---|
| #26, #28–#30, #32–#36 | Merged e revisadas uma vez no parecer anterior; revalidar achados após mudanças posteriores. | Conversa de 2026-10-22. |
| #25, #31 | Abertas; análise executiva/recomendação registrada; reler diffs antes de nova decisão. | Busca GitHub em 2026-10-22, `main` `d3ee3fd`. |
| #27 | Fechada sem merge no snapshot anterior; não conta como cobertura merged. | Parecer anterior de 2026-10-22. |
| Outras PRs merged/abertas e branches sem PR | Inventário completo ainda não registrado. | Enumerar remotamente na próxima revisão e reconciliar com o ledger. |

## Próximos passos

| Prioridade | Item | Condição de conclusão |
|---|---|---|
| Alta | Inventariar todas as PRs merged/abertas e branches remotas sem PR; reconciliar pareceres prévios e cobrir cada merged pelo menos uma vez. | Listas remotas/SHAs reconciliados e divergências explicadas. |
| Alta | Revalidar #25 e #31 contra `main`, diffs completos, mudanças posteriores, checks e dossiers. | Decisão atualizada com SHAs; sem merge pelo revisor. |
| Alta | Reavaliar achados #26, #34 e #36 contra código/migrations atuais. | Evidência de código e produção consultada; encerrar só com prova. |
| Média | Comparar branches sem PR com `main` e classificar conteúdo aplicado/exclusivo. | Branches relevantes classificadas sem exclusão. |
