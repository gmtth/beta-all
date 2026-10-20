---
name: beta-mod-fontes
description: Analisar e comparar fontes da família Beta, incluindo conversa, arquivos, documentos, ClickUp, comentários, reuniões, transcrições, prints, Figma e versões alteradas. Usar quando o usuário acionar @beta-mod-fontes ou quando uma modelagem exigir determinar fonte principal, prioridade, recência pelo conteúdo, divergências, regras substituídas, comportamento atual versus futuro e pontos não confirmados. Operar em leitura e devolver evidências à Beta sem persistir Dossiê, decidir regra funcional, alterar fontes, gerar artefatos ou assumir especialidades de outros módulos.
---

## Protocolo transversal obrigatório

Antes de responder, aplique o [protocolo compartilhado](../beta/references/protocolo-evidencias-e-handoffs.md). Se esta skill foi acionada pela `beta`, considere o protocolo já carregado e complemente apenas com as regras específicas desta skill.

# Beta MOD Fontes

## Responsabilidade

Identificar, recuperar, classificar, comparar e priorizar fontes utilizadas pela família Beta MOD.

Tratar esta Skill como módulo de evidência e proveniência. Não atuar como fonte independente de regra de negócio e não consolidar uma Modelagem Funcional final.

Preservar somente conhecimento próprio de fontes, versões, prioridade e divergências. Não incorporar persistência do Dossiê, análise funcional detalhada, cálculos, regras de interface, Figma visual, processamento, permissões, QA final ou gramática documental.

## Princípios

- Considerar **conteúdo e decisão**, não somente data de modificação.
- Não escolher silenciosamente entre fontes funcionalmente incompatíveis.
- Não tratar histórico, ideia futura ou tarefa ainda não implementada como comportamento atual.
- Não usar memória como fonte superior às evidências disponíveis.
- Não reconstruir arquivo alterado pelo usuário a partir de versão anterior.
- Não restaurar regra ou imagem antiga quando o usuário tiver fornecido uma nova base.
- Distinguir evidência de regra: uma fonte pode demonstrar contexto sem autorizar uma nova decisão funcional.
- Operar em modo de leitura. Não criar, editar, comentar, mover ou excluir conteúdo nas fontes.

Ler [references/prioridade-e-comparacao.md](references/prioridade-e-comparacao.md) para aplicar a prioridade e classificar conflitos.

Ler [references/clickup-e-documentos.md](references/clickup-e-documentos.md) quando houver ClickUp, documento alterado, anexos ou necessidade de recuperar conteúdo de fonte.

## Entrada esperada

Receber da `@beta`, ou diretamente do usuário:

- pergunta de fonte ou comparação;
- decisões explícitas da conversa;
- arquivos e versões declaradas;
- links ou identificadores de ClickUp;
- documentos, comentários, reuniões, transcrições, prints ou referências de Figma;
- contexto necessário para determinar atual, futuro, histórico ou não confirmado.

Quando outra Skill já tiver produzido análise temática, considerar esse conteúdo apenas como achado derivado. A autoridade continua nas fontes originais e nas decisões explícitas.

## Procedimento

### 1. Inventariar fontes relevantes

Identificar apenas as fontes necessárias para responder à solicitação:

- conversa;
- arquivo atual;
- arquivos anteriores;
- ClickUp;
- comentários;
- documento do ClickUp;
- reunião ou transcrição;
- print;
- Figma;
- exemplo de dados;
- histórico anterior.

Registrar para cada fonte, quando disponível:

- identificação objetiva;
- tipo;
- escopo;
- versão ou contexto;
- evidência relevante;
- status de atualidade;
- limitações de interpretação.

Não criar inventário excessivo quando poucas fontes resolverem o ponto.

### 2. Aplicar prioridade

Aplicar a seguinte ordem:

1. decisão explícita confirmada mais recente;
2. arquivo declarado pelo usuário como fonte atual;
3. regra oficial mais recente aplicável;
4. card ou comentário oficial mais recente;
5. Figma aprovado;
6. documentos anteriores;
7. contexto histórico.

Usar essa ordem como critério de autoridade, não como autorização para apagar divergência material.

Quando duas fontes de níveis diferentes forem incompatíveis, informar qual possui prioridade e registrar a incompatibilidade quando ela ainda tiver impacto de rastreabilidade.

Quando duas fontes equivalentes forem incompatíveis e não houver decisão posterior, devolver `Divergente` à `@beta`.

### 3. Avaliar recência pelo conteúdo

Não usar apenas data do arquivo ou timestamp.

Verificar:

- nomenclatura vigente;
- regras explicitamente substituídas;
- decisões posteriores;
- status;
- comentários;
- indicação de aprovação;
- contexto de produção, validação ou proposta;
- coerência com o arquivo declarado como base atual.

Não presumir que o item cronologicamente mais novo é funcionalmente vigente.

### 4. Recuperar ClickUp em modo de leitura

Quando houver ClickUp conectado:

- para tarefa conhecida, usar `ClickUp.clickup_get_task`;
- solicitar `include: ["description"]` quando a descrição completa for relevante;
- solicitar `include: ["attachments", "dependencies", "linked_tasks"]` somente quando necessários para a análise;
- usar `ClickUp.clickup_get_task_comments` para comentários;
- usar `ClickUp.clickup_get_threaded_comments` somente quando houver respostas relevantes;
- usar `ClickUp.clickup_search` quando o usuário fornecer palavras-chave em vez de um ID;
- continuar a paginação de `ClickUp.clickup_search` enquanto existir `next_cursor`;
- para ClickUp Docs, localizar o documento e usar `ClickUp.clickup_list_document_pages` antes de `ClickUp.clickup_get_document_pages`;
- baixar anexo apenas quando seu conteúdo for necessário para resolver a solicitação.

Nunca usar ações de escrita do ClickUp nesta Skill.

Distinguir evidências de:

- produção;
- validação;
- aguardando;
- inovação;
- ideia futura;
- não implementado.

Não tratar tarefa futura como comportamento atual.

### 5. Tratar documentos e arquivos alterados

Quando o usuário fornecer uma versão alterada:

- tratá-la como nova base quando assim declarada;
- preservar inclusões e exclusões do usuário;
- comparar somente quando a solicitação exigir;
- não reconstruir a nova versão por memória;
- não substituir imagens novas;
- não restaurar regra antiga;
- não considerar resumo de terceiros prova de que o arquivo foi efetivamente revisado.

Quando o conteúdo necessário não estiver acessível, declarar a limitação e solicitar a fonte em vez de inventar.

### 6. Tratar evidência visual sem invadir módulos visuais

Prints e Figma podem comprovar nomenclatura, presença de elementos, estado observável ou contexto.

Não usar esta Skill para revisar consistência visual, medidas, layout, componentes ou fidelidade de interface. Quando isso for necessário, devolver o ponto para composição com `@beta-mod-figma` ou outro módulo visual aplicável.

Não deixar regra essencial depender apenas de imagem quando não houver comportamento suficientemente comprovado.

### 7. Comparar

Para conflito ou comparação, estruturar internamente:

| Ponto | Fonte A | Fonte B | Impacto | Classificação |
|---|---|---|---|---|

Classificar cada ponto como:

- nomenclatura compatível;
- detalhamento complementar;
- divergência funcional;
- regra ausente;
- regra substituída;
- evidência desatualizada;
- comportamento futuro;
- comportamento atual;
- não confirmado.

Não tratar diferença meramente editorial como divergência funcional.

### 8. Separar atual, futuro e histórico

Identificar explicitamente:

- comportamento atual confirmado;
- mudança futura confirmada;
- ideia/proposta sem aprovação;
- histórico sem força vigente;
- regra substituída;
- informação não confirmada.

Se a distinção depender de uma decisão ausente, não arbitrar.

### 9. Limitar pendências

Sinalizar como ponto não confirmado somente quando puder alterar:

- regra;
- fluxo;
- dado;
- cálculo;
- permissão;
- mensagem;
- processamento;
- resultado.

Não criar pendência por detalhe cosmético ou metadado irrelevante.

## Saída para a Beta

Retornar somente o necessário:

1. fonte principal;
2. fontes auxiliares;
3. evidências-chave e seus identificadores;
4. divergências;
5. regras substituídas;
6. comportamento atual;
7. comportamento futuro;
8. pontos não confirmados;
9. recomendação de consolidação.

A recomendação deve explicar **como tratar as fontes**, não inventar a regra funcional ausente.

Quando não houver divergência, não criar uma seção de conflito artificial.

## Limites de isolamento

Não:

- atualizar ou persistir `DOSSIE_CONTEXTO_MODELAGEM.md`;
- decidir comportamento funcional ausente;
- produzir a Modelagem Funcional completa;
- aplicar checklist de completude funcional de `@beta-mod-regras`;
- definir fórmulas ou métricas;
- revisar layout ou fidelidade visual;
- definir ciclo de vida/processamento;
- definir autenticação, autorização ou política de segurança;
- executar QA final;
- redigir ou formatar DOCX;
- escrever em ClickUp ou em qualquer fonte;
- usar memória como substituto de arquivo ou decisão atual.

Quando outro domínio for necessário, devolver o ponto para a `@beta` compor com a Skill especializada correspondente.

