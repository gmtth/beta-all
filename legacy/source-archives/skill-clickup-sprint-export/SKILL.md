---
name: clickup-sprint-export
description: Exportar sprints do CENCIHUB a partir do ClickUp para um arquivo Markdown padronizado, autossuficiente e otimizado para recuperação por IA, busca semântica e bases de conhecimento. Usar ao consultar, consolidar, documentar ou reexportar cards concluídos de uma sprint, especialmente históricos de QA, incidentes, causas, soluções, comentários, checklists, regressões, clientes, módulos e regras funcionais.
---

# ClickUp Sprint Export

Gerar um arquivo `.md` por sprint, adequado à leitura humana e à indexação em grande escala por IA.

Ler [references/formato-exportacao.md](references/formato-exportacao.md) integralmente antes de consultar o ClickUp ou produzir o arquivo. Seguir o schema, os vocabulários e a ordem das seções sem criar variantes.

## Princípios obrigatórios

- Preservar evidência histórica e separar fato, interpretação e sugestão.
- Não transformar incidente histórico em regra funcional geral.
- Não transformar hipótese em causa confirmada.
- Não considerar QA realizado apenas porque o card está fechado, entregue ou em Go Live.
- Não classificar o resultado de QA como aprovado, reprovado ou aprovado com ressalva sem evidência textual inequívoca desse resultado.
- Não converter narrativa do incidente em passos de reprodução; registrar passos somente quando a fonte apresentar uma sequência executável.
- Não inventar dados ausentes nem omitir campos por falta de informação.
- Tornar cada bloco de card autossuficiente para sobreviver à fragmentação na indexação.
- Usar termos estáveis e explícitos; evitar pronomes e referências vagas.
- Preservar literalmente campos personalizados, exceto pela redação de dados sensíveis.

## Entradas mínimas

Obter do pedido ou confirmar:

- sprint, lista ou URL correspondente;
- `list.id`, diretamente ou por consulta;
- número ou nome da sprint.

Se o usuário não indicar uma sprint identificável, pedir somente essa informação. Não pedir escolhas de formato: o formato é fixado pela referência.

## Fluxo de execução

### 1. Identificar a lista

Resolver `list.id`, nome da lista, número da sprint e período quando disponível. Tratar `list.id` como identificador principal.

### 2. Inventariar candidatos

Consultar todas as páginas da lista usando retorno resumido. Coletar ID, título, lista, status e datas necessárias ao filtro. Deduplicar por ID somente após concluir a paginação.

Não usar resultados de busca global como prova de pertencimento à sprint.

### 3. Filtrar antes de detalhar

Incluir somente cards que:

1. pertençam ao `list.id` confirmado; e
2. estejam em `Go Live`, `Entregue`, `Concluído` ou `Concluido`.

Aceitar outro status do tipo `closed` apenas quando a configuração da lista confirmar que ele é o status final equivalente. Não abrir detalhes nem comentários dos cards reprovados. Não incluir seção de descartados.

### 4. Enriquecer cards aprovados

Consultar uma vez cada recurso disponível e necessário:

- detalhe completo, descrição e metadados;
- responsáveis, tags, parent e checklists nativos;
- campos personalizados;
- comentários;
- metadados de anexos.

Priorizar `Solução aplicada`, `Causa do incidente`, `Ticket Movidesk`, `Branch`, `Comando`, `PR`, `Aberto por` e `Desenvolvedor`.

Usar retorno detalhado quando o resumido não expuser informação obrigatória. Não repetir indefinidamente consultas que não retornem o dado.

### 5. Interpretar com proveniência

Rotular conteúdo analítico:

- `[EXTRAÍDO]`: explicitamente presente na fonte;
- `[INTERPRETADO]`: síntese fiel sustentada pela fonte;
- `[SUGERIDO]`: enriquecimento para investigação ou validação futura;
- `[NÃO INFORMADO]`: ausente ou indeterminável, com marcador específico.

Nunca misturar validações históricas executadas com sugestões de testes futuros.

### 6. Redigir dados sensíveis

Substituir senhas, tokens, chaves, credenciais, telefones pessoais, e-mails sensíveis, links internos sensíveis e segredos por `[REDACTED]`. Registrar somente o tipo de dado redigido. Não repetir o valor original.

### 7. Gerar e validar o Markdown

Produzir exatamente um arquivo por sprint:

`historico_qa_incidentes_cencihub_sprint_XX.md`

Usar o modelo da referência e confirmar:

- paginação e deduplicação concluídas;
- lista e status validados;
- delimitadores únicos por card;
- seções obrigatórias presentes;
- vocabulários normalizados;
- custom fields preservados integralmente;
- estado das consultas representado corretamente;
- QA sustentado por evidência específica;
- anexos não tratados como analisados sem leitura;
- limitações concretas e status global coerente;
- ausência de dados sensíveis expostos.

Salvar o arquivo como artefato persistente e disponibilizá-lo ao usuário.

## Resposta final

Informar brevemente:

- status e sprint;
- candidatos encontrados e cards incluídos;
- cards com informação incompleta;
- comentários consultados;
- campos personalizados recuperados;
- cards com QA identificado;
- módulos e clientes principais;
- limitações;
- link do arquivo.

Não listar descartados nem explicar detalhes técnicos do processo.

