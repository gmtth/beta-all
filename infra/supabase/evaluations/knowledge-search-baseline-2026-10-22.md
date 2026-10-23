# Baseline observada da busca lexical — 2026-10-22

- **Momento:** antes do primeiro reranking lexical da migration `20261022170000_rank_knowledge_by_query_coverage.sql`.
- **Ambiente registrado:** MCP Beta em produção, modo `lexical`, `limit=5`.
- **Proveniência:** medições descritas na PR [#31](https://github.com/gmtth/beta-all/pull/31), head `1ebae29eddedfc4e9e1850535734dbb083c78aa7`.
- **Escopo:** observação dos resultados retornados, não avaliação da resposta final do modelo, embeddings ou busca híbrida.
- **Privacidade:** não inclui transcrições nem dados pessoais; protocolos e IDs servem para rastrear resultados já indexados.

Esta é a medição pré-reranking. O conjunto adjudicado v1 em [`knowledge-search-v1.md`](./knowledge-search-v1.md) tem outro propósito: define precedentes esperados e controles factuais/abstenção. Não substitui as formulações e observações abaixo.

## Perguntas e resultados observados

| # | Pergunta usada | Evidência esperada | Observação no top 5 pré-reranking |
|---|---|---|---|
| 1 | A máquina aparece offline no painel. Isso prova que ela parou de funcionar? | `20260803000000007` — distinguir estado exibido de operação física | Não apareceu; vieram registros sobre filtros e outros assuntos. |
| 2 | O painel mostra a máquina offline e a equipe suspeita da rede. Há caso cuja causa estava no sistema? | `20260803000000007` | Não apareceu; vieram chamados não relacionados ao status da máquina. |
| 3 | Quais casos ajudam a separar problema de rede de erro ao exibir o status? | `20261013000000122`, `20260911000000145` e, para status, `20260803000000007` | Os dois primeiros apareceram nas posições 1 e 5; o caso de status não apareceu. |
| 4 | Uma retirada duplicou porque a confirmação demorou e o operador tentou de novo. Como foi tratada? | `20250604000000028` | Apareceu na posição 3. |
| 5 | Como evitar duplicidade quando a máquina demora para confirmar uma retirada? | `20250604000000028` | Não apareceu no top 5; a paráfrase não recuperou o caso da pergunta 4. |
| 6 | A máquina parou depois de uma atualização, sem código de erro. Há precedente confirmado? | Nenhum caso confirmado; a resposta deveria abster-se | O top 5 trouxe chamados não relacionados. |
| 7 | Busque casos de equipamento lento ou travando e identifique causas confirmadas. | Caso diretamente pertinente, cuja causa esteja explícita | `20260819000000195` apareceu em primeiro; a busca, sozinha, não estabeleceu que a causa correspondia ao sintoma. |
| 8 | Encontre um exemplo em que a quantidade entregue alterou a próxima data de retirada. | `20260702000000016` | Não apareceu no top 5 desta formulação natural; a busca exata por protocolo funcionava. |
| 9 | Máquina sem IP via DHCP: quais chamados registram falta de comunicação e o que foi verificado? | `20260911000000145` e `20261013000000122` | Apareceram nas posições 4 e 5. |
| 10 | Máquina de EPI não entrega produto: que causas e resultados foram registrados? | `20260911000000140` e casos equivalentes | `20260911000000140` apareceu na posição 3; chamados de entrega/cadastro ficaram acima. |
| 11 | A conexão continua falhando depois de verificar cabeamento e trocar a placa. Há precedente? | `20260918000000203` | Apareceu na posição 4; a resposta deveria distinguir relato, testes e causa registrada. |

## Controles e limites registrados

- A importação explícita do protocolo `20260918000000203` foi registrada como aceita, com ID Movidesk `6667` e 54 trechos. Busca pelo protocolo retornou a seção inicial (Interação 1); consulta ao último evento retornou a Interação 16, do histórico com 16 eventos e status Fechado.
- Busca exata por protocolo retornou os registros para nove IDs verificados: `6667`, `6128`, `6904`, `6609`, `6604`, `6316`, `2622`, `5835` e `6255`. Isso é controle de identificação exata, não prova de relevância por sintomas.
- A avaliação relatou resultados lexicais repetidos de filtros/interações (`4650`, `5818`, `5664`) em perguntas diferentes. Score lexical não confirma semelhança técnica nem causa.
- Uma amostra de 55 protocolos de máquina (25 recentes e 30 anteriores) já estava indexada; nenhum foi reimportado. O registro não encontrou candidato ausente nessa amostra.
- A baseline não é estatisticamente representativa. Na rodada posterior, a PR #42 registrou melhora em 2 perguntas, regressão dos alvos esperados em 4 e ausência de melhora nas demais; a busca permaneceu lexical e sem ganho geral demonstrado. Consulte os resultados comparativos no [`DOSSIER.md`](../DOSSIER.md#reranking-lexical-2026-10-22).

## Próximo piloto de ingestão

Não reimportar os 55 registros da amostra. Para um lote futuro, selecionar até cinco chamados novos, fechados/resolvidos e ainda não indexados, priorizando rede/DHCP, status incorreto, máquina travada/inoperante, confirmação/duplicidade e falha de entrega. Deduplicar por protocolo, confirmar o estado na origem e importar apenas IDs individualmente autorizados; reduzir o lote se não houver candidatos válidos.
