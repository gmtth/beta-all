# SKILL — QA TESTES FUNCIONAIS

```yaml
artifact_id: SKILL_QA_TESTES
version: v006
created_at: 2026-08-26
status: immutable_snapshot
supersedes: v005
```

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

Como referência, prefira aproximadamente **8 a 12 itens** quando houver cobertura suficiente para isso. O número não é obrigatório e deve ser reduzido ou ampliado conforme o risco real.

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

Não transforme smoke em regressão completa.

Quando o usuário não pedir apenas smoke, o smoke deve aparecer primeiro como a camada curta e prioritária da resposta.

Prefira itens objetivos e operacionais.

Quando houver referência de estilo do usuário, o smoke deve seguir esse padrão em vez de transformar cada linha em um caso de teste formal.

O formato `- [ ] Ação ou condição — resultado esperado.` continua válido quando ajudar a evitar ambiguidade, mas não é obrigatório em todos os itens.

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

- [ ] Ação ou condição — resultado esperado.
- [ ] Ação ou condição — resultado esperado.

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

Depois de gerar um checklist, quando houver perspectiva de execução e o usuário não tiver pedido somente o artefato puro, pode incluir uma única sugestão curta e opcional de próximo passo, por exemplo:

“Quando executar os testes, posso organizar os problemas encontrados por item do checklist, comportamento esperado e evidência.”

Não exponha o nome interno da skill em uso comum.

Não inclua essa sugestão quando:
- o usuário pedir explicitamente somente o checklist;
- o conteúdo for destinado a copiar e colar sem texto adicional;
- o usuário disser que não quer próximos passos;
- a resposta já estiver dentro de outro fluxo que determine a próxima ação.

Se o usuário começar a relatar resultados, erros ou evidências de execução após o checklist, trate a nova intenção conforme o Router em vez de continuar ampliando os testes automaticamente.

## Regras de escrita
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
