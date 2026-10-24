# Dossier do plugin Beta

**Atualizado:** 2026-10-24

**Componente:** `plugins/beta/`

**Manifesto:** `suite-beta`, versão `1.0.10`

## Resumo e escopo

O plugin reúne a família Beta ANL e Beta MOD em uma experiência com a skill `beta` como entrada e orquestradora. Ela encaminha tarefas às skills especializadas, consolida respostas e mantém o comportamento transversal descrito em suas instruções.

Este dossier cobre o pacote do plugin, suas skills, referências, metadados, configuração MCP, roteamento e publicação pelo marketplace GitHub. O código e estado do runtime MCP/OAuth e da integração Supabase têm dossiers próprios em [`mcp/movidesk/DOSSIER.md`](../../mcp/movidesk/DOSSIER.md) e [`infra/supabase/DOSSIER.md`](../../infra/supabase/DOSSIER.md).

Este dossier foi reconstruído retroativamente após a consolidação. Baseia-se no snapshot importado, manifesto, matriz de roteamento e repositórios históricos preservados em `legacy/source-archives/` na árvore Git até `fd7c090bb25b7b9086de9ebea38a1680df6bddb4`; a pasta foi removida da árvore ativa e continua recuperável pelo histórico. Não foi encontrada uma exportação integral das conversas históricas nem um dossier retroativo anterior. Fatos de implementação são descritos como observáveis nas fontes disponíveis; não é uma transcrição de conversas.

## Estado atual

- O pacote contém 20 skills: a orquestradora `beta` e 19 skills especializadas ANL/MOD.
- O manifesto `.codex-plugin/plugin.json` conserva a identidade `suite-beta` e está na versão local `1.0.10`. `interface.shortDescription` tem 29 caracteres e `interface.defaultPrompt` contém três opções.
- O Knowledge Master vigente é [`CENCIHUB_KNOWLEDGE_MASTER__2026-10-20__v002.md`](./references/CENCIHUB_KNOWLEDGE_MASTER__2026-10-20__v002.md). Ele resolve duas referências quebradas com anchors explícitos; o snapshot `v001` está preservado sem alteração. O relatório correspondente está em [`KNOWLEDGE_MASTER_INTEGRITY__2026-10-20__v002.md`](./references/KNOWLEDGE_MASTER_INTEGRITY__2026-10-20__v002.md).
- Dezesseis skills estão na revisão `metadata.version` `"3"`; `beta-mod-qa` e `beta-mod-sites` permanecem em `"2"`; `beta-anl-movidesk` está em `"4"`; `beta` está em `"8"` e `beta-anl-qatestes` em `"4"` após as mudanças de comunicação. A contagem inicial foi `"1"`; os incrementos seguem a regra definida em [`AGENTS.md`](./AGENTS.md).
- Os metadados das skills incluem nomes técnicos e exibidos vigentes, descrições, prompts, política de invocação, cores e logos. As skills ClickUp Cards e ClickUp Checklist compartilham brand color `#754FF6` e os logos small/large, copiados para cada pasta para manter o pacote autossuficiente.
- `beta-anl-clickupchecklist` tem prompt padrão coerente com sua restrição de atualizar apenas o comentário mais recente “Checklist de testes” e com as informações necessárias da rodada.
- A integração configurada em `.mcp.json` aponta para `https://movidesk-oauth-proxy-pkce.thngrns.chatgpt.site/mcp/`. Consultas ao Movidesk permanecem somente leitura; a importação explicitamente solicitada de chamados para a base interna é uma escrita restrita e auditada, descrita na skill `beta-anl-movidesk`. Endpoint, publicação e migração são acompanhados pelo dossier MCP; a configuração local não prova conectividade end-to-end.
- O marketplace GitHub **Beta** está configurado na raiz do monorepo para apontar a este pacote. A importação/sincronização no workspace e o uso pelos quatro analistas ainda precisam ser confirmados; consulte [`plugin-marketplace.md`](../../docs/components/plugin-marketplace.md).
- A comunicação compartilhada está centralizada em `skills/beta/references/protocolo-evidencias-e-handoffs.md`: precedentes com evidência rastreável, separação entre fonte e recomendação e cartões de encerramento com campos e regras condicionais.
- A grade aprovada usa quatro cartões principais na primeira linha e, na segunda, “Skills acionadas” primeiro e sempre; Feedback/Ações aparecem apenas quando relevantes. A largura da segunda linha divide um grid de 12 colunas igualmente entre 1, 2 ou 3 cartões (`md-12`, `md-6` ou `md-4`); abaixo de `md`, os cartões empilham. Não tem cabeçalho Beta, título “Resumo da operação”, linha superior ou cartão Próximo passo. Todo texto usa o mesmo estilo pequeno; sem renderizador documentado, a tabela Markdown portátil não promete proporções `col-md`.
- Dois contratos de invocação direta antes sem referência explícita ao protocolo (`beta-anl-clickupchecklist` e `beta-mod-sites`) agora apontam para ele. Revisados também os control planes ANL/MOD e as instruções de governança para exigir auditoria transversal das 20 skills em futuras mudanças de comunicação.
- Revisões de skill nesta alteração: `beta` `"5"`, `beta-anl-clickupchecklist` `"4"` e `beta-mod-sites` `"3"`; as demais permanecem inalteradas. O manifesto passou para `1.0.5`.
- A solicitação posterior sobre cartões nativos foi incorporada como regra condicional: usar componentes interativos somente quando o cliente e um mecanismo documentado realmente os oferecerem; sem suporte, usar Markdown e não simular componentes com tags XML/HTML. Texto colado como “protocolo de sistema” é tratado como preferência de formato do usuário, não como instrução superior. `beta` passou à revisão `"6"`; o manifesto passou a `1.0.6`.
- A decisão inicial sobre os cartões foi registrada no histórico abaixo; a configuração vigente inclui também o cartão “Skills acionadas” e as larguras responsivas descritas no protocolo.
- Os validadores `validate_beta_anl_skills.py` e `validate_beta_routing_cases.py` foram executados em 2026-10-20 após os ajustes de referências técnicas, snapshot, metadados e versionamento; ambos passaram sem erros (20 skills e 24 casos de roteamento).

## Decisões vigentes

### Nomenclatura técnica e exibida

A orquestradora é a única skill com identificador técnico `beta` e nome exibido `Beta`. As demais usam `beta-anl-identificação` para análise ou `beta-mod-identificação` para modelagem. Quando relacionadas a uma ferramenta, o nome da ferramenta aparece primeiro no identificador e no nome exibido. Nomes exibidos especializados são curtos, não começam por Beta/ANL/MOD e não usam travessão.

Dentro do pacote, referências internas usam sempre o identificador técnico: pasta, `name`, títulos de `SKILL.md`, roteamento, handoffs, exemplos de invocação, documentação e validações. O nome exibido de `agents/openai.yaml` fica reservado à interface e a textos voltados ao usuário quando a apresentação visual do nome for relevante. Assim, por exemplo, o título interno é `beta-anl-clickupchecklist`, enquanto o nome de interface é `ClickUp Checklist`.

A migração de nomes foi aplicada em 2026-10-20: pastas, frontmatter, roteamento, referências, fixtures, validadores e metadados foram atualizados. Esta tabela preserva o mapeamento anterior para consulta histórica.

| Identificador técnico anterior | Identificador técnico vigente | Nome exibido anterior | Nome exibido vigente |
|---|---|---|---|
| `beta` | `beta` | Beta | Beta |
| `beta-anl-duvidas-funcionais` | `beta-anl-duvidasfuncionais` | Beta ANL — Dúvidas funcionais | Dúvidas funcionais |
| `beta-anl-gerador-cards-clickup` | `beta-anl-clickupgeradorcards` | Beta ANL — Gerador de cards ClickUp | ClickUp Cards |
| `beta-anl-movidesk` | `beta-anl-movidesk` | Beta ANL — Movidesk | Movidesk |
| `beta-anl-qa-resultados` | `beta-anl-qaresultados` | Beta ANL — QA resultados | Resultados QA |
| `beta-anl-qa-testes` | `beta-anl-qatestes` | Beta ANL — QA testes funcionais | Testes funcionais |
| `beta-anl-regras-negocio` | `beta-anl-regrasnegocio` | Beta ANL — Regras de negócio | Regras de negócio |
| `beta-anl-triagem-incidentes` | `beta-anl-triagemincidentes` | Beta ANL — Triagem de incidentes | Triagem de incidentes |
| `beta-clk-checklist` | `beta-anl-clickupchecklist` | Beta CLK Checklist | ClickUp Checklist |
| `beta-mod-artefatos` | `beta-mod-artefatos` | Beta MOD — Artefatos | Artefatos |
| `beta-mod-dossie` | `beta-mod-dossie` | Beta MOD — Dossiê | Dossiê |
| `beta-mod-figma` | `beta-mod-figma` | Beta MOD — Figma | Figma |
| `beta-mod-fluxos` | `beta-mod-fluxos` | Beta MOD — Fluxos | Fluxos |
| `beta-mod-fontes` | `beta-mod-fontes` | Beta MOD — Fontes | Fontes |
| `beta-mod-permissoes` | `beta-mod-permissoes` | Beta MOD — Permissões | Permissões |
| `beta-mod-processamento` | `beta-mod-processamento` | Beta MOD — Processamento | Processamento |
| `beta-mod-qa` | `beta-mod-qa` | Beta MOD — QA | QA |
| `beta-mod-regras` | `beta-mod-regras` | Beta MOD — Regras | Regras |
| `beta-mod-relatorios` | `beta-mod-relatorios` | Beta MOD — Relatórios | Relatórios |
| `beta-sites` | `beta-mod-sites` | Beta SIT | Sites |

### Metadados, identidade visual e dependências

- Cada skill deve preencher `display_name`, `short_description`, `icon_small`, `icon_large`, `brand_color`, `default_prompt` e `policy.allow_implicit_invocation` em `agents/openai.yaml`.
- Manter os dois logos preenchidos com assets existentes e versionados dentro da pasta da skill. Skills ANL e MOD reutilizam os logos e cores canônicos de suas famílias, salvo exceções aprovadas.
- Movidesk (`#FF2A28`), Sites (`#168DE4`) e as duas skills ClickUp (`#754FF6`) são exceções visuais registradas. ClickUp Cards e ClickUp Checklist têm cópias locais dos mesmos logos pequeno e grande.
- Declarar `dependencies.tools` sempre que uma skill depender de uma ferramenta/conexão externa suportada pelo formato e runtime. Não inventar dependências. A skill Movidesk declara a conexão MCP; não há uma definição verificável de servidor ClickUp no pacote atual, portanto a dependência ClickUp permanece pendente de confirmação.
- `policy.allow_implicit_invocation` é `true` somente para `beta`; todas as especializadas usam `false`.
- O manifesto deve respeitar limites do formato: `shortDescription` com até 30 caracteres e `defaultPrompt` com até três opções. A configuração vigente cumpre esses limites.
- A comunicação final segue o protocolo transversal: precedentes com evidência rastreável e cartões compactos conforme formato e capacidade disponíveis. A grade aprovada não tem cabeçalho/título/linha superior nem cartão Próximo passo; Feedback e Ações são condicionais. A confiabilidade é percentual heurístico inteiro em incrementos de 10, não probabilidade calibrada. Componentes nativos dependem de suporte explícito do cliente; o pacote não promete renderização idêntica entre clientes.

| Grupo/skill | Logo vigente | Cor | Diretriz |
|---|---|---|---|
| ANL em geral | `./assets/fundo.png` | `#C11D26` | Reutilizar como padrão ANL. |
| MOD em geral | `./assets/beta-mod.png` | `#E3DB0B` | Reutilizar como padrão MOD; conferir contraste em futuras alterações. |
| Movidesk | `./assets/fundo.png` na pasta da skill | `#FF2A28` | Exceção de produto aprovada. |
| ClickUp Cards e ClickUp Checklist | `./assets/small-logo.png` e `./assets/large-logo.png` em cada pasta | `#754FF6` | Identidade compartilhada ClickUp, mantida autossuficiente em cada skill. |
| Sites | `./assets/beta-sit.png` | `#168DE4` | Exceção de produto aprovada. |

### Comportamento e proteção

- Selecionar uma intenção e um modo primário; não acionar ANL e MOD em paralelo sem necessidade.
- Preservar autoridade das skills. Não converter ticket, hipótese ou precedente isolado em regra, requisito ou causa confirmada.
- Fazer handoff apenas quando outra skill puder fornecer evidência ou decisão necessária e devolver uma síntese consolidada.
- Distinguir regra confirmada, fato operacional, precedente, padrão, hipótese e lacuna.
- Respeitar limites de segurança e publicação do MCP. `beta-mod-sites` trabalha em clone isolado e não se conecta ao backend real do CENCIHUB.
- Tratar arquivos `references/origem-*.md` como fontes de rastreabilidade; não reescrevê-los como novas instruções.

## Mapa dos componentes

| Caminho | Responsabilidade |
|---|---|
| `skills/beta/` | Entrada, control plane, roteamento e protocolo transversal |
| `skills/beta-anl-*/` | Dúvidas funcionais, regras, triagem, QA, ClickUp e Movidesk |
| `skills/beta-mod-*/` | Modelagem de regras, dossiê, fontes, fluxos, permissões, processamento, relatórios, Figma, QA, artefatos e Sites |
| `references/` | Knowledge Master, integridade e apoio compartilhado |
| `references/CENCIHUB_KNOWLEDGE_MASTER__2026-10-20__v002.md` | Snapshot vigente, com links internos resolvidos; `v001` preservado |
| `tests/beta-routing-cases.json` | Casos de contrato e cobertura de roteamento |
| `scripts/` | Validadores estruturais e de cobertura das skills/roteamento |
| `.codex-plugin/plugin.json` | Manifesto e metadados do pacote |
| `.mcp.json` | Servidor MCP declarado para o plugin |
| `../../.agents/plugins/marketplace.json` | Registro do marketplace Beta no monorepo |

O protocolo transversal de evidências, certeza, vigência, handoffs e publicação está em `skills/beta/references/protocolo-evidencias-e-handoffs.md`. A skill `beta` encaminha para módulos especializados e mantém a resposta final; os contratos locais de cada módulo permanecem em seu `SKILL.md` e referências.

As especialidades ANL cobrem dúvidas funcionais, regras de negócio, triagem de incidentes, QA de testes e resultados, geração de cards ClickUp, checklist ClickUp e consulta Movidesk. As especialidades MOD cobrem regras, dossiê, fontes, fluxos, permissões, processamento, relatórios, Figma, QA e artefatos. As antigas orquestradoras `beta-anl-router` e `beta-mod` não fazem parte do diretório ativo; seus contratos foram incorporados à skill `beta`, e cópias de auditoria são mantidas fora do pacote ativo.

## Contratos de responsabilidade das skills

O contrato entre as skills tem duas camadas. A skill `beta` é a única orquestradora: escolhe a especialidade necessária, coordena handoffs e mantém o protocolo transversal e a resposta consolidada. Cada skill especializada tem um domínio delimitado e devolve seu resultado à `beta`; não passa a decidir regras gerais nem a assumir o papel de outra especialidade. A descrição abaixo é um mapa de navegação e prevenção de regressões. O `SKILL.md` de cada linha continua sendo a fonte normativa para procedimento, formato, autorização e limites completos.

| Identificador técnico | Função própria | Fronteira que deve ser preservada |
|---|---|---|
| `beta-anl-duvidasfuncionais` | Responder dúvidas sobre o CENCIHUB de forma curta, funcional e didática. | Não inventar telas, campos ou fluxos, nem transformar dúvida simples em investigação extensa. |
| `beta-anl-regrasnegocio` | Explicar regras funcionais confirmadas, condições, dependências, exceções e efeitos. | Não derivar regra geral somente de ticket ou de bug histórico. |
| `beta-anl-triagemincidentes` | Isolar sintomas, escopo, reprodução, impacto e evidências ao triar incidentes. | Não fechar causa sem evidência, prometer correção ou tratar precedente como diagnóstico atual. |
| `beta-anl-qatestes` | Criar checklists funcionais, smoke tests e cobertura de regressão proporcional ao risco. | Não inventar requisito, depender de implementação interna ou assumir a organização dos resultados da execução. |
| `beta-anl-qaresultados` | Organizar resultados observados, problemas, evidências e estados da rodada de QA. | Não inventar sucesso, reescrever o checklist nem criar card automaticamente; publicação segue o gate de aprovação da própria skill. |
| `beta-anl-clickupgeradorcards` | Criar, consolidar e revisar cards ClickUp com contexto funcional e rastreabilidade para desenvolvimento. | Não assumir o contrato de checklist nem converter hipótese ou histórico em causa/regra confirmada. |
| `beta-anl-clickupchecklist` | Atualizar apenas o comentário-alvo “Checklist de testes” no ClickUp, segundo o contrato de rodada informado. | Não criar checklist nem alterar tarefa, comentário ou conteúdo fora do alvo autorizado; seguir os gates de seleção, confirmação e validação da skill. |
| `beta-anl-movidesk` | Consultar e sintetizar chamados reais; importar chamados selecionados para a base interna somente mediante pedido explícito. | Consultas não alteram chamados. Importação não muda a origem e não transforma correspondência textual em prova de causa. |
| `beta-mod-fontes` | Identificar, recuperar, priorizar e comparar fontes, versões, recência e divergências. | Atua em leitura; não decide regra funcional, não persiste Dossiê e não produz modelagem final. |
| `beta-mod-regras` | Verificar completude e rastreabilidade de regras, gatilhos, ações, validações, resultados e estados. | Não cria autoridade de regra nem consolida a Modelagem Funcional final. |
| `beta-mod-fluxos` | Organizar sequências de telas, navegação, interações e estados de interface. | Não inventa telas/regras nem substitui análise de regra, revisão visual no Figma ou modelagem final. |
| `beta-mod-figma` | Inspecionar e comparar a representação visual no Figma, componentes e estados de interface. | É módulo visual; não define regra funcional nem produz modelagem final concorrente. |
| `beta-mod-permissoes` | Analisar autenticação, autorização, papéis, dados sensíveis e isolamento entre empresas. | Não inventa papéis, permissões ou arquitetura; devolve riscos e regras confirmadas para composição pela `beta`. |
| `beta-mod-processamento` | Analisar ciclo de vida funcional, estados, transições, duplicidade, precedência, reprocessamento, falhas e concorrência. | Não inventa tecnologia nem regra; não assume relatórios, permissões especializadas ou modelagem final. |
| `beta-mod-relatorios` | Estruturar relatórios, indicadores, previsões e cálculos de modo reproduzível. | Não inventa fórmulas ou regras e não incorpora processamento ou modelagem final fora desse domínio. |
| `beta-mod-dossie` | Manter o Dossiê de Contexto da Modelagem, distinguindo o que é modelagem, contexto e fora de escopo. | Não cria regra, resolve conflito sem decisão, produz modelagem final ou gera artefatos além do Dossiê. |
| `beta-mod-qa` | Fazer a revisão crítica final de modelagem consolidada, priorizando riscos materiais de implementação, dados e homologação. | Não cria regra, não resolve divergência sem decisão, não reescreve o documento nem produz plano completo de testes. |
| `beta-mod-artefatos` | Materializar conteúdo funcional consolidado em documentos e outros artefatos finais. | Não altera entendimento funcional nem resolve regra/fonte; recebe conteúdo aprovado/consolidado e mantém a responsabilidade documental. |
| `beta-mod-sites` | Materializar um clone web autônomo do CENCIHUB a partir de contexto e regras aprovados. | Permanece isolada; não se conecta ao backend, API, banco, autenticação ou ambiente real. |

### Regra para mudanças nas skills

Antes de qualquer alteração em `SKILL.md`, `agents/openai.yaml`, assets de skill ou comportamento de roteamento diretamente ligado a uma skill, o usuário deve receber um plano exato: skills e arquivos afetados, trechos/metadados que mudarão, comportamento pretendido, impacto positivo esperado, impacto negativo ou regressões possíveis, dependências e validações/versionamento. A edição só começa após aprovação explícita desse plano. Sem aprovação, a atividade permanece em análise/proposta. Mudanças apenas neste dossier ou no AGENT podem documentar o contrato, mas não autorizam alterações implícitas nas skills.

Mudanças comportamentais e de redação devem ser generalizáveis para todo o domínio e fluxo da skill. Não inserir chamados, cards, documentos operacionais, casos concretos ou exemplos nas instruções das skills, nem direcionar regras a um erro ou artefato isolado. Um caso individual pode motivar investigação, mas só pode fundamentar uma regra geral após abstração e justificativa. Necessidades específicas permanecem na conversa ou no artefato correspondente, não na skill.

## Histórico de mudanças

| Data/marco | Alteração ou evidência | Fonte e limite |
|---|---|---|
| Importação inicial | O plugin `gmtth/plugin-beta`, branch `main`, commit `f63afd20d346cd666c2f2b7908683be76eb16ea5`, foi consolidado em `plugins/beta/`; proveniência em `docs/migration/SOURCE_IMPORTS.tsv`. | Snapshot importado e inventários. |
| Reconstrução do dossier | Este registro foi criado a partir do código, instruções, manifestos e arquivos históricos; não existe transcrição integral das conversas. | Histórico Git até `fd7c090bb25b7b9086de9ebea38a1680df6bddb4` e documentação de migração. |
| 2026-10-20, nomenclatura | Identificadores técnicos de oito skills e nomes exibidos das 19 especializadas foram padronizados. Nomes anteriores estão preservados na tabela de decisões para rastreabilidade. | Pastas, `SKILL.md`, roteamento, referências, fixtures e metadados ativos. |
| 2026-10-20, revisão de `SKILL.md` | Revisados os 20 frontmatters, os links relativos e os identificadores citados. Títulos internos foram alinhados aos nomes exibidos e, nesta revisão, corrigidos para os identificadores técnicos; invocação/exemplo do ClickUp Checklist também foi atualizado após encontrar referências antigas. | Todos os `skills/*/SKILL.md`; identificadores sem diretório de skill ativo são nomes de referências/control planes ou menções históricas. |
| 2026-10-20, versionamento inicial | Inicializada a contagem do pacote em `1.0.0` e das 20 skills em `"1"`; futuras alterações incrementam o patch do pacote e somente as skills afetadas. | `.codex-plugin/plugin.json`, `skills/*/SKILL.md` e regra em `AGENTS.md`. |
| 2026-10-20, referência técnica e versão | Decidido que conteúdo interno referencia skills por identificador técnico, reservando `display_name` para interface e comunicação voltada ao usuário. Títulos dos 20 `SKILL.md` foram alinhados às pastas/identificadores; todas as skills passaram à revisão `"2"` e o manifesto a `1.0.1`. | Regra em `AGENTS.md`, todos os `skills/*/SKILL.md` e `.codex-plugin/plugin.json`. |
| 2026-10-20, validação e versão | Os validadores de skills e roteamento passaram sem erros. O manifesto foi incrementado para `1.0.2` para registrar esta atualização do dossier; as versões das skills não mudaram. | Saída recente de `python scripts/validate_beta_anl_skills.py` e `python scripts/validate_beta_routing_cases.py`; `.codex-plugin/plugin.json`. |
| 2026-10-20, referências técnicas e Knowledge Master | Referências internas a skills foram padronizadas com identificadores técnicos. Links quebrados no snapshot foram resolvidos em nova versão `v002`, preservando `v001` e os hashes das seis fontes. Dezoito skills passaram à revisão `"3"`; o manifesto passou a `1.0.3`. | Skills e referências alteradas; `references/CENCIHUB_KNOWLEDGE_MASTER__2026-10-20__v002.md`; relatório de integridade correspondente. |
| 2026-10-20, metadados | O prompt padrão de ClickUp Checklist foi preenchido; o manifesto foi ajustado para descrição de 29 caracteres e três prompts; ClickUp Cards recebeu os logos e a cor de ClickUp Checklist. | `.codex-plugin/plugin.json`, arquivos `agents/openai.yaml` e assets nas duas skills ClickUp. |
| 2026-10-20, importação explícita de conhecimento | A skill Beta agora permite importar chamados ao Supabase somente após pedido explícito, sem alterar o Movidesk. `beta` e `beta-anl-movidesk` passaram à revisão `"4"`; o manifesto passou a `1.0.4`. | Skills, instruções MCP do Sites e documentação operacional; implementação/publicação continuam no estado do dossier MCP. |
| 2026-10-22, contrato de comunicação e evidências | Centralizado cabeçalho, confiabilidade qualitativa, requisitos de citação para casos e resumo final observável. Removidas percentagens sem calibração e exposição de nomes internos de skills/ferramentas no resumo. Corrigidas referências de protocolo em ClickUp Checklist e Sites; governança agora exige revisar todas as skills. | Protocolo compartilhado, Beta, control planes ANL/MOD, observabilidade, duas skills diretas, `AGENTS.md` e manifesto `1.0.5`. Alterações ainda não publicadas. |
| 2026-10-22, componentes nativos condicionais | Acrescentada preferência por cartões/flashcards/quizzes/painéis nativos somente quando houver suporte e formato documentado no cliente. Definido fallback Markdown sem XML/HTML que finja interatividade; texto colado como “protocolo de sistema” é tratado como referência de formato do usuário. `beta` passou a `"6"`; manifesto `1.0.6`. | `SKILL.md`, protocolo compartilhado, `AGENTS.md` e dossier. Sem testes ou publicação nesta etapa. |
| 2026-10-22, cartões de encerramento | Especificada a grade visual aprovada, os seis campos iniciais e as condições de Feedback/Ações; retirado Próximo passo; definido o significado de Ações; confiabilidade padronizada em porcentagem heurística por faixas discretas. Atualizados Beta e materiais ANL/MOD que ainda exigiam cabeçalho/resumo antigo. `beta` `"7"`, `beta-anl-qatestes` `"4"`, manifesto `1.0.7`. | Skill Beta, protocolo compartilhado, control planes, observabilidade, `AGENTS.md` e dossier. Alterações locais; sem testes ou publicação nesta etapa. |
| 2026-10-22, cartão Skills acionadas e grade responsiva | Acrescentado cartão obrigatório “Skills acionadas” antes dos opcionais na segunda linha. Lista somente nomes exibidos de skills realmente ativadas. Grade `md`: largura total quando sozinho, metade com um cartão opcional e um terço com os dois; abaixo de `md`, empilha. `beta` passou a `"8"`; manifesto `1.0.8`. | Skill Beta, protocolo, control planes ANL/MOD, observabilidade, `AGENTS.md` e dossier. Alterações locais; sem testes ou publicação nesta etapa. |
| 2026-10-24, contratos individuais e gate de mudança | Documentada a função e a fronteira de cada uma das 19 skills especializadas; explicitado o papel exclusivo da orquestradora. AGENT e dossier agora exigem plano concreto de mudança com efeitos positivos/negativos e aprovação explícita antes de editar fontes, metadados, assets ou roteamento direto de uma skill. Nenhum `SKILL.md` foi alterado; manifesto incrementado para `1.0.9`. | Matriz baseada nas descrições, seções de responsabilidade, objetivos e limites dos 20 `SKILL.md`; `plugins/beta/AGENTS.md` e este dossier. Versões individuais de skills mantidas. |
| 2026-10-24, neutralidade a casos isolados | Exigido que mudanças de comportamento e redação das skills expressem regras generalizáveis; proíbe-se incluir chamados, cards, documentos, casos concretos ou exemplos nas instruções, ou codificar comportamento com base em um caso isolado. Necessidades específicas permanecem na conversa ou no artefato. Nenhum `SKILL.md` foi alterado; manifesto incrementado para `1.0.10`. | `plugins/beta/AGENTS.md` e decisão solicitada pelo usuário. Versões individuais de skills mantidas. |
| Integração MCP | `.mcp.json` configura o endpoint documentado do Sites/MCP, mas isso não comprova conectividade ou publicação end-to-end. | `.mcp.json`, `docs/components/sites.md` e `mcp/movidesk/DOSSIER.md`. |

Não há evidência suficiente para atribuir data ou motivação a toda a evolução anterior do plugin. Para casos históricos específicos, consultar o arquivo de origem e o repositório preservado; não deduzir intenção apenas a partir de uma alteração de código.

## Próximos passos

| Item | Estado | Condição para concluir |
|---|---|---|
| Sincronização/importação do marketplace Beta no workspace | Pendente de confirmação | Configurar/confirmar o marketplace e verificar a disponibilidade da skill para os analistas. |
| Dependência declarativa ClickUp | Pendente de verificação do formato/runtime | Identificar e validar a conexão ClickUp suportada; então declarar `dependencies.tools` sem inventar endpoints ou IDs. |
| Importação MCP/Supabase em produção | Runtime publicado na versão 74; ainda pendente de uso autenticado | Reautorizar scopes no cliente MCP e confirmar a importação do ticket piloto; não inferir sucesso da configuração local. |
| Busca diagnóstica completa | Pendente em MCP/base | Ingestão, busca híbrida, filtros de classificação, reranking, citações e avaliação permanecem etapas separadas. |
| Avaliar exemplos de diagnóstico reais com o contrato de evidências | Pendente | Usar amostras anonimizadas e verificar se cada afirmação sobre caso tem fonte/trecho, sem percentuais de confiança não calibrados; avaliar qualidade antes de ampliar a regra. |

Ao confirmar a conclusão de um item, retire-o desta lista e registre a evidência no histórico. A implementação de OAuth e a migration/runtime atuais são acompanhadas em [`mcp/movidesk/DOSSIER.md`](../../mcp/movidesk/DOSSIER.md#próximos-passos) e [`infra/supabase/DOSSIER.md`](../../infra/supabase/DOSSIER.md#próximos-passos).

## Fontes de verdade

1. Pedido explícito atual do usuário e regras globais do monorepo em [`../../AGENTS.md`](../../AGENTS.md).
2. Regras específicas deste componente em [`AGENTS.md`](./AGENTS.md).
3. Contratos ativos em `skills/*/SKILL.md`, referências e `tests/beta-routing-cases.json`.
4. Este dossier para estado, decisões registradas, histórico e pendências.
5. Inventários, snapshots em `docs/migration/` e árvore Git até `fd7c090bb25b7b9086de9ebea38a1680df6bddb4` para proveniência, não como instruções vigentes sem reconciliação.

Para identidade e comportamento de publicação do Sites/MCP, consultar [`../../docs/components/sites.md`](../../docs/components/sites.md) e [`../../mcp/movidesk/DOSSIER.md`](../../mcp/movidesk/DOSSIER.md). Para regras e estado do conhecimento Supabase, consultar [`../../infra/supabase/DOSSIER.md`](../../infra/supabase/DOSSIER.md). Em conflito, preservar a evidência, identificar escopo/data e aplicar a precedência explícita; não apagar divergências silenciosamente.
