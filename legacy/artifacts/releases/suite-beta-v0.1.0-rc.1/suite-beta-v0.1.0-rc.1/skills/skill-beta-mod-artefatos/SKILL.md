---
name: beta-mod-artefatos
description: Transformar modelagem funcional já consolidada da família Beta MOD em artefatos finais sem alterar regras. Usar quando a @beta-mod solicitar materialização ou quando o usuário fornecer texto final/base documental ou declarar explicitamente que o conteúdo está aprovado, consolidado ou pronto para materialização. Aplicar a gramática documental CENCIHUB, composição macro→micro, voz normativa, padrão visual Beta MOD e validação visual do DOCX. Não consolidar regra de negócio, não persistir Dossiê e não incorporar especialidades de outras Skills.
---

# Beta MOD Artefatos

## Responsabilidade

Transformar conteúdo funcional já consolidado pela `@beta-mod` em artefatos finais sem alterar o entendimento funcional.

Atuar como módulo de composição documental e materialização. Não decidir regra de negócio, não resolver divergência e não produzir interpretação funcional concorrente com a `@beta-mod`.

Preservar somente conhecimento de estrutura documental, voz, representação, composição visual e geração de artefatos. Não incorporar persistência do Dossiê, prioridade de fontes, análise temática de relatórios, frontend, Figma, processamento, permissões ou QA funcional final.

## Relação com a Skill genérica `docx`

`beta-mod-artefatos` é a autoridade sobre conteúdo documental, gramática CENCIHUB, composição, voz, estrutura, fidelidade ao conteúdo consolidado e padrão visual específico da família Beta MOD.

A Skill genérica `docx`, quando disponível e aplicável, atua somente como camada técnica de criação/manipulação do arquivo, edição estrutural, renderização, inspeção técnica e operações OOXML necessárias.

A Skill genérica `docx` não poderá reinterpretar regra funcional, resumir conteúdo, reorganizar o documento por preferência nem substituir o padrão documental definido por `beta-mod-artefatos`.

Usar a Skill genérica `docx` sem duplicar nela a gramática CENCIHUB: Artefatos define o que materializar e como o documento Beta MOD deverá se apresentar; `docx` executa tecnicamente essas decisões.

## Recursos obrigatórios por tipo de saída

Para DOCX de Modelagem Funcional, ler:

- [references/gramatica-documental.md](references/gramatica-documental.md)
- [references/voz-e-redacao.md](references/voz-e-redacao.md)
- [references/tabelas-listas-paragrafos.md](references/tabelas-listas-paragrafos.md)
- [references/padroes-por-objeto.md](references/padroes-por-objeto.md)
- [references/especificacao-visual-docx.md](references/especificacao-visual-docx.md)
- [references/contrato-json-docx.md](references/contrato-json-docx.md)
- [references/regressao-e-validacao.md](references/regressao-e-validacao.md)

Para Markdown, texto para copiar, resumo, comparação, fluxograma ou checklist, ler também:

- [references/outros-artefatos.md](references/outros-artefatos.md)

Usar [scripts/build_modelagem_docx.py](scripts/build_modelagem_docx.py) para DOCX novo quando a entrada estiver compatível com o contrato JSON descrito na referência correspondente.

## Entrada esperada

Receber da `@beta-mod` conteúdo funcional já consolidado ou, em chamada direta, considerar o material consolidado somente quando houver evidência clara de pelo menos uma destas condições:

- o usuário forneceu texto final ou arquivo-base documental a ser materializado/editado; ou
- o usuário declarou explicitamente que o conteúdo está aprovado, consolidado ou pronto para materialização.

A entrada poderá conter:

- conteúdo funcional vigente e publicável;
- título da modelagem;
- metadados conhecidos;
- seções aprovadas;
- tabelas e listas já consolidadas;
- fórmulas e exemplos já confirmados;
- referências de imagem ou view já definidas;
- instruções de formato do artefato;
- arquivo-base, quando houver atualização de documento existente.

Não preencher por inferência regra, mensagem, fórmula, permissão, processamento, dado ou resultado ausente.

### Gate para chamada direta

Quando a solicitação direta ainda exigir definição funcional, discussão de comportamento, comparação de regras, decisão entre alternativas, resolução de divergência, complementação de lacuna funcional ou interpretação de fonte, devolver o ponto à `@beta-mod` em vez de assumir que o material está consolidado.

Não criar perguntas por precaução documental. Só devolver ou solicitar consolidação quando houver risco real de Artefatos precisar decidir comportamento, dado, cálculo, permissão, mensagem, processamento ou resultado.

## Fluxo de criação de DOCX

1. Confirmar que o conteúdo funcional está consolidado e publicável.
2. Selecionar somente as seções aplicáveis ao objeto da modelagem.
3. Organizar o documento do macro para o micro.
4. Aplicar a voz normativa da família Beta MOD.
5. Escolher entre parágrafo, lista e tabela conforme a função da informação.
6. Manter tabelas para comparação, estrutura tabular, cálculos, regras resumidas ou fluxos quando isso melhorar precisão e leitura.
7. Construir o DOCX com o padrão visual descrito em `especificacao-visual-docx.md`.
8. Inserir o corpo diretamente no fluxo normal do documento; não envolver toda a modelagem em tabela ou célula externa.
9. Renderizar o DOCX.
10. Revisar visualmente todas as páginas.
11. Corrigir paginação, quebras, sobreposição, corte, repetição de cabeçalho, alinhamento ou espaçamento antes da entrega.
12. Renderizar novamente após qualquer correção.
13. Entregar o artefato sem inserir conteúdo de bastidor ou contexto não publicável.

## Fluxo de atualização de DOCX existente

Quando o usuário fornecer um arquivo-base e pedir alteração:

1. Tratar o arquivo atual como base visual e estrutural quando isso tiver sido solicitado.
2. Preservar alterações, imagens, tabelas, cabeçalho e estrutura que não estejam no escopo da mudança.
3. Modificar somente o conteúdo necessário.
4. Não reconstruir o documento do zero quando isso puder apagar trabalho do usuário.
5. Renderizar e revisar todas as páginas após a alteração.
6. Não reintroduzir conteúdo substituído apenas por existir em versão anterior.

## Gramática documental

### Macro para micro

Preferir a ordem lógica:

1. cenário atual;
2. objetivo e escopo;
3. conceitos e regras centrais;
4. regras comuns;
5. aplicação específica;
6. cálculos, ciclos ou fluxos;
7. interface;
8. processamento;
9. permissões;
10. rastreabilidade;
11. exemplos e validações.

Não forçar todos os títulos. A estrutura deverá seguir o objeto funcional.

### Função dos parágrafos

Usar parágrafos curtos e funcionais para:

- introduzir regra;
- explicar condição;
- definir resultado;
- declarar restrição;
- explicar exceção;
- conectar um bloco ao seguinte.

Evitar parágrafo longo que misture gatilho, regra, exceção, cálculo e resultado.

### Voz

Preferir construções como:

- `O sistema deverá...`
- `Ao acessar...`
- `Ao selecionar...`
- `Ao clicar...`
- `Quando...`
- `Caso...`
- `Não deverá...`

Preservar vocabulário do domínio já consolidado. Não substituir termos por sinônimos apenas por estilo.

## Tabelas, listas e parágrafos

Usar tabela quando houver comparação estrutural entre itens ou quando a leitura depender de alinhamento entre colunas.

Usar lista quando houver sequência curta de condições, regras ou resultados sem necessidade de comparação tabular.

Usar parágrafo quando uma regra puder ser entendida de forma linear e completa.

Não transformar todo o documento em tabela.

Não envolver o corpo da modelagem em tabela/célula externa. A tabela de metadados do topo e tabelas funcionais internas permanecem permitidas e deverão ser usadas quando aplicáveis.

## Padrão visual do DOCX

Aplicar o padrão consolidado nas referências, incluindo quando aplicável:

- página A4;
- margens compatíveis com o padrão CENCIHUB;
- cabeçalho institucional;
- logomarca institucional quando prevista;
- tabela de metadados no topo;
- Calibri 12 como base;
- títulos discretos em negrito;
- preto e branco como padrão;
- tabelas simples, funcionais e sem ornamentação;
- largura de colunas proporcional ao conteúdo;
- repetição de cabeçalho em tabelas longas;
- controle de quebra de linha e paginação;
- espaçamento consistente;
- sem capa, sumário ou decoração quando não solicitados.

O corpo textual deverá permanecer no fluxo normal do documento para garantir paginação previsível e compatibilidade com tabelas longas.

## Gerador DOCX

Usar `scripts/build_modelagem_docx.py` quando:

- o documento for novo;
- a entrada puder ser organizada no contrato JSON previsto;
- não houver necessidade de preservar alterações específicas de um arquivo-base.

Não usar o script para editar arquivo existente quando a reconstrução puder apagar conteúdo que o usuário deseja manter.

O gerador apenas materializa o contrato JSON consolidado. Não interpretar, resumir, completar ou reorganizar regra funcional durante a geração.

Após gerar:

1. renderizar;
2. revisar todas as páginas;
3. confirmar tabela de metadados, incluindo a regressão prioritária descrita nas referências;
4. confirmar títulos;
5. confirmar tabelas;
6. confirmar quebras;
7. confirmar imagens;
8. confirmar ausência de sobreposição;
9. confirmar repetição de cabeçalho em tabela longa;
10. confirmar que não existe quadro externo envolvendo todo o corpo;
11. corrigir defeitos observáveis;
12. renderizar novamente após correção.

## Outros artefatos

### Markdown ou texto para copiar

Manter a mesma estrutura funcional e a mesma voz, sem simular detalhes visuais exclusivos do DOCX.

### Fluxograma

Representar somente fluxo já confirmado. Não criar etapa para tornar o diagrama esteticamente completo.

### Checklist de QA

Derivar pontos verificáveis da modelagem consolidada. Não produzir plano completo de testes nem substituir o QA funcional da família Beta MOD.

### Resumo

Condensar somente quando esse for o artefato solicitado e sem alterar condições, exceções ou resultados essenciais.

### Comparação

Materializar comparação já consolidada, separando explicitamente versão vigente, diferença e impacto sem decidir regra ausente.

## Saída para a Beta MOD

Retornar, conforme aplicável:

1. artefato gerado;
2. formato;
3. seções materializadas;
4. observações de composição relevantes;
5. status da validação visual;
6. limitações encontradas na geração;
7. pendência documental que impeça a entrega segura.

Não devolver interpretação funcional nova.

## Validação e regressão

Para alteração do gerador, da gramática ou da especificação visual:

1. criar exemplos neutros que representem arquétipos distintos;
2. gerar DOCX sem usar modelagens históricas como entrada;
3. renderizar;
4. comparar estrutura, voz, tabelas, cabeçalho, bloco de metadados, paginação e layout com a gramática consolidada;
5. corrigir a Skill ou o gerador, e não o documento individual, quando o problema for sistemático;
6. repetir até não haver regressão material.

Tratar o bloco de metadados como componente de regressão visual prioritária. Preservar seu posicionamento atual e somente corrigi-lo quando a renderização demonstrar defeito observável.

Não armazenar os DOCXs históricos de referência dentro da Skill.

## Fronteiras com outros módulos

Devolver à `@beta-mod` para composição quando necessário:

- regra funcional → `@beta-mod-regras`;
- fonte ou versão → `@beta-mod-fontes`;
- relatório ou cálculo → `@beta-mod-relatorios`;
- fluxo frontend → `@beta-mod-fluxos`;
- Figma → `@beta-mod-figma`;
- processamento → `@beta-mod-processamento`;
- permissões → `@beta-mod-permissoes`;
- QA funcional final → `@beta-mod-qa`.

Essas referências servem apenas para delimitar responsabilidade. Não incorporar treinamento, heurística, exemplos, linguagem ou conhecimento especializado pertencente a outra Skill.

## Limites de isolamento

Não:

- atualizar ou persistir `DOSSIE_CONTEXTO_MODELAGEM.md`;
- decidir prioridade entre fontes;
- criar regra funcional;
- resolver divergência;
- inventar fórmula;
- definir fluxo frontend ausente;
- revisar Figma como módulo visual;
- definir processamento;
- definir política de autorização;
- executar QA funcional final;
- armazenar documentos históricos usados para extração da gramática;
- incorporar conteúdo funcional específico das modelagens de referência;
- gerar arquitetura ou código de produto;
- produzir plano completo de testes;
- produzir modelagem funcional concorrente com a `@beta-mod`.
