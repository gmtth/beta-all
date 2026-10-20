---
name: clickup-checklist
description: Consultar o ClickUp por palavras-chave, localizar cards relevantes e compilar todos os checklists de testes/QA encontrados nos comentários, com falhas, resultados e evidências de revisão. Use quando o usuário invocar `clickup-checklist` ou pedir checklists de QA em cards do ClickUp.
---

# ClickUp Checklist

## Invocação

Use esta habilidade com:

`clickup-checklist <palavras-chave>`

Aceite uma ou mais palavras-chave, inclusive expressões compostas. Se o usuário não informar período, priorize cards do ano corrente. Se ele informar um período, respeite-o.

## Objetivo

Encontrar no ClickUp os cards relacionados às palavras-chave e produzir uma compilação fiel de todos os checklists de testes/QA registrados nos comentários. O resultado deve ser claro, copiável e em português, dentro de um campo de texto editável do ChatGPT, preferencialmente um bloco de escrita do tipo `document`.

## Procedimento de consulta

1. Use a busca global do ClickUp com cada palavra-chave fornecida.
2. Considere candidatos cujo título, descrição, nomes de campos, comentários ou conteúdo relacionado correspondam ao tema. Não se limite ao título.
3. Quando a busca inicial for insuficiente, amplie apenas com termos semanticamente relacionados ao pedido. Por exemplo, para “não geração”, também considere “geração”, “emissão”, “download”, “job”, “ficha”, “PDF”, “erro”, “falha” e “revisão”, quando fizer sentido.
4. Para cada candidato, use `get_task` para confirmar identidade, título, URL/link, descrição e demais metadados relevantes.
5. Use `get_task_comments` e leia todos os comentários disponíveis, seguindo paginação ou cursores até o fim. Nunca pare após o primeiro comentário relevante.
6. Preserve a ordem cronológica dos checklists, do mais antigo ao mais recente. Use a data do comentário; se ela não estiver disponível, mantenha a ordem retornada e sinalize a limitação somente quando necessário.
7. Se houver duplicatas do mesmo card na busca, consolide-as por ID da tarefa.

## Identificação dos checklists

Extraia cada comentário que contenha um checklist de testes/QA, incluindo listas com caixas marcadas ou desmarcadas e listas equivalentes claramente usadas como roteiro de validação.

- Um card pode conter vários checklists. Extraia todos, sem fundir, resumir ou escolher apenas o mais recente.
- Trate checklists separados no mesmo comentário como checklists distintos quando tiverem objetivo, etapa, autor ou ciclo de teste diferente.
- Registre o autor de cada checklist exatamente como apresentado pelo ClickUp.
- Preserve os itens e a ordem do checklist. Mantenha o estado das caixas quando ele existir (`[ ]`, `[x]` ou equivalente).
- Não transforme uma lista de requisitos, descrição funcional ou lista de tarefas de desenvolvimento em checklist de QA sem evidência de que foi usada para testar.
- Comentários de atualização de status, correção ou revisão que não contenham checklist devem ser usados como evidência relacionada, mas não devem ser apresentados como um novo checklist.

## Associação de problemas ao checklist

Para cada checklist, examine comentários do mesmo card que pertençam ao mesmo ciclo de testes. Relacione somente problemas, divergências, regressões, bloqueios e resultados encontrados durante aquele ciclo.

Considere como evidência relacionada:

- falhas observadas ao executar um item do checklist;
- resultados diferentes do esperado;
- erros de geração, emissão, download, PDF, job, permissões, filtros, e-mail ou fluxo, quando ligados ao teste;
- regressões ou retorno de um erro após uma correção;
- observações que indiquem que o teste passou ou falhou, quando isso ajudar a interpretar os itens.

Diferencie sempre:

- **Problema original do card:** o defeito que motivou a tarefa, conforme título, descrição ou comentário de abertura;
- **Problema encontrado no QA:** a falha ou divergência descoberta ao executar o checklist;
- **Motivo de revisão:** a justificativa explícita para mover a tarefa para revisão.

Não atribua uma falha a um checklist apenas porque ocorreu no mesmo card. A associação deve ser sustentada pelo texto, pela proximidade temporal ou pela referência explícita ao mesmo teste/ciclo. Quando não houver relação suficiente, mantenha o fato como observação geral do card ou não o inclua na seção do checklist.

## Motivo de ida para revisão

Inclua o motivo somente quando houver evidência explícita nos comentários, no histórico acessível ou em outro conteúdo do card que diga por que a tarefa foi para revisão.

Não deduza que uma tarefa foi para revisão apenas porque há falhas, porque o checklist está incompleto ou porque o status atual é “revisão”. Se não houver justificativa explícita, escreva:

`Não foi identificado nos comentários um motivo explícito de ida para revisão.`

Preserve o sentido e, quando útil, a redação original da evidência, sem inventar causas ou preencher lacunas.

## Formato obrigatório da saída

Agrupe o resultado por card e inclua somente cards com pelo menos um checklist de testes/QA, salvo se o usuário pedir também candidatos sem checklist.

Para cada card, use este formato:

:::writing{variant="document" id="ID_UNICO"}
## <Título do card>

**Link do card:** <URL do ClickUp>

### Checklist 1 — <data, etapa ou identificação disponível>

**Autor:** <nome>

**Checklist preservado:**

- [ ] <item exatamente como registrado>
- [x] <item exatamente como registrado>

**Problemas encontrados durante os testes deste checklist:**

- <problema ou resultado encontrado, com contexto suficiente e sem inventar informação>

Se não houver falha ou evidência relacionada:

`Não foram identificados nos comentários problemas relacionados a este checklist.`

### Checklist 2 — <data, etapa ou identificação disponível>

**Autor:** <nome>

**Checklist preservado:**

- [ ] <item>

**Problemas encontrados durante os testes deste checklist:**

- <problema relacionado ao segundo ciclo>

### Motivo de ida para revisão

<justificativa explícita registrada no card> ou <mensagem padrão de ausência de evidência>
:::

Replique as seções `Checklist N` para todos os checklists do card, em ordem cronológica. Não use uma única seção de problemas para vários checklists. Se o mesmo problema aparecer em ciclos diferentes, repita-o somente quando o comentário o relacionar a cada ciclo e destaque regressão/retorno quando isso estiver explícito.

## Regras de fidelidade

- Não resumir nem fundir checklists diferentes.
- Não omitir checklists adicionais por já existir um checklist anterior no mesmo card.
- Não inventar autor, data, link, causa, resultado, motivo de revisão ou relação entre comentários.
- Não corrigir silenciosamente a redação dos itens. Preserve o texto; traduza apenas a organização e os rótulos da resposta.
- Se o checklist estiver parcialmente preenchido, preserve o estado observado e informe os resultados disponíveis.
- Se um item estiver ilegível, ausente ou truncado, sinalize a limitação em vez de completar por inferência.
- Se nenhum checklist de QA for encontrado, informe quais candidatos foram consultados e diga claramente que não foi localizado checklist de testes nos comentários lidos.
- Ao encontrar conflito entre comentários, apresente as versões em ordem cronológica e identifique a regressão, correção ou divergência apenas se o texto do card permitir.

## Controle final antes de responder

Confirme que:

- todas as palavras-chave foram usadas na busca;
- os candidatos relevantes foram validados com `get_task`;
- todos os comentários foram lidos com `get_task_comments` até o fim;
- cada checklist tem autor e itens preservados;
- todos os checklists do mesmo card aparecem separadamente e em ordem;
- problemas foram associados ao ciclo correto ou excluídos quando a relação não era comprovada;
- o motivo de revisão só foi afirmado quando havia evidência explícita;
- a resposta está em português, copiável e dentro de um campo de texto editável.

