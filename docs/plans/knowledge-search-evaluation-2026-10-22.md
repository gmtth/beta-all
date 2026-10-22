# Avaliação piloto da busca de conhecimento — 2026-10-22

## Objetivo e escopo

Registrar uma baseline reproduzível da busca lexical `knowledge_search` após publicar a ingestão de chamados longos e importar o ticket `20260918000000203`. A avaliação mede se perguntas naturais recuperam precedentes relevantes, se filtros genéricos trazem ruído e se a Beta consegue abster-se quando não há correspondência confirmada.

Não inclui texto integral de tickets. Protocolos e IDs aparecem apenas para rastrear os resultados já indexados. As consultas foram executadas em produção em 2026-10-22, com `limit=5`, via MCP Beta. O modo informado pelo runtime é `lexical`; esta baseline não mede embeddings, reranking nem qualidade da resposta final gerada pelo modelo.

## Casos e resultados observados

| # | Pergunta de avaliação | Evidência esperada | Resultado observado no top 5 | Avaliação |
|---|---|---|---|---|
| 1 | A máquina aparece offline no painel. Isso prova que ela parou de funcionar? | `20260803000000007` — diferenciar estado exibido de operação física | Não apareceu; vieram registros sobre filtros e outros assuntos | Falha de recuperação |
| 2 | O painel mostra a máquina offline e a equipe suspeita da rede. Há caso cuja causa estava no sistema? | `20260803000000007` | Não apareceu; vieram chamados não relacionados ao status da máquina | Falha de recuperação |
| 3 | Quais casos ajudam a separar problema de rede de erro ao exibir o status? | `20261013000000122`, `20260911000000145` e, para status, `20260803000000007` | Os dois primeiros apareceram nas posições 1 e 5; o caso de status não apareceu | Parcial; distinção incompleta |
| 4 | Uma retirada duplicou porque a confirmação demorou e o operador tentou de novo. Como foi tratada? | `20250604000000028` | Apareceu na posição 3 | Recuperado; validar evidência antes de recomendar |
| 5 | Como evitar duplicidade quando a máquina demora para confirmar uma retirada? | `20250604000000028` | Não apareceu no top 5 | Falha de estabilidade entre paráfrases |
| 6 | A máquina parou depois de uma atualização, sem código de erro. Há precedente confirmado? | Nenhum caso confirmado nos dados consultados; resposta correta deve declarar ausência de correspondência | O top 5 trouxe chamados não relacionados | Ruído; a resposta deve abster-se e não citar esses resultados |
| 7 | Busque casos de equipamento lento ou travando e identifique causas confirmadas. | Caso diretamente pertinente, com causa explícita; resultados sem correspondência física não contam como solução confirmada | `20260819000000195` apareceu em primeiro, mas a busca não permite concluir sozinha que sua causa corresponda ao sintoma | Recuperação candidata; classificação de relevância e causa ainda exige leitura da evidência |
| 8 | Encontre um exemplo em que a quantidade entregue alterou a próxima data de retirada. | `20260702000000016` | Não apareceu no top 5 desta formulação natural | Falha de recuperação; a busca exata por protocolo funciona |
| 9 | Máquina sem IP via DHCP: quais chamados registram falta de comunicação e o que foi verificado? | `20260911000000145` e `20261013000000122` | Apareceram nas posições 4 e 5 | Parcial; bons casos ficam no limite do top 5 e há ruído acima |
| 10 | Máquina de EPI não entrega produto: que causas e resultados foram registrados? | `20260911000000140` e casos equivalentes | `20260911000000140` apareceu na posição 3; outros chamados de entrega/cadastro ficaram acima | Parcial; resultado útil com ordenação ruidosa |
| 11 | A conexão continua falhando depois de verificar cabeamento e trocar a placa. Há precedente? | `20260918000000203` | Apareceu na posição 4 | Recuperado; a resposta deve distinguir relato, testes e causa registrada |

## Controles de ingestão e busca exata

- O runtime aceitou a importação explícita de `20260918000000203` e informou **54 trechos**; o registro retornou `externalId=6667` e o protocolo correto.
- A busca pelo protocolo retornou o registro e a seção inicial **Interação 1**. A consulta direcionada ao último evento retornou **Interação 16**, correspondente ao evento final da linha do tempo (16 eventos; status `Fechado`). Isso confirma presença de conteúdo no começo e no fim, sem reproduzir os textos do chamado.
- Consultas exatas por protocolo retornaram o registro correspondente para os nove IDs verificados na amostra (incluindo `6667`, `6128`, `6904`, `6609`, `6604`, `6316`, `2622`, `5835` e `6255`). Isso é controle de identificação exata, não medida de busca por sintomas.
- A busca lexical de frases naturais por vezes retorna os mesmos chamados de filtros/interações (`4650`, `5818`, `5664`) para sintomas diferentes. Não usar apenas score lexical para declarar semelhança ou causa.

## Leitura da baseline

A identificação exata por protocolo e a busca por alguns sintomas específicos funcionam. A recuperação natural ainda varia bastante conforme a formulação: casos de status e reposição podem desaparecer, enquanto resultados lexicais genéricos ocupam posições altas. As respostas precisam verificar cada resultado contra a descrição/interação e se abster quando nenhum trecho sustenta a correspondência. Esta avaliação não autoriza promover hipótese a causa confirmada.

## Próxima rodada de ingestão

**Não reimportar os registros desta amostra:** foram consultados 25 chamados recentes (2026-10-01 a 2026-10-22) e 30 anteriores (2025-01-01 a 2026-09-30), todos com `keyword=maquina`; os 55 protocolos verificados já apareceram na base de conhecimento. Não foi encontrado um candidato ausente nessa amostra e nenhuma importação adicional foi feita.

Quando houver novos candidatos, executar um piloto de **até cinco chamados novos, fechados/resolvidos e ainda não indexados**, procurando um caso de cada grupo: rede/DHCP; status exibido incorretamente; máquina travada/inoperante; atraso de confirmação/duplicidade; falha de entrega. Comparar protocolo exato antes de importar, registrar estado da origem, consultar o ticket completo, e importar apenas os IDs individualmente autorizados. Se não houver cinco casos ausentes com resultado útil, reduzir o lote; não duplicar ingestão para atingir uma meta.

## Critérios para a próxima medição

1. Repetir estas 11 perguntas com o mesmo limite e registrar os protocolos recuperados e suas posições.
2. Medir `Recall@5` sobre os precedentes adjudicados e anotar separadamente casos esperados mas ausentes; não usar resultados apenas relacionados como acertos.
3. Avaliar se as citações sustentam cada fato, se hipótese e solução confirmada estão separadas e se a resposta se abstém nos negativos.
4. Só comparar ou mudar pesos/índices após preservar esta baseline. A busca semântica/híbrida exige uma decisão separada sobre provedor/modelo, dimensão, custo, proteção de dados e reindexação.

