# Ciclo de vida, unicidade, precedência e gatilhos

## Conceitos

Identificar somente os conceitos necessários ao caso:

- registro principal;
- chave funcional;
- origem;
- status;
- ativo;
- excluído;
- histórico;
- registro efetivo;
- processamento;
- grupo;
- fila;
- tentativa;
- erro;
- conclusão.

## Ciclo de vida

Usar:

| Evento | Estado anterior | Estado final | Registro afetado | Efeito proibido |
|---|---|---|---|---|

Para cada evento, verificar:

1. estado inicial;
2. gatilho;
3. transição permitida;
4. transição proibida;
5. registro afetado;
6. preservação do ID;
7. criação ou atualização;
8. histórico;
9. efeitos em registros relacionados;
10. efeito que não poderá ocorrer.

Não equiparar exclusão, inativação e cancelamento sem fonte.

## Unicidade e duplicidade

Definir:

- combinação única;
- como localizar registro existente;
- quando atualizar;
- quando criar;
- quando restaurar;
- quando excluir logicamente;
- como tratar duplicidades existentes;
- qual registro prevalece;
- como preservar histórico.

Perguntas relevantes:

- mais de um registro pode representar a mesma combinação funcional?
- a mesma origem pode criar linhas paralelas?
- uma restauração reutiliza o mesmo registro ou cria outro?
- exclusão altera a possibilidade de criação futura?
- duplicidade histórica precisa ser resolvida ou apenas impedida daqui em diante?

Não responder por inferência.

## Precedência

Quando houver origens concorrentes, estruturar:

| Nível | Origem | Prioridade | Condição | Resultado |
|---|---|---|---|---|

Definir:

- nível da comparação;
- ordem de prioridade;
- origem vencedora;
- exceções;
- impacto em registros;
- origens inativas;
- vínculos específicos;
- prevenção de linhas paralelas.

Não reutilizar prioridade de outra funcionalidade sem confirmação.

## Gatilhos

Usar:

| Gatilho | Registros afetados | Pessoas afetadas | Momento | Resultado |
|---|---|---|---|---|

Considerar, conforme aplicável:

- criação;
- edição;
- ativação;
- inativação;
- exclusão;
- restauração;
- importação;
- ação manual;
- rotina automática.

Cada gatilho deverá possuir resultado funcional conhecido. Quando o mesmo evento produzir efeitos distintos conforme estado ou origem, separar os casos.
