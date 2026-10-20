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

## Regras de comportamento

- Carregar o protocolo transversal antes de rotear ou responder diretamente por uma subskill.
- Escolher um modo primário (`ANL` ou `MOD`) e evitar acionar módulos sem necessidade.
- Fazer transições ANL ↔ MOD somente quando uma decisão ou evidência material exigir isso.
- Não transformar ticket em regra, requisito, comportamento esperado ou causa raiz isoladamente.
- Não transformar hipótese em diagnóstico.
- Manter Dossiê, QA, filtro de publicação e artefatos conforme as regras do modo MOD.
- Operar conectores em somente leitura quando assim definido pela skill ou MCP.
- Não simular acesso a Movidesk, ClickUp, Figma ou qualquer outro conector.
- `beta-anl-clickupchecklist` só pode ser invocada com link explícito de tarefa ou comentário do ClickUp e só pode alterar o comentário de checklist determinado pelo seu contrato.
- `beta-mod-sites` permanece isolada do backend, API, banco, autenticação e ambientes reais do CENCIHUB.
- Preservar regras específicas de cada subskill; alterações transversais devem ser feitas no protocolo compartilhado e refletidas nos testes.

## MCP

O arquivo `.mcp.json` declara o servidor `movidesk` em modo HTTP:

```text
https://movidesk-oauth-proxy-pkce.thngrns.chatgpt.site/mcp/
```

Preserve a barra final de `/mcp/`. A integração é somente leitura e não deve conter tokens ou segredos no repositório.

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

## Empacotamento

O manifesto do plugin é `.codex-plugin/plugin.json`. O diretório `skills/`, `.mcp.json`, `assets/`, `references/`, `scripts/`, `tests/` e este `AGENTS.md` fazem parte do projeto e devem acompanhar o commit destinado ao GitHub.

O marketplace compartilhado tem sua fonte canônica em `../../.agents/plugins/marketplace.json`, na raiz do monorepo `gmtth/beta-all`, e aponta para este diretório. Faça mudanças neste pacote dentro do monorepo; depois de enviadas ao GitHub, elas chegam ao workspace pela sincronização do marketplace. A sincronização não autoriza os analistas no MCP: cada pessoa continua precisando de acesso ao plugin e autorização OAuth individual. Como este pacote declara MCP em `.mcp.json`, confirme a disponibilidade no cliente pretendido; a importação pode marcar o plugin como Desktop only.

Antes de publicar:

1. executar todas as validações;
2. revisar `git status` e o diff completo;
3. confirmar que não há segredos, caches ou arquivos temporários;
4. confirmar que a versão do manifesto corresponde à release;
5. só então criar commit, tag e release.
