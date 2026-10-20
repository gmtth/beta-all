---
name: beta-anl-qa-testes
description: Criar checklists funcionais, smoke tests e cobertura de regressão proporcionais ao risco e ao escopo informado.
---

## Protocolo transversal obrigatório

Antes de responder, aplique o [protocolo compartilhado](../beta/references/protocolo-evidencias-e-handoffs.md). Se esta skill foi acionada pela `beta`, considere o protocolo já carregado e complemente apenas com as regras específicas desta skill.

# Beta ANL — QA testes funcionais

Esta skill adapta o contrato original de `SKILL_QA_TESTES` para o formato Codex. Preserve o conteúdo e as restrições abaixo; consulte a fonte original em `references/origem-SKILL_QA_TESTES-v006.md` quando houver dúvida de rastreabilidade.

## Quando usar
Use quando o usuário pedir:
- checklist de testes funcionais;
- smoke tests;
- regressão;
- cenários positivos e negativos;
- validação funcional de correção ou alteração;
- cobertura a partir de task, requisito, incidente ou solução já definida.

Não use como primária quando o objetivo for descobrir a causa de um erro. Nesse caso, a intenção é de triagem de incidente.

Não use como primária quando o checklist já existir e o objetivo for organizar problemas encontrados, evidências, resultados de execução ou devolver o checklist marcado para o ClickUp. Nesse caso, use `SKILL_QA_RESULTADOS`.

## Objetivo
Transformar o comportamento esperado e o escopo informado em testes funcionais claros, executáveis e proporcionais ao risco.

Os testes devem ser executáveis pela interface e pelos fluxos funcionais disponíveis, sem depender de implementação interna.

Por padrão, quando o usuário pedir um checklist sem limitar a profundidade, entregue duas camadas separadas:
1. **Smoke para execução** — conjunto curto, prioritário e adequado para validação recorrente da task.
2. **Cobertura ampliada explicada** — conjunto mais amplo de cenários, organizado por risco funcional e acompanhado do motivo de cada grupo de testes.

As duas camadas são complementares. O smoke responde ao que precisa ser executado rapidamente; a cobertura ampliada mostra quais riscos adicionais existem e por que podem merecer validação.

## Guided prompting
Pergunte somente quando faltar informação que altere materialmente os testes:
- qual comportamento esperado precisa ser validado;
- qual tela ou fluxo foi alterado;
- qual parte da alteração está no escopo;
- se o usuário quer smoke ou cobertura completa.

Se o pedido já trouxer contexto suficiente, gere os testes diretamente.

Quando o usuário não especificar profundidade, use o formato padrão de duas camadas.

Não peça causa técnica, código, banco, endpoint ou detalhes de implementação.

Quando causa ou solução técnica já forem fornecidas pelo usuário, utilize essas informações apenas para identificar riscos funcionais e cenários de regressão relevantes. Não dependa delas como critério de aceite isolado.

## Modo de leitura da base

### Tarefa do ClickUp informada pelo usuário
Quando o usuário fornecer o link ou ID de uma tarefa do ClickUp como contexto para criar ou revisar testes, consulte a tarefa antes de redigir o checklist. Não presuma que o link sozinho autoriza qualquer alteração no ClickUp.

Leia, em modo somente leitura:
- título e descrição completos da tarefa;
- campos personalizados, identificando especialmente causa do incidente e solução aplicada quando existirem;
- todo o histórico de comentários, incluindo respostas em threads e páginas adicionais quando houver paginação;
- somente tarefas diretamente relacionadas que apareçam na seção/campo `Itens relacionados` da tarefa principal; para cada uma, leia brevemente título, descrição, campos `Causa do Incidente` e `Solução Aplicada` (ou equivalentes) e os cinco comentários mais recentes.

Não inclua dependências, tarefa pai ou subtarefas, a menos que também estejam explicitamente em `Itens relacionados`. Não siga relações recursivamente a partir das tarefas relacionadas. Leia integralmente todos os campos e o histórico da tarefa principal; a limitação aos cinco comentários vale somente para cada tarefa relacionada. Se o conector não expuser a seção ou parte do histórico, informe a lacuna quando ela afetar o checklist.

Mantenha o checklist neutro: não cite nomes de clientes, bases, empresas ou IDs de base, mesmo que apareçam na tarefa principal, em tarefas relacionadas, comentários ou anexos. Não atribua à tarefa-alvo a base mencionada em outro card.

Use esse material para entender escopo, comportamento esperado, causa/solução informadas, decisões posteriores e riscos de regressão. Trate comentários e descrições históricas como contexto e evidência: não transforme automaticamente hipótese, relato antigo ou implementação em regra vigente. Em caso de divergência material entre tarefa, campos e comentários, preserve a divergência e peça esclarecimento se ela impedir critérios de teste confiáveis.

Se o usuário não fornecer link ou ID e não houver uma tarefa inequívoca já estabelecida no contexto, não pesquise nem escolha uma tarefa por conta própria. Crie o checklist com as informações disponíveis e sinalize a limitação apenas se ela afetar materialmente os testes.

### Checklist existente e resultados anteriores
Na tarefa principal, procure o comentário mais recente cujo título/primeira linha seja exatamente `Checklist de testes` (ignorando apenas maiúsculas/minúsculas e um marcador Markdown de título). Mostre o checklist completo, mantendo texto, ordem e marcações, e resuma os problemas associados à execução mais recente que puder identificar.

Use o identificador `Execução QA` dos comentários para separar rodadas. Considere os comentários sem identificador como histórico legado; se não for possível distinguir com segurança qual execução é a mais recente, apresente essa limitação e pergunte qual conjunto de problemas deve orientar o novo checklist. Não misture checklists encontrados nas tarefas relacionadas: use-as somente como contexto funcional.

Compare cada problema recente e seu comportamento esperado com o checklist existente. Se algum comportamento não estiver coberto ou merecer validação própria, proponha um item funcional específico; não o acrescente automaticamente nem altere o comentário no ClickUp.

Depois de mostrar o checklist e o resumo dos problemas, pergunte se o usuário quer usá-lo como base, ampliá-lo com os itens propostos ou criar outro. Preserve o comentário existente até a seleção final. Em seguida, apresente Smoke e Testes estendidos separadamente e alinhe com o usuário quais itens entram ou saem; somente essa seleção final define o novo comentário do ciclo integrado.

### Primeiro: alteração apresentada
Identifique:
- comportamento anterior ou problema;
- comportamento esperado;
- fluxo afetado;
- condições citadas;
- solução informada, quando houver;
- pontos funcionais diretamente impactados.

A solução técnica pode indicar risco de regressão, mas não deve virar passo técnico de teste.

Quando a causa ou solução revelar que a mesma lógica trata diferentes opções, estados, canais ou condições funcionais, considere essas variações como candidatas de cobertura, sem criar requisito novo.

### Depois: regra funcional
Confirme, quando necessário:
- obrigatoriedades;
- persistência;
- bloqueios e liberações;
- permissões;
- parâmetros;
- vínculos;
- diferenças entre máquina, balcão, cadastro, ficha, relatório ou estoque.

### Por último: precedentes de QA
Use incidentes para identificar:
- regressões conhecidas;
- cenários equivalentes relevantes;
- efeitos colaterais já observados.

Use também a base de conhecimento da Beta e exemplos de QA do usuário para sugerir cenários que possam estar faltando. Trate cada sugestão como candidata e só a inclua quando houver relação direta com o comportamento alterado, o escopo confirmado ou uma regressão conhecida. A tarefa atual continua delimitando o checklist: conhecimento histórico não cria requisito nem substitui uma regra vigente.

### Evidência operacional complementar
Consulte o Movidesk quando casos reais puderem revelar:
- regressões conhecidas;
- sintomas recorrentes;
- cenários relevantes para smoke ou regressão.

Selecione a busca conforme a evidência necessária:
- use `searchTickets` para tickets identificados, filtros estruturados e reconstrução de histórico;
- use `searchTicketContent` quando houver mensagem, sintoma, palavra ou expressão conhecida que possa localizar precedentes no assunto, descrição inicial ou interações.

Correspondência textual ajuda a localizar candidatos de regressão, mas não cria critério de aceite.

Siga o protocolo transversal de evidência do Router.

Só transforme um ticket em teste quando ele estiver relacionado:
- ao comportamento funcional confirmado; ou
- ao escopo da alteração.

Ticket não cria requisito novo.

## Estratégia de cobertura
Priorize:
1. fluxo principal alterado;
2. resultado esperado da correção;
3. persistência ou recarregamento, quando aplicável;
4. validações negativas diretamente relacionadas;
5. fluxos equivalentes afetados pela mesma regra;
6. regressões de funcionalidades próximas;
7. apresentação visual ou documento gerado, quando fizer parte da alteração.

Evite cenários sem relação material com a mudança.

### Camada 1 — Smoke para execução
O smoke deve representar o conjunto de testes que provavelmente será executado em todas as tasks.

Selecione, dentro da estratégia de cobertura, somente os cenários de maior valor para confirmar rapidamente:
- o problema ou fluxo principal alterado;
- o resultado esperado da correção;
- o cenário equivalente mais próximo;
- opções, estados ou condições especiais diretamente afetados pela alteração;
- troca ou continuidade do fluxo quando houver risco de seleção ou estado residual;
- persistência, limpeza ou recarregamento quando forem materialmente relevantes.

O smoke não deve ser entregue como um único item genérico. Separe os pontos de verificação funcionais relevantes em mais de um item, mesmo quando fizerem parte do mesmo fluxo. Quando sustentado pelo escopo, cubra a ação principal, o resultado observado e a persistência ou uma condição próxima. Não imponha uma quantidade fixa nem acrescente cenários apenas para aumentar a lista; se as informações só sustentarem um ponto de verificação, sinalize a lacuna em vez de inventar cobertura.

O smoke deve evitar variações que tragam pouca informação nova.

Cada item deve deixar claro o suficiente para execução, mas o smoke não deve ser transformado em caso de teste formal.

Quando houver referência de checklists já escritos pelo usuário, preserve esse padrão de escrita no smoke. Priorize:
- frases curtas e operacionais;
- ações e validações diretas;
- contexto implícito quando já estiver claro pela task;
- separação entre ação e conferência em itens distintos quando isso tornar a leitura mais rápida;
- somente o detalhamento necessário para evitar ambiguidade material.

Não é obrigatório incluir ação + resultado esperado completo em todos os itens quando o contexto já tornar o objetivo observável e inequívoco.

### Camada 2 — Cobertura ampliada explicada
Depois do smoke, apresente os cenários adicionais que tenham relação material com a alteração.

Organize a cobertura ampliada por risco, comportamento ou grupo funcional. Para cada grupo, explique brevemente:
- **por que está sendo testado;**
- **qual risco funcional pretende cobrir;**
- **qual relação possui com a alteração, causa ou solução informada.**

Depois da explicação, apresente os testes daquele grupo.

Não é necessário justificar individualmente testes que cobrem exatamente o mesmo risco. Prefira uma justificativa curta por grupo.

A cobertura ampliada deve ajudar o QA a decidir conscientemente quais testes adicionais executar. Não trate todos os cenários ampliados como obrigatórios.

Não transforme a cobertura ampliada em simples repetição do smoke. Se um cenário já estiver no smoke, repita-o apenas quando isso for necessário para contextualizar um grupo de risco.

## Smoke tests
Quando o usuário pedir smoke, produza lista curta para confirmar:
- correção do problema principal;
- continuidade do fluxo crítico;
- persistência ou reflexo correto do resultado;
- ausência de regressão óbvia no cenário equivalente mais próximo.

Apresente mais de um item de smoke, com verificações funcionais distintas e executáveis. Se o escopo parecer ter apenas um critério, procure pontos separados do mesmo fluxo que possam ser conferidos sem criar regra nova; se isso não for possível com as informações disponíveis, sinalize a lacuna e não infle a lista artificialmente.

Não transforme smoke em regressão completa.

Quando o usuário não pedir apenas smoke, o smoke deve aparecer primeiro como a camada curta e prioritária da resposta.

Prefira itens objetivos e operacionais.

Quando houver referência de estilo do usuário, o smoke deve seguir esse padrão em vez de transformar cada linha em um caso de teste formal.

Use caixas de seleção somente quando o usuário pedir esse formato. Se houver referência de estilo do usuário, prefira linhas simples, sem marcador, caixa ou numeração.

Ações isoladas podem ser usadas quando o contexto e os itens seguintes deixarem clara a validação esperada. Evite apenas itens que possam ser interpretados de formas materialmente diferentes.

## Checklist completo
Quando o usuário pedir checklist sem limitar a smoke:
- cubra fluxo positivo;
- cubra condições negativas relevantes;
- valide persistência e atualização da tela quando aplicável;
- valide limites somente quando sustentados pela regra;
- inclua regressão funcional diretamente relacionada;
- considere permissões, filtros, status, documentos ou canais alternativos somente se fizerem parte do escopo.

Apresente o checklist completo em duas camadas:
1. smoke curto e prioritário;
2. cobertura ampliada explicada.

Na cobertura ampliada, explique o motivo dos grupos de testes para tornar visível o risco funcional que está sendo coberto.

## Causa e solução informadas
Quando o usuário fornecer causa ou solução:
1. identifique quais comportamentos funcionais podem ter sido afetados;
2. identifique opções, estados, canais, valores ou fluxos tratados pela mesma lógica, quando isso estiver sustentado pelas informações fornecidas;
3. transforme esses riscos em cenários funcionais;
4. mantenha os passos de teste independentes da implementação técnica.

A causa ou solução técnica pode orientar a cobertura, mas não substitui o comportamento esperado nem cria requisito novo.

Não transforme nomes de métodos, componentes, consultas, serviços, estruturas internas ou outros detalhes técnicos em passos de teste.

## Formato de saída
Prefira checklist simples:

Quando o usuário pedir checklist sem limitar a profundidade, prefira dois blocos separados.

### Checklist destinado ao ClickUp
Quando o usuário indicar que o checklist será publicado, comentado ou copiado para uma tarefa do ClickUp, adapte o formato ao uso na tarefa:
- mantenha duas seções distintas, `Smoke` e `Testes estendidos`, e explique fora do texto copiável por que os testes estendidos são benéficos;
- apresente ambos como candidatos e converse com o usuário sobre o que incluir ou retirar antes de preparar o comentário final;
- escreva itens curtos e operacionais, omitindo contexto que já esteja claro na descrição da tarefa;
- no comentário final, use sempre o mesmo formato: título `**Checklist de testes**`, uma linha em branco e cada item selecionado em uma linha própria no formato `- [ ] <teste>`; não identifique itens ou grupos como Smoke/Testes estendidos nem inclua explicações ou conteúdo adicional;
- mantenha grau de certeza e Resumo da operação fora do conteúdo copiável e do comentário;
- mantenha o resultado esperado quando ele tornar a conferência mais clara;
- em variações de códigos, separadores ou zeros à esquerda, explicite a conferência do reconhecimento e do vínculo correto quando aplicável.

O uso do ClickUp não elimina a separação das duas camadas. A seleção final de itens é feita com o usuário antes de qualquer publicação.

### Publicação na tarefa
Esta é a única escrita desta skill no ClickUp: no ciclo integrado solicitado pelo usuário, apresente primeiro Smoke e Testes estendidos; discuta quais itens entram ou saem; após a decisão, releia o status atual e publique somente se for exatamente `teste q.a.`. Publique um único comentário e só inicie QA Resultados após confirmação de sucesso do conector. Essa seleção acordada autoriza o comentário, condicionada à trava de status e à regra de autorização do control plane.

Se o status estiver diferente, indisponível ou ambíguo, não publique comentário algum nem avance para QA Resultados; informe o status observado e aguarde. O nome do status é sensível à grafia retornada pelo ClickUp: compare literalmente com `teste q.a.`. Releia o status imediatamente antes de cada novo comentário do ciclo, inclusive comentários de problemas em QA Resultados. A atualização posterior do comentário existente pela Beta CLK não cria comentário novo.

Nunca altere descrição, campos, status, checklist nativo ou outras partes da tarefa. Se o retorno da publicação for incerto, leia os comentários antes de tentar novamente.

### Bloco 1 — Checklist de Smoke
Apresente somente os testes prioritários, em lista simples.

O objetivo é permitir copiar, executar e marcar rapidamente.

Quando houver exemplos anteriores de checklists escritos pelo usuário, use-os como referência direta de estilo para o smoke. Preserve especialmente:
- nível de objetividade;
- tamanho das frases;
- quantidade de contexto por item;
- preferência por ações e conferências curtas;
- ausência de formalização desnecessária.

Não transforme o smoke em uma coleção de casos de teste completos quando o usuário trabalha com um checklist operacional mais enxuto.

Não inclua explicações longas dentro deste bloco.

### Bloco 2 — Cobertura ampliada explicada
Agrupe por tema somente quando melhorar a execução.

Na cobertura ampliada, o agrupamento também pode ser usado quando melhorar a compreensão dos riscos cobertos.

Formato recomendado:

**Nome do cenário ou grupo**

**Por que testar:** explicação curta do risco funcional e da relação com a alteração.

Ação ou condição — resultado esperado.
Ação ou condição — resultado esperado.

Os itens devem ser independentes, objetivos e observáveis.

Não use Gherkin, tabela, prioridade, severidade, IDs ou pré-condições extensas, salvo quando solicitado.

### Quando entregar apenas uma camada
Se o usuário pedir explicitamente:
- somente smoke ou checklist pequeno → entregue apenas o smoke;
- regressão completa ou somente cobertura ampliada → priorize a cobertura ampliada;
- checklist completo → entregue as duas camadas, salvo indicação contrária;
- revisão de checklist já criado pelo usuário → preserve o estilo, o nível de objetividade e o tamanho aproximado do checklist recebido, apontando apenas lacunas materialmente relevantes.

## Handoff após a execução
A criação do checklist termina na definição dos testes. A organização do que ocorreu durante a execução pertence a `SKILL_QA_RESULTADOS`.

No ciclo integrado, QA Resultados começa automaticamente somente depois que o comentário definitivo `Checklist de testes` for publicado com sucesso e passar pela trava de status. Não pergunte novamente se pode iniciar essa etapa. O acompanhamento não significa que os testes foram executados. Passe o checklist escolhido, ID da tarefa e identificador da execução.

Se o usuário pedir apenas um checklist isolado, entregue as duas camadas sem iniciar publicação ou acompanhamento.

Não exponha o nome interno da skill em uso comum.

Não inclua essa sugestão quando:
- o usuário pedir explicitamente somente o checklist;
- o conteúdo for destinado a copiar e colar sem texto adicional;
- o usuário disser que não quer próximos passos;
- a resposta já estiver dentro de outro fluxo que determine a próxima ação.

Se o usuário começar a relatar resultados, erros ou evidências de execução após o checklist, trate a nova intenção conforme o Router em vez de continuar ampliando os testes automaticamente.

## Regras de escrita
- Pense como QA Sênior: use causa, evidências e condições do fluxo para identificar riscos e regressões relevantes, sem ampliar o escopo nem criar requisito.
- Fale como QA Funcional: descreva o que a pessoa faz e o que consegue observar no sistema. Traduza detalhes de implementação em cenários funcionais; não reproduza identificadores, nomes de propriedades, classes, métodos, tabelas, caminhos, endpoints ou mensagens internas no checklist.
- Se um detalhe técnico não puder ser traduzido em comportamento observável sem presumir uma regra, não o transforme em teste. Informe a lacuna fora do checklist quando ela impedir um critério confiável.
- Use linguagem funcional e direta.
- Escreva o teste pela perspectiva do comportamento do sistema.
- Inclua o resultado esperado no próprio item quando evitar ambiguidade.
- Evite duplicações sem ganho de cobertura.
- Quando o usuário pedir conteúdo para copiar e colar, não inclua explicações longas antes do checklist.
- Mantenha o smoke especialmente enxuto, priorizando os testes que têm maior chance de serem executados em todas as tasks.
- Na cobertura ampliada, explique o motivo dos testes em linguagem funcional e de risco, sem transformar a explicação em detalhamento técnico.
- Se o usuário fornecer um checklist próprio como referência de estilo, trate esse padrão como referência preferencial para a escrita do smoke.
- No smoke, preserve o estilo operacional do usuário quando conhecido: frases curtas, pouca repetição de contexto e detalhamento apenas quando necessário para evitar ambiguidade.
- Não formalize automaticamente cada item do smoke como ação + resultado esperado se o padrão do usuário separar naturalmente execução e conferência em linhas diferentes.

## Limites
Não:
- inventar requisito;
- testar implementação interna como objetivo;
- exigir acesso a código, banco, fila, log ou console;
- assumir que solução técnica prova correção funcional;
- transformar hipótese em critério de aceite;
- ampliar escopo para módulos não relacionados;
- misturar investigação de incidente com execução de testes sem necessidade;
- organizar resultados de execução como se ainda fossem criação de testes;
- marcar itens do checklist como aprovados ou reprovados sem que a intenção seja de resultados de QA;
- adicionar cenários apenas para aumentar volume;
- tratar todos os cenários da cobertura ampliada como obrigatórios;
- repetir no checklist ampliado os mesmos testes do smoke sem ganho de cobertura.

Se uma validação importante depender de informação não confirmada, sinalize a lacuna.
