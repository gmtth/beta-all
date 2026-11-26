# Avaliação pré-merge das skills impactadas

**Data da avaliação:** 2026-10-25
**Revisão de privacidade:** 2026-11-26
**Escopo:** `beta` (orientação de observabilidade) e `beta-mod-artefatos` (fixture de regressão).
**Limite:** avaliação manual anterior ao merge; não é comparação A/B do runtime.

## Resumo

- **Beta:** a amostra manual usou busca real na base compartilhada. Cinco trechos foram retornados e dois precedentes foram usados para compor uma resposta parcial. Os critérios registrados para rastreabilidade, distinção entre histórico e diagnóstico atual, solicitação de dados discriminantes e formato dos cartões passaram.
- **Beta MOD Artefatos:** três DOCX sintéticos foram gerados a partir dos arquétipos de processamento, frontend e relatório. Os nove checks estruturais registrados passaram para cada arquivo.
- **Validação visual:** permanece não verificada. O renderizador não encontrou `soffice.exe`; não houve PNGs nem inspeção das páginas.
- **Efeito da mudança:** a amostra da Beta seguiu o protocolo transversal, que já prevalecia antes da edição. Não foi demonstrada mudança comportamental, melhoria estatística ou melhoria visual.

Identificadores de chamados e trechos operacionais da consulta foram omitidos deste registro para minimizar dados persistidos no repositório. A avaliação original usou esses dados para revisão manual; este documento preserva resultados e limites, não conteúdo de chamados.

## 1. Beta

### Método e resultado

A pergunta de avaliação descrevia, em termos genéricos, um equipamento com status offline e pedia precedentes e verificações. Foi executada uma busca lexical com limite de cinco resultados. A resposta usou dois registros históricos que continham sinais e verificações úteis, sem tratar essas informações como causa confirmada para o equipamento atual. Três outros resultados foram descartados por não oferecerem confirmação suficiente; entre as limitações estavam hipótese sem confirmação, relatos divergentes e inconsistência temporal.

A resposta de amostra foi classificada como **parcial**: apresentou os precedentes como histórico, registrou que o diagnóstico atual não estava confirmado e pediu informações atuais capazes de diferenciar hipóteses. A amostra registrou **60% de confiabilidade heurística**, não probabilidade calibrada nem métrica de qualidade da busca, e listou as skills exibidas Beta, Triagem de incidentes e Movidesk.

### Critérios avaliados

| Critério | Resultado registrado | Observação |
|---|---|---|
| Afirmações sobre precedentes apoiadas em resultados consultados | Passou | Dois dos cinco resultados foram usados. Identificadores e conteúdo dos registros foram removidos deste arquivo. |
| Pedido de suporte diferenciado de resultado confirmado | Passou | A resposta não afirmou que as verificações foram executadas nem que resolveram o caso. |
| Histórico não apresentado como diagnóstico do equipamento atual | Passou | A resposta deixou a causa atual em aberto. |
| Perguntas de esclarecimento relevantes | Passou | Foram solicitados dados atuais que poderiam mudar a investigação. |
| Encerramento compatível com o protocolo comum | Passou | A amostra omitiu campos opcionais sem evento correspondente. |

### Interpretação

A remoção do formato obsoleto da referência reduz conflito documental e direciona a apresentação ao protocolo transversal. Como o documento anterior já dizia que o protocolo prevalecia, esta amostra não prova melhoria ou mudança do comportamento da Beta.

## 2. Beta MOD Artefatos

### Método

A fixture `beta-mod-artefatos-regression-cases.json` foi consultada manualmente. Seus três arquétipos foram mapeados para o contrato do builder (`general-processing`, `frontend` e `report`). Conteúdo sintético foi usado; os DOCX gerados eram temporários e não são entregáveis aprovados.

### Resultado estrutural registrado

| Check estrutural | Processamento | Frontend | Relatório |
|---|---:|---:|---:|
| Formato A4 | Passou | Passou | Passou |
| Margens esperadas | Passou | Passou | Passou |
| Imagem institucional no cabeçalho | Passou | Passou | Passou |
| Campo de número de página no rodapé | Passou | Passou | Passou |
| Metadados em tabela 3 × 4 | Passou | Passou | Passou |
| Quantidade esperada de tabelas | Passou | Passou | Passou |
| Conteúdo no fluxo normal do documento | Passou | Passou | Passou |
| Ausência de tabela externa envolvendo o corpo | Passou | Passou | Passou |
| Calibri nos parágrafos do corpo | Passou | Passou | Passou |

### Validação visual pendente

A tentativa registrada de usar `render_docx.py` encerrou antes da conversão por ausência de `soffice.exe` no `PATH`. Não foram produzidas imagens de página. Os checks estruturais passaram; a qualidade visual permanece **não verificada** e não deve ser descrita como aprovada.

A fixture não é consumida por runner automático. Os rótulos são descritivos e exigem mapeamento manual para o contrato JSON aceito pelo builder. Portanto, ela preserva cobertura dos três arquétipos como roteiro de regressão, mas não automatiza a geração ou comparação.

## Conclusão pré-merge

1. A alteração na referência da Beta remove uma orientação desatualizada e remete ao protocolo comum; a avaliação não demonstra mudança de comportamento.
2. Os três arquétipos foram gerados e passaram nos checks estruturais registrados.
3. A inspeção visual continua pendente e nenhum ganho de qualidade dos DOCX foi demonstrado.
4. A avaliação pós-integração deve repetir o cenário genérico com versão, modelo e fontes registrados; diferenças na base de dados precisam ser separadas de diferenças nas instruções.
