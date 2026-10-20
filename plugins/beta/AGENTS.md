# Suite Beta — contexto do projeto

## Objetivo

Este projeto empacota a família Beta em um único plugin do Codex. A entrada principal é a skill `beta`, responsável por escolher e consolidar os modos Beta ANL e Beta MOD.

## Arquitetura ativa

- `skills/beta/`: única orquestradora automática e control plane.
- `skills/beta-anl-*`: módulos de análise funcional, QA, ClickUp e Movidesk.
- `skills/beta-clk-checklist/`: sincronização controlada de checklist comentado do ClickUp.
- `skills/beta-mod-*`: módulos especializados de modelagem funcional.
- `skills/beta-sites/`: materialização de clone web isolado do CENCIHUB.
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

## Regras de comportamento

- Carregar o protocolo transversal antes de rotear ou responder diretamente por uma subskill.
- Escolher um modo primário (`ANL` ou `MOD`) e evitar acionar módulos sem necessidade.
- Fazer transições ANL ↔ MOD somente quando uma decisão ou evidência material exigir isso.
- Não transformar ticket em regra, requisito, comportamento esperado ou causa raiz isoladamente.
- Não transformar hipótese em diagnóstico.
- Manter Dossiê, QA, filtro de publicação e artefatos conforme as regras do modo MOD.
- Operar conectores em somente leitura quando assim definido pela skill ou MCP.
- Não simular acesso a Movidesk, ClickUp, Figma ou qualquer outro conector.
- `beta-clk-checklist` só pode ser invocada com link explícito de tarefa ou comentário do ClickUp e só pode alterar o comentário de checklist determinado pelo seu contrato.
- `beta-sites` permanece isolada do backend, API, banco, autenticação e ambientes reais do CENCIHUB.
- Preservar regras específicas de cada subskill; alterações transversais devem ser feitas no protocolo compartilhado e refletidas nos testes.

## MCP

O arquivo `.mcp.json` declara o servidor `movidesk` em modo HTTP:

```text
https://movidesk-oauth-proxy-pkce.thngrns.chatgpt.site/mcp/
```

Preserve a barra final de `/mcp/`. A integração é somente leitura e não deve conter tokens ou segredos no repositório.

## Validação local

Na raiz do projeto, execute:

```text
python scripts/validate_beta_anl_skills.py
python scripts/validate_beta_routing_cases.py
```

Também confira:

- JSON válido em `.codex-plugin/plugin.json`;
- `SKILL.md` e `agents/openai.yaml` em cada skill ativa;
- ícones referenciados pelos metadados existentes;
- links relativos para referências válidos;
- ausência de caminhos absolutos, tokens e referências a diretórios externos;
- cobertura das 19 subskills especializadas na matriz de roteamento.

## Preservação de fontes

Arquivos `references/origem-*.md` são fontes de rastreabilidade e não devem ser reescritos durante ajustes de estilo ou roteamento. Regras específicas devem permanecer na skill correspondente. O protocolo compartilhado não substitui conteúdo especializado.

## Empacotamento

O manifesto do plugin é `.codex-plugin/plugin.json`. O diretório `skills/`, `.mcp.json`, `assets/`, `references/`, `scripts/`, `tests/` e este `AGENTS.md` fazem parte do projeto e devem acompanhar o commit destinado ao GitHub.

Antes de publicar:

1. executar todas as validações;
2. revisar `git status` e o diff completo;
3. confirmar que não há segredos, caches ou arquivos temporários;
4. confirmar que a versão do manifesto corresponde à release;
5. só então criar commit, tag e release.
