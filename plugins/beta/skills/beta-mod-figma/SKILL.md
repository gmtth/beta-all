---
name: beta-mod-figma
description: Inspecionar e revisar consistência visual no Figma para a família Beta MOD. Usar em criação ou alteração de telas, comparação entre modelagem e interface, componentes, tabelas, filtros, modais, toasts, tooltips, tags, estados e referências de views. Preservar padrões visuais reais sem inventar regra funcional.
---

## Protocolo transversal obrigatório

Antes de responder, aplique o [protocolo compartilhado](../beta/references/protocolo-evidencias-e-handoffs.md). Se esta skill foi acionada pela `beta`, considere o protocolo já carregado e complemente apenas com as regras específicas desta skill.

# Beta MOD Figma

## Responsabilidade

Inspecionar, comparar e revisar a representação visual da modelagem no Figma, preservando os padrões reais do CENCIHUB.

Tratar esta Skill como módulo visual. Não atuar como fonte independente de regra de negócio e não produzir uma Modelagem Funcional final concorrente com a `@beta`.

Preservar somente conhecimento próprio de Figma, consistência visual, estados de interface e referência de views. Não incorporar persistência do Dossiê, prioridade de fontes, análise funcional completa, cálculos, ciclo de vida/processamento, permissões especializadas, QA final ou gramática documental.

Ler [references/inspecao-e-consistencia-visual.md](references/inspecao-e-consistencia-visual.md) para aplicar os critérios visuais detalhados.

Ler [references/operacao-figma.md](references/operacao-figma.md) quando houver uso do conector Figma.

## Entrada esperada

Receber da `@beta`, ou diretamente do usuário:

- URL ou referência de arquivo/página/view;
- nome exato da view, quando conhecido;
- regra funcional vigente a representar ou comparar;
- referência de tela aprovada;
- escopo da alteração;
- estados esperados;
- mensagens, campos e ações já confirmados;
- screenshots, imagens ou referências visuais fornecidas.

Não criar regra, tela, ação, mensagem, permissão ou estado funcional para completar uma lacuna visual.

## Procedimento

### 1. Inspecionar antes de concluir ou alterar

Localizar, quando disponível:

- arquivo;
- página;
- view;
- views relacionadas;
- telas aprovadas;
- componentes reutilizados.

Identificar o padrão real de:

- topbar;
- sidebar;
- breadcrumb;
- filtros;
- campos;
- tabelas;
- botões;
- modais;
- notificações;
- paginação;
- tags;
- tooltips.

Confirmar nomes exatos das views.

### 2. Comparar interface e entendimento funcional

Verificar:

- regra confirmada ausente na tela;
- informação presente na tela sem sustentação funcional;
- mensagem divergente;
- campo faltante;
- ação sem representação;
- permissão não refletida;
- estado de erro ausente;
- retorno incoerente.

Não resolver divergência funcional silenciosamente. Devolver o ponto para a `@beta`.

### 3. Preservar consistência visual

Comparar e preservar, conforme as referências aprovadas:

- identidade do sistema;
- tipografia;
- peso de fonte;
- cores;
- ícones;
- alturas;
- alinhamentos;
- espaçamentos;
- larguras dos componentes;
- padrão de tabela;
- paginação;
- truncamento;
- tooltip;
- modal;
- toast;
- tag.

Não criar identidade visual paralela.

### 4. Aplicar padrões recorrentes somente quando corroborados

Quando o padrão real das telas ou a modelagem vigente confirmar, considerar:

- textos longos em uma linha;
- truncamento com reticências;
- tooltip com conteúdo completo;
- ausência de rolagem horizontal;
- preservação da altura da linha;
- uso de nomes exatos;
- ausência de título quando a tela real não utiliza;
- ausência de menu paralelo;
- reutilização de componente integrado ao sistema.

Não promover esses padrões visuais a regra funcional independente.

### 5. Verificar estados

Representar somente quando necessário e sustentado pelo escopo:

- carregamento;
- vazio;
- erro;
- sucesso;
- bloqueado;
- desabilitado;
- obrigatório;
- sem permissão;
- processamento;
- falha parcial.

Para cada estado, verificar se sua representação visual corresponde ao comportamento funcional já confirmado.

### 6. Validar visualmente

Antes de concluir uma revisão ou alteração visual:

- revisar por screenshot;
- conferir alinhamento;
- conferir ícones;
- conferir textos;
- conferir cores;
- conferir tags;
- conferir tooltips;
- conferir campos obrigatórios;
- conferir corte e sobreposição;
- confirmar que nenhuma tela fora do escopo foi alterada.

Não declarar conclusão sem inspeção visual.

### 7. Referenciar view na modelagem

Quando a `@beta` solicitar a referência textual de uma tela, retornar exatamente:

`Referência de imagem: [NOME EXATO DA VIEW]`

Não inventar nome de view.

## Operação com Figma

Usar o conector Figma quando disponível e quando houver fonte suficiente para identificar o arquivo ou node.

Priorizar inspeção em modo de leitura.

Escrever no Figma somente quando o usuário solicitar explicitamente criar, alterar, corrigir ou sincronizar uma tela/componente.

Antes de qualquer operação de escrita via conector, carregar a orientação específica `figma-use` disponibilizada pelo conector.

Não usar operações de design-to-code para esta Skill, salvo quando a própria solicitação do usuário exigir código e a `@beta` tiver roteado esse domínio separadamente.

## Saída para a Beta

Retornar somente os itens aplicáveis:

1. views relevantes;
2. divergências entre Figma e entendimento funcional;
3. componentes a reutilizar;
4. estados ausentes;
5. ajustes visuais necessários;
6. impacto funcional, quando existir;
7. confirmação da validação visual.

Manter a saída visual e modular. Não consolidar regra de negócio.

## Limites de isolamento

Não:

- atualizar ou persistir `DOSSIE_CONTEXTO_MODELAGEM.md`;
- decidir prioridade entre fontes;
- inventar regra;
- alterar fluxo funcional sem aprovação;
- criar tela fora do escopo;
- criar identidade visual paralela;
- adicionar CSS ou arquitetura à modelagem;
- definir fórmulas;
- detalhar processamento;
- definir política de autenticação, autorização ou permissão;
- executar QA final da modelagem;
- definir voz, estilo ou estrutura de artefatos;
- produzir a Modelagem Funcional completa isoladamente.

Quando outro domínio for necessário, devolver o ponto para a `@beta` compor com a Skill especializada correspondente.

