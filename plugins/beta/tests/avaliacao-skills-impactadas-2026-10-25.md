# Avaliação pré-merge das skills impactadas

**Data:** 2026-10-25  
**Escopo:** `beta` (protocolo de observabilidade e encerramento) e `beta-mod-artefatos` (regressão por arquétipo e fixture externa).  
**Estado da mudança avaliada:** PR #52 aberta; alterações ainda não integradas em `main`.

## Resumo

- **Beta:** amostra manual com consulta real à base indexada. Os critérios funcionais avaliados passaram: evidências rastreáveis, distinção entre registro histórico e diagnóstico atual, solicitação de dados discriminantes e cartões conforme o protocolo compartilhado.
- **Beta MOD Artefatos:** três DOCX sintéticos foram gerados pelo builder do plugin. Os nove checks estruturais passaram em cada arquivo. A inspeção visual não foi concluída porque `soffice.exe` não está disponível no ambiente de renderização.
- **Limite da avaliação:** isto não é um A/B isolado do runtime do plugin. O teste da Beta foi conduzido manualmente neste chat seguindo a skill disponível e usando a ferramenta real de busca. Os documentos de Artefatos foram criados pelo builder local. Não há evidência de melhora estatística ou de mudança observável de comportamento após merge.

## 1. Beta

### Entrada e evidência

Pergunta fixa adotada para a amostra:

> Minha máquina aparece offline. O que os chamados anteriores sugerem e o que devo verificar?

Busca lexical executada na base compartilhada com `limit=5` e a consulta `máquina offline perda de conexão comunicação status`. A busca retornou cinco trechos. A resposta da amostra selecionou dois registros:

| Protocolo | Evidência retornada | Limite de interpretação |
|---|---|---|
| `20261013000000122` | Interação do suporte solicita conferir cabos, teste de rede/túneis, reinicialização e envio de foto do teste se a máquina continuasse offline. | O trecho contém solicitações de verificação, não confirma execução nem resolução. |
| `20261014000000134` | Interação registra a mensagem “DHCP não recebeu IP” e solicita verificação do serviço DHCP, cabos e portas. | O sinal sustenta a interpretação daquele caso; não confirma DHCP como causa da máquina atual. |

Outros resultados não usados na resposta:

| Protocolo | Motivo para não usar na amostra |
|---|---|
| `20261015000000143` | O trecho registra perda simultânea de conexão e uma indicação de instabilidade de rede, mas não confirma causa; também contém datas relativas incompatíveis com a data de criação retornada. |
| `20261007000000064` | Histórico de discussão sobre possível bloqueio de porta, sem evidência de restrição confirmada no trecho. |
| `20260918000000203` | Caso de conectividade com relatos divergentes sobre a infraestrutura; não resolve a causa e contém contexto específico de outra operação. |

### Amostra de resposta

> O status offline, sozinho, não confirma a causa. Encontrei dois precedentes úteis:
>
> - No protocolo **20261013000000122**, o suporte pediu verificações de cabeamento e rede, além de reinicialização. O trecho consultado não informa se isso resolveu o problema.
> - No protocolo **20261014000000134**, foi registrada a mensagem “DHCP não recebeu IP” e solicitado que verificassem DHCP, cabos e portas. Isso se aplica àquele caso; não confirma que seja a causa da sua máquina.
>
> Para investigar a situação atual, preciso do texto exato exibido no teste de rede, saber se outras máquinas ficaram offline ao mesmo tempo e se o teste apontou falha de DHCP.

Resumo de encerramento usado na amostra:

| Confiabilidade | Resultado | Evidências | Validação |
|---|---|---|---|
| 60% · precedentes consultados; causa atual não confirmada | Parcial · caminhos de investigação, sem diagnóstico da máquina atual | `20261013000000122`; `20261014000000134` | Pendente · faltam dados atuais do equipamento |

| Skills acionadas |
|---|
| Beta · Triagem de incidentes · Movidesk |

### Critérios avaliados

| Critério | Resultado | Observação |
|---|---|---|
| Cada afirmação sobre um precedente aponta para protocolo consultado | Passou | Os dois protocolos citados retornaram na busca. |
| Pedido de suporte é diferenciado de resultado confirmado | Passou | A resposta diz que a execução/resolução não aparece nos trechos. |
| Histórico não é apresentado como diagnóstico da máquina atual | Passou | A resposta nega confirmação causal e pede dados atuais. |
| Lacunas pedidas podem alterar a investigação | Passou | Texto do teste de rede, simultaneidade entre máquinas e resultado DHCP. |
| Encerramento usa os campos canônicos e omite cartões opcionais sem evento | Passou | Sem “próximo passo”, Feedback ou Ações no cartão. |

### Interpretação

A amostra segue o protocolo canônico, mas isso não prova que a alteração na referência de observabilidade melhorou a resposta: a versão anterior já declarava que o protocolo transversal prevalecia. A remoção do formato obsoleto reduz conflito documental; o impacto de comportamento permanece não demonstrado.

## 2. Beta MOD Artefatos

### Método

A fixture `beta-mod-artefatos-regression-cases.json` foi consultada manualmente. Seus três arquétipos foram mapeados para os formatos aceitos pelo builder: processamento, frontend e relatório. Foram criados JSONs sintéticos temporários e executado `scripts/build_modelagem_docx.py` para gerar três DOCX. Nenhum conteúdo operacional ou chamado real foi usado.

Arquivos temporários gerados em `%TEMP%\beta-skill-eval-20261025`:

- `processing.docx` — processamento;
- `frontend.docx` — fluxo de frontend com quatro colunas;
- `report.docx` — relatório com fórmula e tabela de colunas.

### Resultado estrutural

| Check estrutural | Processamento | Frontend | Relatório |
|---|---:|---:|---:|
| A4 (21,001 × 29,700 cm) | Passou | Passou | Passou |
| Margens superior e esquerda esperadas | Passou | Passou | Passou |
| Imagem institucional no cabeçalho | Passou | Passou | Passou |
| Campo de número de página no rodapé | Passou | Passou | Passou |
| Metadados em tabela 3 × 4 | Passou | Passou | Passou |
| Quantidade de tabelas esperada (metadados + tabela funcional quando aplicável) | Passou | Passou | Passou |
| Conteúdo no fluxo normal do documento | Passou | Passou | Passou |
| Ausência de tabela externa envolvendo o corpo | Passou | Passou | Passou |
| Fonte Calibri nos parágrafos do corpo | Passou | Passou | Passou |

O builder concluiu a geração dos três arquivos, com tamanhos entre 57.678 e 57.981 bytes.

### Validação visual pendente

O renderizador `render_docx.py` foi executado, mas encerrou antes da conversão porque não encontrou `soffice.exe` no `PATH` (`FileNotFoundError`). Não foram criadas páginas PNG/PDF e nenhuma inspeção visual pôde ser feita. Não foi usado o LibreOffice instalado no computador nem outro renderizador, conforme as instruções da skill de documentos.

Portanto, os checks estruturais passaram, mas o gate visual não passou nem falhou: permanece **não verificado**. Os DOCX são artefatos temporários de avaliação, não entregáveis aprovados.

### Consistência da fixture

- A fixture contém os três arquétipos previstos e os alvos de comparação (hierarquia, ordem, densidade, larguras, quebras, cabeçalho e rodapé).
- O repositório não possui runner que consuma automaticamente essa fixture; a avaliação foi manual.
- Os rótulos da fixture são descritivos, não um payload direto para o builder. Foi necessário mapear cada um para o campo `layout.archetype` aceito e fornecer conteúdo sintético separado.
- Assim, a fixture preserva o roteiro de cobertura, mas ainda não automatiza a regressão.

## Conclusão pré-merge

1. A mudança da Beta tem benefício documental claro (remover uma orientação obsoleta), mas a amostra não mostrou diferença de comportamento, pois o protocolo canônico já prevalecia.
2. A mudança de Artefatos manteve os três arquétipos e o builder produziu documentos estruturalmente válidos. Sem renderização, não há conclusão sobre qualidade visual.
3. Não há base para afirmar que qualquer alteração melhorou a qualidade dos DOCX ou a precisão das respostas.
4. Após a PR #52 ser mergeada, repetir a mesma pergunta da Beta e a mesma fixture com versão, modelo e fonte de dados registrados. Resolver o bloqueio do renderizador e comparar todas as páginas antes de declarar o teste de Artefatos concluído.
