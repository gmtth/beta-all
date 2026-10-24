# Avaliação de busca de conhecimento — v1

- **Data:** 2026-10-22
- **Fonte de adjudicação:** chamados consultados no Movidesk por ferramenta autorizada e conferidos pelo resumo/histórico do registro.
- **Uso:** comparar busca lexical atual e futura busca híbrida; não usar este conjunto como conteúdo para resposta ao cliente.

## Regras de avaliação

- `esperado` identifica precedentes que devem aparecer entre os candidatos; não significa que resolvam o caso atual.
- `confirmado` significa que o chamado registra explicitamente a causa/ação indicada na nota. `parcial` indica que o caso é relevante, mas não confirma todos os detalhes da pergunta. `abstenção` significa que a consulta não oferece evidência suficiente para afirmar uma causa.
- Cada resposta deve manter protocolo e título como proveniência, separar fato de hipótese e pedir os dados atuais que faltam.
- Consultas negativas/ambíguas são necessárias para medir falsos positivos e a capacidade de a Beta não inventar diagnóstico.
- O arquivo não reproduz transcrições, nomes, e-mails, telefones, endereços, IPs ou anexos dos chamados.

## Casos positivos e ambíguos

| # | Pergunta de avaliação | Protocolos esperados | Adjudicação e o que o registro sustenta |
|---|---|---|---|
| 1 | O painel diz que a máquina está offline. Isso prova que o equipamento parou? | `20260803000000007` | **Confirmado:** o chamado atribui o status incorreto a uma configuração do sistema que impedia o dashboard de consultar o estado atual; após liberação, a operação normalizou. Não prova o estado de outra máquina. |
| 2 | A máquina fica tentando atualizar o estoque e o painel não mostra o estado atual. Há precedente de falha no sistema de status? | `20260803000000013`, `20260803000000007` | **Confirmado:** o histórico associa o comportamento a uma configuração de segurança no código que bloqueava a consulta do estado pelo dashboard. |
| 3 | Uma máquina ficou sem conexão mesmo após troca de placa de rede. O que resolveu um caso semelhante? | `20260918000000203` | **Confirmado:** o registro descreve mudança de porta no switch, liberação do novo IP e retorno da máquina ao estado online. É um precedente de rede, não confirmação da causa do caso atual. |
| 4 | Uma máquina parou de funcionar; como diferenciar problema de rede de falha do equipamento? | `20261001000000013`, `20260819000000195` | **Confirmado/parcial:** o primeiro registra restauração após ajustes de switch/IP. O segundo registra causas distintas em máquinas diferentes: mini-PC travado e motor em curto em uma; ausência de rede na outra. A resposta precisa preservar essa distinção. |
| 5 | Uma retirada foi registrada duas vezes após demora na confirmação. Como isso foi tratado? | `20250604000000028` | **Confirmado:** o chamado relata duplicidade associada à instabilidade de rede e uma proteção para evitar processar duas vezes a mesma retirada. |
| 6 | A máquina indica falta de estoque, trava e falha ao liberar itens. Que causas foram encontradas numa visita? | `20260819000000195` | **Confirmado:** o relatório separa mini-PC travado e motor em curto numa máquina, e problema de rede na outra. Não fundir os dois achados numa causa única. |
| 7 | A máquina aparece offline, mas voltou sozinha. O histórico confirma por que ela caiu? | `20261001000000013` | **Parcial:** a máquina voltou a operar e houve ajustes de rede registrados, mas o chamado não confirma que a recuperação foi espontânea nem demonstra todos os detalhes da causa inicial. |
| 8 | A máquina não liberava o EPI e aparecia desconectada. O que a verificação encontrou? | `20260911000000140` | **Confirmado:** a equipe registrou conexões de rede e energia mal encaixadas; após conferi-las, o funcionamento e as entregas foram restabelecidos. Bloqueios de rede também foram investigados. Esse precedente não confirma a causa de outra máquina. |
| 9 | Houve fumaça, aquecimento e falha nas portas da máquina. O que a avaliação encontrou? | `20260820000000222` | **Confirmado:** histórico de visita registra aquecimento excessivo, dano em componentes/fusíveis e operação parcial após manutenção; o caso também tinha tratativa pendente com fabricante. Não apresentar como solução integral concluída. |
| 10 | A próxima retirada foi adiada porque o prazo era multiplicado pela quantidade entregue? | `20260702000000016` | **Confirmado:** o caso registra cinco unidades, prazo unitário de dez dias e cálculo de cinquenta dias, levando à data de 21/08/2026. É regra/cadastro descrito naquele chamado, não necessariamente regra universal. |
| 11 | Sem protocolo, modelo da máquina, ambiente ou resultado de teste, qual componente causou o status offline? | **Nenhum protocolo obrigatório; abstenção** | **Controle negativo:** não afirmar rede, hardware ou sistema. Solicitar informações discriminantes e, só então, buscar precedentes. |

## Como usar na comparação

Executar cada pergunta na mesma versão da RPC, com o mesmo limite de resultados. Registrar por consulta: protocolos encontrados e posição, precedentes esperados ausentes, falsos positivos, se a resposta se absteve quando necessário, latência e se a evidência citada sustenta a conclusão. Comparar lexical e híbrida com `Recall@5`, `MRR@5`, falsos positivos e acerto de abstenção; não usar `relevance` como probabilidade de certeza.

O conjunto é uma primeira amostra direcionada de chamados já confirmados; ainda não é uma avaliação estatística representativa de todos os tipos de máquina, clientes ou períodos. Antes de declarar ganho geral, ampliar diversidade e revisar a adjudicação com analistas.

## Rodada lexical registrada — 2026-10-22

- **Ambiente observado:** ferramenta `knowledge_search` publicada, `mode=lexical`, `limit=5`; 11 consultas executadas sequencialmente.
- **Medição de latência:** tempo de parede da chamada da ferramenta pelo conector, incluindo rede/orquestração; não é latência isolada da RPC ou do banco.
- **Protocolos esperados recuperados:** 9 de 12 protocolos positivos (`Recall@5 = 0,750`).
- **`MRR@5`:** 0,733, calculado por pergunta positiva (10 perguntas); pergunta sem alvo recuperado contribui zero.
- **Latência observada:** mínimo 6,668 s; mediana 6,840 s; p95 8,059 s; máximo 8,059 s. Amostra pequena, sequencial e sem repetição; não constitui SLA.
- **Controle negativo (#11):** a ferramenta devolveu 5 candidatos. A busca lexical não abstém por si; este benchmark não mediu se a resposta final da Beta pediu esclarecimentos ou evitou atribuir causa.
- **Falsos positivos:** não quantificados nesta rodada. Candidatos fora da lista adjudicada não foram automaticamente classificados como irrelevantes; exigem revisão humana. Os cinco resultados do controle negativo são candidatos sem protocolo-alvo esperado, não prova de que todos sejam semanticamente irrelevantes.

| # | Protocolos esperados | Posições dos esperados no top 5 | Protocolos retornados (ordem) |
|---|---|---|---|
| 1 | `20260803000000007` | ausente | `20260812000000134`, `20260820000000222`, `20260825000000253`, `20261013000000122`, `20261001000000013` |
| 2 | `20260803000000013`, `20260803000000007` | `20260803000000013` #1; outro ausente | `20260803000000013`, `20250604000000028`, `20250814000000086`, `20250707000000067`, `20250704000000060` |
| 3 | `20260918000000203` | #1 | `20260918000000203`, `20260820000000217`, `20261021000000193`, `20261013000000122`, `20260825000000253` |
| 4 | `20261001000000013`, `20260819000000195` | #1, #3 | `20261001000000013`, `20260918000000203`, `20260819000000195`, `20260820000000214`, `20260825000000253` |
| 5 | `20250604000000028` | #1 | `20250604000000028`, `20250814000000086`, `20250707000000067`, `20250704000000060`, `20250613000000127` |
| 6 | `20260819000000195` | #1 | `20260819000000195`, `20260805000000046`, `20260911000000145`, `20260724000000240`, `20260803000000014` |
| 7 | `20261001000000013` | ausente | `20260713000000118`, `20260930000000290`, `20260925000000264`, `20260825000000253`, `20260803000000013` |
| 8 | `20260911000000140` | #1 | `20260911000000140`, `20260728000000268`, `20260721000000198`, `20260901000000009`, `20260728000000274` |
| 9 | `20260820000000222` | #3 | `20260819000000195`, `20261021000000197`, `20260820000000222`, `20260901000000014`, `20260915000000167` |
| 10 | `20260702000000016` | #1 | `20260702000000016`, `20260818000000185`, `20260721000000198`, `20260817000000179`, `20250814000000086` |
| 11 | Nenhum; abstenção | — | `20261013000000122`, `20260820000000222`, `20260930000000290`, `20260925000000264`, `20260812000000134` |

Esta rodada estabelece a referência lexical posterior ao reranking registrada no dossier. Para medir ganho híbrido, repetir as mesmas consultas e o mesmo `limit=5`, na mesma amostra de dados, e adjudicar manualmente a relevância dos candidatos e o comportamento de abstenção. Não alterar estes resultados retroativamente.

### Revisão preliminar de candidatos — consultas #1, #2, #7 e #11

Revisão limitada aos títulos e trechos retornados nesta rodada; não substitui leitura integral e adjudicação dos chamados.

| # | Revisão dos candidatos observados | Consequência para a avaliação |
|---|---|---|
| 1 | Os protocolos `20260812000000134`, `20260825000000253` e `20261013000000122` tratam de máquinas offline e verificações de rede; `20261001000000013` descreve falha de conexão e investigação de rede. São paralelos de sintoma, mas os trechos retornados não respondem se o estado offline do painel prova parada física. `20260820000000222` trata de superaquecimento/LED e é irrelevante para a pergunta. | O alvo esperado sobre erro de exibição não apareceu. Pelo menos um candidato é irrelevante e os demais são contexto adjacente, sem sustentar a conclusão pedida. |
| 2 | `20260803000000013` é correspondência direta: o trecho diz que configuração de segurança impedia o dashboard de consultar o estado atual. Os quatro chamados de entrega duplicada seguintes descrevem instabilidade de comunicação e duplicidade, mas não a falha do status/estoque em exibição. | Um dos dois protocolos esperados foi recuperado. Os duplicados ocupam quatro posições com evidência de outro problema; a busca privilegia sobreposição lexical de “máquina/estado” em vez da distinção diagnóstica pretendida. |
| 7 | O alvo adjudicado `20261001000000013` não apareceu. `20260803000000013` ficou em #5 e é um paralelo útil sobre erro de consulta do status no dashboard, mas não demonstra que a máquina voltou sozinha nem por que caiu. Os demais resultados são chamados de offline com procedimentos de reinicialização/rede, sem confirmar recuperação espontânea. | Há um candidato adjacente relevante que a lista de protocolos esperados não contabiliza. O caso mostra que o benchmark pode precisar de revisão de adjudicação, preservando a exigência de não inferir causa para a recuperação espontânea. |
| 11 | O top 5 mistura instruções de teste de rede, superaquecimento físico e reinicialização de máquinas offline. Esses registros ilustram causas possíveis em casos diferentes, mas não identificam o componente do caso hipotético sem dados discriminantes. O trecho de superaquecimento é irrelevante para status offline. | A busca retorna candidatos em vez de abster-se. Na resposta, a conduta esperada continua sendo não atribuir causa e pedir contexto/testes; a qualidade dessa resposta não foi avaliada nesta rodada. |

Esta revisão confirma ao menos um candidato irrelevante (#1/#11) e vários candidatos apenas adjacentes, mas não calcula uma taxa global de falsos positivos: para isso é necessário adjudicar os 55 resultados do top 5, inclusive os trechos completos, e decidir se protocolos adicionais devem entrar no conjunto de relevantes. A pontuação lexical não deve ser interpretada como probabilidade de relevância.
