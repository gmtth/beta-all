# Protocolo transversal de evidências e handoffs

## Finalidade

Aplicar as mesmas garantias de evidência, certeza, vigência, transição e consolidação em qualquer fluxo da Beta, seja ANL, MOD ou uma transição entre os dois modos.

Este arquivo é transversal. Não substitui as regras específicas das skills especializadas.

## Classificação da informação

Classifique cada informação material antes de usá-la:

- **Fato fornecido**: informação presente na mensagem, arquivo ou evidência acessível nesta tarefa.
- **Regra confirmada**: comportamento funcional sustentado por fonte normativa ou conhecimento canônico vigente.
- **Fato operacional**: ocorrência, estado, data, responsável ou histórico retornado por um conector.
- **Precedente**: caso anterior comparável, sem força normativa automática.
- **Padrão observado**: recorrência dentro da amostra consultada, sem generalização automática.
- **Hipótese**: explicação plausível ainda não confirmada.
- **Lacuna**: informação necessária que não está disponível ou não foi decidida.

Nunca transforme automaticamente:

- ticket em regra, requisito, comportamento esperado ou causa raiz;
- hipótese em diagnóstico;
- precedente em regra atual;
- aparência de tela em requisito funcional;
- histórico antigo em estado atual;
- ausência de evidência em confirmação negativa.

## Fontes, vigência e conflitos

Quando houver múltiplas fontes:

1. identifique autoridade, finalidade, data efetiva, versão e escopo;
2. diferencie fonte normativa, fonte operacional, evidência de execução e histórico;
3. preserve a fonte mais específica e vigente quando isso estiver confirmado;
4. não desempate conflito por conveniência, aparência, maior detalhamento ou memória;
5. registre como `Divergente` quando permanecer incompatibilidade material sem decisão posterior;
6. reduza a certeza quando a vigência, versão ou contexto forem incertos.

Incidente mais recente não substitui regra funcional. Regra documentada não prova que um incidente ocorreu.

## Conhecimento funcional e snapshots

Para regras, definições, fluxos e comportamento esperado, use o `CENCIHUB_KNOWLEDGE_MASTER` vigente quando ele estiver disponível.

- não vincule a execução a um nome físico de arquivo;
- quando houver mais de um snapshot, compare metadados, versão, `snapshot_created_at`, data efetiva e fonte de sustentação;
- preserve snapshots anteriores para histórico e comparação temporal;
- reduza a certeza quando houver fonte sem data, conflito ou risco material de desatualização;
- não trate snapshot recente como prova de que todo o seu conteúdo é recente.

Regras detalhadas de uma fonte operacional, como filtros e ações específicas do Movidesk ou do ClickUp, permanecem na skill especializada correspondente; este protocolo governa somente sua interpretação, evidência e handoff.

## Handoff obrigatório

Um handoff só deve ocorrer quando a outra skill puder alterar materialmente a resposta, fornecer evidência necessária ou fechar uma lacuna relevante.

Todo handoff deve preservar:

- objetivo original;
- modo primário (`ANL` ou `MOD`);
- pergunta que precisa ser respondida;
- evidências já obtidas;
- incertezas e conflitos;
- saída esperada;
- condição de retorno à `beta`.

Nenhum achado material pode terminar apenas como “ver com outra skill”. Após o retorno, a `beta` deve reconsolidar o resultado e verificar se ainda existe pendência.

## Estados e destinos

Classifique cada ponto funcional material como um dos estados:

- `Confirmado`;
- `Pendente`;
- `Divergente`;
- `Substituído`;
- `Histórico`.

Quando aplicável, informe também o destino:

- `MODELAGEM`;
- `CONTEXTO — NÃO PUBLICAR`;
- `FORA DO ESCOPO`.

Não publique pendência, divergência não resolvida, contexto interno ou regra substituída como se fosse requisito vigente.

## Transições entre ANL e MOD

- **ANL → MOD**: quando investigação, QA, dúvida ou ticket revelar regra, requisito, fluxo, permissão, processamento, relatório ou decisão funcional ainda não consolidada.
- **MOD → ANL**: quando a modelagem precisar de explicação funcional, incidente, teste, resultado de QA, card ou evidência operacional.
- **MOD → Movidesk ANL**: somente para consulta real, somente leitura, quando o fato operacional for necessário.
- **ANL → MOD → ANL**: quando uma decisão funcional precisar ser fechada antes de produzir testes, resultado ou card.

Não faça transição somente porque uma skill relacionada existe. Preserve a intenção primária.

## Conectores e segurança operacional

- Use somente conectores realmente disponíveis na sessão.
- Não simule consultas, resultados, permissões ou alterações.
- Respeite o modo somente leitura dos conectores operacionais.
- Nunca solicite ou exponha tokens, segredos ou credenciais.
- Diferencie ausência de resultado, filtro inválido, falta de permissão e indisponibilidade.
- Se uma fonte necessária estiver indisponível, mantenha a lacuna como `Pendente` ou `Divergente` e informe a limitação quando ela afetar a conclusão.

## Dossiê, publicação e artefatos

No modo MOD:

- atualize logicamente o Dossiê quando houver informação funcional nova relevante;
- mantenha um único `DOSSIE_CONTEXTO_MODELAGEM.md`;
- aplique o filtro de publicação antes de produzir a modelagem final;
- execute QA antes da finalização e novamente após correção material;
- materialize artefatos somente depois de consolidação, Dossiê, filtro e QA, salvo conteúdo explicitamente aprovado para mera materialização;
- não incorpore o Dossiê automaticamente ao artefato publicável.

## Certeza e resposta

Separe fato, regra, evidência complementar, hipótese, lacuna e recomendação. Não use precisão falsa.

Quando a resposta utilizar conhecimento interno, aplique o grau de certeza definido pela `beta` e pela skill primária. Quando o usuário pedir somente um artefato reutilizável em formato rígido, não insira o protocolo dentro do artefato.

## Resumo obrigatório da operação

Sempre que qualquer skill Beta for ativada, encerre a resposta com um bloco curto `Resumo da operação`, inclusive quando a saída principal for somente um artefato copiável. Mantenha o bloco fora do artefato ou de qualquer comentário publicado.

Use sempre este padrão, preenchendo os quatro campos e escrevendo “nenhuma” quando não houver dado aplicável:

`**Resumo da operação:** skills acionadas e estado: <skills realmente ativadas e resultado>; fontes/validações: <fontes e verificações realizadas>; ações externas/alterações: <ações realizadas ou “nenhuma”>; pendências/limitações: <itens existentes ou “nenhuma”>.`

Registre somente fatos observáveis. Se uma validação for executada sem ativar skill Beta, não atribua a execução a uma skill; identifique-a como validação direta e use o mesmo padrão caso inclua um Resumo da operação. Não exponha cadeia de pensamento, não liste skills apenas consideradas e não estime métricas que o runtime não forneça.

## Carregamento progressivo

A `beta` deve carregar este protocolo antes do roteamento. Uma subskill chamada diretamente deve carregá-lo antes de responder. Quando a `beta` já o tiver carregado, a subskill deve aplicar o contrato sem reler desnecessariamente o arquivo e complementar apenas com suas regras específicas.
