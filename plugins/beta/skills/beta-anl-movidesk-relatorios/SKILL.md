---
name: beta-anl-movidesk-relatorios
description: Gerar o relatório executivo padrão de chamados do Movidesk em HTML e, quando solicitado, em Word com os mesmos dados. Para consultas e sínteses sem relatório, use beta-anl-movidesk.
metadata:
  version: "2"
---

Antes de responder, aplique o [protocolo compartilhado](../beta/references/protocolo-evidencias-e-handoffs.md). Se a skill foi acionada pela beta, complemente o protocolo já carregado com as regras abaixo.

# beta-anl-movidesk-relatorios

Consulte dados autorizados do Movidesk em leitura e gere o relatório executivo seguindo o [contrato do modelo e dos dados](references/formato-relatorio-padrao.md).

1. Conte chamados por data de criação e ID único. Use o fuso America/Sao_Paulo. Calcule os três meses-calendário completos mais recentes, os três imediatamente anteriores, o ano vigente até a data de corte e o ano anterior até a data equivalente. Use o último dia válido do mês para equivalências em ano não bissexto. Os períodos podem se sobrepor.
2. Use movidesk_search_tickets com include_past, datas explícitas, date_field igual a createdDate, top igual a 100, ordenação estável e paginação por skip. Selecione somente ID, data, categoria, tags e status quando necessários. Registre cobertura até o fim confirmado, preferindo a página seguinte vazia quando não houver total da fonte. Detecte IDs duplicados e páginas ausentes. Se a fonte falhar, atingir o limite ou estiver indisponível, indique os períodos afetados e mantenha seus indicadores indisponíveis.
3. Conte cada chamado uma vez por categoria oficial, de acordo com a taxonomia verificada. Preserve Outros e Sem categoria. Calcule ocorrências separadamente usando as tags registradas em cada chamado e conte IDs únicos por ocorrência. Use os rótulos gerenciais do modelo. Quando a classificação histórica mudar, explicite o efeito na comparação. Não classifique por texto livre nem some ocorrências sobrepostas.
4. Reconcilie os volumes por categoria, mês e situação. Mostre a situação atual dos chamados criados no período, sem inferir histórico. Priorize números e percentuais, com notas curtas sobre cobertura, denominadores e limites. Não inclua estimativas de custo.
5. Prepare somente agregados no formato da referência. Execute **python scripts/render_report.py agregados.json relatorio.html** a partir da pasta da skill. O [modelo](assets/relatorio-padrao.html) fixa a apresentação e incorpora a marca do pacote. Quando o ambiente não executar o script, preencha o mesmo modelo conforme o contrato.
6. Entregue o HTML autossuficiente. Se pedirem Word, transcreva o mesmo relatório, incluindo tabelas, cartões, rótulos e notas. Se pedirem gráficos no Word, insira gráficos nativos editáveis com os mesmos dados, mantendo a transcrição. Confira os valores contra o HTML e a apresentação no ambiente disponível. Se o formato ou arquivo não estiver disponível, diga o que conseguiu entregar.
7. Use contagens reais por padrão. Uma alteração para teste exige pedido explícito e identificação visível de Dados de teste no HTML e no Word. Informe o fator e a regra de arredondamento, reconcilie as contagens e recalcule os indicadores derivados. Entregue o artefato de teste em arquivo separado.

Não altere chamados, não importe conhecimento e não exponha dados pessoais ou dados individuais em relatórios agregados.
