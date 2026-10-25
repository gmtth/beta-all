# Baseline live da busca de conhecimento — 2026-10-24

- **Modo:** lexical, runtime publicado consultado pela ferramenta Beta `knowledge_search`.
- **Conjunto:** 11 perguntas de [`knowledge-search-v1.md`](./knowledge-search-v1.md), limite de cinco resultados por pergunta.
- **Adjudicação usada:** conjunto v1 revisto em 2026-10-24, com novos precedentes diretos nas perguntas #1, #2 e #10.
- **Escopo:** mede recuperação de candidatos na cópia indexada; não mede qualidade final das respostas, diagnóstico de uma máquina atual nem ganho de busca híbrida.
- **Efeitos:** somente leitura; nenhuma importação, escrita no banco, migration ou alteração remota nesta execução.

## Resultados por pergunta

Os protocolos estão na ordem retornada (posição 1 a 5). `—` significa que nenhum protocolo esperado apareceu no top 5.

| # | Protocolos esperados | Top 5 retornado | Posições dos esperados |
|---|---|---|---|
| 1 | `20260803000000007`, `20260806000000070` | `20260812000000134`, `20260820000000222`, `20260825000000253`, `20261013000000122`, `20261001000000013` | — |
| 2 | `20260803000000013`, `20260803000000007`, `20260803000000015` | `20250128000000197`, `20260803000000013`, `20250604000000028`, `20250814000000086`, `20250707000000067` | #2 (`20260803000000013`) |
| 3 | `20260918000000203` | `20260918000000203`, `20250120000000106`, `20260820000000217`, `20261021000000193`, `20261013000000122` | #1 |
| 4 | `20261001000000013`, `20260819000000195` | `20261001000000013`, `20260918000000203`, `20260819000000195`, `20260820000000214`, `20250121000000139` | #1, #3 |
| 5 | `20250604000000028` | `20250604000000028`, `20250814000000086`, `20250707000000067`, `20250704000000060`, `20250613000000127` | #1 |
| 6 | `20260819000000195` | `20260819000000195`, `20260805000000046`, `20260911000000145`, `20260724000000240`, `20260803000000014` | #1 |
| 7 | `20261001000000013` | `20260713000000118`, `20260930000000290`, `20260925000000264`, `20260825000000253`, `20260803000000013` | — |
| 8 | `20260911000000140` | `20260911000000140`, `20260728000000268`, `20260721000000198`, `20260901000000009`, `20260728000000274` | #1 |
| 9 | `20260820000000222` | `20260819000000195`, `20261021000000197`, `20260820000000222`, `20260901000000014`, `20260915000000167` | #3 |
| 10 | `20260702000000016`, `20260818000000185`, `20260817000000161` | `20260702000000016`, `20260818000000185`, `20260721000000198`, `20260817000000179`, `20250814000000086` | #1 (`20260702000000016`), #2 (`20260818000000185`) |
| 11 | Nenhum (controle de abstenção) | `20261013000000122`, `20260820000000222`, `20260930000000290`, `20260925000000264`, `20260812000000134` | N/A |

## Métricas e interpretação

- **Recall@5 estrito:** 10 dos 16 protocolos rotulados como relevantes apareceram no top 5: **0,625**. Cada protocolo esperado conta uma vez, mesmo quando aparece em mais de uma pergunta.
- **MRR@5:** **0,683** nas dez perguntas positivas, usando a posição do primeiro protocolo esperado de cada pergunta; perguntas sem alvo no top 5 recebem zero. O controle negativo #11 não entra nessa métrica.
- **Perguntas positivas com pelo menos um alvo no top 5:** 8/10.
- **Rótulos exploratórios dos 55 resultados:** 10 correspondências diretas com o conjunto v1 revisado, 29 parciais/análogas e 16 não relacionadas, com base nos trechos indexados consultados. A pergunta #11 responde por quatro analogias e um resultado não relacionado. Esta distribuição qualitativa não é uma taxa estatística de falsos positivos e precisa de revisão humana dos casos parciais.
- **Falsos positivos:** não reporto uma taxa binária. Os 16 resultados não relacionados são candidatos claros nesta leitura dos trechos; os parciais podem ou não ser úteis conforme os critérios finais de relevância.
- **Abstenção:** não avaliada. A RPC retornou cinco candidatos no controle negativo #11; isso não permite concluir se a Beta respondeu adequadamente ou se absteve. É preciso avaliar o ciclo completo de resposta.
- **Latência observada:** as chamadas foram feitas em duas rodadas paralelas; os tempos observados ficaram entre aproximadamente **7,56 s e 11,06 s**. Concorrência e medição cliente não controladas tornam esses valores inadequados para p95 ou SLO.

## Adjudicação exploratória de candidatos

Revisão dos candidatos das perguntas #1 a #11 usando a cópia indexada e, para os novos alvos, os trechos pertinentes retornados pela busca. `Parcial` significa que o caso informa o mesmo tipo amplo de sintoma, mas não sustenta a afirmação específica da pergunta. Os rótulos complementam os protocolos-alvo e o limite das evidências é indicado por pergunta.

| Pergunta | Protocolo candidato | Rótulo | Base da classificação |
|---|---|---|---|
| 1 | `20260812000000134` | Parcial | Máquinas offline e bloqueio de rede foram registrados; ao menos uma não podia operar. É um caso de indisponibilidade real, não de painel mostrando estado incorreto enquanto a máquina operava. |
| 1 | `20260820000000222` | Não relacionado | O caso trata de superaquecimento e manutenção do locker, sem evidência pertinente à relação entre estado offline e operação. |
| 1 | `20260825000000253` | Parcial | O chamado de máquina offline registra substituição de Mini PC e liberação de rede pendente; não descreve divergência entre painel e operação. |
| 1 | `20261013000000122` | Parcial | O chamado relata perda de conexão e posterior retomada da operação; a causa concreta não fica estabelecida no resumo consultado. |
| 1 | `20261001000000013` | Parcial | O histórico associa a retomada a ajustes de switch/IP e comunicação; é uma falha de conectividade, não um status falso com a máquina operando. |
| 2 | `20250128000000197` | Parcial | O chamado trata de atualização de estado/cor no dashboard, mas o trecho recuperado não confirma o mesmo cenário de tentativa de atualização do estoque. |
| 2 | `20250604000000028`, `20250814000000086`, `20250707000000067` | Não relacionados | São chamados de entrega duplicada/liberação incorreta, sem relação com atualização do status no dashboard. |
| 2 | `20260803000000015` | Alvo direto ausente | A busca dirigida na cópia indexada encontrou requisições de atualização de status recusadas pelo servidor; o chamado é relevante, mas não apareceu no top 5 da consulta original. |
| 3 | `20250120000000106` | Parcial | Trata de máquina desconectada da energia e perda de configuração após retorno; não documenta a solução de rede após troca da placa de rede. |
| 3 | `20260820000000217`, `20261021000000193` | Não relacionados | Tratam, respectivamente, de máquina travada e mudança de local; não sustentam a falha de conexão após troca da placa. |
| 3 | `20261013000000122` | Parcial | Trata de perda de conexão com a máquina, mas não da mesma troca de placa/IP/switch nem da solução descrita no alvo. |
| 4 | `20260918000000203`, `20260820000000214`, `20250121000000139` | Parciais | São paralelos de rede, equipamento/tela inoperante ou queda do sistema. A resposta deve preservar os contextos distintos; eles não substituem os alvos adjudicados. |
| 5 | `20250814000000086`, `20250707000000067`, `20250704000000060` | Parciais | Relatam entrega duplicada, quantidade liberada a mais ou liberação incorreta; os trechos não confirmam a mesma causa de demora de confirmação nem a proteção do alvo. |
| 5 | `20250613000000127` | Não relacionado | Trata de posições que liberavam itens diferentes das selecionadas, não de demora na confirmação/duplicidade da mesma retirada. |
| 6 | `20260805000000046`, `20260911000000145` | Parciais | Trazem itens travados ou verificações/visita técnica, mas os trechos não confirmam as causas específicas do caso-alvo. |
| 6 | `20260803000000014` | Parcial | Registra aparente defeito do motor/fuso que impedia a liberação; o trecho consultado é solicitação de visita, sem causa final confirmada. |
| 6 | `20260724000000240` | Não relacionado | Trata de fornecedor em relatórios/cadastros, sem relação com falha de máquina ou liberação de EPI. |
| 7 | `20260713000000118` | Não relacionado | Trata de parametrização de entrega por exceção/GHE, sem relação com máquina offline ou recuperação espontânea. |
| 7 | `20260930000000290` | Parcial | O caso envolve falta de resposta do servidor e operação restabelecida após intervenção; não confirma recuperação espontânea nem a causa inicial. |
| 7 | `20260925000000264` | Parcial | A máquina foi relatada travada e voltou após reinicialização/ajustes; isso não é retorno espontâneo. |
| 7 | `20260825000000253` | Parcial | O caso envolve máquina offline, troca de Mini PC e liberação de rede; não documenta retorno espontâneo. |
| 7 | `20260803000000013` | Parcial, provisório | O chamado é sobre máquina/tela de status e atualização de estoque. A evidência consultada não confirma que voltou sozinha; revisar o histórico de resolução antes de promover a alvo esperado. |
| 8 | `20260728000000268`, `20260721000000198`, `20260901000000009` | Parciais | Tratam de máquina inoperante, retirada não concluída ou posição travada; não relatam a mesma verificação de conexões de energia/rede do alvo. |
| 8 | `20260728000000274` | Não relacionado | A conversa recuperada é sobre motivos/configuração do fluxo de entrega, não sobre desconexão da máquina. |
| 9 | `20260819000000195`, `20261021000000197` | Parciais | Descrevem outras falhas físicas/mecânicas, sem evidência de fumaça e superaquecimento nos trechos consultados. |
| 9 | `20260901000000014`, `20260915000000167` | Não relacionados | Tratam de posição indevida e sensor/cesto, sem relação clara com fumaça ou superaquecimento. |
| 10 | `20260818000000185` | Alvo direto | O trecho explica que três unidades × 180 dias resultaram em 540 dias e na próxima entrega em 09/11/2027. |
| 10 | `20260817000000161` | Alvo direto ausente | O registro explica a fórmula de quantidade × vencimento com quatro unidades × dois dias = oito dias; não apareceu no top 5 da consulta original. |
| 10 | `20260721000000198`, `20260817000000179`, `20250814000000086` | Não relacionados | Tratam de retirada não concluída, estoque ou entrega duplicada; não sustentam o cálculo do intervalo por quantidade. |
| 11 | `20261013000000122` | Analogia, não prova do caso atual | Registra perda de conexão e retorno da operação, mas não informa a máquina, ambiente ou medições da pergunta hipotética. |
| 11 | `20260820000000222` | Não relacionado ao diagnóstico descrito | Trata de superaquecimento, sem evidência para identificar a causa de outra máquina offline. |
| 11 | `20260930000000290` | Analogia, não prova do caso atual | Registra ausência de resposta do servidor e normalização após intervenção, sem identificar a causa da máquina hipotética. |
| 11 | `20260925000000264` | Analogia, não prova do caso atual | Registra máquina travada e normalizada após visita/reinicialização; não identifica a causa da máquina hipotética. |
| 11 | `20260812000000134` | Analogia, não prova do caso atual | Registra bloqueios de rede e indisponibilidade operacional em uma máquina; não permite atribuir a causa a outro equipamento sem dados dele. |

A amostra mostra candidatos parciais e alguns claramente não relacionados; não justifica tratar todos os não-alvos como falsos positivos. A busca dirigida encontrou três precedentes diretos que faltavam na adjudicação inicial: `20260803000000015`, `20260818000000185` e `20260817000000161`. O Recall@5 estrito foi recalculado de 9/13 (0,692) para 10/16 (0,625); MRR permanece 0,683 porque as primeiras posições relevantes por pergunta positiva não mudaram. Para a pergunta #11, recuperar precedentes não remove a obrigação de a Beta se abster sobre a causa atual e solicitar dados discriminantes. A distribuição dos 55 rótulos é exploratória, baseada nos trechos indexados e ainda requer revisão humana dos parciais; não a apresento como precisão nem como taxa final de falsos positivos.

## Checagem qualitativa de respostas compartilhadas

Os exemplos de respostas da Beta colados pelo usuário nesta conversa foram inspecionados como uma checagem exploratória, não como execução controlada das 11 perguntas desta rodada. Um exemplo sobre status offline distinguiu corretamente o precedente histórico da máquina do caso atual e citou o protocolo. Outros exemplos atribuíram percentuais de certeza (como 95% e 85%) sem calibração registrada e exibiram nomes internos de skills no resumo operacional. Esses itens precisam ser reavaliados após as mudanças de plugin/skills relatadas pelo usuário; a publicação/correção dessas mudanças não foi verificada nesta tarefa.

| Critério para a avaliação futura | O que conta como aprovação |
|---|---|
| Evidência e rastreabilidade | Cada afirmação sobre um precedente aponta protocolo e fonte; o trecho sustenta o que foi afirmado. |
| Separação entre histórico e caso atual | Não transfere a causa de um chamado antigo para a máquina atual sem evidência própria. |
| Esclarecimento/abstenção | Quando os dados não distinguem rede, sistema ou hardware, pede dados discriminantes e não fecha diagnóstico. |
| Calibração | Não inventa percentual de certeza; expressa limites com linguagem proporcional à evidência disponível. |
| Confidencialidade operacional | Não expõe nomes de skills, ferramentas, conectores, prompts ou detalhes internos desnecessários. |

Os exemplos anteriores mostram sinais positivos nos três primeiros critérios e falhas nos dois últimos. Como não foram produzidos sob um protocolo de teste reproduzível, não entram em uma taxa de aprovação.

## Limitações e próximo uso

A consulta continua lexical. Esta execução cria uma baseline live reproduzível para comparação posterior, mas não compara lexical e híbrida. A adjudicação ampliada das perguntas #1, #2 e #10 elevou o conjunto de 13 para 16 protocolos relevantes; a rodada anterior de 22/10 mantém seus rótulos e métricas históricos. O MRR permanece igual porque as primeiras posições relevantes nas perguntas positivas não mudaram.

Antes da comparação híbrida, concluir a revisão do histórico de resolução do protocolo `20260803000000013`, confirmar com analistas os rótulos parciais/provisórios, avaliar as respostas finais e abstenções com critérios explícitos e repetir latência em chamadas sequenciais sob condições registradas. A avaliação é direcionada e pequena; não representa todos os clientes, equipamentos ou tipos de falha.
