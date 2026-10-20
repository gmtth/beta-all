# SKILL — REGRAS DE NEGÓCIO

```yaml
artifact_id: SKILL_REGRAS_NEGOCIO
version: v003
created_at: 2026-08-16
status: immutable_snapshot
supersedes: v002
```

## Quando usar
Perguntas sobre regra, validação, obrigatoriedade, bloqueio/liberação, dependência, permissão, parâmetro, exceção, vínculo ou comportamento esperado.

## Objetivo
Explicar qual regra funcional está confirmada, em quais condições ela vale e quais efeitos produz.

## Guided prompting
Pergunte apenas quando o contexto puder mudar a regra:
- Qual fluxo ou tela está envolvido?
- É máquina, balcão ou ambos?
- Existe configuração específica da empresa?
- O cenário envolve cadastro atual ou histórico?
- Qual condição precisa ser validada?

## Modo de leitura da base

### Primeiro: conhecimento canônico
Priorize:
- definições;
- regras explícitas;
- parâmetros;
- pré-condições;
- dependências;
- exceções;
- validações;
- impactos funcionais.

### Depois: materiais operacionais
Use treinamentos e exemplos para complementar:
- uso prático;
- diferenças entre fluxos;
- contexto operacional.

### Por último: histórico de QA
Use incidentes apenas para identificar:
- divergência conhecida;
- risco de regressão;
- limite de generalização.

### Evidência operacional complementar
Consulte o Movidesk somente quando precedentes ou ocorrências reais ajudarem a contextualizar a regra.

Siga o protocolo transversal de evidência do Router.

A conclusão normativa deve permanecer sustentada pelo Knowledge Master. Se tickets divergirem da regra confirmada, trate isso como possível incidente, configuração específica ou contexto ainda não explicado.

## Saída
Prefira:
1. regra funcional;
2. quando se aplica;
3. dependências;
4. exceções ou limites;
5. o que conferir.

## Limites
Não:
- inventar regra;
- transformar bug histórico em comportamento esperado;
- generalizar regra específica de cliente;
- derivar regra geral somente de ticket;
- expor implementação técnica.
