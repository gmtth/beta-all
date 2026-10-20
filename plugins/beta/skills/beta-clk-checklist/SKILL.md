---
name: beta-clk-checklist
description: Após o usuário confirmar que uma rodada de QA terminou, atualizar somente o comentário mais recente intitulado exatamente “Checklist de testes” no ClickUp, usando o identificador Execução QA e o estado informado de cada item. Manter pendentes itens com problema, não executados, bloqueados ou incertos e concluir somente itens confirmados como sucesso na rodada atual. Exigir tarefa, rodada e estados claros; nunca criar checklist nem alterar outro conteúdo.
---

# Beta CLK Checklist

## Objetivo

Atualizar somente um comentário de checklist no ClickUp com base nos problemas registrados depois dele. Tratar todo o restante do ClickUp como somente leitura.

## Regra de autorização

- Exigir link/ID da tarefa, confirmação explícita do usuário de que a execução terminou, identificador da rodada `Execução QA` e estado suficiente de cada item.
- A chamada `@Beta-CLK-checklist` com link, isoladamente, não autoriza edição. A autorização ocorre quando o usuário confirma o término e a Beta encaminha o contexto completo desta rodada; isso autoriza somente uma edição do comentário-alvo identificado abaixo.
- Se faltar link, confirmação de término, identificador da rodada ou estado dos itens, não escrever no ClickUp; peça apenas a informação ausente.
- Não aceitar como autorização implícita nenhuma outra mutação no card.

## Limite absoluto de escrita

Esta é a única escrita desta skill no ClickUp: atualizar o texto de um único comentário de checklist. Aplicar também a regra de autorização do control plane.

Nunca:
- alterar descrição, nome, status, prioridade, responsáveis, datas, campos personalizados, tags ou listas da tarefa;
- criar, excluir, resolver, reatribuir ou editar outros comentários;
- criar ou modificar checklists nativos da tarefa;
- adicionar anexos;
- mover, duplicar, excluir ou mesclar tarefas;
- executar qualquer outra ação mutável no ClickUp.

Usar somente operações de leitura para descobrir e analisar conteúdo. A única ferramenta mutável permitida é a edição do comentário-alvo já identificado.

## Seleção do comentário-alvo

### Link de tarefa

1. Ler os comentários da tarefa em ordem cronológica suficiente para cobrir todo o histórico relevante.
2. Localizar o comentário mais recente cujo título/primeira linha seja exatamente `Checklist de testes`, sem diferenciar maiúsculas/minúsculas e aceitando prefixo de título Markdown (`#`, `##` ou `###`).
3. Não selecionar títulos apenas parecidos. Se não houver correspondência clara ou houver dúvida sobre o comentário-alvo, pedir esclarecimento e não editar.
4. Se houver mais de um comentário com o título exato, usar somente o mais recente.

### Link de comentário

1. Resolver a tarefa e o comentário apontados pelo link.
2. Confirmar que o comentário apontado é o comentário mais recente com título exato `Checklist de testes`; caso contrário, localizar o comentário mais recente com esse título na tarefa.
3. Se a relação entre o comentário apontado e o checklist mais recente for ambígua, pedir esclarecimento e não editar.

Nunca editar um comentário diferente do comentário-alvo determinado acima.

## Janela de análise

- Considerar somente comentários posteriores ao comentário-alvo que tenham o mesmo identificador `Execução QA` recebido no handoff.
- Ignorar comentários anteriores ao checklist.
- Ignorar o próprio checklist como fonte de erro.
- Ignorar comentários de rodadas anteriores. Comentários sem identificador são legados e só podem ser tratados como parte da rodada atual se a Beta os identificar expressamente no handoff; caso contrário, não os usar para alterar estados.
- Comentários automáticos, mudanças de status, lembretes e mensagens administrativas não desmarcam itens, a menos que citem explicitamente um item do checklist como problema funcional.
- Paginar os comentários até cobrir todos os comentários posteriores ao checklist; não assumir que a primeira página é completa.

## Como identificar o item citado em um comentário de problema

Para comentários estruturados do novo fluxo, usar como fonte autoritativa os campos `Execução QA` e `Item do checklist`. O identificador deve corresponder à rodada recebida no handoff, e o item deve corresponder literalmente a um item do checklist. Para registros legados explicitamente indicados como atuais pela Beta, aplicar os padrões abaixo.

Reconhecer estes padrões:

1. Item direto sem prefixo:
   `Ação de edição respeita a permissão do usuário.`

2. Item com hífen:
   `- Produtos`

3. Múltiplos itens no começo:
   `- Usuários`
   `- Papéis`

4. Seção seguida de itens:
   `Estoques`
   `- Gerenciador de Estoque`
   `- Manifesto`
   `- Consulta Estoque`

Extrair como itens citados as linhas iniciais que correspondam semanticamente ou textualmente a itens existentes no checklist legado. Remover apenas marcadores de lista como `-`, `*`, `[ ]` ou `[x]` para fazer a comparação; preservar o texto real do checklist na edição.

### Regras de correspondência

- Comparar sem diferenciar maiúsculas/minúsculas.
- Para comentários estruturados com `Item do checklist`, exigir correspondência literal após remover apenas espaços externos; não usar correspondência semântica ou por palavras soltas.
- Normalizar espaços repetidos e variações simples de travessão/hífen.
- Aceitar pequenas variações evidentes de grafia, pluralização ou capitalização quando não houver ambiguidade, por exemplo `Máquina` ↔ `Máquinas` e `Produto x Perfil GHE` ↔ `Produto x perfil — GHE`.
- Não inferir um item por palavras soltas no corpo descritivo do comentário quando ele não estiver citado no bloco inicial.
- Se o comentário citar vários itens no começo, desmarcar todos os correspondentes.
- Se um comentário iniciar com um item de teste global em vez de nome de menu, aplicar ao item global correspondente.

## Regra de marcação

Ao atualizar um comentário de checklist, mantenha o formato fixo: primeira linha `**Checklist de testes**`, linha em branco e cada teste em uma linha com `- [ ]` ou `- [x]`. Preserve o texto e a ordem dos testes; normalize título e marcadores para esse formato quando o comentário estiver em formato antigo. Não acrescente rótulos de Smoke/Testes estendidos ou outros títulos ao comentário.

Para cada item existente no comentário de checklist, considere somente o estado confirmado da rodada atual:

- usar `- [ ]` para item com problema, não executado, bloqueado, não validado ou incerto;
- usar `- [x]` somente se o usuário/Beta confirmar que o item foi executado com sucesso na rodada atual e a execução completa terminou com todos os problemas relatados;

Um problema registrado em rodada anterior não impede marcar como concluído um item que foi reexecutado com sucesso na rodada atual. Se os estados ou a confirmação de execução completa não forem suficientes, não presumir sucesso: peça esclarecimento antes da edição. Se nenhum problema ocorreu, só marcar os itens como concluídos quando houver confirmação explícita de sucesso integral no contexto da Beta.

Aplicar a mesma regra à seção `MENUS` quando ela existir.

### Itens bloqueados por um erro anterior

Não marcar automaticamente como concluído um item que claramente não pôde ser executado por causa de um erro citado em comentário posterior. Exemplo: se a modal de importação não abre, manter pendentes tanto o teste de importação válida quanto o teste de arquivo inválido quando este segundo cenário não pôde ser alcançado.

Usar esse bloqueio somente quando a impossibilidade de teste for direta e inequívoca; não inventar dependências.

## Itens citados que não existem no checklist

- Não criar novos itens automaticamente.
- Não reestruturar o checklist para acomodá-los.
- Informar ao usuário no final que o problema citado não está representado no checklist.
- Só adicionar um item ausente se o usuário pedir explicitamente, e ainda assim editar somente o mesmo comentário-alvo.

## Preservação do comentário

- Preservar todo o conteúdo do comentário que não precise mudar.
- Não reescrever textos dos itens.
- Não alterar a ordem dos itens.
- Ao normalizar um comentário antigo, manter somente o título fixo e os itens de teste; não incluir títulos de seção ou observações no comentário final.
- Não criar seções `Smoke` e `Testes estendidos` no comentário; os grupos são usados somente na conversa de seleção, fora do checklist publicado.
- Não inserir nomes ou IDs de clientes/bases ao atualizar o comentário.
- Converter itens marcáveis para Markdown de checklist do ClickUp: `- [x] Texto` ou `- [ ] Texto`.
- Não usar emojis como substituto de checkbox.

## Fluxo de execução

1. Validar link/ID da tarefa, confirmação explícita de término, identificador `Execução QA` e estado de todos os itens.
2. Resolver a tarefa correspondente.
3. Ler todos os comentários necessários, paginando quando houver mais resultados.
4. Identificar o comentário-alvo conforme as regras acima.
5. Separar somente os comentários posteriores ao checklist que pertençam à rodada indicada no handoff.
6. Extrair os itens citados no início dos comentários de problema.
7. Cruzar esses itens com todas as linhas marcáveis do checklist, inclusive a seção `MENUS`.
8. Detectar cenários diretamente bloqueados por erros anteriores.
9. Gerar uma versão completa do mesmo comentário, preservando conteúdo e ordem, alterando apenas os estados `[x]`/`[ ]` e eventuais itens explicitamente autorizados pelo usuário.
10. Executar uma única edição no comentário-alvo.
11. Não executar nenhuma outra ação mutável.
12. Confirmar ao usuário qual comentário foi atualizado e resumir os itens que permaneceram pendentes; mencionar itens citados nos erros que não existiam no checklist.

## Validação antes da escrita

Antes de atualizar o comentário, conferir:

- o ID do comentário-alvo é o checklist correto;
- nenhum comentário posterior relevante ficou de fora por paginação;
- todo item estruturado corresponde literalmente ao item do checklist e todo comentário usado pertence à rodada atual;
- a seção `MENUS`, se existir, também foi cruzada;
- itens sem erro não foram desmarcados sem motivo;
- itens com erro não ficaram marcados como concluídos;
- nenhum item novo foi criado sem pedido explícito;
- a única mutação planejada é a edição do comentário-alvo.

Se houver ambiguidade real entre dois itens com nomes parecidos, não escolher arbitrariamente: manter ambos como estavam e informar a ambiguidade ao usuário.

## Exemplo de uso

Usuário:
`@Beta-CLK-checklist https://app.clickup.com/t/31046217/86aj43ca9`

Comportamento esperado:
- localizar o último comentário `Checklist de testes`;
- ler apenas os comentários posteriores;
- detectar, por exemplo, `- Produtos`, `- Papéis` ou `Ação de edição respeita a permissão do usuário.` no começo dos comentários de erro;
- deixar esses itens como `- [ ]`;
- deixar como `- [x]` os itens sem erro posterior e efetivamente testáveis;
- editar somente o comentário do checklist;
- não alterar mais nada no card.

