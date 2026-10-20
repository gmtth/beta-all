# Plugin e skills

O plugin ativo e suas skills ficam em `plugins/beta/`. Preserve manifesto, `.mcp.json`, skills, referências, assets, scripts e testes no mesmo diretório; as instruções específicas estão em [`AGENTS.md`](../../plugins/beta/AGENTS.md).

As versões standalone antigas de ClickUp e as skills/subplugins fixadas pelo agregador antigo foram importadas com história em `legacy/source-archives/`. Elas não foram ativadas nem inseridas no roteamento atual. Em especial, `skill-clickup-sprint-export` pode apoiar no futuro a ingestão de cartões concluídos, mas deve ser avaliada como mudança funcional separada antes de entrar no manifesto/roteador do plugin.

O plugin guarda uma referência ao endpoint MCP publicado. A alteração do endpoint ou a publicação do plugin devem ser coordenadas com o runtime em `mcp/movidesk/`.
