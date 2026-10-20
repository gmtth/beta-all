# Análise de fluxos e frontend

## Visão geral

Criar quando útil:

| Ordem | Tela atual | Ação necessária | Próxima etapa |
|---|---|---|---|

A visão geral deverá representar somente o caminho principal.

## Fluxo detalhado

Para cada etapa, verificar:

1. ponto de entrada;
2. condição inicial;
3. tela;
4. dados apresentados;
5. ação;
6. validação;
7. resultado;
8. próxima tela;
9. ramificação;
10. erro;
11. cancelamento;
12. retorno;
13. registro gerado, quando aplicável.

Estrutura sugerida:

| Etapa | Tela atual | Ação do usuário | Próxima tela ou resultado |
|---|---|---|---|

## Navegação

Verificar, conforme o caso:

- botão Voltar;
- página anterior;
- paginação;
- filtros;
- rolagem;
- campos preenchidos;
- seleção;
- carrinho;
- sessão;
- troca de menu;
- saída;
- conclusão;
- nova aba.

Não assumir que o estado é preservado ou descartado.

## Etapas condicionais

Para cada etapa não obrigatória, verificar se:

- aparece;
- é ignorada;
- bloqueia;
- apenas informa;
- permanece aberta;
- retorna;
- permite continuar.

A condição de entrada e a condição de saída deverão estar claras.

## Validações

Verificar quando aplicável:

| Item | Pergunta funcional |
|---|---|
| Obrigatoriedade | O campo ou ação é obrigatório? |
| Formato | Qual formato é aceito? |
| Mensagem | Existe texto confirmado? |
| Destaque | Qual elemento é realçado? |
| Bloqueio | O usuário pode continuar? |
| Nova tentativa | É possível tentar novamente? |
| Clique duplo | Pode produzir duplicidade? |
| Repetição | A mesma ação pode ser repetida? |
| Submissão duplicada | Há risco de duplicação do resultado? |
| Carregamento | O que pode ou não pode ser feito enquanto processa? |

Não criar solução técnica para debounce, lock ou idempotência.

## Estados da interface

Quando aplicável:

- carregando;
- vazio;
- sucesso;
- erro;
- indisponível;
- desabilitado;
- somente leitura;
- oculto;
- obrigatório;
- selecionado;
- não selecionado.

Para cada estado relevante, verificar:

- gatilho;
- informação apresentada;
- ações permitidas;
- ações bloqueadas;
- condição de saída;
- preservação de dados.

## Modais e mensagens

Para cada modal:

| Item | Verificação |
|---|---|
| Gatilho | O que faz abrir |
| Título | Texto confirmado |
| Mensagem | Texto confirmado |
| Dados | Informações exibidas |
| Ações | Botões/ações disponíveis |
| Confirmar | Resultado |
| Cancelar | Resultado |
| Fechar | Resultado |
| Preservação | Dados mantidos ou descartados |
| Continuidade | Fluxo segue ou bloqueia |
| Erro | Comportamento em falha |

## Referências de tela

Quando solicitado pelo usuário:

`Referência de imagem: [NOME EXATO DA VIEW]`

Não criar URL se o pedido for somente pelo nome.

Referência de tela não substitui regra funcional textual.

## Consistência

Antes de devolver o fluxo, revisar:

- próxima tela conhecida;
- retorno conhecido;
- erro em ponto válido;
- repetição sem duplicidade indevida;
- etapa opcional com regra;
- preservação de dados;
- dependência de permissão identificada;
- mensagem coerente com resultado;
- conclusão com destino;
- saída com efeito conhecido.

## Critério de pendência

Perguntar ou devolver pendência apenas quando a ausência puder alterar:

- comportamento;
- dado;
- permissão;
- mensagem;
- processamento;
- resultado;
- navegação.

Não criar pendência por preferência visual ou detalhe cosmético.
