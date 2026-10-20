# Tabelas, listas e parágrafos

## Regra de escolha

Usar **parágrafo** quando a informação depende de sequência lógica ou explicação.

Usar **lista** quando vários itens compartilham o mesmo contexto e têm o mesmo nível.

Usar **tabela** quando a comparação por coluna reduz ambiguidade.

Não usar tabela como contêiner decorativo para texto corrido. O corpo da modelagem deverá permanecer diretamente no fluxo normal do documento.

## Tabelas recomendadas

### Campo e regra

| Campo | Regra |
|---|---|

Usar para parâmetros, formulários ou definições breves.

### Status e significado

| Status | Significado |
|---|---|

### Canal e comportamento

| Canal | Condição | Ação | Resultado |
|---|---|---|---|

Ajustar colunas à informação realmente confirmada.

### Coluna de relatório

| Coluna | Formato | Informação |
|---|---|---|

### Permissão

| Ação | Quem pode | Interface | Backend |
|---|---|---|---|

Usar somente se as permissões já vierem consolidadas.

### Fluxo

| Etapa | Tela atual | Ação do usuário | Próxima tela ou resultado |
|---|---|---|---|

Usar coluna curta para `Etapa`.

### Exceção

| Condição | Resultado |
|---|---|

### Exemplo

| Informação | Exemplo |
|---|---|

## Larguras semânticas

Não distribuir colunas igualmente por padrão.

Preferir:

- coluna de índice, ordem, status ou data: estreita;
- nome de campo: média;
- descrição, regra ou resultado: larga.

Referências úteis para largura relativa:

- duas colunas curtas/longas: `0,32 / 0,68`;
- três colunas `campo / formato / regra`: `0,23 / 0,24 / 0,53`;
- fluxo de quatro colunas: `0,08 / 0,25 / 0,37 / 0,30`;
- matriz de quatro colunas equilibrada: ajustar pela maior coluna narrativa.

Essas proporções são visuais, não regras funcionais.

## Cabeçalho

Usar primeira linha em negrito.

Não aplicar preenchimento colorido por padrão.

Repetir cabeçalho em páginas seguintes quando a tabela quebrar.

## Células

Usar texto alinhado à esquerda para narrativa.

Usar alinhamento central ou à direita somente quando fizer sentido para número, data, status ou código.

Usar alinhamento vertical central.

Não usar altura fixa que possa cortar texto.

Permitir quebra de linha apenas quando necessária.

## Bordas

Usar grade simples preta.

Não adicionar sombras, gradientes, bordas duplas ou cores decorativas.

## Listas

Usar bullets nativos do Word no DOCX.

Não digitar `•` manualmente.

Usar lista numerada somente quando a ordem for parte do comportamento ou da validação.

Não usar numeração apenas para contar regras independentes.

## Fórmulas

Não esconder fórmula em tabela quando a expressão precisa ser lida como regra central.

Preferir linha própria e, se necessário, tabela separada para variáveis ou exceções.

## Texto antes e depois da tabela

Introduzir a tabela com uma frase quando o contexto não for autoevidente.

Depois da tabela, continuar somente com exceções ou consequências que não couberam nela.

Evitar repetir em prosa tudo que a tabela já expressa.

## Tabelas largas

Quando uma tabela ficar muito larga:

1. reduzir texto de cabeçalhos sem perder significado;
2. redistribuir larguras;
3. permitir quebra de cabeçalho em duas linhas;
4. reduzir levemente o tamanho somente dentro da tabela, preservando legibilidade;
5. dividir a informação em duas tabelas apenas se os conjuntos forem semanticamente distintos.

Não girar a página nem reduzir toda a modelagem por causa de uma única tabela sem solicitação.
