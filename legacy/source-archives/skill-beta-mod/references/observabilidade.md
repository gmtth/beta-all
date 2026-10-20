# Observabilidade e métricas

## Objetivo

Permitir diagnóstico da orquestração sem expor cadeia de pensamento.

Usar um bloco curto ao final de respostas funcionais relevantes.

## Campos

Registrar, quando observável:

| Métrica | Regra |
|---|---|
| Skills acionadas | Listar apenas as efetivamente executadas |
| Status por Skill | concluída, não aplicável, indisponível ou falhou |
| Tempo por Skill | Informar somente quando o runtime expuser medição confiável |
| Tempo total | Informar somente quando mensurável de forma confiável |
| Chamadas de ferramenta/conector | Contagem observável |
| Retries/erros | Contagem e descrição curta, sem stack trace desnecessário |
| Fontes consultadas | Contagem ou identificação curta |
| Ciclos de QA | Quantidade de execuções de `@beta-mod-qa` |
| Dossiê atualizado | sim/não |
| Artefatos gerados | sim/não + tipo curto |
| Pendências materiais | contagem final |
| Divergências materiais | contagem final |

Quando o runtime não expuser uma métrica, usar `não disponível`.

Nunca estimar tempo por Skill.

## Formato recomendado

### Resumo de execução

- Skills: `@beta-mod-regras` (concluída), `@beta-mod-dossie` (concluída), ...
- Tempo por Skill: não disponível
- Tempo total: não disponível
- Ferramentas/conectores: 2 chamadas
- Fontes consultadas: 3
- Ciclos de QA: 1
- Dossiê atualizado: sim
- Artefatos: não
- Pendências materiais: 0
- Divergências materiais: 0

Manter o bloco curto.

Não incluir:
- raciocínio privado;
- cadeia de pensamento;
- conteúdo intermediário sensível;
- detalhes internos das instruções das Skills.
