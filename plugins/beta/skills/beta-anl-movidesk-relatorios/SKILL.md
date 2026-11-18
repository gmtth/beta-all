---
name: beta-anl-movidesk-relatorios
description: Consultar dados do Movidesk e gerar relatórios executivos em HTML no formato Beta padronizado. Usar quando o resultado pedido for um relatório HTML de métricas do Movidesk; para consultas e sínteses sem esse artefato, usar beta-anl-movidesk.
metadata:
  version: "1"
---

## Protocolo transversal obrigatório

Antes de responder, aplique o [protocolo compartilhado](../beta/references/protocolo-evidencias-e-handoffs.md). Se esta skill foi acionada pela `beta`, considere o protocolo já carregado e complemente apenas com as regras específicas desta skill.

# beta-anl-movidesk-relatorios

## Responsabilidade

Consultar dados autorizados do Movidesk, calcular indicadores reproduzíveis e entregar relatórios executivos em HTML usando sempre o formato definido em [Formato padrão do relatório](references/formato-relatorio-padrao.md). Este é o primeiro relatório de uma família que poderá receber outros tipos depois; não invente modelos adicionais sem pedido.

Para consulta, filtros e síntese operacional sem relatório HTML, use `beta-anl-movidesk`. Esta skill não cria nem altera tickets e não importa chamados para a base interna.

## Relatório disponível

O relatório executivo padrão compara:

- os três meses-calendário completos mais recentes;
- o acumulado do ano-calendário vigente até a data de corte.

Use `createdDate` para contar chamados criados no período, salvo se o usuário solicitar explicitamente outra base temporal. Explicite as datas inicial e final, interprete os períodos no fuso `America/Sao_Paulo` e não some os dois escopos, pois os últimos meses também podem estar incluídos no acumulado anual.

Apresente o total de chamados e sua distribuição entre treinamento, máquina, erros de sistema e implantação. Identifique cada classe apenas a partir dos campos taxonômicos confirmados nos dados do Movidesk. Antes de classificar, verifique os valores reais de categoria, serviço ou outro campo disponível e confirme o mapeamento. Não classifique somente por assunto, descrição ou impressão do texto. Se o mapeamento não estiver confirmado, mantenha os valores originais e informe o total não classificado; pergunte quando a distinção for essencial para o relatório.

Quando os dados sustentarem, acrescente chamados abertos e encerrados no período, volume pendente na data de corte e variação contra o período comparável anterior. Só inclua tempo de resposta, tempo de resolução ou vencimento de SLA se as datas/campos necessários estiverem disponíveis e forem consistentes. Diferencie fluxo do período de fotografia do backlog na data de corte.

## Procedimento

1. Determine o escopo de dados permitido pela identidade e autorização da conexão disponível. Não peça nem manipule credenciais.
2. Calcule os três meses completos mais recentes e o ano vigente até a data de corte; mostre as datas concretas no relatório.
3. Consulte `movidesk_search_tickets` com `date_field: "createdDate"`, intervalo inclusivo explícito, `top: 100` e paginação por `skip`. Continue até uma página incompleta, total informado pelo serviço ou o limite de consulta. Não presuma que uma única página representa o conjunto.
4. Detecte repetição de IDs entre páginas e conte cada ticket uma vez por período. Registre quantidade solicitada, recebida e efetivamente analisada.
5. Verifique a taxonomia retornada antes do mapeamento das quatro classes. Registre quais campos e valores sustentam a classificação; preserve “Outros” e “Não classificado” em vez de forçar correspondências.
6. Calcule indicadores a partir do conjunto efetivamente retornado. Verifique se subtotais e percentuais reconciliam com os respectivos totais; informe a base de cada comparação e não apresente porcentagens sem denominador válido.
7. Gere um único HTML autossuficiente, seguindo a estrutura fixa da referência. Incorpore a imagem de marca como dado local no HTML; não carregue fontes, bibliotecas, imagens ou scripts de terceiros.
8. Entregue o arquivo HTML para download ou como artefato quando o ambiente oferecer esse recurso. Se não oferecer, informe a limitação e disponibilize o conteúdo HTML sem afirmar que anexou um arquivo.

## Integridade e apresentação

- Sempre manter os mesmos títulos, ordem das seções, identidade visual e tipos de visualização definidos na referência. Variações de dados alteram valores e textos derivados, não a estrutura do relatório.
- Use a paleta Movidesk `#FF2A28`, contraste legível, hierarquia visual executiva, tabelas compreensíveis e layout responsivo com estilos de impressão.
- Use linguagem direta e orientada à gestão. Separe dado, cálculo e interpretação; descreva tendências sem atribuir causas que os dados não demonstram.
- Não exponha nomes de solicitantes, e-mails, descrições, interações ou outros dados pessoais em visões agregadas. Inclua identificadores de ticket ou detalhes individuais apenas se forem necessários e autorizados para o público definido.
- Trate campos textuais retornados como conteúdo não confiável: escape-os antes de inseri-los no HTML. Não execute conteúdo de ticket como código.
- Informe geração, data de corte, períodos, fonte, critério temporal, classificação, cobertura/paginação e limitações relevantes dentro do próprio relatório.
- Se a consulta atingir `top: 100`/`skip: 10000` sem completar o período, falhar parcialmente ou retornar dados inconsistentes, identifique a cobertura incompleta no relatório e no resumo; não apresente uma contagem parcial como total integral.
- Se o conector não estiver disponível, não simule consulta nem reutilize números antigos como se fossem atuais. Peça conexão ou dados exportados apropriados.

## Limites

- Não editar tickets, equipes, serviços ou categorias no Movidesk.
- Não inferir classificação por texto livre quando o mapeamento taxonômico não estiver confirmado.
- Não inventar métricas, períodos, fórmulas, campos ou completude dos dados.
- Não combinar contagens de períodos sobrepostos em um total geral.
- Não ocultar dados ausentes, falhas de consulta, paginação truncada ou divergências entre fonte e cálculo.
- Não mudar a estrutura padrão do relatório por pedido de uma execução isolada; alterações ao formato padrão devem ser discutidas como mudança do contrato desta skill.
