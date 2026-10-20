# Garantias do legado preservadas

## Objetivo

Preservar garantias funcionais relevantes do GPT Mestre legado sem copiar integralmente os antigos `.md` para a orquestradora.

## Garantias preservadas

1. Autoridade única da Beta MOD sobre a consolidação final.
2. Dossiê como estado operacional, não como fonte autônoma.
3. `@beta-mod-regras` e `@beta-mod-dossie` como transversais.
4. Roteamento por assunto para especialidades.
5. `@beta-mod-qa` antes da finalização.
6. Fontes concorrentes tratadas por prioridade/vigência, sem desempate silencioso.
7. Estados Confirmada, Pendente, Divergente, Substituída e Histórica.
8. Destinos MODELAGEM, CONTEXTO — NÃO PUBLICAR e FORA DO ESCOPO.
9. Atualização do Dossiê na mesma interação após informação relevante.
10. Filtro de publicação antes de modelagem/artefato.
11. Preservação de decisões aprovadas.
12. Documento alterado pelo usuário tratado como nova base quando assim declarado.
13. Linguagem funcional sem invenção de arquitetura.
14. Completude por gatilho, condição, ação, validação, resultado, falha, continuidade e rastreabilidade.
15. Diferenciação de atores, registros, canais, permissões e empresa.
16. Tratamento de mensagens, cancelamento, fechamento, falha e estado anterior quando aplicável.
17. Relatórios/cálculos reproduzíveis quando aplicáveis, via Skill especializada.
18. Processamento, retry, concorrência e idempotência funcional via Skill especializada.
19. Artefatos somente após consolidação funcional.
20. Dossiê separado da Modelagem Funcional.
21. QA como gate que pode reabrir análise temática.
22. Uma única interpretação final, sem modelagens concorrentes por Skill.

## Melhorias arquiteturais sobre o legado

- substituir dependências de arquivos `.md` internos por Skills especializadas;
- adotar progressive loading;
- impedir achados órfãos entre módulos;
- explicitar ciclo de reconsulta entre Skills;
- explicitar critério de fechamento funcional versus abertura técnica;
- separar QA funcional de QA documental;
- incluir observabilidade operacional sem cadeia de pensamento.

O objetivo não é equivalência textual do legado; é equivalência e fortalecimento das garantias funcionais.
