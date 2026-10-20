# Gramática documental CENCIHUB

## Princípio

Compor o artefato a partir de conteúdo funcional já consolidado. Tratar estrutura como gramática adaptável, não como modelo rígido.

A ordem deverá ir do entendimento amplo para o comportamento específico. Não criar seção apenas porque ela existe em outro documento.

## Camadas de composição

### 1. Identificação

Quando o artefato for uma Modelagem Funcional em DOCX, apresentar metadados antes do conteúdo:

- Solicitante;
- Sistema;
- Data;
- Tipo Dev;
- Título;
- Breve descritivo.

Não inventar valor ausente. Se o metadado for obrigatório para a entrega e não estiver disponível, devolver a lacuna.

### 2. Abertura

Usar, conforme o caso:

- `MODELAGEM`;
- `CENÁRIO ATUAL`;
- `CENÁRIO ATUAL E OBJETIVO`;
- `OBJETIVO E ESCOPO`;
- `MELHORIA`.

Não acumular títulos equivalentes. Escolher somente a forma sustentada pelo conteúdo consolidado.

### 3. Regras centrais

Apresentar conceitos, escopo, condições de inclusão, granularidade, parâmetros e regras comuns antes de detalhes de interface.

Quando houver termos próximos com efeitos distintos, separar em subtítulos próprios.

### 4. Especialização

A partir das regras centrais, posicionar apenas os blocos aplicáveis:

- aplicação por canal;
- período e datas;
- regras de cálculo;
- ciclo de vida e status;
- gatilhos;
- fluxos funcionais;
- interface e comportamento das telas;
- processamento;
- notificações;
- permissões;
- rastreabilidade;
- comportamentos preservados.

### 5. Fechamento

Quando aplicável:

- exemplo funcional;
- principais pontos de validação funcional;
- pontos pendentes de definição.

Pendência interna não deverá aparecer apenas por existir. Publicar somente quando a própria entrega exigir que o desenvolvimento conheça a indefinição.

## Arquétipos

### Geral / transversal

Ordem preferencial:

1. cenário atual e objetivo;
2. parâmetros ou conceitos;
3. regras comuns;
4. aplicação por canal;
5. interface;
6. fluxos;
7. papéis e permissões;
8. rastreabilidade;
9. fluxos preservados;
10. validação funcional.

Usar somente os blocos aplicáveis.

### Ciclo de vida / processamento

Ordem preferencial:

1. cenário atual;
2. objetivo e escopo;
3. conceitos e regras centrais;
4. estados, unicidade ou precedência já consolidados;
5. gatilhos;
6. processamento;
7. tela operacional, quando houver;
8. notificações;
9. comportamentos preservados;
10. validação funcional.

### Frontend / fluxo de telas

Ordem preferencial:

1. objetivo ou melhoria;
2. regras gerais de interface e navegação;
3. fluxo principal resumido;
4. fluxos por tela ou etapa;
5. regras aplicáveis imediatamente após cada fluxo;
6. componentes ou estados complementares;
7. validação funcional.

Usar numeração de telas somente quando o conteúdo já estiver organizado como fluxo sequencial.

### Relatório / cálculo

Ordem preferencial:

1. cenário atual e objetivo;
2. regras de inclusão e granularidade;
3. período e datas;
4. regras de cálculo;
5. exceções e estados sem cálculo;
6. tela do relatório;
7. filtros;
8. estrutura das colunas;
9. apresentação e exportação;
10. exemplo funcional;
11. validação funcional.

Não transformar esta ordem em regra de negócio. É somente composição.

## Hierarquia textual

### Seção principal

Usar caixa alta e negrito:

`REGRAS COMUNS`

`PROCESSAMENTO`

`TELA DO RELATÓRIO`

### Subtítulo

Usar negrito, caixa normal:

`Ativação da segurança de senha`

`Período do cálculo`

`Estrutura da tabela`

### Nível numerado

Usar quando a sequência de telas ou etapas já fizer parte do entendimento:

`1. LOGIN E AUTENTICAÇÃO`

`1.1 Fluxo de autenticação`

Não numerar arbitrariamente uma modelagem apenas para parecer mais formal.

## Proximidade semântica

Manter cada evidência junto do conteúdo que representa:

- mensagem depois do gatilho;
- tabela depois da regra que ela organiza;
- imagem depois da explicação correspondente;
- exemplo depois das fórmulas e exceções que ele demonstra;
- validação funcional no fechamento.

Não reunir todas as imagens ou mensagens no final sem necessidade.

## Preservação

Quando revisar artefato existente:

- preservar ordem já aprovada;
- mover somente quando a posição atual produzir contradição ou separar regra de seu contexto;
- não reorganizar por gosto;
- não reintroduzir seção substituída;
- não apagar inclusão do usuário.
