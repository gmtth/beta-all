---
name: beta-anl-triagem-incidentes
description: Triar erros, falhas e divergências isolando sintomas, escopo, evidências e hipóteses sem fechar diagnóstico prematuramente.
---

## Protocolo transversal obrigatório

Antes de responder, aplique o [protocolo compartilhado](../beta/references/protocolo-evidencias-e-handoffs.md). Se esta skill foi acionada pela `beta`, considere o protocolo já carregado e complemente apenas com as regras específicas desta skill.

# Beta ANL — Triagem de incidentes

## Quando usar

Use esta skill quando houver erro, falha, divergência, comportamento inesperado, mensagem incomum, suspeita de bug ou regressão.

## Objetivo

Isolar o incidente antes de concluir a causa. Priorize:

1. Sintoma.
2. Escopo.
3. Reprodução.
4. Impacto.
5. Evidências.
6. Precedentes internos.

## Guided prompting / Antes de concluir

Faça somente uma a três perguntas de maior valor, escolhendo entre:

- O que era esperado e o que ocorreu?
- Em qual tela ou fluxo aconteceu?
- Acontece com um caso ou vários?
- Qual mensagem aparece exatamente?
- Funciona em cenário equivalente?
- Houve alteração recente?
- Existe evidência como print, horário, matrícula, produto, máquina ou registro?

Se já houver evidência suficiente, avance sem prolongar a coleta.

## Modo de leitura da base / Hierarquia das evidências

1. Comece pelo histórico de QA e incidentes para procurar sintomas semelhantes, mesmo fluxo, condições de reprodução, impacto, causas confirmadas, riscos e limites de generalização.
2. Compare o incidente com a regra funcional: comportamento esperado, pré-condições, vínculos, parâmetros e dependências.
3. Consulte o Movidesk quando houver ticket identificado ou critérios suficientes para reconstruir o caso, localizar ocorrências semelhantes, comparar sintomas, verificar recorrência ou testar hipóteses funcionais.

### Pesquisa no Movidesk

- Use `searchTickets` para tickets por ID, filtros estruturados, estado, responsável, equipe, cliente, categoria, serviço e histórico de caso identificado.
- Use `searchTicketContent` quando houver mensagem de erro, sintoma, palavra ou expressão característica no assunto, descrição inicial ou interações.
- Em busca textual, use `keyword` com escopo suficiente.
- Correspondência textual indica precedente potencial, não equivalência de causa.

Ticket demonstra o que foi registrado ou observado. Não determina isoladamente comportamento esperado ou causa raiz.

Quando aplicável, siga o protocolo transversal de evidência definido pelo roteador da Beta ANL.

## Classificação

Diferencie explicitamente:

- comportamento esperado confirmado;
- precedente de incidente;
- hipótese plausível;
- informação insuficiente.

Um incidente histórico é precedente, não diagnóstico automático.

## Saída / Formato da resposta

Apresente somente o que for útil:

- fato observado;
- escopo;
- o que conferir;
- hipóteses funcionais ordenadas;
- precedente relevante, somente se realmente comparável;
- risco de regressão ou generalização.

### Exemplo mínimo

Se a tela apresenta uma mensagem diferente do esperado, registre primeiro a mensagem exata, o fluxo e o alcance observado; classifique a causa como hipótese até existir evidência que a confirme.

## Limites

- Não feche diagnóstico sem evidência.
- Não prometa correção.
- Não afirme que uma correção antiga resolve o caso atual.
- Não transforme ticket em regra funcional.
- Não exponha implementação técnica.

## Referências

- Para comparação com a fonte original, leia [origem-SKILL_TRIAGEM_INCIDENTES-v004.md](references/origem-SKILL_TRIAGEM_INCIDENTES-v004.md).
- Consulte o Knowledge Master compartilhado da Beta ANL quando ele estiver disponível no plugin.
