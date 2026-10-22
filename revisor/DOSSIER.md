# Dossier do Revisor Oficial — Beta All

Atualizado em 2026-10-22. Este dossier registra as regras de contexto, evidências, cobertura e pendências do revisor oficial de `gmtth/beta-all`. Ele segue o padrão dos dossiers ativos do monorepo e não substitui o estado canônico dos componentes. As regras completas estão em [`AGENTS.md`](AGENTS.md), subordinadas ao [`AGENTS.md` mestre](../AGENTS.md).

## Resumo e escopo

- **Componente:** revisão de pull requests, branches e mudanças do monorepo Beta All.
- **Responsabilidade:** detectar perda de comportamento esperado, incompatibilidade com contratos/dossiers, defeitos, riscos e validações faltantes; entregar parecer técnico acionável ao usuário.
- **Escopo GitHub:** somente [`gmtth/beta-all`](https://github.com/gmtth/beta-all).
- **Modo:** somente leitura no produto, dados, serviços e revisão de PRs alheias. O usuário autorizou manter este dossier, suas instruções e a referência no `AGENTS.md` mestre. Essas mudanças documentais seguem o isolamento por conversa e o fluxo de commit/push/PR do `AGENTS.md` mestre; isso não autoriza alteração de produto, merge ou deploy.
- **Princípio:** ausência de achado no escopo verificado não é garantia de ausência total de regressão.

## Estado atual

Snapshot remoto consultado em 2026-10-22:

| Item | Estado observado | Evidência/limite |
|---|---|---|
| Repositório e branch padrão | `gmtth/beta-all`, `main` | Consulta GitHub e remote do clone oficial. |
| `main` | `aeaebb4ae51a4a0644d1277ff778fec65ef7e5e7` no início desta rodada. | SHA consultado no `origin/main` local e confrontado com metadados GitHub; após o commit deste dossier, verificar o novo head. |
| Checkout usado nesta revisão | Clone limpo em `main`; a única alteração local desta rodada é este dossier. | Não houve alteração de código, migration, PR, branch de produto ou Sites. |
| PRs abertas | #25 e #31; ambas documentais; ambas `mergeable: false` mesmo após o push documental do revisor | Busca GitHub refeita após `7d8797e`, em 2026-10-22; reconsultar antes de repetir. |
| PRs merged | 32 de 32 cobertas até esta rodada | Revisão consolidada registrada em `Histórico de revisões`; diffs e contratos foram consultados, sem executar testes nesta rodada. |

### PRs abertas no snapshot

| PR | Conteúdo e evidência observados | Estado funcional conhecido | Parecer registrado |
|---|---|---|---|
| [#25 — registrar publicação da página de feedback](https://github.com/gmtth/beta-all/pull/25) | Mudança documental: registra merge da #24, sincronização para Sites, publicação v108 e smoke visual autenticado. Head `5ebbf560b8e9c1dee423ac2481fc9422b0248d81`; base reportada `91de48874808cd09fb53a21e82f1ce5bbcd2ac24`; `open`, `mergeable: false`. | Página/painel já estava implementada e publicada segundo a evidência registrada; `main` dizia incorretamente que a mudança não teve PR, merge ou publicação. A PR corrige esse fato no dossier. | **Merge recomendado após atualizar/reconciliar a branch**; sem merge direto porque a base era antiga e o GitHub não a marcava mergeable. |
| [#31 — baseline de avaliação da busca](https://github.com/gmtth/beta-all/pull/31) | Mudança documental: registra 11 consultas naturais reais e controles exatos, atualização da importação longa, estado de publicação/importação e plano para avaliar ranking. Head `1ebae29eddedfc4e9e1850535734dbb083c78aa7`; base `74c034e6dbc673e78b9a54e3a8dfef6e4b2293bd`; `open`, `mergeable: false`. | A baseline só existia na PR; a #36 já referenciava um artefato de avaliação ausente do `main`. A migration de ranking não estava aplicada e as buscas não tinham sido reavaliadas em produção segundo o registro consultado. | **Merge recomendado após rebase/atualização e reconciliação dos dossiers com mudanças posteriores**; não declarar a busca validada em produção. |

Os pareceres são snapshots de revisão, não reviews formais submetidos ao GitHub. Revalidar findings após alterações posteriores.

## Decisões vigentes

- Revisar apenas `gmtth/beta-all`; não estender a outros repositórios Beta.
- Revisar cada PR merged ao menos uma vez e manter cobertura cumulativa. Pedidos genéricos incluem PRs abertas e branches sem PR relevantes além da cobertura merged nova.
- Recuperar expectativas nos dossiers/contratos atuais dos componentes. Não avaliar comportamento apenas pelo diff ou supor que o `main` atual representa todo comportamento esperado.
- O revisor não altera produto, não comenta/submete review, não faz merge nem exclui branch. Recomendações de merge ou exclusão são pareceres, não ações.
- Os próprios arquivos do revisor e a referência no `AGENTS.md` raiz podem ser mantidos quando autorizados, sempre em worktree/branch exclusiva e por PR conforme o `AGENTS.md` mestre. Não fazer commit direto em `main`; publicação não se aplica a mudanças apenas documentais.
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

Em 2026-10-22, a regra transversal foi atualizada para exigir worktree/branch exclusiva, push para a branch e PR própria por conversa. Isso substitui a autorização operacional anterior de commitar documentos do revisor diretamente em `main` sem PR; as entradas abaixo preservam o histórico do que ocorreu à época.

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

### 2026-10-22 — revisão completa do inventário merged e revalidação

Inventário atualizado diretamente no GitHub para `gmtth/beta-all`: 36 PRs no total, **32 merged**, duas abertas (#25 e #31) e duas fechadas sem merge (#16 e #27). `main` consultada em `aeaebb4ae51a4a0644d1277ff778fec65ef7e5e7`; checkout local limpo. A revisão leu instruções/dossiers do componente, lista de arquivos e diffs das PRs, além de rastrear os fluxos atuais. Não executou testes nesta rodada.

| PR | Revisão de comportamento esperado |
|---|---|
| [#1 — métricas e ingestão da base](https://github.com/gmtth/beta-all/pull/1) | PR inicial ampla: consolida a importação explícita, o catálogo e as métricas MCP em D1. A ingestão continua exigindo pedido explícito, scopes adequados, ID interno canônico, RPC transacional e auditoria; a telemetria permanece separada no D1. Não identifiquei perda no recorte conferido. O corpo da PR reporta build aprovado, sem testes automatizados. |
| [#2 — reconexão OAuth](https://github.com/gmtth/beta-all/pull/2) | Acrescenta discovery/PKCE, desafio de autenticação MCP e refresh rotativo. Contratos e limites posteriores estão registrados no AGENTS MCP; os achados atuais de escopo/erro na #26 também afetam esse fluxo OAuth. O corpo reporta build e testes HTML; os testes TypeScript originalmente tentados não executaram por resolução de imports. |
| [#3 — validade configurável do access token](https://github.com/gmtth/beta-all/pull/3) | Configuração por master limitada a 1 minuto–30 dias; novos access tokens usam o valor, sem reescrever validade de tokens existentes nem dos refresh tokens. O corpo reporta 11 testes focados, build e smoke administrativo autenticado; smoke do painel ainda estava pendente. |
| [#4 — latência e sucesso](https://github.com/gmtth/beta-all/pull/4) | Mede duração e taxa de sucesso por ferramenta no D1. Preserva chamadas históricas sem duração na taxa, deixando latência desconhecida em vez de inventá-la. O próprio corpo diz que o build completo não foi executado naquela rodada. |
| [#5 — diagnóstico seguro da importação](https://github.com/gmtth/beta-all/pull/5) | Distingue falhas do Movidesk/Supabase e evita devolver corpos brutos de erro; timeout é tratado como resultado incerto e não como falha seguramente sem gravação. Contrato preservado. A PR reporta 15 testes, build e lint direcionado aprovados; importação de produção não foi confirmada. |
| [#6 — navegador administrativo Supabase](https://github.com/gmtth/beta-all/pull/6) | A página e APIs verificam sessão/role master; prévias são allowlist/paginadas e excluem conteúdo de `record_chunk`. Não encontrei caminho de prévia arbitrária no código atual consultado. A PR reporta build, quatro testes e conferências SQL; smoke HTTP/site master ainda estava pendente. |
| [#7 — importação por ID ou protocolo](https://github.com/gmtth/beta-all/pull/7) | Exige correspondência exata, falha fechada em conflito e persiste o ID interno canônico, evitando duplicidade por consulta via protocolo. Contrato e testes reportados preservam esses comportamentos. Sem importação real adicional nesta revisão. |
| #8 — registro documental da #7 | Só documentação de merge/publicação e ressalva de validação do chamado piloto. Nenhuma regressão de runtime. |
| [#9 — telemetria de status HTTP](https://github.com/gmtth/beta-all/pull/9) | Acrescenta status HTTP a falhas finais registradas; a PR limita corretamente a métrica a chamadas que terminam em erro com status, não respostas intermediárias recuperadas. Sem perda observada. Build e diff-check reportados. |
| [#10 — contexto autenticado de erros](https://github.com/gmtth/beta-all/pull/10) | Guarda e-mail somente em falhas de conta autenticada e painel master, além de status/duração; isso é compatível com a exceção de privacidade vigente, com retenção de 90 dias no caminho de escrita. Build/testes não foram executados naquela rodada, segundo a PR. |
| #11 — registro documental da #10 | Documenta integração/publicação; sem alteração de runtime. |
| [#12 — busca lexical](https://github.com/gmtth/beta-all/pull/12) | RPC filtra registros apagados, fontes inativas e classificação não autorizada; limita consulta/resultados e resposta; usa lexical, não embeddings. A migration preserva `knowledge:read`. A #31 contém baseline que demonstra falhas/ruído em paráfrases; portanto, exatidão por protocolo não valida relevância diagnóstica. PR reporta 28 testes e build; teste live da busca não estava confirmado naquela época. |
| [#13 — indicadores de carregamento](https://github.com/gmtth/beta-all/pull/13) | Spinner compartilhado e acessível nos carregamentos/ações do painel e navegador; não encontrei perda de ações. A branch atual não existe no inventário, mas a PR está merged e comportamento permanece no `main`. |
| [#14 — insights de telemetria](https://github.com/gmtth/beta-all/pull/14) | Mantém volume, erros HTTP e por ferramenta; adiciona comparação temporal, categorias, contas com falhas e percentis. Retenção é aplicada tanto ao gravar evento quanto ao abrir métricas, sem depender apenas da visita do painel. Não identifiquei perda no contrato. |
| #15 — registro documental da #14 | Só registra publicação/estado da telemetria. Nenhuma regressão de runtime. |
| #16 — registro de publicação da busca, fechada sem merge | Somente documentação. A publicação v101 e a limitação da chamada MCP foram registradas depois no dossier; o conteúdo útil foi substituído por registros posteriores. Branch `docs/knowledge-search-publication-status` não aparece no inventário remoto atual. Não reabrir/mesclar. |
| [#17 — protocolo em `movidesk_get_ticket`](https://github.com/gmtth/beta-all/pull/17) | Inclusão aditiva do protocolo visível, preservando ID interno e demais campos da resposta. Dossier registra consulta live e importação posterior; sem perda identificada. |
| [#18 — persistência e busca exata por protocolo](https://github.com/gmtth/beta-all/pull/18) | Preserva protocolo em `attributes`, retorno de busca e comparação exata ao lado do ID interno; o SQL conserva filtro de classificação e melhor trecho por registro. Testes/live registrados nos dossiers. Não executei SQL nem consulta live nesta rodada. |
| [#19 — paginação de importações recentes](https://github.com/gmtth/beta-all/pull/19) | Aumenta feed de 10 para 30, pagina três por vez e limita excedente na API e RPC. Mantém ordenação recente e indicação de faixa. Dossier registra migration, publicação e smoke; nada disso foi repetido nesta revisão. |
| #20 — registro documental da #19 | Só registra migration/deploy e smoke da paginação. Sem alteração de runtime. |
| [#21 — feedback e autodiagnóstico](https://github.com/gmtth/beta-all/pull/21) | Mantém feedback contextual separado da telemetria D1 e da base de conhecimento; exige autorização `feedback:write`, gravação idempotente, acesso master e retenção/agregação programadas. O runtime mantém feature flag desligada conforme dossier. Migration foi reportada aplicada; execução dos jobs e fluxo end-to-end continuam sem evidência de conclusão. |
| #22 — registro documental da #21 | Só documentação do rollout/deploy e smoke relatados; não prova execução dos jobs nem piloto de coleta. |
| [#23 — importação de chamados longos](https://github.com/gmtth/beta-all/pull/23) | Alinha MCP/RPC em 350 mil caracteres, 250 trechos de até 1.500 caracteres, mantém upsert atômico e aumenta timeout para 30s. O código valida limite antes de persistir; migração SQL limita quantidade e tamanho de cada trecho. PR reporta 30 testes, lint/build e migration aplicada; a reimportação específica ficou como follow-up no corpo. |
| [#24 — refinamento visual do painel de feedback](https://github.com/gmtth/beta-all/pull/24) | Mudança de apresentação solicitada; remove rodapé/link e textos redundantes, conserva listagem, ações de revisão/remoção, carregamento incremental e spinners. PR reporta build e 10 testes de renderização. |
| #26 — escopos OAuth por conta | **Achado de segurança confirmado no `main`:** refresh substituto grava `row.scope` integral embora o access token seja emitido com `accessScope` filtrado; se admin reativar depois scope que havia sido removido do access token, outro refresh pode restaurá-lo sem reconexão. Além disso, a rota REST `authorizeMovidesk` usa helper que reduz qualquer falha a `null` e responde `401 invalid_token`, inclusive `insufficient_scope`; o contrato exige distinção. Ver `token-grants.ts:121-128`, `app/api/_movidesk.ts:36-42` e AGENTS MCP. Recomenda-se persistir somente scopes efetivos no refresh girado e propagar o motivo de autorização. |
| #28 — registro documental da #26 | Só documentação de merge, testes e publicação. Sem runtime próprio. |
| #29 — controles compactos de scope | Mantém checkbox individual, descrições acessíveis, salvamento e estado ocupado. Mudança visual sem perda funcional observada. |
| #30 — registro documental da #29 | Só documentação de publicação. |
| #32 — seções sob demanda no painel | Carrega ao expandir, cancela/limpa ao recolher e permite retry após erro. Build reportado; testes e inspeção visual autenticada pendentes segundo a PR. |
| #33 — registro documental da #32 | Só registro do deploy. Não converte a inspeção visual pendente em evidência concluída. |
| #34 — remoção do resumo de scopes | **Perda de visibilidade confirmada:** API ainda retorna `tokenScopes`, mas painel mostra contagem/expiração e scopes configurados pelo administrador, sem mostrar quais scopes estão nos tokens; a mensagem de reconexão depende desse dado invisível. Contrato do dossier distingue as duas listas. Recomenda-se restaurar indicação compacta/acessível dos scopes efetivamente concedidos. |
| #35 — registro documental da #34 | Só registra sincronização/publicação. Sem runtime próprio. |
| #36 — reranking lexical | Preserva resposta, filtros e match exato por ID/protocolo; porém a migration ainda consta como proposta não aplicada, teste pgTAP/SQL não executado e baseline live de 11 perguntas sem repetição validada. Não há evidência para afirmar melhora em produção. A #31 contém essa baseline e atende referência já citada no dossier; recomendo integrá-la após atualização/reconciliação. |

**PRs abertas:** #25 continua sendo registro de publicação da #24 (v108/smoke); seu patch corrige o dossier que ainda descreve a mudança como local/não publicada. **Merge recomendado após atualizar e reconciliar a branch**, sem merge direto por `mergeable: false`. #31 registra a baseline das 11 consultas reais e estado da importação longa; a baseline não está no `main`, e sua referência é necessária para a avaliação da #36. **Merge recomendado após atualizar/reconciliar**; não declarar ranking validado.

**PRs fechadas sem merge:** #16 é documentação substituída por registros posteriores. #27 reapresenta a implementação OAuth já integrada na #26 devido à ancestralidade do squash e conserva a interface antiga com scopes visíveis; essa interface foi posteriormente alterada pela #29 e a lista visível foi removida pela #34. A documentação de deploy da #27 foi substituída pela #28. **Não recomendo mesclar #27**, pois sua árvore é anterior às decisões posteriores e poderia reverter ajustes; a branch `codex/admin-user-scopes` ainda existe no GitHub, ligada à PR fechada, e só deve ser excluída mediante pedido. Nenhuma branch remota sem PR foi encontrada: os refs listados correspondem a PRs existentes, além de `main`. As branches citadas historicamente `feat/site-loading-spinners` e `docs/knowledge-search-publication-status` não aparecem; a primeira tem implementação merged na #13, a segunda era #16 fechada sem merge.

**Validação desta rodada:** diff/código/documentação e metadados GitHub foram consultados; não rodei testes, build, SQL, deployment ou smoke. Os resultados atribuídos a PRs são os reportados nelas/dossiers, não execuções minhas. Nada foi alterado em runtime, Supabase, Sites, PRs ou branches.

## Achados que exigem revalidação

Achados revalidados em 2026-10-22 contra o `main` consultado no SHA `aeaebb4ae51a4a0644d1277ff778fec65ef7e5e7`:

| Origem | Achado registrado | Revalidação necessária |
|---|---|---|
| #26 | **Confirmado no código atual:** scope removido pode sobreviver no refresh girado e voltar após reativação; `insufficient_scope` é reduzido a `401 invalid_token` em rotas REST. | Correção no runtime e regressões de teste ainda necessárias; nenhuma feita pelo revisor. |
| #34 | **Confirmado no código atual:** a tela omite `tokenScopes`, embora a API ainda forneça a lista. | Restaurar indicação visível dos scopes do token sem confundir com grants administrativos; nenhuma alteração feita pelo revisor. |
| #36 | **Pendente de validação externa:** o dossier Supabase ainda registra migration/rollback preparados, sem execução SQL, aplicação remota nem repetição das 11 consultas. | Executar o teste SQL, verificar migration no banco e repetir baseline após integração/publicação; não alegar melhora ainda. |

## Cobertura de PRs e branches

| Identificador | Estado no ledger | Limite |
|---|---|---|
| #1–#15, #17–#24 | Merged e cobertas nesta rodada. | Revisão estática de diffs, código e contratos; sem execução de testes nesta rodada. |
| #26, #28–#30, #32–#36 | Merged, cobertas em parecer anterior e findings #26/#34/#36 revalidados nesta rodada. | #26 e #34 persistem; #36 continua sem validação live. |
| #25, #31 | Abertas no snapshot de 2026-10-22; análise executiva registrada. | Diff/checks precisam de reconsulta antes de nova recomendação. |
| #16 | Fechada sem merge; era documental e o conteúdo útil foi substituído por registros posteriores. | Não conta como merged; branch correspondente ausente na consulta de 2026-10-22. |
| #27 | Fechada sem merge; código de escopos deriva da #26 já merged; branch conserva apresentação anterior à remoção da lista de scopes na #34 e documentação substituída pela #28. | Não mesclar; `codex/admin-user-scopes` ainda aparece como ref remota associada a PR fechada. Reavaliar exclusão apenas se solicitada. |
| #25 e #31 | Abertas e não mergeable no inventário de 2026-10-22. | Recomendações registradas acima; reconsultar base, diff e checks na próxima rodada. |
| Branches remotas sem PR | Nenhuma encontrada na busca de 2026-10-22. | Os refs listados pertencem a PRs conhecidas, além de `main`; `feat/site-loading-spinners` e `docs/knowledge-search-publication-status` não aparecem. |

## Próximos passos

| Prioridade | Trabalho | Contexto/evidência | Condição de conclusão |
|---|---|---|---|
| Alta | Corrigir os dois defeitos de autorização identificados na #26. | Refresh token conserva `row.scope` em vez dos scopes efetivos; rota REST colapsa `insufficient_scope`. | Correção de runtime com testes de regressão e preservação dos demais grants/contratos. |
| Alta | Restaurar visibilidade dos scopes efetivamente concedidos nos tokens. | #34 removeu sua apresentação, embora a API e o aviso de reconexão ainda dependam deles. | Painel distingue visualmente scopes do token dos scopes ativados pelo administrador e mantém acessibilidade. |
| Alta | Atualizar/reconciliar as branches abertas #25 e #31 antes de recomendar merge final. | Ambas seguem não mergeable; #25 reconcilia publicação da página, #31 mantém baseline da #36 ausente no `main`. | Consultar estado novo e integrar somente após reconciliar docs posteriores; não alegar busca validada antes da medição. |
| Alta | Validar reranking #36 em SQL e no corpus live. | Migração/teste SQL e repetição das 11 consultas continuam pendentes segundo os dossiers e a PR. | Teste SQL aprovado, migration remota comprovada e benchmark repetido com resultados comparáveis. |

## Fontes de verdade

1. Pedido atual do usuário e autorização desta tarefa.
2. [`../AGENTS.md`](../AGENTS.md) e `AGENTS.md` ativo do componente afetado.
3. Contratos, arquitetura/ADRs, testes e critérios de aceite canônicos.
4. Código e estado remoto atual; checks/CI e evidência direta de execução/deploy, sempre identificados por SHA/data.
5. Dossiers ativos atualizados com proveniência.
6. Histórico de PRs, comentários, snapshots, branches antigas e legado, somente como evidência contextual.

PR mergeada não prova deployment. Status verde não prova teste de contrato não incluído. Arquivo de migration não prova aplicação. Ausência de teste não prova defeito, mas limita a confiança. Quando as fontes não permitirem conclusão, registrar como inconclusivo e indicar a evidência exata que falta.
