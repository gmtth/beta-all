# Supabase da base de conhecimento

O projeto Supabase escolhido para o piloto usa PostgreSQL e `pgvector`. A integração do MCP acessa a Data API/PostgREST por HTTPS a partir do servidor; o runtime Workers não abre conexão TCP direta ao PostgreSQL.

## Estado confirmado pela documentação e pelo código

- Schema `beta` com `source_system`, `source_record` e `record_chunk`.
- `pgvector` habilitado; RLS ativo nas três tabelas; `service_role` tem acesso de leitura descrito no registro da configuração.
- A Data API expõe o schema `beta` e as tabelas. Isso não substitui a autorização OAuth no MCP.
- A ferramenta inicial `knowledge_list_sources` exige `knowledge:read`, limita a resposta a dez fontes e consulta `beta.source_system`.
- O teste manual registrado anteriormente encontrou Movidesk, ClickUp e Documentos administrativos.

## Migrações reproduzíveis

Ainda não foi encontrada uma migração versionada que crie integralmente o schema `beta`, políticas RLS, índices vetoriais, grants e funções de busca. Não criar migração de produção a partir de screenshots ou nomes de tabela. Primeiro comparar com o DDL real do Supabase e depois versionar o estado confirmado em `migrations/`.

## Segredos e configuração

Configurar no ambiente do servidor apenas `SUPABASE_URL` e `SUPABASE_SECRET_KEY`, com valores guardados no gerenciador de segredos do host. Nunca colocar a chave secreta em arquivos do plugin, navegador, commits ou contexto retornado ao modelo. Uma chave compartilhada anteriormente na conversa foi considerada comprometida; usar apenas uma chave rotacionada e ativa.

O acesso service-role ignora RLS. A autorização do usuário, classificação, filtros por cliente e limites de contexto devem ser aplicados pelo backend antes de responder. Manter operações estreitas e seleção explícita de colunas.

## Próximas etapas

1. Exportar o DDL real sem linhas de dados e compará-lo com `source_system`, `source_record` e `record_chunk`.
2. Registrar migrações versionadas e caminho de rollback, sem dados sensíveis.
3. Implementar ingestão idempotente, busca lexical e vetorial, filtros de autorização, reranking e citações.
4. Manter histórico de conversas separado do conhecimento validado, sem chain-of-thought.
5. Validar limites do plano, backup, retenção e recuperação antes de produção.
