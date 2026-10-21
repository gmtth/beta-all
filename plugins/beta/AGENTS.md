# Suite Beta — contexto do projeto

## Execução dentro do monorepositório

O repositório Git e o diretório de trabalho únicos são a raiz `beta-all/`; este componente está em `plugins/beta/`. Leia primeiro o `AGENTS.md` da raiz e este arquivo. Para comandos abaixo que usam caminhos relativos (`scripts/`, `.codex-plugin/`, `skills/`), execute-os com o diretório atual em `plugins/beta/`. Faça commits no repositório monorepo, respeitando o escopo da pasta.

## Objetivo

Este projeto empacota a família Beta em um único plugin do Codex. A entrada principal é a skill `beta`, responsável por escolher e consolidar os modos Beta ANL e Beta MOD.

## Arquitetura ativa

- `skills/beta/`: única orquestradora automática e control plane.
- `skills/beta-anl-*`: módulos de análise funcional, QA, ClickUp e Movidesk.
- `skills/beta-anl-clickupchecklist/`: sincronização controlada de checklist comentado do ClickUp.
- `skills/beta-mod-*`: módulos especializados de modelagem funcional.
- `skills/beta-mod-sites/`: materialização de clone web isolado do CENCIHUB.
- `skills/beta/references/protocolo-evidencias-e-handoffs.md`: protocolo transversal obrigatório.
- `references/`: Knowledge Master, integridade e material de apoio compartilhado.
- `tests/beta-routing-cases.json`: matriz de contratos de roteamento.
- `scripts/`: validações estruturais e de cobertura do roteamento.

As antigas orquestradoras `beta-anl-router` e `beta-mod` não fazem parte da pasta ativa do plugin. Seus contratos foram incorporados à `beta`; cópias de auditoria ficam fora do plugin e não são necessárias para sua execução.

## Invocação

- `$beta` pode ser invocada implicitamente e é a entrada principal.
- As subskills `beta-anl-*` e `beta-mod-*` são explicitamente invocáveis e possuem `allow_implicit_invocation: false`.
- A `beta` pode encaminhar para uma subskill quando isso for necessário para concluir a intenção primária.
- Nomes de subskills especializadas não devem ser renomeados sem atualizar referências, metadados, testes e documentação.

## Padrão de nomenclatura

- `beta` sem sufixo é reservado exclusivamente à skill orquestradora.
- Identificadores técnicos das skills especializadas seguem `beta-[anl|mod]-identificação`: use `anl` para análise e `mod` para modelagem. Quando a skill for ligada a uma ferramenta, escreva primeiro o nome da ferramenta dentro da identificação, por exemplo `beta-anl-movidesk`, `beta-anl-clickupchecklist`, `beta-anl-clickupgeradorcards`, `beta-mod-figma` e `beta-mod-sites`.
- Mantenha os identificadores técnicos estáveis entre a pasta da skill e o `name` em `SKILL.md`. Se um identificador técnico mudar, atualize no mesmo conjunto o roteamento e os handoffs da orquestradora, referências textuais, `agents/openai.yaml`, testes/fixtures e documentação. Preserve o nome antigo apenas onde for necessário registrar compatibilidade ou histórico.
- Em conteúdo interno do pacote, use sempre o identificador técnico (`beta-anl-*`, `beta-mod-*` ou `beta`) ao referenciar uma skill, inclusive em títulos de `SKILL.md`, roteamento, handoffs, exemplos de invocação, documentação e validações. Use `display_name`/nome exibido apenas em metadados de interface ou quando o texto for deliberadamente voltado ao usuário e a identidade visual for relevante. Não use o nome exibido como substituto do identificador em contratos internos.
- O nome exibido da orquestradora é `Beta`. As demais skills não devem começar com `Beta`, `ANL` ou `MOD`, nem usar travessão no nome exibido. Se forem relacionadas a uma ferramenta, escreva o nome da ferramenta primeiro também no nome exibido, por exemplo `ClickUp Cards` e `ClickUp Checklist`. Prefira nomes curtos e explicativos de duas palavras; use até três quando necessário para clareza.
- Mudar apenas o nome exibido em `agents/openai.yaml` não altera o identificador técnico nem exige renomear a pasta ou atualizar chamadas. Essa alteração ainda deve ser refletida no dossier e nos artefatos de publicação pertinentes.
- Uma padronização de nomes existentes deve ser feita como migração coordenada: atualizar identificadores e referências juntos, rodar os validadores de skills e roteamento e revisar o pacote. Não renomear skills como efeito colateral de uma mudança apenas de nomes exibidos.

## Padrão visual e metadados

- Toda skill ativa deve ter metadados completos em `agents/openai.yaml`: `display_name`, `short_description`, `icon_small`, `icon_large`, `brand_color`, `default_prompt` e `policy.allow_implicit_invocation`.
- Sempre preencher `brand_color`, `icon_small` e `icon_large`. Os dois campos de logo podem apontar para o mesmo asset ou para assets pequeno/grande separados, desde que ambos existam, sejam legíveis e estejam versionados dentro da pasta da skill.
- Por padrão, as skills ANL reutilizam o logo ANL canônico já existente e as skills MOD reutilizam o logo MOD canônico já existente. Exceções por ferramenta ou produto são permitidas, como Movidesk e Sites; mantenha seus logos/cores próprios quando isso fizer parte da identidade visual aprovada. Registre novas exceções no dossier.
- Mantenha a paleta padrão consistente dentro de cada família. Use cores em hexadecimal, preserve exceções explícitas e confira contraste/legibilidade antes de introduzir uma cor nova. Não substitua assets existentes sem verificar seu uso e identidade.
- `display_name` deve seguir o padrão de nomenclatura. `short_description` deve resumir a função específica sem duplicar o nome; `default_prompt` deve ser curto, funcional e usar o identificador técnico vigente quando invocar a skill.
- `policy.allow_implicit_invocation` deve ser `true` somente para a orquestradora `beta` e `false` para skills especializadas. Sempre declare `dependencies.tools` quando a skill depender de uma ferramenta ou conexão externa que o formato e o runtime suportem. Não invente dependências nem copie configuração de outro conector; se não houver integração suportada/verificada, registre a limitação e não declare uma dependência fictícia.
- No manifesto do plugin, mantenha também `interface.brandColor`, `interface.composerIcon` e `interface.logo` preenchidos, junto aos metadados descritivos e funcionais exigidos pelo formato de pacote. Verifique limites de tamanho e quantidade definidos pelo formato antes de empacotar.
- Ao validar metadados, conferir também que todo caminho de logo é relativo, existe dentro da pasta da skill e aponta para o asset correto; que a cor está em hexadecimal; e que prompt, nome e política correspondem à função e ao modo da skill.

## Versionamento do plugin e das skills

- O manifesto `.codex-plugin/plugin.json` deve usar `version` como SemVer válido. A contagem inicial é `1.0.0`; a cada alteração no pacote, incrementar o patch em exatamente um (`1.0.1`, `1.0.2`...), sem saltos. O contador do pacote cobre qualquer alteração incluída no plugin.
- Cada `SKILL.md` deve ter `metadata.version` como string numérica, começando em `"1"`. A cada alteração no conteúdo, instruções ou metadados daquela skill, incrementar esse número em exatamente um. Skills não alteradas mantêm suas versões.
- Toda mudança em uma skill também é uma alteração do pacote: atualizar a versão da skill afetada e incrementar o patch do plugin. Uma mudança compartilhada apenas fora das skills incrementa apenas a versão do plugin.
- Essas versões são contadores simples de revisão, não sinalizam compatibilidade ou impacto. Não usar SemVer nas skills nem números não inteiros; não omitir aspas em `metadata.version`, pois o formato de skills requer valores de metadata como strings.
- Ao revisar, conferir que o plugin começa na versão inicial `1.0.0`, todas as skills foram inicializadas em `"1"`, e que cada alteração posterior incrementa apenas os contadores correspondentes. Registrar o escopo da versão no dossier e manter o manifesto sincronizado com a release publicada.

## Regras de comportamento

- Carregar o protocolo transversal antes de rotear ou responder diretamente por uma subskill.
- Escolher um modo primário (`ANL` ou `MOD`) e evitar acionar módulos sem necessidade.
- Fazer transições ANL ↔ MOD somente quando uma decisão ou evidência material exigir isso.
- Não transformar ticket em regra, requisito, comportamento esperado ou causa raiz isoladamente.
- Não transformar hipótese em diagnóstico.
- Manter Dossiê, QA, filtro de publicação e artefatos conforme as regras do modo MOD.
- Operar conectores em somente leitura quando assim definido pela skill ou MCP. A exceção atual é a importação explícita de um chamado para a base interna Supabase, descrita na skill Movidesk; ela nunca altera o chamado de origem.
- Não simular acesso a Movidesk, ClickUp, Figma ou qualquer outro conector.
- `beta-anl-clickupchecklist` só pode ser invocada com link explícito de tarefa ou comentário do ClickUp e só pode alterar o comentário de checklist determinado pelo seu contrato.
- `beta-mod-sites` permanece isolada do backend, API, banco, autenticação e ambientes reais do CENCIHUB.
- Preservar regras específicas de cada subskill; alterações transversais devem ser feitas no protocolo compartilhado e refletidas nos testes.

## MCP

O arquivo `.mcp.json` declara o servidor `movidesk` em modo HTTP:

```text
https://movidesk-oauth-proxy-pkce.thngrns.chatgpt.site/mcp/
```

Preserve a barra final de `/mcp/`. As consultas ao Movidesk são somente leitura; a única escrita permitida é a importação explícita e auditada de chamados para a base interna, conforme a skill Movidesk e os escopos OAuth `movidesk:read`, `knowledge:read` e `knowledge:write`. Nunca incluir tokens ou segredos no repositório.

## Validação local

No diretório `plugins/beta/`, execute:

```text
python scripts/validate_beta_anl_skills.py
python scripts/validate_beta_routing_cases.py
```

Também confira:

- JSON válido em `.codex-plugin/plugin.json`;
- `SKILL.md` e `agents/openai.yaml` em cada skill ativa;
- nomes, descrições curtas, prompts padrão e políticas de invocação completos e coerentes;
- `brand_color`, `icon_small` e `icon_large` preenchidos, com assets existentes e corretos;
- links relativos para referências válidos;
- ausência de caminhos absolutos, tokens e referências a diretórios externos;
- cobertura das 19 subskills especializadas na matriz de roteamento.

## Preservação de fontes

Arquivos `references/origem-*.md` são fontes de rastreabilidade e não devem ser reescritos durante ajustes de estilo ou roteamento. Regras específicas devem permanecer na skill correspondente. O protocolo compartilhado não substitui conteúdo especializado.

## Estrutura obrigatória dos dossiers

Todo dossier ativo deste componente deve seguir esta ordem fixa de seções, usando estes títulos:

1. `## Resumo e escopo` — finalidade, limites do componente, caminho canônico e limites de reconstrução quando aplicável.
2. `## Estado atual` — fatos observáveis com data de referência, versão/integrações, estado de validação e limites conhecidos. Não apresentar estados históricos como atuais.
3. `## Decisões vigentes` — decisões aprovadas e regras de referência; distinguir claramente o que está confirmado do que foi substituído.
4. `## Mapa dos componentes` — diretórios, arquivos e relações necessários para localizar e entender a implementação.
5. `## Histórico de mudanças` — marcos em ordem cronológica, com data, estado, evidência e impacto; preservar proveniência sem reescrever o passado.
6. `## Próximos passos` — backlog ativo, com tarefa, prioridade, evidência/contexto e condição para conclusão; remover itens comprovadamente resolvidos.
7. `## Fontes de verdade` — links para instruções e fontes canônicas, com ordem de precedência e tratamento de snapshots/legado.

No início do documento, informar a data de atualização e o componente. Use tabelas para mudanças ou estados que precisem ser comparados. Mantenha cada fato na fonte canônica e resuma com links nos demais dossiers; não replique conteúdo operacional completo. Se uma seção não tiver conteúdo, mantenha o título e escreva “Nenhuma pendência conhecida” ou “Sem histórico adicional identificado”, em vez de omiti-la. Orientações sobre como editar dossiers ficam no `AGENTS.md`, não como uma seção extra que altere a ordem fixa.

Ao identificar trabalho futuro ou receber pedido para guardar um item, adicione-o a `## Próximos passos` no dossier canônico. Lembre ocasionalmente os itens em aberto quando a tarefa se relacionar a eles. Ao verificar que um item foi concluído, retire-o dessa seção e registre a evidência em `## Histórico de mudanças` ou `## Estado atual`. Backlog não significa autorização para executar.

## Empacotamento

O manifesto do plugin é `.codex-plugin/plugin.json`. O diretório `skills/`, `.mcp.json`, `assets/`, `references/`, `scripts/`, `tests/` e este `AGENTS.md` fazem parte do projeto e devem acompanhar o commit destinado ao GitHub.

O marketplace compartilhado tem sua fonte canônica em `../../.agents/plugins/marketplace.json`, na raiz do monorepo `gmtth/beta-all`, e aponta para este diretório. Faça mudanças neste pacote dentro do monorepo; depois de enviadas ao GitHub, elas chegam ao workspace pela sincronização do marketplace. A sincronização não autoriza os analistas no MCP: cada pessoa continua precisando de acesso ao plugin e autorização OAuth individual. Como este pacote declara MCP em `.mcp.json`, confirme a disponibilidade no cliente pretendido; a importação pode marcar o plugin como Desktop only.

Antes de publicar:

1. executar todas as validações;
2. revisar `git status` e o diff completo;
3. confirmar que não há segredos, caches ou arquivos temporários;
4. confirmar que a versão do manifesto corresponde à release;
5. só então criar commit, tag e release.
