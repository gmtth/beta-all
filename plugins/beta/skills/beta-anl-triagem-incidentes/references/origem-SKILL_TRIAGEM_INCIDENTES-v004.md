# SKILL — TRIAGEM DE INCIDENTES

```yaml
artifact_id: SKILL_TRIAGEM_INCIDENTES
version: v004
created_at: 2026-08-16
status: immutable_snapshot
supersedes: v003
```

## Quando usar
Erro, falha, divergência, comportamento inesperado, mensagem incomum, suspeita de bug ou regressão.

## Objetivo
Isolar o incidente antes de concluir causa.

Priorize:
1. sintoma;
2. escopo;
3. reprodução;
4. impacto;
5. evidências;
6. precedentes internos.

## Guided prompting
Escolha somente 1 a 3 perguntas de maior valor:
- O que era esperado e o que ocorreu?
- Em qual tela ou fluxo?
- Acontece com um caso ou vários?
- Qual mensagem aparece exatamente?
- Funciona em cenário equivalente?
- Houve alteração recente?
- Existe evidência como print, horário, matrícula, produto, máquina ou registro?

## Modo de leitura da base

### Primeiro: histórico de QA e incidentes
Procure:
- sintomas semelhantes;
- mesmo fluxo;
- condições de reprodução;
- impacto;
- causas confirmadas em casos anteriores;
- riscos;
- limites de generalização.

### Depois: regra funcional
Compare o incidente com:
- comportamento esperado;
- pré-condições;
- vínculos;
- parâmetros;
- dependências.

### Evidência operacional complementar
Consulte o Movidesk quando houver ticket identificado ou critérios suficientes para:
- reconstruir o histórico do caso;
- localizar ocorrências semelhantes;
- comparar sintomas;
- verificar recorrência;
- testar hipóteses funcionais.

Selecione a busca conforme a evidência necessária:
- use `searchTickets` para ticket por ID, filtros estruturados, estado, responsável, equipe, cliente, categoria, serviço e histórico de caso identificado;
- use `searchTicketContent` quando houver mensagem de erro, sintoma, palavra ou expressão característica que possa estar registrada no assunto, descrição inicial ou interações.

Na pesquisa textual, use `keyword` com escopo suficiente. Correspondência textual indica precedente potencial, não equivalência de causa.

Siga o protocolo transversal de evidência do Router.

Ticket demonstra o que foi registrado ou observado. Não determina isoladamente comportamento esperado ou causa raiz.

### Classificação interna
Diferencie:
- comportamento esperado confirmado;
- precedente de incidente;
- hipótese plausível;
- informação insuficiente.

Incidente histórico é precedente, não diagnóstico automático.

## Saída
Apresente somente o que for útil:
- fato observado;
- escopo;
- o que conferir;
- hipóteses funcionais ordenadas;
- precedente relevante, se realmente comparável;
- risco de regressão ou generalização.

## Limites
Não:
- fechar diagnóstico sem evidência;
- prometer correção;
- afirmar que correção antiga resolve o caso atual;
- transformar ticket em regra funcional;
- expor implementação técnica.
