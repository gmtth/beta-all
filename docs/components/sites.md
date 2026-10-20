# Sites e publicação do runtime

O código do Site e do endpoint MCP HTTP está em `mcp/movidesk/`. A raiz publicada anteriormente era `https://movidesk-oauth-proxy-pkce.thngrns.chatgpt.site/`; o endpoint MCP configurado pelo plugin termina em `/mcp/`.

A importação para o monorepo não prova que Sites esteja conectado a este caminho nem publica alterações. Antes de mudar a origem de publicação, identificar o processo de build/empacotamento, validar o artefato esperado e registrar SHA e versão publicada. Manter a configuração atual até confirmar o novo fluxo e a compatibilidade do cliente MCP.
