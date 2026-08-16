# Phase 3A — análise factual determinística

Phase 3A prepara tickets do Movidesk para consumo por uma IA cliente. O MCP busca, normaliza, segmenta e organiza o histórico; a IA cliente interpreta causas, prioridade, correlação e classificação final.

A implementação é determinística e não depende de IA externa, embeddings, LLM, MCP Sampling ou novos endpoints.

## Ferramentas

`movidesk_summarize_ticket` retorna os mesmos campos públicos (`summary`, `reportedProblem`, `actionsTaken`, `pendingItems`, `evidence`, `hypotheses`, `confidence` e `incomplete`), mas com semântica factual:

- `reportedProblem`: primeira manifestação pública identificada do cliente, descrição inicial ou assunto como fallback;
- `actionsTaken`: ações registradas como concluídas, excluindo intenções, perguntas e mensagens administrativas;
- `pendingItems`: pendências explicitamente registradas que não foram claramente encerradas por eventos posteriores;
- `evidence`: fatos e trechos presentes no ticket, sem inferir causa;
- `hypotheses`: somente hipóteses escritas explicitamente no histórico;
- `confidence`: qualidade/suficiência da extração factual, não probabilidade de causa;
- `incomplete`: indica falta estrutural de histórico, não ticket aberto ou ausência de solução.

`movidesk_classify_ticket_issue` faz classificação conservadora somente diante de sinais explícitos e inequívocos. `officialCategory` é a categoria original do Movidesk; `category` é um sinal analítico do MCP e não representa causa raiz; `categories` preserva o sinal compatível para retrocompatibilidade; `evidence` mostra os fatos que acionaram a classificação; `confidence` indica a força desses sinais.

## Normalização interna

O objeto original do Movidesk não é alterado. A Phase 3A cria internamente mensagens com ator (`client`, `agent`, `system` ou `unknown`), visibilidade pública/interna, timestamp, `sourceIndex` e identificação da ação. Quando `htmlDescription` possui marcadores de chat (`data-person-role`), as mensagens são segmentadas por esses marcadores; caso contrário, cada ação permanece uma unidade factual.

Boilerplate de saudação, encerramento, assinatura e canais de atendimento é marcado apenas na representação analítica e não é removido da timeline nem de outras ferramentas.

## Limites

O MCP não determina causa provável, problema predominante, intenção, correlação conceitual ou solução. Essas interpretações começam na IA cliente, usando `evidence`, o histórico e os dados oficiais preservados.
