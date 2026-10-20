# Voz e redação da Modelagem Funcional

## Voz

Usar linguagem normativa, impessoal, objetiva, funcional e verificável.

Preferir frases em que o sujeito funcional e o resultado sejam explícitos.

Padrões recorrentes:

- `O sistema deverá...`
- `Ao acessar...`
- `Ao selecionar...`
- `Ao clicar...`
- `Quando...`
- `Caso...`
- `Não deverá...`
- `Deverá ser apresentado...`
- `A operação somente deverá continuar após...`

## Construção da regra

Sempre que possível, ordenar a frase ou o pequeno conjunto de frases como:

**condição ou gatilho → ação → validação → resultado → restrição ou exceção**

Exemplo estrutural, sem regra de negócio:

`Ao selecionar [ação], o sistema deverá validar [condição]. Quando a validação for concluída, deverá apresentar [resultado]. Caso [exceção], não deverá [efeito proibido].`

Não copiar esse molde mecanicamente quando a leitura ficar artificial.

## Parágrafos

Preferir parágrafos curtos, normalmente de uma a três frases.

Usar um parágrafo para:

- explicar um comportamento completo;
- introduzir uma tabela;
- registrar uma condição e seu resultado;
- explicar uma consequência funcional.

Quebrar quando o parágrafo passar a tratar outro gatilho, outro ator, outro registro ou outra exceção.

Não criar parede de texto quando regras atômicas puderem ser lidas em lista.

## Listas

Usar lista quando vários itens:

- compartilham o mesmo contexto;
- estão no mesmo nível lógico;
- podem ser lidos independentemente.

Cada item deverá ser uma regra completa ou uma condição completa.

Evitar bullets que dependem de uma frase vaga anterior para fazer sentido.

## Ênfase

Usar negrito para:

- títulos;
- subtítulos;
- rótulos;
- cabeçalhos de tabela.

Usar itálico com parcimônia para mensagem literal longa ou citação funcional já confirmada.

Não usar cor como significado funcional no texto. Cor só deverá aparecer quando a própria interface ou artefato exigir sua descrição.

Não usar sublinhado por decoração.

## Mensagens

Nunca apresentar mensagem sem gatilho.

Quando o texto literal estiver confirmado, preservar:

- maiúsculas e minúsculas;
- pontuação;
- acentuação;
- aspas internas.

Não “melhorar” uma mensagem aprovada.

Quando o texto não estiver confirmado, não fabricar mensagem para completar o documento.

## Fórmulas

Apresentar fórmula em linha própria, sem alterar operadores, ordem ou unidade.

Exemplo de forma:

`Indicador = Numerador / Denominador`

Depois da fórmula, registrar em parágrafo ou lista:

- origem dos valores;
- unidade;
- arredondamento ou truncamento;
- exceções;
- zero, nulo ou N/A;

somente quando esses pontos já estiverem consolidados.

## Exemplos

Introduzir exemplo depois da regra.

Usar o exemplo para demonstrar, nunca para criar regra ausente.

Quando houver muitos valores, usar tabela `Informação | Exemplo`.

Depois da tabela, usar um parágrafo curto para explicar a sequência do cálculo ou resultado.

## Nomenclatura

Preservar nomes reais de:

- menus;
- campos;
- botões;
- telas;
- status;
- tags;
- papéis;
- relatórios;
- colunas.

Usar caminhos no formato:

`Cadastros > Funcionários > Editar`

Usar aspas para nomes de opções ou mensagens quando isso melhorar a distinção.

## Termos a evitar

Evitar expressões não verificáveis:

- corretamente;
- adequadamente;
- conforme necessário;
- seguir o fluxo atual;
- seguir o padrão;
- dependendo do caso;
- entre outros.

Substituir por comportamento observável somente quando a fonte permitir.

## Revisão estilística

Não reescrever texto aprovado por preferência.

Corrigir somente quando houver:

- ambiguidade;
- contradição;
- mudança de significado;
- perda de rastreabilidade;
- erro de digitação que prejudique entendimento;
- inconsistência evidente de nomenclatura.
