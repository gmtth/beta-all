# Aceite visual dos cartões de encerramento Beta

Este arquivo registra os cenários e limites de validação do contrato visual definido em [`../skills/beta/references/protocolo-evidencias-e-handoffs.md`](../skills/beta/references/protocolo-evidencias-e-handoffs.md). As referências oficiais aprovadas estão em [`referencias-visuais/cartoes-principais-e-skills.png`](referencias-visuais/cartoes-principais-e-skills.png) e [`referencias-visuais/cartoes-com-feedback-e-acoes.png`](referencias-visuais/cartoes-com-feedback-e-acoes.png). As imagens foram copiadas sem edição.

## Cenários de distribuição

As quatro configurações abaixo mantêm sempre a grade principal `2 × 2`. A linha complementar varia somente de acordo com as condições de exibição já existentes.

| Cenário | Linha principal 1 | Linha principal 2 | Linha complementar | Resultado do contrato |
|---|---|---|---|---|
| A | Confiabilidade · Resultado | Evidências · Validação | Skills acionadas | Uma coluna complementar ocupando toda a largura disponível. |
| B | Confiabilidade · Resultado | Evidências · Validação | Skills acionadas · Feedback | Duas colunas iguais; Feedback só aparece quando aplicável. |
| C | Confiabilidade · Resultado | Evidências · Validação | Skills acionadas · Ações | Duas colunas iguais; Ações só aparece quando aplicável. |
| D | Confiabilidade · Resultado | Evidências · Validação | Skills acionadas · Feedback · Ações | Três colunas iguais; opcionais só aparecem quando seus critérios forem atendidos. |

## Casos de aceite

| ID | Verificação | Estado | Evidência/limite |
|---|---|---|---|
| 01 | Quatro cartões principais em duas linhas e duas colunas, na ordem aprovada. | Contrato revisado | Protocolo e Beta alinhados; renderização visual não executada. |
| 02 | Cenário A: Skills acionadas sozinha na linha complementar. | Contrato revisado | Grade e condição preservadas; renderização não executada. |
| 03 | Cenário B: Skills acionadas e Feedback, nessa ordem e com larguras iguais. | Contrato revisado | Condição de Feedback não foi alterada; renderização não executada. |
| 04 | Cenário C: Skills acionadas e Ações, nessa ordem e com larguras iguais. | Contrato revisado | Definição e condição de Ações não foram alteradas; renderização não executada. |
| 05 | Cenário D: três cartões complementares iguais, na ordem aprovada. | Contrato revisado | Renderização não executada. |
| 06 | Ícones monocromáticos fixos: `target`, `clipboard-check`, `search`, `shield-check`, `puzzle`, `message-square`, `list-checks`. | Especificado | Nomes registrados para mecanismo nativo compatível; existência/renderização dos ícones no cliente não verificada. |
| 07 | Cabeçalho compacto, ícone, divisória, conteúdo pequeno, borda discreta e quebras naturais. | Especificado | A especificação cobre estrutura; layout real não verificado. |
| 08 | Identificadores de evidência continuam clicáveis quando houver URL válida, sem inventar referências. | Regra preservada | Regra de evidência não mudou; teste de clique/renderização não executado. |
| 09 | Empilhamento responsivo sem alterar ordem e sem expandir a grade principal para quatro colunas. | Especificado | Teste em viewport estreita não executado. |
| 10 | Adaptação a tema claro e escuro. | Especificado | Tema adaptativo declarado; inspeção nos dois temas não executada. |
| 11 | Mesmo contrato em conversa sem memória/contexto anterior. | Regra independente de memória | Teste em nova conversa não executado. |
| 12 | Invocação direta das subskills usa o protocolo compartilhado sem criar um layout concorrente. | Revisão documental | Auditados os `SKILL.md` ativos das 21 skills; não foi encontrada instrução de layout local incompatível. Teste de runtime por skill não executado. |
| 13 | Omissões existentes permanecem vigentes para respostas sociais/editoriais e formatos rígidos. | Regra preservada | Protocolo e texto da Beta mantêm as exceções; não houve teste de runtime. |
| 14 | Fallback Markdown representa a grade principal 2×2 e linha complementar de 1–3 colunas, sem simular componentes nativos. | Especificado | Contrato textual revisado; renderização Markdown não executada em cliente. |
| 15 | Cartões permanecem fora de entregáveis copiáveis, comentários e conteúdo publicado. | Regra preservada | Instrução existente permanece no protocolo; não houve operação de publicação nesta mudança. |

## Não regressão semântica

Revisão do diff confirmou que a alteração se limita à apresentação: não muda os campos, significados, metodologia de confiabilidade, regras de evidência, validação, feedback, ações, condições de exibição, exceções, roteamento, responsabilidades, handoffs, integrações, permissões, segurança ou formatos de entregáveis.

## Limite da validação

Não há, nesta execução, um mecanismo nativo documentado de cartões ou renderizador visual para testar. Portanto, a implementação foi verificada documentalmente contra a especificação e os cenários; **não foi validada visualmente no cliente ChatGPT**. Os cenários 01–05, 06–10 e 14 continuam precisando de inspeção no cliente que suporte os componentes nativos. As referências PNG registram o aceite visual esperado, não comprovam a renderização atual.
