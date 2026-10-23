# Plugin e skills

O plugin ativo e suas skills ficam em `plugins/beta/`. Preserve manifesto, `.mcp.json`, skills, referências, assets, scripts e testes no mesmo diretório; as instruções específicas estão em [`AGENTS.md`](../../plugins/beta/AGENTS.md).

As versões standalone antigas de ClickUp e as skills/subplugins fixadas pelo agregador antigo foram importadas com história em `legacy/source-archives/` na árvore até `fd7c090bb25b7b9086de9ebea38a1680df6bddb4`; essa história continua recuperável no Git, embora a pasta tenha sido removida da árvore ativa. Elas não foram ativadas nem inseridas no roteamento atual. Em especial, `skill-clickup-sprint-export` pode apoiar no futuro a ingestão de cartões concluídos, mas deve ser avaliada como mudança funcional separada antes de entrar no manifesto/roteador do plugin.

O plugin guarda uma referência ao endpoint MCP publicado. A alteração do endpoint ou a publicação do plugin devem ser coordenadas com o runtime em `mcp/movidesk/`.
