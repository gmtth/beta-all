# Matriz de roteamento

## Princípio

Selecionar o conjunto mínimo de Skills necessário para fechar o comportamento.

`@beta-mod-regras` e `@beta-mod-dossie` são transversais em toda modelagem funcional relevante.

`@beta-mod-qa` é obrigatório antes da finalização de modelagem relevante.

## Matriz

| Gatilho ou assunto | Skill | Momento | Saída esperada para a orquestradora |
|---|---|---|---|
| Nova funcionalidade, revisão, consolidação ou regra funcional relevante | `@beta-mod-regras` | Sempre | Completude funcional, lacunas materiais, rastreabilidade |
| Informação funcional nova ou alteração relevante | `@beta-mod-dossie` | Sempre, após fonte quando necessário | Estado vigente, destino, impactos e alertas de publicação |
| Múltiplas fontes, versões, documentos alterados, ClickUp, comentários, conflito de vigência | `@beta-mod-fontes` | Antes de consolidar no Dossiê | Autoridade, vigência, complementaridade, substituição ou divergência |
| Relatório, indicador, previsão, projeção, fórmula, período, data, exportação | `@beta-mod-relatorios` | Conforme escopo | Semântica de cálculo/relatório, granularidade, período e casos ausentes |
| Tela, formulário, modal, navegação, fluxo frontend, portal, máquina, totem | `@beta-mod-fluxos` | Conforme escopo | Fluxos, estados, navegação, validações e resultados de interação |
| Figma, view, componente ou consistência visual | `@beta-mod-figma` | Conforme escopo | Evidência e consistência visual sem criar regra |
| Criação, edição, exclusão, restauração, lote, fila, retry, timeout, concorrência, precedência | `@beta-mod-processamento` | Conforme escopo | Estados, transições, processamento, falhas, retry e concorrência funcional |
| Autenticação, autorização, papéis, senha, biometria, RFID, dado sensível, isolamento entre empresas | `@beta-mod-permissoes` | Conforme escopo | Autorização, atores, proteção e isolamento funcional |
| Modelagem consolidada pronta para finalização | `@beta-mod-qa` | Gate final e novamente após correções materiais | Bloqueios, contradições, ambiguidades relevantes, riscos e conclusão |
| Geração/edição de DOCX, Markdown ou outro artefato | `@beta-mod-artefatos` | Após consolidação, Dossiê, filtro e QA | Materialização documental sem reinterpretar regra |

## Dependências cruzadas

Quando uma Skill detectar dependência de outra:

1. registrar o achado provisoriamente;
2. identificar a especialidade necessária;
3. executar a Skill correspondente;
4. receber a resposta;
5. atualizar o entendimento consolidado;
6. revisar impactos;
7. atualizar o Dossiê se houver nova informação relevante;
8. verificar se o achado já pode terminar como Confirmado, Pendente ou Divergente;
9. continuar o ciclo até não existir dependência material órfã.

Exemplo:

`@beta-mod-fluxos` identifica que uma ação depende de permissão → executar `@beta-mod-permissoes` → consolidar a autorização e o efeito na interface/backend → atualizar o Dossiê → verificar se ainda existe pendência.

## Não acionar indiscriminadamente

Não chamar uma Skill apenas porque ela existe.

Roteamento deve ser orientado pelo assunto e pelas dependências que surgirem.

Se uma Skill não for aplicável, tratá-la como não aplicável; não omitir silenciosamente Skill que o roteamento torna obrigatória.
