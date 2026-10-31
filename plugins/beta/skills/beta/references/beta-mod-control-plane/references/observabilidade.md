# Observabilidade e métricas

> A apresentação comum da Beta segue o [protocolo transversal](../../protocolo-evidencias-e-handoffs.md). Este documento trata apenas de telemetria técnica autorizada.

## Objetivo

Permitir diagnóstico da orquestração sem expor cadeia de pensamento. A apresentação da resposta ao usuário, incluindo cartões, campos e condições de exibição, segue exclusivamente o [protocolo transversal](../../protocolo-evidencias-e-handoffs.md).

## Métricas técnicas

Registrar somente quando o runtime realmente medir, houver autorização e a informação for útil:

| Métrica | Regra |
|---|---|
| Latência | Usar a duração medida; nunca estimar tempo por skill. |
| Tentativas e erros | Registrar contagens observadas e categorias técnicas seguras. |
| Chamadas | Registrar contagens observadas quando disponíveis e autorizadas. |

Para métricas relevantes mas indisponíveis, registrar `não disponível`; não substituir ausência por zero. Não expor dados técnicos internos em respostas ao usuário. A confiabilidade percentual heurística e sua apresentação seguem exclusivamente o protocolo compartilhado.
