# Baseline live da busca de conhecimento — 2026-10-24

- **Modo:** lexical, runtime publicado consultado pela ferramenta Beta `knowledge_search`.
- **Conjunto:** 11 perguntas de [`knowledge-search-v1.md`](./knowledge-search-v1.md), limite de cinco resultados por pergunta.
- **Adjudicação usada:** versão atual do v1. A pergunta #1 inclui dois precedentes confirmados, após acrescentar o chamado `20260806000000070`, já validado anteriormente nesta conversa.
- **Escopo:** mede recuperação de candidatos na cópia indexada; não mede qualidade final das respostas, diagnóstico de uma máquina atual nem ganho de busca híbrida.
- **Efeitos:** somente leitura; nenhuma importação, escrita no banco, migration ou alteração remota nesta execução.

## Resultados por pergunta

Os protocolos estão na ordem retornada (posição 1 a 5). `—` significa que nenhum protocolo esperado apareceu no top 5.

| # | Protocolos esperados | Top 5 retornado | Posições dos esperados |
|---|---|---|---|
| 1 | `20260803000000007`, `20260806000000070` | `20260812000000134`, `20260820000000222`, `20260825000000253`, `20261013000000122`, `20261001000000013` | — |
| 2 | `20260803000000013`, `20260803000000007` | `20250128000000197`, `20260803000000013`, `20250604000000028`, `20250814000000086`, `20250707000000067` | #2 (`20260803000000013`) |
| 3 | `20260918000000203` | `20260918000000203`, `20250120000000106`, `20260820000000217`, `20261021000000193`, `20261013000000122` | #1 |
| 4 | `20261001000000013`, `20260819000000195` | `20261001000000013`, `20260918000000203`, `20260819000000195`, `20260820000000214`, `20250121000000139` | #1, #3 |
| 5 | `20250604000000028` | `20250604000000028`, `20250814000000086`, `20250707000000067`, `20250704000000060`, `20250613000000127` | #1 |
| 6 | `20260819000000195` | `20260819000000195`, `20260805000000046`, `20260911000000145`, `20260724000000240`, `20260803000000014` | #1 |
| 7 | `20261001000000013` | `20260713000000118`, `20260930000000290`, `20260925000000264`, `20260825000000253`, `20260803000000013` | — |
| 8 | `20260911000000140` | `20260911000000140`, `20260728000000268`, `20260721000000198`, `20260901000000009`, `20260728000000274` | #1 |
| 9 | `20260820000000222` | `20260819000000195`, `20261021000000197`, `20260820000000222`, `20260901000000014`, `20260915000000167` | #3 |
| 10 | `20260702000000016` | `20260702000000016`, `20260818000000185`, `20260721000000198`, `20260817000000179`, `20250814000000086` | #1 |
| 11 | Nenhum (controle de abstenção) | `20261013000000122`, `20260820000000222`, `20260930000000290`, `20260925000000264`, `20260812000000134` | N/A |

## Métricas e interpretação

- **Recall@5 estrito:** 9 dos 13 protocolos rotulados como relevantes apareceram no top 5: **0,692**. Cada protocolo esperado conta uma vez, mesmo quando aparece em mais de uma pergunta.
- **MRR@5:** **0,683** nas dez perguntas positivas, usando a posição do primeiro protocolo esperado de cada pergunta; perguntas sem alvo no top 5 recebem zero. O controle negativo #11 não entra nessa métrica.
- **Perguntas positivas com pelo menos um alvo no top 5:** 8/10.
- **Falsos positivos:** não calculados. Os candidatos sem rótulo não foram revisados individualmente e não devem ser chamados de falsos positivos sem adjudicação.
- **Abstenção:** não avaliada. A RPC retornou cinco candidatos no controle negativo #11; isso não permite concluir se a Beta respondeu adequadamente ou se absteve. É preciso avaliar o ciclo completo de resposta.
- **Latência observada:** as chamadas foram feitas em duas rodadas paralelas; os tempos observados ficaram entre aproximadamente **7,56 s e 11,06 s**. Concorrência e medição cliente não controladas tornam esses valores inadequados para p95 ou SLO.

## Adjudicação exploratória de candidatos

Revisão manual dos candidatos das perguntas #1 e #7 e do controle negativo #11, conferindo resumos/históricos autorizados no Movidesk. `Parcial` significa que o caso informa o mesmo tipo amplo de sintoma, mas não sustenta a afirmação específica da pergunta. Estes rótulos complementam a lista de protocolos-alvo; não alteram a métrica estrita acima.

| Pergunta | Protocolo candidato | Rótulo | Base da classificação |
|---|---|---|---|
| 1 | `20260812000000134` | Parcial | Máquinas offline e bloqueio de rede foram registrados; ao menos uma não podia operar. É um caso de indisponibilidade real, não de painel mostrando estado incorreto enquanto a máquina operava. |
| 1 | `20260820000000222` | Não relacionado | O caso trata de superaquecimento e manutenção do locker, sem evidência pertinente à relação entre estado offline e operação. |
| 1 | `20260825000000253` | Parcial | O chamado de máquina offline registra substituição de Mini PC e liberação de rede pendente; não descreve divergência entre painel e operação. |
| 1 | `20261013000000122` | Parcial | O chamado relata perda de conexão e posterior retomada da operação; a causa concreta não fica estabelecida no resumo consultado. |
| 1 | `20261001000000013` | Parcial | O histórico associa a retomada a ajustes de switch/IP e comunicação; é uma falha de conectividade, não um status falso com a máquina operando. |
| 7 | `20260713000000118` | Não relacionado | Trata de parametrização de entrega por exceção/GHE, sem relação com máquina offline ou recuperação espontânea. |
| 7 | `20260930000000290` | Parcial | O caso envolve falta de resposta do servidor e operação restabelecida após intervenção; não confirma recuperação espontânea nem a causa inicial. |
| 7 | `20260925000000264` | Parcial | A máquina foi relatada travada e voltou após reinicialização/ajustes; isso não é retorno espontâneo. |
| 7 | `20260825000000253` | Parcial | O caso envolve máquina offline, troca de Mini PC e liberação de rede; não documenta retorno espontâneo. |
| 7 | `20260803000000013` | Parcial, provisório | O chamado é sobre máquina/tela de status e atualização de estoque. A evidência consultada não confirma que voltou sozinha; revisar o histórico de resolução antes de promover a alvo esperado. |
| 11 | `20261013000000122` | Analogia, não prova do caso atual | Registra perda de conexão e retorno da operação, mas não informa a máquina, ambiente ou medições da pergunta hipotética. |
| 11 | `20260820000000222` | Não relacionado ao diagnóstico descrito | Trata de superaquecimento, sem evidência para identificar a causa de outra máquina offline. |
| 11 | `20260930000000290` | Analogia, não prova do caso atual | Registra ausência de resposta do servidor e normalização após intervenção, sem identificar a causa da máquina hipotética. |
| 11 | `20260925000000264` | Analogia, não prova do caso atual | Registra máquina travada e normalizada após visita/reinicialização; não identifica a causa da máquina hipotética. |
| 11 | `20260812000000134` | Analogia, não prova do caso atual | Registra bloqueios de rede e indisponibilidade operacional em uma máquina; não permite atribuir a causa a outro equipamento sem dados dele. |

A amostra mostra candidatos parciais e alguns claramente não relacionados; não justifica tratar todos os não-alvos como falsos positivos. Para a pergunta #11, a recuperação de precedentes não remove a obrigação de a Beta se abster sobre a causa atual e solicitar dados discriminantes. Não foi calculada precisão global, pois esta revisão cobre apenas três perguntas e inclui um rótulo provisório.

## Limitações e próximo uso

A consulta continua lexical. Esta execução cria uma baseline live reproduzível para comparação posterior, mas não compara lexical e híbrida. O aumento de um para dois alvos na pergunta #1 corrige uma lacuna de adjudicação conhecida; por isso Recall@5 usa 13 alvos, enquanto o registro da avaliação anterior preserva a adjudicação disponível na data daquela execução. O MRR permanece igual porque a pergunta #1 continuou sem alvo recuperado.

Antes da comparação híbrida, concluir a revisão do histórico de resolução do protocolo `20260803000000013`, adjudicar os demais candidatos das perguntas positivas com analistas, avaliar as respostas finais e abstenções com critérios explícitos e repetir latência em chamadas sequenciais sob condições registradas. A avaliação é direcionada e pequena; não representa todos os clientes, equipamentos ou tipos de falha.
