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

### Regras de correspondência

- Comparar sem diferenciar maiúsculas/minúsculas.
- Normalizar espaços repetidos e variações simples de travessão/hífen.
- Aceitar pequenas variações evidentes de grafia, pluralização ou capitalização quando não houver ambiguidade.
- Não inferir um item por palavras soltas no corpo descritivo do comentário quando ele não estiver citado no bloco inicial.

## Regra de marcação

Para cada item existente no comentário de checklist:

- usar `- [ ]` quando houver pelo menos um comentário posterior de problema que cite esse item no início;
- usar `- [x]` quando não houver comentário posterior de problema que cite esse item;
- manter títulos e nomes de seções como texto normal, sem checkbox, salvo se já forem itens marcáveis no checklist original.

## Fluxo de execução

1. Validar que há um link de tarefa ou comentário do ClickUp.
2. Resolver a tarefa correspondente.
3. Ler todos os comentários necessários, paginando quando houver mais resultados.
4. Identificar o comentário-alvo conforme as regras acima.
5. Separar somente os comentários posteriores ao checklist.
6. Extrair os itens citados no início dos comentários de problema.
7. Cruzar esses itens com todas as linhas marcáveis do checklist.
8. Detectar cenários diretamente bloqueados por erros anteriores.
9. Gerar uma versão completa do mesmo comentário, preservando conteúdo e ordem.
10. Executar uma única edição no comentário-alvo.
11. Não executar nenhuma outra ação mutável.

## Validação antes da escrita

Antes de atualizar o comentário, conferir:

- o ID do comentário-alvo é o checklist correto;
- nenhum comentário posterior relevante ficou de fora por paginação;
- itens com erro não ficaram marcados como concluídos;
- nenhum item novo foi criado sem pedido explícito;
- a única mutação planejada é a edição do comentário-alvo.
