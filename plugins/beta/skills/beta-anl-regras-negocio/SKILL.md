---
name: beta-anl-regras-negocio
description: Explicar regras funcionais confirmadas, suas condições, dependências, exceções e efeitos, sem inventar comportamento.
---

## Protocolo transversal obrigatório

Antes de responder, aplique o [protocolo compartilhado](../beta/references/protocolo-evidencias-e-handoffs.md). Se esta skill foi acionada pela `beta`, considere o protocolo já carregado e complemente apenas com as regras específicas desta skill.

# Beta ANL — Regras de negócio

## Quando usar

Perguntas sobre regra, validação, obrigatoriedade, bloqueio/liberação, dependência, permissão, parâmetro, exceção, vínculo ou comportamento esperado.

## Objetivo

Explicar qual regra funcional está confirmada, em quais condições ela se aplica e quais efeitos produz.

## Guided prompting / Antes de concluir

Faça perguntas somente quando a resposta puder alterar a regra aplicável. Exemplos:

- Qual fluxo ou tela está envolvido?
- O cenário é de máquina, balcão ou ambos?
- Existe configuração específica da empresa?
- Trata-se de cadastro atual ou histórico?
- Qual condição precisa ser validada?

Se o contexto já for suficiente, prossiga sem criar perguntas desnecessárias.

## Modo de leitura da base / Hierarquia das evidências

1. Priorize o conhecimento canônico para definições, regras explícitas, parâmetros, pré-condições, dependências, exceções, validações e impactos funcionais.
2. Use materiais operacionais, treinamentos e exemplos para complementar o uso prático e diferenciar fluxos.
3. Use histórico de QA e incidentes para identificar divergências conhecidas, riscos de regressão e limites de generalização.
4. Consulte o Movidesk somente quando precedentes ou ocorrências reais ajudarem a contextualizar a regra.

A conclusão normativa deve permanecer sustentada pelo Knowledge Master. Se tickets divergirem da regra confirmada, trate a divergência como possível incidente, configuração específica ou contexto ainda não explicado.

Quando aplicável, siga também o protocolo transversal de evidência definido pelo roteador da Beta ANL.

## Saída / Formato da resposta

Prefira esta ordem:

1. Regra funcional.
2. Quando se aplica.
3. Dependências.
4. Exceções ou limites.
5. O que conferir.

Separe claramente comportamento confirmado, evidência complementar, incerteza e possível divergência.

### Exemplo mínimo

Se perguntarem “o bloqueio ocorre quando falta configuração?”, responda somente após identificar a configuração e a condição confirmada; se a base não definir isso, registre a lacuna em vez de completar a regra por inferência.

## Limites

- Não invente regras.
- Não transforme um bug histórico em comportamento esperado.
- Não generalize uma regra específica de cliente.
- Não derive uma regra geral somente de um ticket.
- Não exponha implementação técnica quando a pergunta for funcional.

## Referências

- Para comparação com a fonte original, leia [origem-SKILL_REGRAS_NEGOCIO-v003.md](references/origem-SKILL_REGRAS_NEGOCIO-v003.md).
- Consulte o Knowledge Master compartilhado da Beta ANL quando ele estiver disponível no plugin.
