# Homologação do MCP Movidesk

Este diretório guarda a identidade do Site separado de homologação. O runtime fonte continua canônico em `mcp/movidesk/`; sincronize-o explicitamente com `npm run sites:sync -- <checkout> --target homolog`.

O binding `DB` pertence ao Site de homologação e deve permanecer independente da base D1 de Produção. Nunca copiar ou trocar o `project_id` de produção. Segredos de Movidesk e Supabase não são herdados do Sites de Produção: configurá-los no ambiente de homologação por procedimento próprio, sem gravá-los no Git. Se um segredo de integração não estiver configurado, a capacidade correspondente não estará pronta para smoke funcional.

Endpoint MCP: `https://beta-mcp-homolog.thngrns.chatgpt.site/mcp/`

Discovery OAuth: `https://beta-mcp-homolog.thngrns.chatgpt.site/.well-known/oauth-authorization-server`

Em 2026-11-27 foi publicada a v1 e passaram os smokes HTTP/OAuth básicos. Para validar chamadas reais às ferramentas, configure neste Site os segredos próprios `MOVIDESK_TOKEN`, `SUPABASE_URL` e `SUPABASE_SECRET_KEY`; não reutilize os de Produção automaticamente.
