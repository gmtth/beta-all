# Observabilidade e métricas

> Contrato revisado em 2026-10-22. Para a apresentação comum da Beta, prevalece o [protocolo transversal](../../protocolo-evidencias-e-handoffs.md). Este documento distingue o que pode ser mostrado ao usuário do que depende de telemetria autorizada.

## Objetivo

Permitir diagnóstico da orquestração sem expor cadeia de pensamento.

Apresentar ao final das respostas funcionais substantivas o resumo comum em tabela Markdown. A tabela não é um painel de telemetria e não deve expor skills, ferramentas ou arquitetura interna.

## Campos

Registrar, quando observável:

| Métrica | Regra |
|---|---|
| Estado da solicitação | Concluído, parcial ou pendente, conforme resultado observável |
| Evidências | Registros/fontes citados e identificadores disponíveis |
| Validações | Checagens efetivamente realizadas, se relevantes |
| Resultado/feedback | Resultado confirmado ou “não informado” |
| Lacunas e próximo passo | Somente pendências que afetam a conclusão |
| Métricas técnicas | Latência, retries/erros e contagens, apenas se o runtime medir, se houver autorização e utilidade |

Omitir campos não aplicáveis. Para métricas técnicas relevantes mas indisponíveis, escrever `não disponível`; não substituir ausência por zero.

Nunca estimar tempo por Skill.

## Formato recomendado

### Exemplo de resumo voltado ao usuário

| Indicador | Resultado |
|---|---|
| 📊 Estado | Parcial: há precedente, mas o diagnóstico atual não foi confirmado |
| 🔎 Evidências | Chamado #1234, trecho sobre perda de conexão; link disponível na resposta |
| 🧭 Resultado/feedback | Não informado |
| ➡️ Lacunas e próximo passo | Confirmar se a máquina atual reproduz o sintoma |

Manter o bloco curto.

Não incluir no resumo voltado ao usuário:
- raciocínio privado;
- cadeia de pensamento;
- conteúdo intermediário sensível;
- nomes técnicos de skills, ferramentas/conectores ou detalhes da arquitetura interna. Exceção: nomes exibidos das skills realmente ativadas somente no cartão “Skills acionadas”;
- percentuais com falsa precisão, métricas não observadas ou valores zero presumidos. A confiabilidade percentual heurística deve seguir exclusivamente a régua do protocolo compartilhado.
