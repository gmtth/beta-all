# Snapshots locais de Sites

`oauth-20261020/` é uma cópia sem `.git` do diretório local `MCP Movidesk/work/oauth-proxy`. Foram mantidos os arquivos de fonte e a configuração de hospedagem. O build que existia na origem está preservado em `dist.tar.gz`; não deixe o `dist/` expandido no Git porque alguns nomes gerados ultrapassam o limite padrão de checkout do Windows. Foram excluídos `node_modules`, `.next`, `.vinext` e `.wrangler`, que são dependências/cache reproduzíveis.

Este pacote não foi tratado como fonte ativa: não contém `knowledge_list_sources` nem a integração Supabase que está em `mcp/movidesk/`. O Site `Beta MCP` segue publicado externamente na versão 73; detalhes e limites estão em `docs/components/sites.md`.

Para restaurar o build, entre em `oauth-20261020/`, confira o arquivo compactado e extraia-o:

```sh
cd oauth-20261020
sha256sum -c SHA256SUMS.package.txt
tar -xzf dist.tar.gz
sha256sum -c SHA256SUMS.txt
```

O manifesto `SHA256SUMS.txt` valida os arquivos do snapshot depois que `dist/` é restaurado. Os 96 arquivos do build arquivado foram extraídos em uma área temporária e comparados individualmente com seus hashes originais antes da remoção da cópia expandida. O checkout original continua intacto.
