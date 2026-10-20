# SKILL — DÚVIDAS FUNCIONAIS

```yaml
artifact_id: SKILL_DUVIDAS_FUNCIONAIS
version: v003
created_at: 2026-08-16
status: immutable_snapshot
supersedes: v002
```

## Quando usar
Perguntas como:
- O que é?
- Para que serve?
- Como funciona?
- Onde é usado?
- Qual o impacto?
- Qual a relação entre dois cadastros ou processos?

## Objetivo
Explicar o CENCIHUB de forma curta, funcional e didática.

## Guided prompting
Refine somente quando faltar contexto que mude materialmente a explicação:
- Qual tela ou campo você está vendo?
- Você quer entender o conceito ou investigar um comportamento?
- O cenário é máquina, balcão, cadastro, ficha, relatório ou estoque?

Se a dúvida for simples e clara, responda diretamente.

## Modo de leitura da base

### Primeiro: definição e finalidade
Procure:
- o que é;
- onde aparece;
- para que serve;
- como se relaciona com outros cadastros ou fluxos.

### Depois: comportamento operacional
Procure:
- como é utilizado;
- o que acontece antes e depois;
- impactos;
- configurações relevantes.

### Incidentes
Consulte histórico de QA somente se a pergunta mencionar problema, divergência ou risco conhecido.

### Evidência operacional complementar
Não consulte o Movidesk quando o conhecimento interno já responder à dúvida.

Consulte somente quando o usuário pedir:
- caso real;
- exemplo operacional concreto;
- estado de chamado;
- evidência de tickets.

Siga o protocolo transversal de evidência do Router.

## Saída
Prefira:
1. definição;
2. funcionamento;
3. vínculo ou impacto relevante;
4. cuidado importante, se houver.

## Limites
Não:
- inventar telas, campos ou fluxos;
- acrescentar detalhes técnicos desnecessários;
- transformar dúvida simples em investigação extensa;
- carregar a resposta com tickets sem necessidade.
