# Regressão e validação de artefatos

## Gate de entrega do DOCX

Não considerar um DOCX concluído somente porque o arquivo foi criado.

Executar:

1. gerar o DOCX;
2. renderizar todas as páginas para PNG;
3. inspecionar visualmente cada página;
4. corrigir defeitos;
5. renderizar novamente;
6. repetir até não existirem defeitos relevantes.

## Verificações de conteúdo

Comparar o artefato com a entrada consolidada:

- todos os blocos foram incluídos;
- nenhuma regra foi resumida indevidamente;
- nenhuma mensagem mudou;
- nenhuma fórmula mudou;
- nenhuma exceção desapareceu;
- nenhuma regra substituída reapareceu;
- nenhum contexto não publicável foi inserido;
- nenhuma imagem foi trocada;
- nenhum nome real foi normalizado para outro termo.

## Verificações de estrutura

Confirmar:

- ordem macro→micro;
- seções somente quando aplicáveis;
- subtítulos no nível correto;
- tabelas usadas apenas quando úteis;
- exemplos depois das regras;
- validações no fechamento;
- Dossiê não incorporado ao mesmo arquivo.

## Verificações visuais

Em todas as páginas, procurar:

- texto cortado;
- tabela extrapolando a margem;
- linha de tabela truncada;
- cabeçalho quebrado;
- imagem deformada;
- imagem ultrapassando a página;
- título órfão;
- espaço vertical excessivo;
- página vazia;
- número de página fora da área;
- logo ausente ou distorcido;
- fonte diferente sem motivo;
- cor não solicitada;
- célula com texto colado à borda;
- conteúdo muito pequeno.

## Verificação do padrão

Para novo DOCX sem arquivo-base, confirmar:

- A4;
- margens canônicas;
- logo CENCIHUB;
- metadados em três linhas;
- Calibri 12;
- headings de 12 pt em negrito;
- página numerada à direita;
- tabelas simples sem preenchimento;
- corpo em preto e branco;
- ausência de tabela/célula externa envolvendo o corpo da modelagem.

### Regressão prioritária do bloco de metadados

Tratar o bloco de metadados como componente prioritário de regressão visual por utilizar posicionamento específico no DOCX.

Preservar primeiro o posicionamento vigente. Não deslocar, simplificar ou reconstruir o bloco apenas por precaução. Corrigir somente quando a renderização demonstrar defeito observável.

Em cada validação aplicável, confirmar no mínimo:

- ausência de sobreposição;
- posição correta em relação ao cabeçalho;
- larguras relativas e mesclagens previstas;
- quebra adequada de texto em rótulos e valores;
- estabilidade na renderização utilizada pelo ambiente.

Quando houver defeito, corrigir o gerador ou a especificação correspondente e renderizar novamente antes da entrega.

## Regressão por arquétipo

Antes de alterar o gerador de forma estrutural, gerar pelo menos três amostras neutras:

1. geral/processamento com corpo em fluxo normal;
2. frontend com fluxo de quatro colunas em fluxo normal;
3. relatório com fórmula, tabela de colunas e exemplo em fluxo normal.

Comparar:

- hierarquia;
- ordem;
- densidade;
- larguras;
- quebras;
- cabeçalho;
- rodapé.

Corrigir a gramática ou o gerador, não o documento de teste isoladamente.

## Arquivo-base

Em edição de documento existente, a regressão é contra o próprio arquivo-base:

- preservar imagens;
- preservar tabelas;
- preservar cabeçalho;
- preservar alterações do usuário;
- limitar a diferença ao pedido.

Quando possível, usar comparação visual antes/depois além da leitura do XML.

## Critério de saída

Entregar somente quando:

- conteúdo estiver fiel;
- arquivo abrir;
- renderização estiver estável;
- nenhuma página apresentar defeito material;
- a saída corresponder ao formato solicitado.
