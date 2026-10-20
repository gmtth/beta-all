# Especificação visual do DOCX

## Base canônica

Usar esta especificação para novos DOCX quando não houver arquivo-base com estilo próprio.

A gramática foi destilada das referências vigentes; os documentos originais não fazem parte da Skill.

## Página

- tamanho: A4, retrato;
- largura: 21,001 cm;
- altura: 29,700 cm;
- margem superior: 2,752 cm;
- margem inferior: 0,501 cm;
- margem esquerda: 0,501 cm;
- margem direita: 0,748 cm;
- distância do cabeçalho: 0,485 cm;
- distância do rodapé: 0 cm.

Não usar Letter para esta família documental.

## Cabeçalho

Usar `assets/logo-cencihub.png`.

- largura: aproximadamente 7,679 cm;
- altura proporcional: aproximadamente 1,612 cm;
- alinhamento: esquerda;
- sem texto adicional;
- repetir em todas as páginas.

Não esticar nem recortar o logo.

## Rodapé

Apresentar somente o número da página, alinhado à direita.

Não adicionar linha, texto institucional, data ou decoração.

## Fonte

Padrão:

- Calibri;
- 12 pt;
- preto;
- fundo branco.

Não misturar Tahoma/Arial por herança de documentos antigos quando estiver gerando novo documento.

Não reduzir o corpo inteiro para compactar páginas.

## Corpo

### Parágrafo normal

- Calibri 12 pt;
- alinhamento justificado;
- espaçamento de linha: 1,0 a 1,15; usar 1,0 no gerador canônico;
- depois: 4 pt;
- antes: 0 pt.

### Seção principal

- Calibri 12 pt;
- negrito;
- caixa alta;
- antes: 7 pt;
- depois: 3 pt;
- manter com o próximo parágrafo.

### Subtítulo

- Calibri 12 pt;
- negrito;
- caixa normal;
- antes: 7 pt;
- depois: 3 pt;
- manter com o próximo parágrafo.

### Rótulo documental

`MODELAGEM`, quando presente:

- Calibri 12 pt;
- negrito;
- sem aumento de fonte;
- espaçamento curto antes/depois.

A hierarquia é construída por negrito, caixa e espaçamento, não por títulos grandes.

## Corpo da modelagem

Inserir o conteúdo da Modelagem Funcional diretamente no fluxo normal do documento.

Não criar tabela, célula única, moldura ou quadro externo para envolver o corpo escrito da modelagem, independentemente do arquétipo.

Esta diretriz não altera:

- a tabela de metadados;
- tabelas funcionais usadas para comparação por colunas;
- imagens;
- listas;
- fórmulas;
- mensagens;
- demais componentes internos já previstos.

Quando houver arquivo-base, preservar sua estrutura existente e aplicar somente a alteração solicitada pelo usuário.

## Metadados

Usar tabela de 3 linhas e 4 colunas com grade simples.

Larguras relativas derivadas do padrão:

- coluna 1: 32,9%;
- coluna 2: 11,4%;
- coluna 3: 35,5%;
- coluna 4: 20,2%.

Mesclagens:

- linha 1: colunas 1+2 para `Solicitante`; coluna 3 para `Sistema`; coluna 4 para `Data`;
- linha 2: coluna 1 para `Tipo Dev`; colunas 2+3+4 para `Título`;
- linha 3: quatro colunas mescladas para `Breve descritivo`.

Usar rótulos em negrito e valores em fonte normal.

Não usar preenchimento colorido.

Preservar o posicionamento vigente deste bloco e tratá-lo como componente prioritário de regressão visual. A validação deverá confirmar ausência de sobreposição, posição correta em relação ao cabeçalho, larguras e mesclagens, quebra adequada de texto e estabilidade na renderização do ambiente. Não alterar o posicionamento por precaução; corrigir somente diante de defeito observável.

## Tabelas do conteúdo

- estilo de grade simples;
- bordas pretas;
- sem shading por padrão;
- primeira linha em negrito;
- Calibri 12 pt;
- em tabela muito densa, permitir 10,5–11 pt somente dentro dela;
- alinhamento vertical central;
- largura definida pela semântica das colunas;
- sem altura fixa;
- repetir cabeçalho quando houver quebra.

Não usar células mescladas em tabelas funcionais comuns.

## Listas

- bullets nativos do Word;
- Calibri 12 pt;
- alinhamento justificado;
- recuo aproximado de 0,6 cm;
- hanging de aproximadamente 0,3 cm;
- 1–2 pt depois.

## Mensagens

Mensagem literal longa poderá ser itálica.

Não usar caixa colorida decorativa por padrão.

## Imagens

- inserir em linha;
- manter proporção;
- alinhar à esquerda por padrão;
- posicionar logo após a regra correspondente;
- não aplicar moldura automática;
- limitar à largura útil da página.

Larguras de referência:

- modal ou recorte pequeno: 8,5–10 cm;
- tela média: 12–15 cm;
- tela/listagem larga: até a largura útil.

Essas larguras são de apresentação; não alteram a regra.

## Quebras

Evitar:

- título sozinho no fim da página;
- linha de cabeçalho separada da tabela;
- imagem isolada sem contexto;
- grandes vazios causados por `keepTogether` excessivo;
- página vazia final.

Permitir que tabelas funcionais continuem em página seguinte, repetindo o cabeçalho quando aplicável.

## Cores

Padrão do documento: preto e branco.

Usar cor somente quando:

- a própria informação visual precisa ser reproduzida;
- o usuário pediu destaque;
- o arquivo-base já utiliza a cor e ela precisa ser preservada.

Não reproduzir marcações históricas de revisão como padrão visual.
