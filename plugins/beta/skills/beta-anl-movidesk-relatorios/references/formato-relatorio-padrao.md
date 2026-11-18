# Formato padrão do relatório Movidesk

Este documento define o contrato estrutural único dos relatórios HTML desta skill. A revisão visual do primeiro relatório teste pode ajustar tipografia, espaçamentos e aparência dos gráficos sem mudar silenciosamente a ordem ou o significado das seções.

## Estrutura fixa

1. **Cabeçalho** — marca Movidesk, título “Relatório executivo de chamados”, data e hora de geração, data de corte e identificação do período coberto.
2. **Resumo executivo** — cartões com total dos três últimos meses completos, total do ano até a data de corte, volume aberto/encerrado quando disponível e cobertura da consulta. Os totais de períodos sobrepostos permanecem separados.
3. **Evolução mensal** — gráfico de barras com um total por mês, escala e rótulos legíveis, cobrindo o acumulado do ano até a data de corte. Identifique como parcial o mês vigente quando o corte ocorrer antes do último dia. Meses sem chamados devem aparecer como zero apenas quando a consulta do mês foi completa.
4. **Distribuição por assunto gerencial** — tabela com contagem e barra horizontal proporcional para treinamento, máquina, erros de sistema, implantação, outros e não classificado. Exibir participação sobre o total daquele período e preservar as categorias mesmo quando uma delas for zero.
5. **Situação operacional** — abertos/encerrados no período e pendências na data de corte, apenas quando os dados disponíveis permitirem distinguir esses conceitos. Métricas condicionais sem suporte não devem gerar espaço vazio ou valor inventado.
6. **Leituras para gestão** — até três observações descritivas derivadas diretamente dos indicadores exibidos, sem hipótese causal. Se não houver variação relevante ou dados suficientes, apresentar essa condição sem fabricar achados.
7. **Metodologia e cobertura** — origem Movidesk, campo de data, limites inclusivos, taxonomia e mapeamento usados, denominadores, páginas e registros analisados, falhas/truncamento e limitações.

## Regras de consistência

- Manter esta ordem, títulos, cartões obrigatórios e classificação em toda execução.
- O total mensal deve reconciliar com os grupos mutuamente exclusivos (treinamento, máquina, erros de sistema, implantação, outros e não classificado). Cada ticket conta uma vez por período.
- Percentuais são calculados sobre o total do mesmo escopo e devem indicar seu denominador; arredondamentos visuais não alteram as contagens.
- “Acumulado do ano” é o ano-calendário vigente até a data de corte. Os meses completos mais recentes podem se sobrepor a esse acumulado e nunca devem ser somados a ele.
- Uma consulta incompleta pode mostrar observações parciais somente com rótulo claro de cobertura; totais sem cobertura completa não são apresentados como definitivos.
- A versão inicial pode ser aperfeiçoada com o relatório teste pedido pelo usuário. Alterações aprovadas do formato devem ser refletidas nesta referência e elevar a versão da skill conforme as regras do pacote.

## Identidade e saída HTML

- Usar `#FF2A28` como cor de destaque e a imagem Movidesk da pasta `assets/` como marca.
- Usar HTML semântico com CSS embutido, layout responsivo e regras de impressão. Não exigir conexão para carregar recursos externos.
- Escapar dados dinâmicos antes de inseri-los no HTML e remover detalhes pessoais desnecessários.
- Priorizar gráficos com rótulos e tabelas acessíveis; a leitura não pode depender somente de cor ou hover.
