# Formato de exportação de sprint

## Sumário

1. Objetivo
2. Marcadores normalizados
3. Status global
4. Estrutura do documento
5. Modelo por card
6. Regras de preenchimento
7. Vocabulários controlados
8. Checklist de qualidade

## 1. Objetivo

Produzir Markdown para bases de conhecimento e recuperação por IA. Um arquivo representa uma sprint. Cada card deve ser uma unidade autossuficiente, com identificador e contexto próprios, campos estáveis, títulos previsíveis, delimitadores explícitos e fatos separados de inferências.

Evitar tabelas extensas nos cards. Usar listas de chave e valor, listas simples e parágrafos curtos.

## 2. Marcadores normalizados

Usar exatamente:

- `não informado no ClickUp`: a fonte foi consultada e não contém o dado;
- `não recuperado`: o recurso ou campo existe, mas a consulta não expôs o conteúdo;
- `não consultado`: nenhuma consulta ocorreu;
- `indisponível`: houve tentativa sem conteúdo utilizável;
- `não identificado`: o conteúdo não permite determinar o resultado;
- `não classificado`: evidência insuficiente para classificar;
- `não validado`: não há comprovação de validação;
- `não se aplica`: campo legitimamente inaplicável;
- `nenhum`: consulta concluída e conjunto comprovadamente vazio.

Não usar `N/A`, pois mistura ausência, inaplicabilidade e falha de recuperação.

Proveniência: `[EXTRAÍDO]`, `[INTERPRETADO]`, `[SUGERIDO]` ou `[NÃO INFORMADO]`.

## 3. Status global

- `completa`: paginação, filtros, detalhes e recursos obrigatórios concluídos sem limitação material.
- `parcial`: universo e filtros confiáveis, mas parte de comentários, custom fields ou anexos não foi recuperada.
- `incompleta`: falha que compromete universo, paginação, lista, status ou identificação dos cards.

## 4. Estrutura do documento

Usar esta ordem fixa:

```markdown
---
tipo_documento: historico_qa_incidentes_cencihub
versao_schema: "3.0-md"
sprint_numero: "XX"
sprint_nome: "Sprint XX"
clickup_list_id: "LIST_ID"
periodo_sprint: "AAAA-MM-DD a AAAA-MM-DD | não informado no ClickUp"
data_exportacao: "AAAA-MM-DDTHH:MM:SSZ"
status_exportacao: "completa | parcial | incompleta"
total_cards_incluidos: 0
---

# Sprint XX — Histórico de QA e incidentes CENCIHUB

## Resumo da exportação

- Status: ...
- Lista ClickUp: NOME (`LIST_ID`)
- Período: ...
- Data da exportação: ...
- Total de candidatos encontrados: 0
- Total de cards incluídos: 0
- Cards com informação incompleta: 0
- Cards com comentários consultados: 0
- Cards com campos personalizados recuperados: 0
- Cards com QA identificado: 0
- Módulos principais: ...
- Clientes identificados: ...
- Tipos de ocorrência: ...
- Limitações: nenhuma | descrição concreta

## Índice de cards

- `CLICKUP_ID` — Título original — módulo — cliente — tipo — status

## Cards

<!-- CARD_START id="CLICKUP_ID" sprint="XX" list_id="LIST_ID" -->

## CARD CLICKUP_ID — Título original

[modelo obrigatório por card]

<!-- CARD_END id="CLICKUP_ID" -->
```

Ordenar por data de fechamento decrescente e, em caso de empate, por ID. Manter a mesma ordem no índice e nos blocos.

## 5. Modelo por card

Repetir sem remover seções vazias:

```markdown
<!-- CARD_START id="CLICKUP_ID" sprint="XX" list_id="LIST_ID" -->

## CARD CLICKUP_ID — Título original

### Identidade e recuperação

- ID ClickUp: `CLICKUP_ID`
- Sprint: `XX — NOME_DA_SPRINT`
- Lista ClickUp: `LIST_ID — NOME_DA_LISTA`
- Tarefa pai: `PARENT_ID | não se aplica | não informado no ClickUp`
- É subtarefa: `sim | não`
- Status final: `VALOR_ORIGINAL`
- Cliente: `NOME | não informado no ClickUp`
- Cliente/base ID: `ID | não informado no ClickUp`
- Ambiente: `produção | homologação | desenvolvimento | base específica | não informado no ClickUp`
- Módulo principal: `VOCABULÁRIO_CONTROLADO`
- Menus, telas ou fluxos: `lista | nenhum | não informado no ClickUp`
- Tipo de ocorrência: `VOCABULÁRIO_CONTROLADO`
- Natureza: `VOCABULÁRIO_CONTROLADO`
- Severidade funcional: `baixa | média | alta | crítica | não informado no ClickUp`
- Áreas impactadas: `lista normalizada`
- Palavras-chave discriminativas: `termo 1; termo 2; termo 3`

### Metadados do ClickUp

- Criador: ...
- Responsáveis: ...
- Prioridade: ...
- Tags: ...
- Data de criação: ...
- Data de início: ...
- Data de vencimento: ...
- Data de fechamento: ...
- Tempo gasto: ...
- Desenvolvedor: ...
- Aberto por: ...

### Referências técnicas

- Ticket Movidesk: ...
- Branch: ...
- PR: ...
- Comando: ...
- Cards relacionados: `somente IDs reais | nenhum | não informado no ClickUp`
- Integrações ou sistemas citados: ...
- Relatórios impactados: ...
- Históricos ou auditorias impactados: ...
- Movimentações de estoque impactadas: ...
- Jobs, rotinas ou filas citados: ...
- Logs ou erros citados: ...

### Resumo funcional

#### Problema ou demanda

[INTERPRETADO] Resumo fiel e autossuficiente.

#### Comportamento observado

[EXTRAÍDO ou INTERPRETADO] ...

#### Comportamento esperado

[EXTRAÍDO ou NÃO INFORMADO] ...

#### Cenário e reprodução

- Cenário: ...
- Passos explicitamente registrados:
  1. ...
- Exemplos e dados citados: ...
- Parâmetros e configurações citados: ...

### Regras de negócio identificadas

- [EXTRAÍDO] ...
- [NÃO INFORMADO] não informado no ClickUp

### Evidências

- Tipo: `texto | comentário | checklist | log | print | vídeo | planilha | PDF | outro`
  - Origem/contexto: ...
  - Nome ou referência: ...
  - Conteúdo analisado: `sim | não`
  - Síntese permitida: ...

### Campos personalizados preservados

#### Solução aplicada

> [valor integral | não informado no ClickUp | não recuperado]

#### Causa do incidente

> [valor integral | não informado no ClickUp | não recuperado]

#### Outros campos

- Ticket Movidesk: `[valor integral]`
- Branch: `[valor integral]`
- Comando: `[valor integral]`
- PR: `[valor integral]`
- Aberto por: `[valor integral]`
- Desenvolvedor: `[valor integral]`

### Histórico e resultado de QA

#### Consulta aos comentários

- Status: `encontrado | não encontrado | não consultado | indisponível`
- Comentários consultados: `sim | não`

#### Último checklist de testes relevante

- Status: `encontrado | não encontrado | não consultado | indisponível`
- Data: ...
- Autor: ...
- Itens extraídos:
  - [EXTRAÍDO] ...

#### Último registro relevante de QA

- Status: `encontrado | não encontrado | não consultado | indisponível`
- Tipo: `checklist | validação_qa | smoke | regressão | revisão | reprovação | aprovação | ajuste_solicitado | outro | não identificado`
- Data: ...
- Autor: ...
- Resumo fiel: ...
- Itens de validação:
  - [EXTRAÍDO] ...

#### Resultado consolidado de QA

- Houve QA: `sim | não | não identificado`
- Resultado final: `aprovado | reprovado | aprovado_com_ressalva | não_testado | skip_qa | não identificado`
- Houve revisão: `sim | não | não identificado`
- Quantidade de revisões: `número | não identificado`
- Validado para entrega: `sim | não | não identificado`

#### Validações realizadas

- [EXTRAÍDO] Somente testes comprovadamente executados.

#### Validações pendentes

- [EXTRAÍDO ou INTERPRETADO] ...

### Diagnóstico e solução

#### Sintomas para correlação

- [INTERPRETADO] ...

#### Causa confirmada

[EXTRAÍDO] ... | [NÃO INFORMADO] não informado no ClickUp

#### Hipóteses de triagem

- [EXTRAÍDO ou INTERPRETADO] ...

#### Solução registrada

[EXTRAÍDO] ... | [NÃO INFORMADO] não informado no ClickUp

#### Como conferir casos semelhantes

- [SUGERIDO] ...

#### Como validar uma correção futura

- [SUGERIDO] ...

#### Riscos de regressão

- [INTERPRETADO] ...

### Dados internos úteis

- Nomes técnicos: ...
- IDs de bases: ...
- IDs de máquinas: ...
- IDs ou matrículas de funcionários: ...
- IDs ou códigos de produtos: ...

### Recuperação semântica

- Pergunta que este card responde: ...
- Pergunta que este card responde: ...
- Assinatura do incidente: `módulo + fluxo + sintoma + contexto discriminativo`

### Limitações e segurança

- Descrição incompleta: `sim | não`
- Causa não informada: `sim | não | indeterminável por falha de recuperação`
- Solução não informada: `sim | não | indeterminável por falha de recuperação`
- Sem evidência textual: `sim | não`
- Campos personalizados recuperados: `sim | parcialmente | não | indisponível`
- Comentários recuperados: `sim | não | indisponível`
- Anexos consultados: `sim | não | indisponível`
- Dados sensíveis redigidos: `sim | não`
- Tipos de dados redigidos: ...
- Observações concretas: ...

### Escopo histórico

- Não usar como regra geral: `sim | não`
- Motivos: `exceção | correção pontual | script manual | ajuste emergencial | específico de cliente | dado histórico | incidente isolado | workaround | dependente de versão/configuração | evidência insuficiente | nenhum`

### Proveniência da análise

- Validações realizadas: `extraído | interpretado | misto | não informado`
- Como validar correção futura: `sugerido pelo extrator | misto | não informado`
- Riscos de regressão: `extraído | interpretado | misto | não informado`
- Como conferir casos semelhantes: `extraído | interpretado | sugerido pelo extrator | misto | não informado`

### Fonte da extração

- Nível de detalhe: `summary | detailed | misto`
- Campos personalizados consultados: `sim | não | indisponível`
- Comentários consultados: `sim | não | indisponível`
- Anexos consultados: `sim | não | indisponível`
- Consultado em: `AAAA-MM-DDTHH:MM:SSZ`
- Observação: ...

<!-- CARD_END id="CLICKUP_ID" -->
```

## 6. Regras de preenchimento

### Campos personalizados

Copiar integralmente valores reais. Não resumir, corrigir, reescrever ou completar com descrição, comentários ou inferência. Diferenciar campo vazio de campo existente não recuperável.

### Comentários e checklists

Consultar comentários uma vez por card aprovado quando disponível. Extrair o comentário mais recente que contenha checklist, testes, smoke, regressão, validações ou cenários de QA. O checklist desta seção deve vir de comentários, nunca da descrição.

Registrar também o comentário mais recente que represente atividade de QA, mesmo sem checklist. Não transformar comentário ambíguo em aprovação ou reprovação.

Usar `não encontrado` somente após consulta efetiva; `indisponível` após tentativa sem retorno; `não consultado` sem tentativa.

### Resultado de QA

Marcar que houve QA somente com evidência de execução. Marcar `não` apenas quando a ausência estiver explícita. Nos demais casos, usar `não identificado`. Não deduzir aprovação pelo status.

Preencher `aprovado`, `reprovado` ou `aprovado_com_ressalva` somente quando o texto declarar inequivocamente o resultado global do QA. Um smoke parcial, um cenário validado, uma correção confirmada isoladamente ou a existência de pendências não autoriza inferir o resultado global. Nesses casos, usar `não identificado` e registrar separadamente o que foi validado e o que ficou pendente.

### Passos de reprodução

Registrar uma lista numerada somente quando a fonte trouxer passos explícitos ou descrever uma sequência operacional inequívoca já executada. Não transformar comportamento esperado, condição temporal, sugestão de teste ou raciocínio do extrator em passos históricos. Sem sequência comprovada, usar `- [NÃO INFORMADO] não informado no ClickUp`.

### Evidências e anexos

Registrar metadados e contexto. Marcar `Conteúdo analisado: não` quando imagem, vídeo, planilha, PDF ou binário não tiver sido efetivamente lido. Não concluir pelo nome do arquivo.

### Causa, solução e regras

Aceitar como causa confirmada apenas campo personalizado ou texto conclusivo. Manter hipóteses separadas. Registrar somente solução documentada. Não generalizar comportamento específico de cliente, versão ou configuração.

### Recorrência e busca

Usar no máximo três palavras-chave discriminativas. Evitar termos genéricos isolados como `erro`, `problema` e `sistema`. Criar perguntas de recuperação com entidade, fluxo e sintoma suficientes para funcionarem fora do contexto.

A assinatura deve ser compacta e normalizada. Exemplo: `estoques > protocolo de consumo | relatório automático não enviado | periodicidade quinzenal | múltiplos clientes`.

### Limitações

Descrever recurso afetado, tentativa e impacto na confiabilidade. Não usar apenas “informação incompleta”. Se um custom field não foi recuperado, não afirmar que estava vazio.

## 7. Vocabulários controlados

### Módulo principal

`administrador`, `cadastros`, `entrega_manual_balcao`, `entrega_diferenciada`, `estoques`, `fichas_epi`, `funcionarios`, `importacoes`, `integracoes`, `intranet`, `maquinas_entrega`, `matriz_produtos`, `portal`, `registro_interacoes`, `relatorios`, `seguranca_aplicacao`, `self_service`, `infraestrutura`, `outro`, `não classificado`.

### Tipo de ocorrência

`bug_funcional`, `bug_tecnico_com_impacto_funcional`, `problema_relatorio`, `problema_integracao`, `problema_automacao`, `problema_performance`, `melhoria_funcional`, `melhoria_configuracao`, `demanda_documentacao`, `ajuste_exportacao`, `ajuste_pontual`, `validação_qa`, `não classificado`.

### Natureza

`funcional`, `tecnico_funcional`, `configuracao`, `operacional`, `seguranca`, `integracao`, `infraestrutura`, `documentacao`, `não classificado`.

## 8. Checklist de qualidade

1. Markdown válido e UTF-8.
2. Frontmatter completo e coerente.
3. Paginação concluída ou exportação marcada incompleta.
4. Deduplicação por ID.
5. Lista e status válidos em todos os cards.
6. `CARD_START` e `CARD_END` balanceados com o mesmo ID.
7. Todas as seções presentes em todos os cards.
8. Cada card compreensível isoladamente.
9. Custom fields integralmente preservados.
10. Comentários e checklist com estado correto.
11. QA não inferido pelo status.
12. Testes realizados separados de sugestões futuras.
13. Hipóteses separadas da causa confirmada.
14. Anexos não considerados analisados sem leitura.
15. No máximo três palavras-chave discriminativas.
16. Cards relacionados contendo somente IDs reais.
17. Vocabulários controlados respeitados.
18. Limitações específicas, sem falsas ausências.
19. Dados sensíveis redigidos em todo o documento.
20. Contagens coerentes com os cards incluídos.

