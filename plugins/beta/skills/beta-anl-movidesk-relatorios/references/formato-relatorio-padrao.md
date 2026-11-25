# Formato padrão do relatório Movidesk

A apresentação é definida em [relatorio-padrao.html](../assets/relatorio-padrao.html) e preenchida pelo [renderizador](../scripts/render_report.py). Preserve a paleta, a ordem das seções, os gráficos e os estilos de impressão.

1. Cabeçalho com marca Movidesk, data de corte e geração.
2. Resumo com oito cartões: total dos três meses, total anual, variação contra os três meses anteriores, média diária, concentração de sistema e máquina nos dois períodos, chamados em atendimento ou parados no ano e variação anual.
3. Categorias oficiais em barras e tabela, com participação nos dois períodos.
4. Comparativo anual com períodos equivalentes, volume por ano, diferença absoluta e variação por categoria.
5. Chamados por mês, com indicação de mês parcial quando aplicável.
6. Ocorrências de sistema e máquina, com contagem por período e percentuais na categoria oficial associada. Um chamado pode estar em mais de uma ocorrência.
7. Situação atual agrupada e detalhada, por período de abertura.
8. Rodapé com fonte, cobertura e limitações.

## Entrada do renderizador

O JSON contém somente agregados. Datas de início e fim usam ISO YYYY-MM-DD.

| Chave | Conteúdo |
|---|---|
| quarter, year, previous_year | Objetos com start, end e categories. Ordem das contagens: erros de sistema, máquina, treinamento, implantação, outros e sem categoria. |
| quarter.statuses, year.statuses | Contagens opcionais, na ordem fechado, resolvido, em atendimento, parado, cancelado e novo. |
| previous_quarter | Objeto com start, end e total. |
| months | Contagens mensais de janeiro até o mês de corte, em ordem. |
| occurrences | Cinco linhas, na ordem erro de sistema, erro de máquina, máquina inoperante, API e integração, sistema inoperante. Cada linha contém volume trimestral, volume anual, volume trimestral na categoria associada e volume anual na categoria associada. |
| generated_label | Data e hora da geração com fuso. |
| partial_month, month_note | Indicador booleano e nota sobre o último mês exibido. |
| category_note, coverage_note | Notas sobre mapeamento, comparabilidade histórica, períodos consultados, paginação e limites. |
| scenario | Opcional. Descrição do teste e da transformação aplicada. O renderizador rotula a saída como Dados de teste e não modifica volumes automaticamente. |

Use null para grupo, série ou contagem indisponível e zero apenas para contagem confirmada. Os totais por categoria incluem todos os IDs do período. Séries mensais e de situação disponíveis devem reconciliar com o total. Use a mesma classificação no acumulado anual e no comparativo.

## Mapeamento antes do cálculo

Confirme os grupos de implantação, máquina, erros de sistema e treinamento pelos nomes e códigos da taxonomia retornada. Use Outros para categorias válidas fora desses grupos, inclusive categorias históricas genéricas, e Sem categoria para ausência de classificação. Compare o uso da taxonomia entre anos antes de interpretar variações.

Use as tags de erro de sistema, erro de máquina, máquina inoperante, API e integração e sistema inoperante, quando confirmadas, para os rótulos de ocorrência. Compare com a categoria oficial de sistema ou máquina correspondente. Conte cada ID no máximo uma vez por ocorrência e preserve indisponibilidade quando o campo não for retornado.
