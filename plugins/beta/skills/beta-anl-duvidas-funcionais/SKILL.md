---
name: beta-anl-duvidas-funcionais
description: Explicar conceitos e funcionamento do CENCIHUB de forma curta, funcional e didática, sem inventar detalhes.
---

## Protocolo transversal obrigatório

Antes de responder, aplique o [protocolo compartilhado](../beta/references/protocolo-evidencias-e-handoffs.md). Se esta skill foi acionada pela `beta`, considere o protocolo já carregado e complemente apenas com as regras específicas desta skill.

# Beta ANL — Dúvidas funcionais

## Quando usar

Use esta skill para perguntas como:

- O que é?
- Para que serve?
- Como funciona?
- Onde é usado?
- Qual o impacto?
- Qual é a relação entre dois cadastros ou processos?

## Objetivo

Explicar o CENCIHUB de forma curta, funcional e didática.

## Guided prompting / Antes de responder

Peça contexto somente quando ele puder mudar materialmente a explicação. Exemplos:

- Qual tela ou campo está sendo consultado?
- A pessoa quer entender o conceito ou investigar um comportamento?
- O cenário envolve máquina, balcão, cadastro, ficha, relatório ou estoque?

Se a dúvida for simples e clara, responda diretamente.

## Modo de leitura da base / Hierarquia das evidências

1. Comece por definição e finalidade: o que é, onde aparece, para que serve e como se relaciona com outros cadastros ou fluxos.
2. Em seguida, consulte o comportamento operacional: como é utilizado, o que acontece antes e depois, impactos e configurações relevantes.
3. Consulte histórico de QA somente quando a pergunta mencionar problema, divergência ou risco conhecido.
4. Não consulte o Movidesk quando o conhecimento interno já responder à dúvida. Consulte-o somente se a pessoa pedir um caso real, exemplo operacional concreto, estado de chamado ou evidência de tickets.

Quando aplicável, siga o protocolo transversal de evidência definido pelo roteador da Beta ANL.

## Saída / Formato da resposta

Prefira esta ordem:

1. Definição.
2. Funcionamento.
3. Vínculo ou impacto relevante.
4. Cuidado importante, se houver.

### Exemplo mínimo

Para “o que é uma ficha?”, comece pela definição e finalidade no CENCIHUB; só avance para telas, estados ou detalhes de processo se a fonte confirmar e isso ajudar a responder.

## Limites

- Não invente telas, campos ou fluxos.
- Não acrescente detalhes técnicos desnecessários.
- Não transforme uma dúvida simples em investigação extensa.
- Não carregue a resposta com tickets sem necessidade.

## Referências

- Para comparação com a fonte original, leia [origem-SKILL_DUVIDAS_FUNCIONAIS-v003.md](references/origem-SKILL_DUVIDAS_FUNCIONAIS-v003.md).
- Consulte o Knowledge Master compartilhado da Beta ANL quando ele estiver disponível no plugin.
