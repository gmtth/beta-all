# Permissões e autorização

## Matriz de ações

Usar:

| Ação | Quem pode | Interface | Backend | Sem permissão |
|---|---|---|---|---|

Preencher apenas com papéis e permissões confirmados.

Ações possíveis, quando aplicáveis:

- visualizar;
- pesquisar;
- criar;
- editar;
- excluir;
- restaurar;
- aprovar;
- autorizar;
- reprocessar;
- alterar parâmetros;
- consultar histórico.

## Interface versus backend

Não considerar uma ação segura apenas porque:

- o botão está oculto;
- o menu não aparece;
- o campo está desabilitado.

Verificar também o bloqueio funcional da chamada direta no backend, sem especificar solução técnica.

Separar:

| Situação | Tratamento funcional |
|---|---|
| Sem visualização | Elemento não exibido, quando confirmado |
| Somente leitura | Conteúdo visível sem ação de alteração |
| Sem execução | Ação recusada mesmo se chamada diretamente |
| Acesso negado | Mensagem confirmada, quando aplicável |

## Atores

Diferenciar:

- usuário logado;
- usuário autenticado;
- usuário autorizador;
- líder;
- funcionário afetado;
- empresa;
- registro alterado.

Para cada operação, responder:

1. quem iniciou?
2. quem autenticou?
3. quem autorizou?
4. quem será afetado?
5. qual registro será alterado?
6. em qual empresa?
7. quem deverá aparecer na auditoria?

## Alteração por terceiro

Quando alguém autorizar ou executar ação em nome de outra pessoa:

- separar autorizador de afetado;
- confirmar qual registro é alterado;
- evitar alteração acidental do dado do autorizador;
- preservar rastreabilidade de ambos os atores.

## Critério de pendência

Devolver pendência quando faltar definição capaz de alterar:

- visualização;
- execução;
- autorização;
- registro afetado;
- empresa;
- bloqueio;
- mensagem;
- auditoria.

Não inventar papel temporário ou permissão genérica.
