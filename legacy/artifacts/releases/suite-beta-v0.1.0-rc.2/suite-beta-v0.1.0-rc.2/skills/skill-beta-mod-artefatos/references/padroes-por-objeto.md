# Padrões de representação por objeto funcional

Este arquivo define **como representar** conteúdo consolidado. Não define regra de negócio.

## Campo

Quando o conteúdo tiver vários campos comparáveis, usar:

| Campo | Tipo/Opções | Regra |
|---|---|---|

Se houver poucos campos e cada um exigir explicação longa, usar subtítulos em vez de tabela.

Registrar obrigatoriedade, valor vazio, padrão ou bloqueio somente quando a entrada consolidada contiver essas informações.

## Tela

Apresentar primeiro:

1. finalidade da tela;
2. ponto de acesso;
3. campos/filtros;
4. ações;
5. comportamento;
6. estados;
7. retorno ou próxima etapa.

Não descrever cor, espaçamento ou componente visual sem necessidade.

Quando houver view confirmada, manter a referência perto da seção.

## Fluxo

Apresentar:

- início do fluxo;
- tabela de etapas;
- regras aplicáveis logo depois.

Tabela preferencial:

| Etapa | Tela atual | Ação do usuário | Próxima tela ou resultado |
|---|---|---|---|

Não inserir etapa inferida.

## Mensagem ou modal

Quando houver texto literal confirmado, introduzir o gatilho antes da mensagem.

Representação preferencial:

**[Subtítulo do evento]**

[parágrafo com gatilho e momento]

*“[mensagem literal]”*

[parágrafo ou tabela com Confirmar / Cancelar / Fechar / Falha, conforme conteúdo consolidado]

Não criar botão ou consequência não confirmada.

## Relatório

Representar em ordem:

1. objetivo e granularidade;
2. elegibilidade;
3. período;
4. cálculo;
5. zero/nulo/N/A;
6. situações;
7. filtros;
8. colunas;
9. exportação;
10. exemplo.

Para colunas, usar:

| Coluna | Formato | Informação |
|---|---|---|

Não calcular nem validar fórmula neste módulo; apenas reproduzir a consolidação recebida.

## Cálculo

Usar a fórmula em linha própria.

Se várias fórmulas forem independentes, usar subtítulos ou uma pequena sequência de linhas.

Usar tabela apenas para:

- variável e origem;
- condição e resultado;
- exemplo de entradas e saídas.

Não alterar arredondamento, truncamento, unidade ou tratamento de N/A.

## Processamento

Quando já consolidado, representar:

- gatilho;
- registros incluídos;
- sequência funcional;
- sucesso;
- falha parcial;
- retry;
- concorrência;
- auditoria.

Usar subtítulos e tabelas curtas quando houver estados ou matrizes.

Não acrescentar job, worker, fila tecnológica ou arquitetura.

## Permissão

Quando já consolidada, representar diferenças por ação em tabela.

Evitar frases genéricas como `respeitar permissões`.

Expor somente os nomes reais fornecidos na entrada.

## Rastreabilidade

Usar parágrafos quando houver poucos eventos.

Usar tabela quando vários eventos precisarem ser comparados por:

- valor/resultado;
- momento;
- responsável;
- afetado;
- origem.

Não inventar nome de log ou coluna.

## Validação funcional

Derivar somente do conteúdo recebido.

Usar lista numerada quando a verificação possuir sequência ou quando a seção já vier consolidada dessa forma.

Cada item deverá apontar um comportamento verificável.

Não transformar a seção em plano completo de testes.
