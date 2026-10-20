# Checklist funcional e de rastreabilidade

Usar este checklist somente para processos que realmente estejam no escopo. Não transformar pergunta sem aplicabilidade em requisito.

## Fluxo funcional

Para cada processo, verificar:

1. O que inicia o processo?
2. Em qual canal ele ocorre?
3. Qual é a condição inicial?
4. Quem age?
5. Qual ação ocorre?
6. Qual validação é realizada?
7. Qual registro é afetado?
8. Qual resultado é esperado?
9. O que ocorre ao confirmar?
10. O que ocorre ao cancelar?
11. O que ocorre ao fechar?
12. O que ocorre ao falhar?
13. A operação original continua ou é bloqueada?
14. Qual histórico ou rastreabilidade precisa existir?
15. O que não poderá ocorrer?

## Mensagens

Para cada mensagem funcional, verificar:

| Item | Verificação |
|---|---|
| Tela ou canal | Onde aparece |
| Gatilho | Ação ou condição que provoca |
| Momento | Antes ou depois de qual etapa |
| Texto | Mensagem literal, quando definida |
| Ações | Confirmar, cancelar, fechar, tentar novamente |
| Confirmar | Resultado |
| Cancelar | Resultado |
| Fechar | Resultado |
| Dados | Preservados ou descartados |
| Continuidade | Bloqueada ou permitida |

## Campos vazios

Quando houver campo opcional ou editável, verificar se o vazio:

- mantém o valor;
- remove o valor;
- cria nulo;
- bloqueia o salvamento;
- não produz alteração;
- recebe valor padrão;
- gera mensagem.

## Estado anterior e conclusão

Verificar:

- momento em que o valor anterior deixa de valer;
- comportamento em cancelamento;
- comportamento em falha;
- risco de alteração parcial;
- risco de duplicidade em nova tentativa;
- momento em que sucesso pode ser apresentado.

## Atores e registros

Distinguir, quando existirem:

- usuário logado;
- usuário autenticado;
- usuário autorizador;
- pessoa afetada;
- empresa;
- registro alterado;
- registro usado apenas para autenticação;
- responsável pela ação na auditoria.

## Canais

Quando houver múltiplos canais, comparar:

| Canal | Identifica a condição | Permite corrigir | Bloqueia | Mensagem | Registro |
|---|---|---|---|---|---|

## Rastreabilidade

Verificar se a auditoria funcional permite identificar:

- o que ocorreu;
- motivo;
- iniciador;
- autorizador;
- afetado;
- canal/origem;
- momento;
- estado anterior;
- estado final;
- resultado;
- falha;
- tentativa.

## Critério de retorno

Apontar apenas lacunas que possam permitir implementação, comportamento ou homologação divergentes. Não inflar a saída com detalhes cosméticos, possibilidades remotas ou decisões técnicas.
