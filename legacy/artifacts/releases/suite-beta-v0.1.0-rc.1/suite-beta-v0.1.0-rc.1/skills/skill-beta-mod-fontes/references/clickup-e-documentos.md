# ClickUp e documentos

## ClickUp: leitura orientada à evidência

### Tarefa conhecida

Usar `ClickUp.clickup_get_task`.

Solicitar somente os blocos necessários:

- `description` para conteúdo completo da tarefa;
- `attachments` para metadados de anexos;
- `dependencies` quando a relação de bloqueio alterar o entendimento da fonte;
- `linked_tasks` quando a própria tarefa indicar relação relevante.

### Comentários

Usar `ClickUp.clickup_get_task_comments`.

Quando um comentário tiver respostas relevantes, usar `ClickUp.clickup_get_threaded_comments`.

Considerar comentários posteriores como possíveis decisões mais recentes, mas aplicar a prioridade geral antes de consolidar.

### Busca

Quando não houver ID conhecido, usar `ClickUp.clickup_search`.

Pesquisar termos específicos e continuar enquanto houver `next_cursor`, preservando os mesmos filtros.

Não assumir que o primeiro resultado é a fonte correta apenas por similaridade de título.

### ClickUp Docs

Usar `ClickUp.clickup_list_document_pages` para descobrir páginas.

Depois usar `ClickUp.clickup_get_document_pages` somente nas páginas relevantes.

### Anexos

Obter metadados pela tarefa antes de baixar.

Baixar somente quando o conteúdo for necessário à análise.

Não copiar credenciais, tokens ou dados sensíveis desnecessários para a saída.

### Restrições

Esta Skill é somente leitura.

Não usar ações de:

- criar ou atualizar tarefa;
- criar comentário;
- criar ou alterar documento;
- mover, mesclar ou excluir conteúdo;
- alterar status;
- anexar arquivo.

## Estados e intenção

Ao ler ClickUp, diferenciar quando a fonte indicar:

- produção;
- validação;
- aguardando;
- inovação;
- ideia futura;
- não implementado.

Status, comentário e descrição devem ser interpretados em conjunto.

Não transformar atividade futura em comportamento atual.

## Documento alterado pelo usuário

Quando o usuário fornecer uma versão revisada:

1. tratar como nova base quando declarado;
2. preservar inclusões, exclusões e imagens;
3. não restaurar regra antiga;
4. não reconstruir por memória;
5. comparar com versão anterior apenas se isso for necessário à solicitação;
6. não considerar um resumo prova de que a versão completa foi revisada.

## Falta de acesso

Se a fonte citada não puder ser lida ou recuperada, declarar a limitação.

Não simular conteúdo, não inferir versão e não usar memória como substituto.
