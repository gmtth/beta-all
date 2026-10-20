---
name: beta-mod-processamento
description: Analisar ciclo de vida e processamento na família Beta MOD. Usar em modelagens com criação, edição, exclusão, restauração, inativação, importação, reimportação, processamento em lote, filas, timeout, retry, concorrência, duplicidade, precedência, histórico ou migração funcional. Estruturar estados, transições e resultados sem inventar tecnologia ou regra funcional.
---

## Protocolo transversal obrigatório

Antes de responder, aplique o [protocolo compartilhado](../beta/references/protocolo-evidencias-e-handoffs.md). Se esta skill foi acionada pela `beta`, considere o protocolo já carregado e complemente apenas com as regras específicas desta skill.

# Beta MOD Processamento

## Responsabilidade

Analisar ciclo de vida e processamento funcional de registros, incluindo estados, transições, unicidade, precedência, gatilhos, reprocessamento, falhas e concorrência.

Tratar esta Skill como módulo analítico. Não atuar como fonte independente de regra de negócio e não produzir uma Modelagem Funcional final concorrente com a `@beta`.

Preservar somente conhecimento próprio de ciclo de vida e processamento. Não incorporar persistência do Dossiê, prioridade de fontes, cálculos de relatório, frontend, Figma, permissões especializadas, QA final ou composição documental.

Ler [references/ciclo-vida-unicidade.md](references/ciclo-vida-unicidade.md) para estados, transições, unicidade, precedência e gatilhos.

Ler [references/processamento-falhas-concorrencia.md](references/processamento-falhas-concorrencia.md) quando houver lote, fila, reprocessamento, falha parcial, retry, timeout ou concorrência.

## Entrada esperada

Receber da `@beta`, ou diretamente do usuário:

- registros e conceitos já confirmados;
- estado atual conhecido;
- eventos/gatilhos;
- transições já definidas;
- regras de criação, atualização, exclusão ou restauração;
- origem e precedência, quando aplicável;
- regras confirmadas de processamento;
- comportamento de falha e nova tentativa;
- requisitos de histórico e auditoria;
- pendências ou divergências já identificadas.

Não preencher por inferência qualquer lacuna que altere estado, criação, atualização, exclusão, precedência, duplicidade, retry, concorrência ou resultado.

## Procedimento

### 1. Definir conceitos

Identificar somente os conceitos aplicáveis:

- registro principal;
- chave funcional;
- origem;
- status;
- ativo;
- excluído;
- histórico;
- registro efetivo;
- processamento;
- grupo;
- fila;
- tentativa;
- erro;
- conclusão.

Não criar conceito que a fonte não sustente.

### 2. Construir o ciclo de vida

Estruturar cada transição relevante:

| Evento | Estado anterior | Estado final | Registro afetado | Efeito proibido |
|---|---|---|---|---|

Definir, quando aplicável:

- estado inicial;
- transições permitidas;
- transições proibidas;
- gatilho;
- preservação do ID;
- criação ou atualização;
- histórico;
- efeitos em registros relacionados.

Não assumir que exclusão é física, lógica ou equivalente a inativação sem confirmação.

### 3. Analisar unicidade e duplicidade

Definir:

- combinação única;
- identificação do registro existente;
- quando atualizar;
- quando criar;
- quando restaurar;
- quando excluir logicamente;
- tratamento de duplicidades existentes;
- registro que prevalece;
- preservação de histórico.

Não escolher chave, registro vencedor ou estratégia de deduplicação sem decisão.

### 4. Analisar precedência

Quando houver origens concorrentes, definir:

- nível da comparação;
- ordem de prioridade;
- origem vencedora;
- exceções;
- impacto em registros;
- tratamento de origens inativas;
- vínculos específicos;
- prevenção de linhas paralelas.

Não reutilizar precedência de outra funcionalidade sem fonte atual que a confirme.

### 5. Mapear gatilhos

Para cada gatilho:

| Gatilho | Registros afetados | Pessoas afetadas | Momento | Resultado |
|---|---|---|---|---|

Considerar somente quando aplicável:

- criação;
- edição;
- ativação;
- inativação;
- exclusão;
- restauração;
- importação;
- ação manual;
- rotina automática.

### 6. Analisar processamento em segundo plano

Quando houver processamento assíncrono ou em lote, definir funcionalmente:

- início;
- registros incluídos;
- agrupamento;
- ordem;
- progresso;
- isolamento entre empresas;
- prevenção de duplicidade;
- comparação antes de persistir;
- novos eventos durante processamento;
- pausa ou reorganização;
- preservação de sucessos;
- falha parcial;
- retomada;
- timeout;
- retry.

Usar valores específicos somente quando confirmados.

Não impor job, worker, serviço, fila tecnológica ou arquitetura.

### 7. Tratar falha parcial

Definir:

- registros concluídos;
- registros com erro;
- preservação dos sucessos;
- retry;
- registros que não deverão ser repetidos;
- mensagem;
- acompanhamento;
- comportamento da nova tentativa.

Não presumir rollback integral ou parcial sem decisão funcional.

### 8. Verificar idempotência funcional

A nova tentativa não deverá, quando essa propriedade for requerida pelo processo:

- duplicar;
- repetir sucessos sem necessidade;
- alterar registros não afetados;
- misturar empresas;
- perder histórico.

Distinguir resultado funcional esperado de implementação técnica.

### 9. Tratar concorrência funcional

Quando uma nova alteração ocorrer durante processamento, definir:

- se pausa;
- se incorpora pendentes;
- se repete concluídos;
- como considera o estado atual;
- como impede resultado antigo de sobrescrever novo.

Quando não houver decisão, devolver a lacuna à `@beta`.

### 10. Verificar auditoria

Registrar, quando aplicável:

- empresa;
- usuário;
- origem;
- data e horário;
- registros;
- estado anterior;
- estado final;
- falha;
- tentativa;
- resultado.

Não inventar nomes de logs, tabelas ou estruturas técnicas.

## Saída para a Beta

Retornar somente os itens aplicáveis:

1. conceitos;
2. matriz de estados;
3. regra de unicidade;
4. precedência;
5. gatilhos;
6. processamento;
7. falha parcial;
8. retry;
9. auditoria;
10. riscos e pendências.

Manter a saída analítica, rastreável e modular.

## Fronteiras com outros módulos

Devolver à `@beta` para composição quando necessário:

- completude geral de regra funcional → `@beta-mod-regras`;
- relatórios ou fórmulas → `@beta-mod-relatorios`;
- telas e navegação → `@beta-mod-fluxos`;
- consistência visual → `@beta-mod-figma`;
- autenticação, autorização e dados sensíveis → `@beta-mod-permissoes`;
- fontes e versões → `@beta-mod-fontes`;
- artefatos e linguagem documental → `@beta-mod-artefatos`.

Essas referências existem apenas para delimitar responsabilidade. Não incorporar o conhecimento interno dos outros módulos.

## Limites de isolamento

Não:

- atualizar ou persistir `DOSSIE_CONTEXTO_MODELAGEM.md`;
- decidir prioridade entre fontes;
- inventar job, tabela, serviço, worker ou fila tecnológica;
- escolher timeout sem decisão;
- escolher tamanho de lote sem decisão;
- escolher chave funcional sem fonte;
- aplicar precedência de outro processo por analogia;
- transformar sugestão técnica em regra funcional;
- definir cálculo de relatório;
- definir fluxo frontend genérico;
- revisar Figma;
- definir política de autenticação, autorização ou permissão;
- executar QA final da modelagem;
- definir voz, estilo ou estrutura de artefatos;
- produzir plano completo de testes;
- produzir a Modelagem Funcional completa isoladamente.

