---
name: beta-mod-fluxos
description: Analisar fluxos de telas e comportamentos de interface na família Beta MOD. Usar em modelagens de portal, totem, máquina, balcão, formulários, carrinho, modais, telas sequenciais, navegação, retorno, validações e estados da interface. Estruturar o fluxo de forma sequencial e verificável sem inventar telas ou regras de negócio.
---

## Protocolo transversal obrigatório

Antes de responder, aplique o [protocolo compartilhado](../beta/references/protocolo-evidencias-e-handoffs.md). Se esta skill foi acionada pela `beta`, considere o protocolo já carregado e complemente apenas com as regras específicas desta skill.

# Beta MOD Fluxos

## Responsabilidade

Analisar e organizar fluxos funcionais de interface de forma sequencial, verificável e coerente com as regras já confirmadas.

Tratar esta Skill como módulo de fluxo e frontend funcional. Não atuar como fonte independente de regra de negócio e não produzir uma Modelagem Funcional final concorrente com a `@beta`.

Preservar somente conhecimento próprio de telas, navegação, interação, estados e sequenciamento. Não incorporar persistência do Dossiê, prioridade de fontes, revisão visual de Figma, cálculos, ciclo de vida/processamento, permissões especializadas, QA final ou composição documental.

Ler [references/analise-fluxos-frontend.md](references/analise-fluxos-frontend.md) para aplicar os checklists detalhados.

## Entrada esperada

Receber da `@beta`, ou diretamente do usuário:

- regra funcional vigente;
- ponto de entrada;
- telas conhecidas;
- ações do usuário;
- validações confirmadas;
- mensagens confirmadas;
- estados esperados;
- navegação e retornos já definidos;
- referências de views ou imagens, quando disponíveis;
- pendências e divergências já identificadas.

Não criar tela, etapa, botão, modal, validação, mensagem ou navegação para preencher lacuna.

## Procedimento

### 1. Construir visão geral

Quando útil, organizar apenas o fluxo principal:

| Ordem | Tela atual | Ação necessária | Próxima etapa |
|---|---|---|---|

Não incluir exceções nessa visão quando isso comprometer a leitura do fluxo principal.

### 2. Detalhar cada etapa

Para cada etapa aplicável, identificar:

- ponto de entrada;
- condição inicial;
- tela atual;
- dados apresentados;
- ação;
- validação;
- resultado;
- próxima tela;
- ramificação;
- erro;
- cancelamento;
- retorno;
- registro gerado, quando funcionalmente confirmado.

Usar estrutura equivalente a:

| Etapa | Tela atual | Ação do usuário | Próxima tela ou resultado |
|---|---|---|---|

### 3. Verificar navegação

Analisar quando aplicável:

- Voltar;
- página anterior;
- preservação de paginação;
- filtros;
- rolagem;
- campos preenchidos;
- seleção;
- carrinho;
- sessão;
- troca de menu;
- saída;
- conclusão;
- abertura em nova aba.

Não presumir preservação ou descarte de estado.

### 4. Tratar etapas condicionais

Para etapa opcional ou condicional, identificar quando ela:

- aparece;
- é ignorada;
- bloqueia;
- apenas informa;
- permanece aberta;
- retorna;
- permite continuar.

Quando a condição não estiver confirmada, devolver como pendência em vez de definir comportamento.

### 5. Verificar validações de interface

Analisar, quando aplicável:

- obrigatoriedade;
- formato;
- mensagem;
- destaque de campo;
- bloqueio;
- nova tentativa;
- clique duplo;
- repetição de ação;
- submissão duplicada;
- carregamento.

Não inventar mensagem literal ou regra de debounce.

### 6. Verificar estados

Considerar somente estados relevantes ao caso:

- carregando;
- vazio;
- sucesso;
- erro;
- indisponível;
- desabilitado;
- somente leitura;
- oculto;
- obrigatório;
- selecionado;
- não selecionado.

Para cada estado, identificar gatilho, comportamento permitido e saída quando isso alterar a experiência funcional.

### 7. Verificar modais e mensagens

Para cada modal ou mensagem, identificar:

- gatilho;
- título, quando confirmado;
- mensagem, quando confirmada;
- dados apresentados;
- ações disponíveis;
- resultado de confirmar;
- resultado de cancelar;
- resultado de fechar;
- preservação de dados;
- continuidade;
- comportamento em erro.

Não aceitar modal sem gatilho ou ação sem resultado funcional conhecido.

### 8. Verificar referências de tela

Quando o usuário solicitar referência textual de uma view, usar:

`Referência de imagem: [NOME EXATO DA VIEW]`

Não criar link quando o usuário pedir somente o nome.

Não usar esta Skill para revisar medidas, cores, espaçamentos, componentes ou fidelidade visual de Figma.

### 9. Revisar consistência do fluxo

Antes de devolver a análise, verificar:

- a próxima tela existe?
- o retorno é conhecido?
- erro mantém o usuário em ponto válido?
- confirmação repetida pode duplicar?
- etapa opcional possui regra?
- dados podem ser perdidos indevidamente?
- ação visual depende de permissão?
- mensagem corresponde ao resultado real?
- conclusão possui destino conhecido?
- saída interrompe ou preserva a operação atual?

Quando a resposta depender de regra de negócio ausente, não arbitrar.

## Fronteiras com outros módulos

Devolver à `@beta` para composição quando necessário:

- completude geral de regra funcional → `@beta-mod-regras`;
- revisão de layout/fidelidade visual → `@beta-mod-figma`;
- autenticação, autorização e permissão → `@beta-mod-permissoes`;
- cálculo ou relatório → `@beta-mod-relatorios`;
- processamento, importação, fila ou ciclo de vida → `@beta-mod-processamento`;
- geração de DOCX ou linguagem documental → `@beta-mod-artefatos`.

Essas referências servem apenas para delimitar responsabilidade. Não incorporar o conhecimento interno desses módulos.

## Saída para a Beta

Retornar somente os itens aplicáveis:

1. fluxo principal;
2. ramificações;
3. navegação;
4. validações;
5. estados;
6. modais e mensagens;
7. referências de views;
8. inconsistências;
9. pendências que alterem comportamento;
10. texto funcional sugerido, somente quando solicitado.

Manter a saída analítica e modular.

## Limites de isolamento

Não:

- atualizar ou persistir `DOSSIE_CONTEXTO_MODELAGEM.md`;
- decidir prioridade entre fontes;
- decidir regra de negócio por preferência visual;
- inventar telas, ações, mensagens ou etapas;
- alterar Figma;
- criar especificação de CSS;
- definir layout visual detalhado;
- definir política de autenticação, autorização ou permissão;
- definir fórmulas;
- detalhar processamento interno;
- executar QA final da modelagem;
- definir voz, estilo ou estrutura de artefatos;
- produzir Modelagem Funcional completa isoladamente;
- produzir plano completo de testes.

Quando outro domínio for necessário, devolver o ponto para a `@beta` compor com a Skill especializada correspondente.


