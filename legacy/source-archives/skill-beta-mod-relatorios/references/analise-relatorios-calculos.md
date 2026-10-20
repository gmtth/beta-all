# Análise de relatórios e cálculos

## Objetivo do relatório

Definir:

- qual pergunta será respondida;
- qual problema atual será resolvido;
- se o dado é real, previsto, projetado ou comparativo;
- qual decisão será apoiada.

## Granularidade

Definir exatamente o que gera uma linha.

Exemplos de granularidade possíveis, quando a fonte confirmar:

- Funcionário × Produto;
- Funcionário × Tipo;
- Funcionário × Tipo × Origem;
- Requisição × Item.

Informar:

- quando há linha adicional;
- quando origens são consolidadas;
- quando uma linha deixa de existir;
- como evitar duplicidade;
- se uma entrega pode participar de mais de uma linha.

## Elegibilidade

Definir quais registros são:

- considerados;
- ignorados;
- ativos;
- inativos;
- excluídos;
- demitidos;
- cancelados;
- incompletos;
- sem valor;
- sem turno;
- sem vencimento;
- com vínculo específico;
- com origens concorrentes.

Usar somente categorias efetivamente aplicáveis ao caso.

## Origem dos dados

Para cada informação, diferenciar:

- cadastro atual;
- valor histórico;
- valor registrado na operação;
- último registro;
- data de criação;
- data de admissão;
- origem efetiva;
- histórico reconstruído;
- histórico não reconstruído.

## Período e datas

Definir:

- data inicial;
- data final;
- origem da data;
- se é editável ou automática;
- limites inclusivos ou exclusivos;
- tratamento do dia atual;
- período histórico;
- período futuro;
- ausência de registro anterior;
- data de criação;
- admissão;
- data de análise.

Quando útil, estruturar:

| Período | Data inicial | Data final | Regra |
|---|---|---|---|

Incluir exemplo real apenas quando houver informação suficiente.

## Dias válidos

Quando aplicável, definir:

- turno atual ou histórico;
- dias da semana;
- feriados;
- férias;
- recessos;
- afastamentos;
- faltas;
- início da contagem;
- inclusão das datas-limite.

## Fórmulas

Para cada cálculo, estruturar:

| Item | Definição |
|---|---|
| Nome | Nome do cálculo |
| Objetivo | O que representa |
| Entradas | Variáveis |
| Origem | Fonte de cada variável |
| Fórmula | Expressão |
| Unidade | Dias, unidades, reais, percentual ou outra unidade confirmada |
| Arredondamento | Regra confirmada |
| Truncamento | Regra confirmada |
| Zero | Resultado |
| N/A | Resultado |
| Ausência | Resultado |
| Não participa | Dados ignorados |

Não utilizar média, cobertura, parte inteira, arredondamento, módulo, truncamento ou projeção sem definição explícita.

## Zero, nulo e N/A

Diferenciar:

- zero válido;
- ausência de dados;
- cálculo impossível;
- divisão por zero;
- valor não informado;
- linha inexistente;
- resultado não calculado.

Definir o conteúdo de todas as colunas afetadas.

## Situações e tags

Para cada situação, definir:

- condição;
- texto;
- comparação utilizada;
- igualdade;
- zero;
- N/A;
- parte inteira;
- arredondamento;
- truncamento;
- cor, quando necessária.

A situação não deverá depender somente de cor.

## Tela do relatório

Quando aplicável, definir:

- menu;
- filtros;
- campos automáticos;
- campos bloqueados;
- colunas;
- formato;
- origem;
- ordenação;
- paginação;
- truncamento;
- tooltip;
- alinhamento;
- estado vazio.

Quando útil, estruturar:

| Coluna | Formato | Informação |
|---|---|---|

Usar esta seção somente para aspectos intrínsecos ao relatório. Fluxo frontend genérico pertence ao módulo de frontend.

## Exportação

Definir, conforme aplicável e confirmado:

- formato;
- todas as linhas filtradas;
- independência da página atual;
- mesmas colunas;
- mesma ordem;
- mesmos formatos;
- mesmos valores;
- mesmo período;
- mesmo cálculo;
- eventual diferença entre tela e arquivo.

## Exemplos reproduzíveis

Incluir, quando houver base suficiente:

- entradas;
- datas;
- dias válidos;
- valores intermediários;
- fórmula;
- resultado;
- situação;
- explicação.

Validar matematicamente.

Quando relevante, contemplar cenário de:

- zero;
- N/A;
- sem histórico;
- sem entrega;
- sem valor;
- específico;
- origem concorrente.

## Revisão específica

Verificar:

- granularidade única;
- risco de duplicidade;
- período;
- limites;
- fórmula reproduzível;
- fechamento matemático do exemplo;
- coerência de zero e N/A;
- valor usado pela situação;
- coerência entre tela e exportação.
