# Processamento, falhas, retry e concorrência

## Processamento em segundo plano

Definir funcionalmente:

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

Valores como tamanho de lote, número de tentativas, intervalo, timeout ou prioridade somente poderão ser usados quando confirmados.

Não traduzir uma regra funcional em arquitetura.

## Falha parcial

Definir:

| Ponto | Regra |
|---|---|
| Concluídos | O que permanece concluído |
| Erros | O que fica com erro |
| Sucessos | Como são preservados |
| Retry | O que será tentado novamente |
| Não repetidos | O que não poderá ser refeito |
| Mensagem | Retorno confirmado |
| Acompanhamento | Como o usuário/processo identifica o resultado |
| Nova tentativa | Comportamento funcional esperado |

Não assumir rollback total.

## Idempotência funcional

Ao analisar nova tentativa, verificar se ela poderá:

- duplicar;
- repetir sucesso;
- alterar registro não afetado;
- misturar empresas;
- perder histórico;
- sobrescrever dado mais novo com resultado antigo.

Se qualquer comportamento depender de implementação técnica ainda não decidida, registrar o efeito funcional esperado sem prescrever mecanismo.

## Concorrência

Quando houver alteração durante processamento, definir:

- pausa;
- incorporação de pendentes;
- repetição de concluídos;
- uso do estado atual;
- tratamento de resultado antigo;
- impacto sobre nova alteração.

Perguntas relevantes:

- novo evento entra no processamento atual ou no próximo?
- registro já concluído pode voltar a ser processado?
- alteração posterior pode ser sobrescrita por cálculo/resultado anterior?
- processamento entre empresas é isolado?
- uma tentativa concorrente pode duplicar efeitos?

## Auditoria

Quando aplicável, verificar:

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

Não inventar estrutura de log, nomes técnicos ou mecanismo de persistência.

## Critério de pendência

Devolver pendência quando a ausência puder alterar:

- estado;
- criação ou atualização;
- exclusão/restauração;
- registro vencedor;
- duplicidade;
- precedência;
- lote/processamento;
- falha parcial;
- retry;
- concorrência;
- resultado;
- histórico;
- auditoria.

Não criar pendência por detalhe técnico sem impacto funcional.
