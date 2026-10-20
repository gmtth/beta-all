---
name: beta-mod-relatorios
description: Analisar relatórios, indicadores, previsões, projeções e cálculos na família Beta MOD. Usar em modelagens que envolvam granularidade, elegibilidade, períodos, origem dos dados, fórmulas, unidades, arredondamento, valores ausentes, situações, colunas, filtros, paginação ou exportação. Retornar análise reproduzível sem inventar regra funcional.
---

## Protocolo transversal obrigatório

Antes de responder, aplique o [protocolo compartilhado](../beta/references/protocolo-evidencias-e-handoffs.md). Se esta skill foi acionada pela `beta`, considere o protocolo já carregado e complemente apenas com as regras específicas desta skill.

# Beta MOD Relatórios

## Responsabilidade

Estruturar funcionalmente relatórios, indicadores, previsões, projeções e cálculos de forma reproduzível e sem ambiguidades.

Tratar esta Skill como módulo analítico. Não atuar como fonte independente de regra de negócio e não produzir uma Modelagem Funcional final concorrente com a `@beta`.

Preservar somente conhecimento próprio de relatórios e cálculos. Não incorporar persistência do Dossiê, prioridade de fontes, fluxo frontend genérico, Figma, processamento, permissões, QA final ou composição documental.

## Entrada esperada

Receber da `@beta`, ou diretamente do usuário:

- objetivo funcional do relatório ou indicador;
- regras confirmadas;
- entidades e registros envolvidos;
- período e datas disponíveis;
- dados de entrada e suas origens;
- fórmulas já definidas;
- tratamentos de zero, nulo, N/A ou ausência;
- regras de tela e exportação específicas do relatório;
- exemplos fornecidos pelo usuário;
- pendências ou divergências já identificadas.

Não preencher por inferência qualquer lacuna que altere cálculo, granularidade, elegibilidade, período, apresentação do resultado ou exportação.

## Procedimento

Ler [references/analise-relatorios-calculos.md](references/analise-relatorios-calculos.md) e aplicar somente as partes pertinentes ao caso.

Executar a análise nesta ordem:

1. definir objetivo do relatório;
2. definir granularidade;
3. definir elegibilidade;
4. identificar origem dos dados;
5. definir período e datas;
6. definir dias válidos, quando aplicável;
7. estruturar cada fórmula;
8. diferenciar zero, nulo, N/A e ausência;
9. definir situações ou tags, quando aplicável;
10. definir apresentação funcional na tela, quando aplicável;
11. definir exportação, quando aplicável;
12. validar exemplos matematicamente quando existirem.

## Regras obrigatórias

- Definir exatamente o que gera uma linha.
- Verificar risco de duplicidade e consolidação de origens.
- Distinguir cadastro atual, histórico, valor registrado na operação e histórico reconstruído.
- Definir origem de cada data e se limites são inclusivos ou exclusivos.
- Não utilizar média, cobertura, parte inteira, arredondamento, módulo, truncamento ou projeção sem definição explícita.
- Para cada fórmula, explicitar entradas, origem, expressão, unidade e tratamentos excepcionais.
- Diferenciar zero válido de ausência de dados, cálculo impossível, divisão por zero, valor não informado, linha inexistente e resultado não calculado.
- Não fazer uma tag depender somente de cor.
- Em exportação, verificar se o arquivo representa todas as linhas filtradas e se é independente da página atual, quando essa for a regra confirmada.
- Não assumir que a remoção de uma coluna elimina a regra funcional que alimentava aquela informação.
- Não misturar histórico com cadastro atual.
- Não inventar fórmula ou regra de arredondamento.

## Limite com frontend

Analisar somente os aspectos de apresentação que pertencem ao próprio relatório, como:

- filtros;
- campos automáticos ou bloqueados;
- colunas;
- formato;
- origem;
- ordenação;
- paginação;
- truncamento;
- tooltip;
- alinhamento;
- estado vazio.

Não definir navegação, comportamento geral de telas, componentes ou fluxo frontend fora do contexto específico do relatório. Quando isso for necessário, devolver o ponto para composição com `@beta-mod-fluxos`.

## Exemplos

Quando houver exemplo funcional, exigir que seja reproduzível e contenha, conforme aplicável:

- entradas;
- datas;
- dias válidos;
- valores intermediários;
- fórmula;
- resultado;
- situação;
- explicação.

Validar matematicamente o exemplo.

Quando relevante, considerar cenários de:

- zero;
- N/A;
- sem histórico;
- sem entrega;
- sem valor;
- regra específica;
- origem concorrente.

Não criar exemplos numéricos que introduzam regras ausentes.

## Saída para a Beta

Retornar somente os itens aplicáveis:

1. granularidade;
2. elegibilidade;
3. período;
4. fórmulas;
5. tratamentos de zero e N/A;
6. situações/tags;
7. colunas;
8. exportação;
9. exemplo reproduzível;
10. inconsistências e pendências.

Manter a saída analítica e rastreável. Não transformar pendência em regra confirmada.

## Revisão específica

Antes de devolver a análise, verificar:

- a granularidade é única?
- uma entrega pode duplicar?
- o período está claro?
- os limites são inclusivos ou exclusivos?
- a fórmula é reproduzível?
- o exemplo fecha matematicamente?
- zero e N/A são coerentes?
- a situação usa o valor correto?
- a exportação mantém o mesmo resultado quando essa for a regra definida?

## Limites de isolamento

Não:

- atualizar ou persistir `DOSSIE_CONTEXTO_MODELAGEM.md`;
- decidir prioridade entre fontes;
- inventar fórmula;
- escolher arredondamento, truncamento ou unidade sem confirmação;
- produzir a Modelagem Funcional completa;
- definir fluxo frontend genérico;
- revisar fidelidade visual em Figma;
- definir ciclo de vida ou processamento;
- definir autenticação, autorização ou política de segurança;
- executar QA final da modelagem;
- definir voz, estilo, layout ou estrutura de DOCX;
- produzir plano completo de testes.

Quando outro domínio for necessário, devolver o ponto para a `@beta` compor com a Skill especializada correspondente.


