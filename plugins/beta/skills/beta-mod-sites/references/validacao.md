# Validação do clone

Executar esta revisão antes de concluir uma criação ou atualização relevante.

## Funcional

Confirmar:

- o gatilho de cada ação implementada;
- o resultado de cada ação;
- o comportamento de confirmar, cancelar, fechar e falhar quando aplicável;
- as validações e mensagens que possuem fonte;
- o tratamento de vazio, zero, nulo ou ausência quando definido;
- o estado anterior preservado em cancelamento/falha quando isso fizer parte da regra;
- o retorno e a próxima tela;
- a inexistência de fluxos inventados.

## Visual

Comparar com as referências fornecidas:

- estrutura;
- hierarquia;
- tipografia;
- cores;
- espaçamentos;
- dimensões;
- alinhamentos;
- ícones;
- tabelas;
- filtros;
- campos;
- botões;
- modais;
- toasts;
- estados visuais.

Não corrigir ou “melhorar” o desenho original sem solicitação.

## Isolamento

Confirmar:

- nenhuma chamada ao sistema real;
- nenhuma dependência de API/backend real;
- nenhuma credencial, cookie, token ou sessão copiada de HAR;
- nenhum dado real necessário para funcionamento;
- estado e dados limitados ao clone.

## Dossiê

Confirmar:

- somente regras vigentes de `MODELAGEM` viraram comportamento;
- `CONTEXTO — NÃO PUBLICAR` não virou requisito;
- `FORA DO ESCOPO` não foi incorporado;
- regras substituídas não permanecem;
- pendências/divergências não foram resolvidas por inferência.

## Resultado da revisão

Classificar somente problemas relevantes como:

- Bloqueio;
- Contradição;
- Ambiguidade relevante;
- Risco;
- Melhoria recomendada.

Não produzir plano completo de testes.
