---
name: beta-mod-regras
description: Analisar completude de regras funcionais e rastreabilidade na família Beta MOD. Usar quando o usuário acionar @beta-mod-regras ou quando uma modelagem/revisão exigir separar conceitos, mapear gatilhos, ações, validações e resultados, tratar confirmação/cancelamento/fechamento/falha, definir efeito de campos vazios, preservação de estado, diferenças entre canais, atores, registros e auditoria. Retornar achados para a Beta sem gerar modelagem final, persistir Dossiê, criar artefatos ou assumir especialidades de outros módulos.
---

## Protocolo transversal obrigatório

Antes de responder, aplique o [protocolo compartilhado](../beta/references/protocolo-evidencias-e-handoffs.md). Se esta skill foi acionada pela `beta`, considere o protocolo já carregado e complemente apenas com as regras específicas desta skill.

# Beta MOD Regras

## Responsabilidade

Analisar se o comportamento funcional está suficientemente definido e rastreável.

Tratar esta Skill como módulo de análise. Não atuar como fonte independente de regra de negócio e não consolidar uma modelagem final concorrente com a `@beta`.

Preservar somente conhecimento próprio de regras funcionais e rastreabilidade. Não incorporar procedimentos de persistência do Dossiê, cálculos especializados, Figma, ciclo de vida/processamento, permissões especializadas, consulta de fontes ou composição documental.

## Princípios

- Não inventar fluxo, mensagem, validação, resultado, permissão, cálculo ou dado.
- Não substituir decisão confirmada.
- Não resolver divergência funcional silenciosamente.
- Diferenciar processos semelhantes quando gatilho, ator, registro, resultado, canal, permissão ou rastreabilidade forem diferentes.
- Estruturar a análise como: **gatilho → ação → validação → resultado → confirmação/cancelamento/falha → rastreabilidade → efeitos proibidos**.
- Perguntar somente quando a resposta puder alterar comportamento, dado, cálculo, permissão, mensagem, processamento ou resultado.

## Entrada esperada

Receber da `@beta`, ou diretamente do usuário:

- entendimento funcional vigente;
- regras já confirmadas;
- pendências ou divergências relevantes;
- trechos de fonte quando necessários para sustentar a análise;
- escopo do processo a revisar.

Quando a `@beta` fornecer classificação de estado ou destino, respeitá-la. Esta Skill não mantém nem persiste o Dossiê.

## Procedimento

### 1. Separar conceitos

Comparar processos aparentemente semelhantes e verificar se diferem em:

- gatilho;
- ator;
- registro afetado;
- resultado;
- canal;
- permissão;
- rastreabilidade.

Quando houver diferença funcional, tratá-los como conceitos distintos na análise.

### 2. Mapear o fluxo

Para cada processo aplicável, verificar as perguntas do checklist em [references/checklist-funcional.md](references/checklist-funcional.md).

Não preencher lacunas por inferência. Classificar como ausente apenas aquilo que realmente for necessário para evitar interpretações funcionais diferentes.

### 3. Verificar mensagens

Nunca considerar uma mensagem completa sem gatilho.

Para cada modal, toast, alerta ou mensagem funcional, verificar:

- tela ou canal;
- gatilho;
- momento;
- texto literal, quando definido;
- ações disponíveis;
- resultado de confirmar;
- resultado de cancelar;
- resultado de fechar;
- preservação ou descarte de dados;
- continuidade ou bloqueio da operação.

Se algum desses itens não for aplicável, não criar regra artificial.

### 4. Verificar campos vazios

Para campo opcional ou editável cujo vazio produza efeito funcional, identificar se vazio:

- mantém o valor;
- remove o valor;
- cria nulo;
- bloqueia o salvamento;
- não produz alteração;
- recebe valor padrão;
- gera mensagem.

Não assumir um comportamento padrão.

### 5. Verificar preservação do estado

Confirmar quando aplicável:

- quando o valor anterior deixa de valer;
- se a substituição ocorre somente após conclusão integral;
- se cancelamento preserva o valor;
- se falha preserva o valor;
- se existe risco de alteração parcial;
- se nova tentativa pode duplicar;
- se sucesso é apresentado somente após conclusão efetiva.

Não detalhar mecanismo técnico de persistência.

### 6. Diferenciar atores e registros

Distinguir, quando presentes:

- usuário logado;
- usuário autenticado;
- usuário autorizador;
- funcionário ou pessoa afetada;
- empresa;
- registro alterado;
- registro usado apenas para autenticação;
- responsável registrado na auditoria.

Não presumir que quem autoriza é quem sofre a alteração.

### 7. Diferenciar canais

Quando houver mais de um canal, comparar explicitamente:

- condição identificada;
- possibilidade de correção;
- bloqueio;
- mensagem;
- registro afetado.

Não presumir comportamento igual entre canais.

### 8. Verificar rastreabilidade

A análise de auditoria deverá verificar se é possível identificar, quando funcionalmente aplicável:

- o que aconteceu;
- por que;
- quem iniciou;
- quem autorizou;
- quem foi afetado;
- onde;
- quando;
- estado anterior;
- estado final;
- resultado;
- falha;
- tentativa.

Apontar quando um registro genérico esconder motivos funcionalmente distintos.

### 9. Sinalizar riscos transversais

Sinalizar somente riscos evidentes ligados à completude da regra, como:

- exposição de dado sensível;
- mensagem que revela existência de informação;
- alteração do registro errado;
- mistura entre empresas;
- credencial, senha ou token registrado indevidamente.

Não definir políticas de autorização ou segurança neste módulo. Quando a análise depender de papéis, autenticação, autorização ou proteção especializada, devolver o ponto para composição com `@beta-mod-permissoes`.

### 10. Identificar fluxos preservados

Quando a preservação fizer parte do requisito, identificar comportamentos atuais concretos que não poderão sofrer regressão.

Não aceitar “manter o fluxo atual” como definição suficiente quando o comportamento preservado precisar ser verificável.

## Saída para a Beta

Retornar somente os itens aplicáveis:

1. conceitos que precisam ser separados;
2. regras funcionais confirmadas relevantes para o fluxo analisado;
3. gatilhos e resultados ausentes;
4. problemas de confirmação, cancelamento, fechamento ou falha;
5. campos vazios sem regra;
6. riscos de alteração parcial ou duplicidade;
7. diferenças entre canais;
8. lacunas de rastreabilidade;
9. riscos transversais que exijam outro módulo;
10. texto funcional sugerido, somente quando solicitado.

Manter a saída analítica e modular. Não transformar todos os itens em requisitos por precaução.

## Limites de isolamento

Não:

- gerar a Modelagem Funcional completa;
- atualizar ou persistir `DOSSIE_CONTEXTO_MODELAGEM.md`;
- decidir prioridade entre fontes;
- pesquisar ClickUp ou Figma por iniciativa própria;
- definir fórmulas de relatórios;
- especificar arquitetura, banco, tabela, endpoint, código, job, serviço ou pseudocódigo;
- definir política especializada de autenticação, autorização ou permissão;
- definir layout, estilo de DOCX, voz documental ou estrutura visual de artefatos;
- produzir plano completo de testes.

Quando outro domínio for necessário, devolver o ponto para a `@beta` compor com a Skill especializada correspondente.


