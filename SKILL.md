---
name: beta-clk-checklist
description: Sincronizar um checklist existente em um único comentário de uma tarefa do ClickUp com os problemas registrados nos comentários posteriores. Usar quando o usuário chamar @Beta-CLK-checklist e fornecer obrigatoriamente um link de tarefa ou de comentário do ClickUp. Localizar o último checklist aplicável, ler somente os comentários posteriores a ele, identificar os itens citados no início de cada comentário de problema e marcar esses itens como pendentes [ ] enquanto os demais ficam concluídos [x]. Nunca criar um checklist do zero e nunca alterar qualquer outro comentário, descrição, status, campo, anexo, checklist nativo de tarefa ou conteúdo do card.
---

# Beta CLK Checklist

## Objetivo

Atualizar somente um comentário de checklist no ClickUp com base nos problemas registrados depois dele. Tratar todo o restante do ClickUp como somente leitura.

## Regra de autorização

- Exigir sempre um link do ClickUp para a tarefa ou para um comentário.
- Considerar a chamada `@Beta-CLK-checklist` acompanhada do link como autorização somente para editar o comentário de checklist determinado por este fluxo.
- Se não houver link, não executar escrita no ClickUp e solicitar o link.
- Não aceitar como autorização implícita nenhuma outra mutação no card.

## Limite absoluto de escrita

Permitir exatamente uma operação de escrita: atualizar o texto de um único comentário de checklist.

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
2. Identificar o comentário de checklist mais recente.
3. Preferir comentários cujo conteúdo declare claramente um checklist, por exemplo `Checklist de testes`, e contenha uma sequência extensa de itens de validação.
4. Se houver mais de um checklist, usar somente o mais recente.

### Link de comentário

1. Resolver a tarefa e o comentário apontados pelo link.
2. Se o comentário apontado for um checklist, usar exatamente esse comentário como alvo.
3. Se o comentário apontado não for um checklist, localizar o checklist mais recente anterior a esse comentário na mesma tarefa.

Nunca editar um comentário diferente do comentário-alvo determinado acima.

## Janela de análise

- Considerar somente comentários publicados DEPOIS do comentário-alvo.
- Ignorar comentários anteriores ao checklist.
- Ignorar o próprio checklist como fonte de erro.
- Comentários automáticos, mudanças de status, lembretes e mensagens administrativas não desmarcam itens, a menos que citem explicitamente um item do checklist como problema funcional.
- Paginar os comentários até cobrir todos os comentários posteriores ao checklist; não assumir que a primeira página é completa.

## Como identificar o item citado em um comentário de problema

Usar o início do comentário como fonte autoritativa para o vínculo com o checklist.

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

Extrair como itens citados as linhas iniciais que correspondam semanticamente ou textualmente a itens existentes no checklist. Remover apenas marcadores de lista como `-`, `*`, `[ ]` ou `[x]` para fazer a comparação; preservar o texto real do checklist na edição.

### Regras de correspondência

- Comparar sem diferenciar maiúsculas/minúsculas.
- Normalizar espaços repetidos e variações simples de travessão/hífen.
- Aceitar pequenas variações evidentes de grafia, pluralização ou capitalização quando não houver ambiguidade, por exemplo `Máquina` ↔ `Máquinas` e `Produto x Perfil GHE` ↔ `Produto x perfil — GHE`.
- Não inferir um item por palavras soltas no corpo descritivo do comentário quando ele não estiver citado no bloco inicial.
- Se o comentário citar vários itens no começo, desmarcar todos os correspondentes.
- Se um comentário iniciar com um item de teste global em vez de nome de menu, aplicar ao item global correspondente.

## Regra de marcação

Para cada item existente no comentário de checklist:

- usar `- [ ]` quando houver pelo menos um comentário posterior de problema que cite esse item no início;
- usar `- [x]` quando não houver comentário posterior de problema que cite esse item;
- manter títulos e nomes de seções como texto normal, sem checkbox, salvo se já forem itens marcáveis no checklist original.

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
- Não mover itens entre seções, salvo instrução explícita do usuário.
- Não apagar títulos, seções ou observações.
- Converter itens marcáveis para Markdown de checklist do ClickUp: `- [x] Texto` ou `- [ ] Texto`.
- Não usar emojis como substituto de checkbox.

## Fluxo de execução

1. Validar que há um link de tarefa ou comentário do ClickUp.
2. Resolver a tarefa correspondente.
3. Ler todos os comentários necessários, paginando quando houver mais resultados.
4. Identificar o comentário-alvo conforme as regras acima.
5. Separar somente os comentários posteriores ao checklist.
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
- todo item citado em bloco inicial foi normalizado sem perder o nome real;
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

