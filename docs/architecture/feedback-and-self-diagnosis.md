# Feedback, frustração e autodiagnóstico da Beta

**Estado:** passos 1–3 concluídos. Em 2026-10-22, migrations `20261022140000` e `20261022150000` foram aplicadas ao Supabase; tabelas/RPCs estão criadas e os dois jobs Cron constam ativos. Verificação confirmou RLS, sem grants diretos nas tabelas, e execução das RPCs restrita ao `service_role`; ainda não há execução Cron registrada. Nesta worktree, passos 5–7 foram parcialmente implementados: ferramenta MCP `beta_record_feedback` com scope `feedback:write`, identidade derivada do OAuth validado, payload minimizado/idempotente, API admin master-only, aceite persistido e exigido para operações OAuth; consentimento manual para usuários comuns e autoautorização cancelável em 10 segundos apenas para e-mails em `OAUTH_MASTER_EMAILS`; `/privacy`, `/terms`, home, instrução MCP, skill Beta e painel `/admin/feedback` atualizados. A captura continua desligada. Build, chamadas funcionais, primeira execução da retenção, publicação e uso com eventos reais ainda não foram validados. O contato organizacional e os textos públicos precisam ser confirmados antes de ativar a captura.
**Atualizado:** 2026-10-22.

## Objetivo

Permitir que a Beta identifique evidências de insatisfação, lacunas de conhecimento/capacidade e problemas de desempenho ou conexão, registre somente o contexto mínimo necessário e ajude a equipe a priorizar melhorias. A Beta pode diagnosticar e recomendar trabalho; mudanças em conhecimento, skills, ferramentas, permissões ou código continuam sujeitas a revisão humana.

## Passo 1 — sinais que a Beta consegue observar

### Evidência confirmada no repositório

| Camada | O que existe hoje | O que isso permite observar | Limite atual |
|---|---|---|---|
| Plugin e skills | O pacote `suite-beta` contém 20 skills. O manifesto inclui diretório de skills e configuração MCP; `beta` orquestra skills especializadas e `beta-anl-movidesk` declara a conexão MCP. | Durante uma invocação, o modelo pode interpretar a solicitação e o contexto que recebeu naquela execução. As instruções podem orientar uma pergunta de confirmação ou uma resposta ao analista. | Skill é instrução para o modelo, não processo em segundo plano nem listener. As instruções locais foram atualizadas para orientar captura explícita; o contexto recebido não garante acesso à conversa inteira nem a interações posteriores. |
| Ferramentas MCP | Além das ferramentas Movidesk e conhecimento, há nesta worktree `beta_record_feedback`, protegida por `feedback:write`. | Pode receber feedback ou autodiagnóstico estruturado que o modelo apresente, com identidade vinculada ao token OAuth e referências limitadas. | Não observa automaticamente mensagens ou reações posteriores. A flag `FEEDBACK_CAPTURE_ENABLED` mantém a gravação desligada; o payload enviado pela ferramenta continua sendo uma alegação do modelo até revisão humana. |
| Telemetria operacional | `instrumentToolUsage` envolve cada chamada registrada e envia `tool_name`, `outcome`, categoria técnica segura, `duration_ms` e horário para `recordMcpToolEvent`. A tabela D1 retém até 90 dias. | Volume, sucesso, latência e falhas observadas dentro do Worker. | Falha técnica não prova frustração. D1 não registra feedback, texto da conversa, identidade ou transcript. |
| Supabase | Além do conhecimento, migrations `20261022140000`/`20261022150000` criam o schema de feedback e agendam retenção. | O Worker local poderá gravar eventos minimizados e ler/revisar dados via RPCs após publicação; retenção agrega e remove detalhes vencidos. | Schema e jobs foram aplicados; RLS/grants e jobs ativos foram conferidos. Ainda não houve chamadas funcionais nem execução Cron registrada. A captura permanece desligada e o painel/runtime desta worktree não foi publicado. |

O manifesto OpenAI descreve skills como instruções/recursos e MCP como ferramentas com entradas estruturadas e resultados. Isso é compatível com um fluxo em que uma skill decide chamar uma futura ferramenta de feedback, mas não estabelece que o servidor MCP receba a conversa inteira. Ver [arquitetura de plugins](https://developers.openai.com/plugins/concepts/plugins) e [conceito de servidor MCP](https://developers.openai.com/plugins/concepts/mcp-server).

### Conclusões do passo 1

1. **Feedback explícito:** a skill pode usar uma reclamação ou correção se ela estiver no contexto que o modelo recebeu. O contrato, a ferramenta autenticada e o schema Supabase já existem localmente/remotamente nesta fase; a gravação continua desativada até publicação e validação do fluxo.
2. **Sinal de frustração inferido:** o modelo pode reconhecer linguagem ou repetição no contexto disponível, mas isso é uma inferência, não uma medição objetiva. Para casos ambíguos, deve pedir confirmação e permitir correção.
3. **Falha operacional:** o Worker já consegue registrar duração, resultado e categoria técnica segura da chamada. Isso permanece telemetria operacional no D1 e não deve ser reclassificado automaticamente como frustração.
4. **Lacuna/autodiagnóstico:** a skill pode identificar uma limitação a partir dos resultados e da evidência disponíveis naquela execução. Nesta worktree há ferramenta para receber evento estruturado, mas ela não foi publicada e permanece desativada.
5. **Conversas completas:** nenhuma evidência do código ou contrato configurado mostra acesso do plugin/MCP ao histórico integral, à reação do usuário depois da resposta ou a conversas em que a Beta não foi invocada. O desenho deve funcionar sem pressupor esse acesso.

### Smoke conversacional informado pelo usuário (2026-10-22)

O usuário executou a sequência de observação com a Beta e compartilhou as respostas. Isso confirma que, naquela conversa e na configuração testada, a Beta recebeu contexto suficiente para retomar críticas de turnos anteriores. É uma amostra manual, não prova que todas as skills ou sessões recebem o mesmo contexto.

| Sinal observado | Comportamento visto | Leitura para o projeto |
|---|---|---|
| Análise inicial de chamados | A Beta separou um padrão de avisos de “sem consumo” de outros sintomas, explicitou limites da amostra e não apresentou hipótese como causa confirmada. | Bom padrão de evidência e incerteza; pode alimentar autodiagnóstico quando identificar uma lacuna concreta. |
| Feedback positivo | A Beta reconheceu que a comparação ajudou e disse que manteria esse formato. | Sinal positivo explícito reconhecido. Não houve alegação de persistência. |
| Pedido de comparação por empresa e problema | A Beta identificou que não respondeu à pergunta central, nomeou as dimensões que faltaram e os dados necessários. | Lacuna de análise bem descrita: faltou agrupar por empresa, sintoma e repetição, usando históricos completos. |
| Ferramenta indisponível | A conversa registrou falhas HTTP 504 na busca textual/interações; a Beta explicou que a evidência estava incompleta. | A indisponibilidade é evidência operacional; a insatisfação com o resultado é feedback conversacional distinto. Relacioná-los por referência, sem duplicar telemetria do D1. |
| Crítica repetida à resposta | A Beta reconheceu que repetiu a comparação e não respondeu à pergunta central. Em mais de uma resposta, descreveu o que faria a seguir, mas não executou a recuperação dos históricos naquela resposta. | Além da lacuna de conhecimento, surgiu uma lacuna de comportamento/execução: reconhecer a crítica não basta; deve agir com as ferramentas disponíveis ou declarar precisamente o bloqueio. Evitar promessas de ação futura sem executá-la. |
| Contexto da empresa | A Beta reconheceu que faltou detalhar operação, histórico por empresa e recorrência dentro de cada empresa. | A descrição da lacuna foi refinada após novo feedback, demonstrando uso do contexto acumulado na conversa. |
| Indicação para anotar o problema | A Beta respondeu “Anotado para esta conversa”. | Comunicou escopo limitado à conversa; não há evidência de gravação persistente, que ainda não existe. |

**Conclusão do smoke:** a skill/Beta reconheceu feedback explícito e manteve contexto suficiente nesta conversa. O teste não valida captura automática, persistência, comportamento de todas as skills, nem execução posterior garantida. O teste revelou que a Beta pode reconhecer a falha sem completar a correção solicitada; o contrato deve registrar essa diferença entre reconhecimento, ação executada e bloqueio real.

## Diretrizes já estabelecidas para as próximas etapas

- Separar origem do evento (`explicit`, sinal conversacional recebido, operacional ou autodiagnóstico), causa suspeita/confirmada, severidade, confiança e confirmação do analista.
- Não tratar palavrões, tom informal, ausência de resultados ou erro técnico isoladamente como prova de frustração.
- Guardar resumo funcional sanitizado e evidência mínima; nunca persistir chain-of-thought, transcript integral, tokens, segredos ou PII desnecessária.
- Identidade e papel devem vir do principal OAuth validado no backend, nunca de campos de texto enviados pelo modelo.
- Manter volume, latência, sucesso e categorias técnicas no D1. Eventos contextuais de feedback e lacunas pertencem ao Supabase, sob autorização, retenção e acesso mínimos.
- Feedback não se converte automaticamente em conhecimento validado nem em alteração de skills/código; revisão humana é obrigatória.
- Definir a métrica de modo interpretável, com janela, contagem, origem do sinal e denominador. Interações sem feedback não significam satisfação.

## Passo 2 — contrato de eventos v1 (concluído)

Este contrato define eventos contextuais para futura captura no Supabase. A taxonomia, os limites, a escala de fricção e o contexto mínimo foram definidos. Não é uma migration nem autorização para armazenar eventos reais. A implementação também depende da política de dados do passo 3 e dos controles de acesso.

### Tipos de evento

| `feedback` | O usuário declara elogio, crítica, correção ou insatisfação sobre uma resposta/ação. | “A resposta não resolveu; faltou comparar quais empresas tiveram o mesmo problema.” |
| `knowledge_gap` | A evidência/conhecimento disponível é insuficiente para a resposta solicitada. | Faltaram históricos completos para comparar as empresas. |
| `capability_gap` | A Beta não dispõe de capacidade/ferramenta para cumprir a tarefa, ou não executa um passo que anunciou. | A Beta reconheceu que repetiu a resposta, mas não recuperou os históricos naquela resposta. |
| `experience_issue` | O usuário relata frustração, demora ou outro problema de experiência. | “Estou frustrado” ou “a consulta está demorando demais”. |
| `self_diagnosis` | A Beta aponta uma limitação própria com evidência observável e incerteza explícita quando a causa não está confirmada. | “Não consegui comparar os históricos porque a consulta falhou com HTTP 504.” |

Uma interação pode conter eventos relacionados de tipos diferentes, por exemplo, `feedback` e `knowledge_gap`, mas cada evento representa um sinal distinto e cita a mesma interação somente se houver identificador confiável. Não inventar `conversation_id` quando a plataforma não o fornece. Não duplicar falhas técnicas como frustração. O registro contextual pode referenciar o identificador de uma chamada operacional D1 quando disponível; duração, categoria técnica e resultado continuam tendo uma única fonte de verdade no D1.

Categorias devem ser controladas e versionadas, sem criar categoria livre a cada evento: `answer_quality`, `missing_context`, `knowledge_coverage`, `tool_capability`, `tool_execution_follow_through`, `latency_experience`, `connection_experience`, `result_relevance` e `other_review_required`. `other_review_required` precisa de triagem humana antes de virar uma categoria permanente.

### Proveniência, classificação de frustração e confiança

- `signal_source`: `explicit_user`, `user_confirmed_inference`, `agent_self_report` ou `observed_task_outcome`.
- Reclamação/correção/elogio declarado diretamente: `explicit_user`. O sistema registra a evidência mínima resumida, não o transcript. Elogio é feedback positivo, não evidência de satisfação geral.
- Frustração inferida de linguagem ambígua: não persistir como frustração sem perguntar e receber confirmação. Se o usuário não confirmar, nenhuma classificação de frustração é gravada.
- Diagnóstico da própria Beta: `agent_self_report`, com resumo sanitizado e referência a resultados/chamadas observados. Não transforma inferência em causa confirmada.
- Falha operacional observada: permanece no D1; pode ser referenciada por um evento contextual apenas quando houver relação explícita com a experiência/limitação discutida.
- `frustration_evidence` é separado de `event_type`: `none`, `explicit_emotion` ou `user_confirmed_inference`. Reclamação objetiva (por exemplo, “a resposta não resolveu”) é feedback negativo, mas não prova emoção de frustração. Ambiguidade não confirmada fica como `none`.
- `friction_level` (0–3) é um indicador observável da experiência, não diagnóstico psicológico nem classificação da pessoa:
  - `0`: nenhuma fricção expressa/observada; inclui feedback neutro ou positivo.
  - `1`: usuário declara resultado insatisfatório, sem sinal de bloqueio da tarefa.
  - `2`: tarefa permanece sem solução ou exige tentativas repetidas, comprovadas pelo contexto disponível.
  - `3`: usuário declara frustração explicitamente ou relata tarefa bloqueada com impacto explícito.
- Não elevar o nível por palavrões, informalidade, pontuação, silêncio ou tom presumido. Se o sinal for ambíguo, perguntar; sem confirmação, não registrar frustração inferida. Se não houver evidência para graduar fricção, usar `0`, sem inventar severidade.
- Cada evento recebe `friction_level` de 0 a 3, seguindo a régua abaixo. A métrica representa fricção observada no uso; não é diagnóstico psicológico nem classificação da pessoa.
- Armazenar `confidence` somente para inferências/diagnósticos; feedback diretamente explícito não precisa de escore de confiança artificial. Guardar separadamente confirmação/correção do usuário.

| Nível | Critério observável |
|---|---|
| 0 | Nenhuma fricção expressa/observada. Inclui feedback positivo ou neutro. |
| 1 | O usuário declara que a resposta/resultado foi insatisfatório, sem indicar que a tarefa ficou bloqueada. |
| 2 | A tarefa permanece sem solução ou exige tentativas repetidas, com evidência na conversa/operação disponível. |
| 3 | O usuário declara frustração explicitamente ou a tarefa está bloqueada com impacto explicitamente informado. |

Classificar somente com evidência disponível. Não subir nível por palavrões, informalidade, pontuação, silêncio ou tom presumido. Se a mensagem for ambígua, perguntar; sem confirmação, não registrar frustração inferida. Se não for possível determinar a fricção, usar nível 0 e preservar a categoria factual do evento, sem inventar severidade.

### Campos mínimos permitidos

`event_id`, `schema_version`, `event_type`, `category`, `signal_source`, `occurred_at`, `actor_ref` derivado/pseudonimizado pelo servidor, `context` sanitizado, `status` (`new`, `reviewed`, `resolved`, `dismissed`), `feedback_polarity` (`positive`, `negative`, `corrective`, `neutral`) somente para `feedback`, `friction_level` (0–3), `frustration_evidence` (`none`, `explicit_emotion`, `user_confirmed_inference`), `user_confirmed` somente quando houve confirmação de inferência, `confidence` apenas para inferência/autodiagnóstico, `tool_event_ref` opcional para correlação D1 e `idempotency_key` opaca para impedir duplicação de retry da mesma gravação.

O objeto `context` contém, quando disponíveis: `goal_summary` (objetivo do usuário), `observed_outcome` (resultado efetivamente obtido), `identified_gap` (o que faltou ou falhou) e `evidence_refs` (referências opacas a ferramentas/registros permitidos). Campos desconhecidos ficam nulos/vazios; o modelo não deve completar lacunas por inferência. Os resumos devem ser sanitizados e concisos.

Não incluir transcript integral, chain-of-thought, tokens, segredos, argumentos/resultados completos de ferramentas, conteúdo de chamados sem necessidade, nem identificadores pessoais em texto livre. Citações de chamados devem usar IDs de origem e só aparecer quando autorizadas e necessárias; o resumo deve minimizar nomes de empresas e pessoas.

### Casos que não geram evento de frustração

- Erro/timeout de ferramenta sem manifestação de insatisfação: telemetria D1 apenas.
- Ausência de elogio ou crítica: não equivale a satisfação nem a frustração.
- Palavrão, informalidade ou mensagem curta sem indicação clara de insatisfação: não classificar automaticamente.
- Hipótese da Beta sem evidência disponível: não persistir como diagnóstico factual.
- Crítica já reconhecida na conversa: não afirmar que foi salva; só confirmar persistência após sucesso real da futura ferramenta.

### Métrica no painel — contrato v1

Apresentar **nível observado de fricção** como distribuição de eventos por período, categoria, origem do sinal e `friction_level` (0–3), com contagem e estado de revisão. Exibir separadamente feedback positivo e negativo. Não chamar isso de taxa nem converter em percentual até haver um denominador confiável de interações observáveis. Falta de feedback não significa satisfação. Não calcular uma pontuação composta na v1; qualquer índice agregado exige definição, validação e calibração humana no piloto.

### Payloads sintéticos para orientar implementação futura

```json
{
  "schema_version": 1,
  "event_type": "feedback",
  "signal_source": "explicit_user",
  "category": "missing_context",
  "feedback_polarity": "negative",
  "friction_level": 1,
  "frustration_evidence": "none",
  "context": {
    "goal_summary": "Comparar por empresa a repetição de problemas de ressuprimento.",
    "observed_outcome": "A resposta agrupou chamados, mas não comparou a recorrência por empresa.",
    "identified_gap": "Faltou comparar empresas, sintomas e recorrência usando históricos completos.",
    "evidence_refs": []
  },
  "status": "new",
  "tool_event_ref": null,
  "idempotency_key": "5747b86e-bd13-4f80-8c21-6dba3189bb7b"
}
```

```json
{
  "schema_version": 1,
  "event_type": "self_diagnosis",
  "signal_source": "agent_self_report",
  "category": "tool_execution_follow_through",
  "friction_level": 2,
  "frustration_evidence": "none",
  "context": {
    "goal_summary": "Comparar os históricos completos dos chamados relacionados.",
    "observed_outcome": "A Beta reconheceu a lacuna, mas não recuperou os históricos naquela resposta.",
    "identified_gap": "A ação de acompanhamento não foi executada na resposta.",
    "evidence_refs": []
  },
  "status": "new",
  "confidence": 0.8,
  "tool_event_ref": null,
  "idempotency_key": "9f855fa3-1258-45a1-82e5-6d9961430241"
}
```

Esses exemplos são sintéticos e não foram gravados. O nível 2 e o escore `0.8` são ilustrativos; o piloto deverá validar a aplicação consistente da régua, sem alterá-la silenciosamente.

## Passo 3 — política de dados e acesso (decisões de produto fechadas; gate operacional pendente)

As decisões de produto abaixo refletem o que o usuário aprovou nesta conversa. Isso fecha o desenho funcional do passo 3; não é parecer jurídico nem autorização para ativar coleta em produção. Antes da produção, a organização ainda precisa indicar quem responde por pedidos de privacidade e validar o texto público. A LGPD lista princípios como finalidade, necessidade, transparência, qualidade e segurança no art. 6º. A ANPD esclarece que não há prazo universal de retenção; o prazo depende da finalidade e das circunstâncias.

### Finalidade e limites de uso

- Usar eventos somente para diagnosticar fricção, lacunas de conhecimento/capacidade e oportunidades de melhoria da Beta.
- O usuário aprovou rastreabilidade e ranking de frustrações cadastradas por analista para diagnosticar melhorias da Beta. Não interpretar o ranking automaticamente como avaliação de desempenho, intenção ou qualidade profissional; mostrar contagens, período, contexto e limitações, com atribuição apenas à identidade autenticada.
- Não promover reclamações nem autodiagnósticos a conhecimento validado. A equipe revisa e decide se vira tarefa, atualização de skill, ferramenta ou conteúdo aprovado.
- Exibir no painel contagens e tendências observadas, conforme o contrato v1. Não apresentar taxa de satisfação/frustração enquanto não existir denominador confiável de interações e metodologia calibrada.

### Dados permitidos e minimização

- Obrigatórios: tipo/categoria, origem do sinal, data, estado de revisão, nível 0–3 e contexto estruturado do contrato v1, sempre sanitizado.
- Identidade (decisão do usuário): rastrear qual analista registrou cada evento e permitir ranking por analista. Derivar identidade exclusivamente do principal OAuth validado no servidor; guardar ID estável da conta e identificação exibível no momento do evento. Nunca aceitar e-mail, papel ou identidade enviados pelo modelo. Se a identidade autenticada não estiver disponível, gravar `actor_status=unidentified`, `actor_id=null` e motivo técnico seguro; nunca adivinhar ou atribuir pela redação. Não identificados aparecem em grupo próprio e fora do ranking nominal.
- Correlação técnica: guardar somente referência opaca a evento operacional do D1 quando necessária para explicar a experiência. Não replicar latência, payload, erro técnico ou resultado completo no Supabase.
- Contexto de conversa: guardar o resumo estruturado e um recorte curto, relevante e sanitizado da interação que evidencia a frustração/lacuna, com sequência mínima necessária para entender pedido, resposta e falha. Não guardar transcript integral nem conteúdo de turnos sem relação. As referências a chamadas MCP/registros de origem são IDs opacos e só podem apontar para dados que o analista autenticado estava autorizado a consultar.
- Campos livres passam por limite de tamanho e sanitização no servidor. Rejeitar tokens, segredos e raciocínio interno. Nome de cliente, pessoa, e-mail, telefone ou dado comercial só entra no recorte se for indispensável ao diagnóstico e permitido pela classificação; preferir mascarar.
- Linguagem ofensiva: registrar a palavra/expressão exata detectada e sua forma normalizada, quando visível no contexto recebido, junto à identidade autenticada e ao recorte sanitizado. Não inferir autoria quando o texto não permite atribuição confiável. Guardar separadamente se a expressão foi dirigida à Beta, a outra pessoa ou se o alvo é incerto.
- “Por que o analista usou essa linguagem” deve separar motivo declarado pelo analista de hipótese categorizada pela IA. A hipótese inclui evidência, confiança e estado não revisado; nunca afirmar estado emocional ou intenção como fato.

### Acesso e responsabilidades

| Ação | Decisão do usuário ou desenho pendente |
|---|---|
| Registrar feedback contextual | Ferramenta MCP dedicada exige usuário OAuth ativo com novo scope `feedback:write`. Só registra feedback explícito ou autodiagnóstico baseado em evidência observada; actor, horário e refs técnicas são definidos/validados no servidor. A gravação falha de forma segura e não bloqueia a resposta principal. |
| Transparência/ambiguidade | Publicar aviso claro na página de privacidade antes de habilitar a captura. Feedback explícito pode ser registrado sob a base legal definida pelo responsável; após gravação bem-sucedida, a Beta informa que salvou um resumo e oferece correção/não registro. “Não registre isso” impede a captura daquele evento. Inferência de frustração exige confirmação antes de persistir. Não presumir base legal pelo uso do plugin nem apresentar consentimento como base sem decisão formal. |
| Registrar autodiagnóstico | A mesma ferramenta aceita somente evento estruturado, resumo/contexto sanitizados e evidências/referências permitidas; não aceita transcript ou identidade escolhida pelo modelo. Todo evento permanece sujeito a revisão humana. |
| Consultar eventos individuais | Somente rota Sites administrativa server-side para sessão ativa com role `master`, seguindo o padrão de proteção das rotas administrativas atuais. O browser nunca acessa Supabase diretamente. Não criar ferramentas MCP de leitura de feedback para o modelo. |
| Consultar agregados | O usuário quer uma nova rota administrativa robusta no Sites para métricas e investigação. Exibir ranking por analista, grupos de frustrações semelhantes e métricas de linguagem ofensiva, além de período, categoria, nível e estado de revisão. Rota sugerida: `/admin/feedback`; adicionar link no rodapé administrativo/inicial conforme padrão do site. |
| Agrupar casos semelhantes | A IA pode sugerir grupos por causa/necessidade subjacente, mesmo com redações diferentes, usando resumo, palavra-chave, embedding e categoria. Cada caso original permanece íntegro; guardar cluster, rótulo explicável, confiança e versão do agrupador. Grupos precisam ser revisáveis e permitir mover, unir e separar casos; não permitir que a IA apague ou reescreva evidência. |
| Ranking e linguagem ofensiva | Mostrar contagem de eventos por analista e lista/frequência das palavras ofensivas detectadas, com casos expansíveis, período e cobertura. Manter “não identificado” separado. A razão para a linguagem aparece como declaração do analista ou hipótese da IA, claramente marcada. Contagens não equivalem a taxa comparável sem denominador de uso; mostrar volumes observados e não rotular pessoas como frustradas. |
| Corrigir/revisar/remover | Master pode editar somente resumo do objetivo, resultado, lacuna e motivo declarado; não é guardado o valor anterior. Master pode remover um evento detalhado. Um pedido de remoção de analista apaga seus eventos, termos ofensivos, agregados mensais e agrupamentos associados; eventos de outros analistas ficam preservados e sem o agrupamento removido. A auditoria guarda só identidade do master, hash da identidade-alvo, ação e nomes dos campos, por até 90 dias. |
| Ler pelo banco | Somente Worker/servidor com segredo Supabase. RLS e grants devem negar acesso ao cliente; checagem OAuth/papel continua obrigatória no servidor, pois a chave `service_role` ignora RLS. |

Scope `feedback:write` é o scope novo para a ferramenta de gravação e exige reautorização OAuth. O painel web reutiliza a validação de sessão + role master já existente e não precisa de `feedback:admin` como scope MCP, pois não é uma ferramenta acessível ao modelo. Não ampliar `knowledge:write` para esse propósito.

As classificações e resumos enviados pelo modelo são **alegações estruturadas**, não evidência verificada pelo MCP: o servidor não recebe a mensagem humana original nem o transcript. Todo evento entra como `new`/não revisado. A única evidência técnica que o servidor pode confirmar é uma referência de ferramenta que ele próprio valide. O painel deve identificar claramente eventos ainda não revisados; nenhuma automação pode agir sobre sua classificação sem revisão humana.

### Retenção, correção e exclusão

- **Aprovado pelo usuário:** eventos detalhados por até **90 dias**, com exclusão automática ao vencer.
- **Aprovado pelo usuário:** depois, manter contagens mensais agregadas por até **12 meses**, sem ocultar grupos pequenos. Para sustentar o ranking histórico solicitado, as agregações podem ser agrupadas por `actor_id` autenticado e categoria/palavra normalizada; portanto, são dados pseudonimizados/identificáveis, não anônimos. Exibir somente no painel master protegido. Excluir rótulos contextuais e recortes ao completar 90 dias.
- Auditoria de revisão: manter por até 90 dias, alinhada à retenção dos eventos; não preservar conteúdo anterior substituído/excluído. Essa é a regra de implementação proposta para este ciclo.
- Atender pedidos autenticados de acesso/correção/exclusão por canal de privacidade publicado. A exclusão remove evento e actor_ref; só manter dado quando o responsável confirmar e documentar uma hipótese aplicável de conservação. Não inferir que o pedido exige ou permite retenção.
- **Decisão do usuário:** se o detalhe já virou agregado e a pessoa pede remoção, apagar todas as contagens identificadas daquele analista, em todos os meses ainda retidos, além dos eventos, termos ofensivos e agrupamentos associados. A operação mantém apenas auditoria mínima por até 90 dias, com hash da identidade-alvo, sem os dados removidos.
- Desativação da conta impede novas gravações imediatamente. Excluir seus eventos identificáveis no processo de desativação, salvo retenção especificamente justificada pelo responsável; registrar o resultado sem conteúdo do evento.
- Executar limpeza automatizada com métricas de sucesso/falha, mas sem payloads. Falha de limpeza gera alerta técnico no canal operacional, sem conteúdo pessoal.

Os prazos de 90 dias e 12 meses são decisões de produto aprovadas pelo usuário, não prazos legais universais. O controlador ainda precisa validar sua aplicação ao contexto e a eliminação final.

### Ambientes e proteção operacional

- Desenvolvimento/testes usam eventos sintéticos; não copiar eventos ou conversas de produção para ambientes locais. A captura em produção permanece desligada até a aprovação do gate de privacidade abaixo.
- Separar credenciais por ambiente, nunca expor `SUPABASE_SECRET_KEY` e nunca incluir conteúdo dos eventos em logs, traces ou relatórios de erro.
- Testar negação de acesso para usuário sem papel, tentativa de registrar em nome de outro analista, payload excessivo e tentativa de injetar segredo/transcript.
- Preservar a separação entre Supabase contextual e D1 técnico. Backup com eventos deve respeitar a mesma autorização/retenção; exclusões devem ser propagadas aos backups conforme ciclo documentado.
- O usuário pode corrigir seu feedback na conversa e solicitar que o evento não seja gravado/removido. O painel master disponibiliza estado de revisão e ações de corrigir, descartar, resolver e excluir; operações ficam auditadas sem preservar conteúdo removido.

### Gate de privacidade antes de ativar captura em produção

1. Nomear o controlador e confirmar a base legal aplicável ao contexto concreto; não assumir consentimento nem legítimo interesse neste documento.
2. Definir e publicar o canal de contato para direitos, aviso claro sobre finalidade, dados, retenção, acesso e como corrigir/impedir a gravação.
3. Confirmar região de hospedagem/transferência e a revisão de privacidade apropriada ao risco; documentar a decisão.
4. Implementar e testar autorização, opt-out por evento, limpeza, exclusão/correção e acesso master previstos acima.

Decisões de produto já definidas: rastreabilidade/ranking nominal, eventos não identificados em grupo separado, painel Sites agrupado e expansível, índice de linguagem ofensiva, retenção de detalhes por 90 dias e agregados por até 12 meses sem supressão de grupos pequenos. As agregações que sustentem ranking por analista continuam identificáveis e ficam protegidas no painel master. Recorte de contexto: guardar no máximo três trechos relevantes da interação, até 500 caracteres cada, sanitizados; incluir apenas falas necessárias para entender pedido, resposta e motivo, sem transcript integral.

Transparência e concordância: revisar `/privacy`, criar `/terms` e ligar as páginas. Na tela OAuth de conexão, exibir links e uma caixa obrigatória: “Li e concordo com os Termos de Uso e consultei o Aviso de Privacidade.” Usuários comuns confirmam manualmente, sem autoenvio. Por solicitação do usuário, endereços listados em `OAUTH_MASTER_EMAILS` recebem a caixa pré-marcada e autorização automática após dez segundos; desmarcar a caixa interrompe a contagem e cancelar abandona o fluxo. Nas instruções e na página inicial, manter uma mensagem curta com link aos termos e ao aviso antes do uso. Guardar versão dos termos aceita, horário, conta OAuth e cliente em registro de auditoria de autorização, separado dos eventos de feedback e com retenção própria definida na revisão do aviso. A concordância com Termos de Uso não substitui a explicação de quais dados são tratados nem decide, por si só, a base legal.

O passo 3 está **resolvido como política de produto v1**. O que resta é um gate operacional anterior à produção: designar o contato que aparecerá no aviso, confirmar internamente a entidade responsável e revisar o texto dos Termos/Aviso. Em termos simples, a organização precisa escolher quem atende um analista que peça para ver, corrigir ou remover seus dados. Isso não precisa ser decidido para avançarmos na implementação local e em dados sintéticos; a coleta real continua desligada até esse contato e o texto público serem definidos.

### Referências oficiais consultadas

- [Lei nº 13.709/2018 (LGPD), texto compilado — Planalto](https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709compilado.htm): princípios do art. 6º e regras gerais de tratamento/término.
- [Perguntas frequentes da ANPD — duração e término do tratamento](https://www.gov.br/anpd/pt-br/acesso-a-informacao/perguntas-frequentes): a LGPD não fixa prazo único; considerar finalidade e circunstâncias.
- [Direitos dos titulares — ANPD](https://www.gov.br/anpd/pt-br/assuntos/titular-de-dados/direito-dos-titulares): confirmação/acesso, correção, bloqueio/exclusão e informações sobre o tratamento.
- [Relatório de Impacto à Proteção de Dados — ANPD](https://www.gov.br/anpd/pt-br/canais_atendimento/agente-de-tratamento/relatorio-de-impacto-a-protecao-de-dados-pessoais-ripd): avaliar riscos, necessidade, proporcionalidade e salvaguardas antes do tratamento quando apropriado.

## Plano de trabalho

| Passo | Escopo | Saída verificável |
|---|---|---|
| 1. Confirmar observabilidade | Inventariar contexto de skills, argumentos MCP, resultados, erros e telemetria; validar contexto em conversa real. | **Concluído com ressalva:** inspeção estática + smoke manual informado pelo usuário. Demonstra contexto nesta conversa, não cobertura universal nem persistência. |
| 2. Fechar contrato de eventos | Definir taxonomia, origem, confiança, severidade, confirmação/correção, campos mínimos e denominador da métrica. | **Concluído como contrato funcional v1**, incluindo escala observável 0–3 e contexto mínimo estruturado. Nenhum evento real foi escrito. |
| 3. Fechar política de dados e acesso | Definir minimização, atribuição, acesso, correção/opt-out, retenção e os requisitos de transparência e concordância. | **Política funcional v1 resolvida** e decisões registradas acima. Gate pré-produção: a organização designar contato e validar textos públicos; coleta real permanece desligada até lá. |
| 4. Modelar Supabase | Criar tabelas separadas para eventos detalhados, termos ofensivos, agrupamentos, auditoria e agregados por analista; habilitar RLS sem acesso direto e definir RPCs de gravação, leitura, revisão, correção, remoção e limpeza/rollup. | **Aplicado ao remoto em 2026-10-22:** dez RPCs e tabelas com RLS sem grants diretos; jobs Cron ativos para rollup horário e limpeza diária do histórico somente dos jobs Beta. Ainda falta observar uma execução bem-sucedida e fazer chamadas funcionais autenticadas. |
| 5. Implementar captura MCP e API protegida | Adicionar registrador autenticado para feedback explícito e autodiagnóstico sanitizado; derivar identidade do OAuth validado, autorizar com `feedback:write`, preservar telemetria técnica em D1 e aplicar limites/idempotência. Criar acesso master-only para resumo, listagens, revisão, correção e remoção. | **Implementado localmente nesta worktree, não validado:** ferramenta e API master-only; feature flag mantém gravação desligada. Correção de campos permitidos, exclusão individual e exclusão de todo o histórico identificado (incluindo contagens) estão na API. Captura também depende de aceite vigente, verificado por OAuth. Build, SQL/RPC, política de execução automática e fluxo end-to-end pendentes. |
| 6. Atualizar plugin, skills e páginas públicas | Definir quando perguntar, como aceitar/corrigir feedback e quando acionar a ferramenta; revisar `/privacy`, criar `/terms`, ligar as páginas e adicionar mensagem/link de concordância no OAuth, página inicial e instruções. Exigir caixa marcada antes de autorizar; parar o autoenvio OAuth, exceto fluxo de validação para e-mails explicitamente configurados em `OAUTH_MASTER_EMAILS`, com contagem de 10 segundos, caixa pré-marcada e cancelamento disponível. A aceitação deve ser persistida e verificada pelo backend antes de qualquer ferramenta, não inferida apenas do scope. | **Parcialmente implementado localmente:** usuários comuns confirmam manualmente; somente e-mails em `OAUTH_MASTER_EMAILS` recebem a caixa pré-marcada e autorização automática em 10 segundos, interrompível por desmarcação ou cancelamento. Aceite D1 versionado por identidade, cliente e horário; middleware OAuth exige aceite vigente; `/privacy` e `/terms` descrevem correção, remoção individual e apagamento de contagens identificadas. Revisão de texto pelo responsável, build/fluxo real e canal operacional de pedidos ainda pendentes. A retenção foi aplicada ao Supabase; falta observar uma execução Cron bem-sucedida. Nenhum deploy. |
| 7. Apresentar no painel | Criar rota Sites master-only `/admin/feedback` com grupos de casos semelhantes expansíveis, ranking por analista, casos não identificados e índice de linguagem ofensiva. | **Implementado localmente, sem build ou revisão visual:** resumo por categoria/origem/fricção, ranking de sinais de fricção por analista, casos não identificados, grupos expansíveis com eventos e contexto sanitizado, palavras/expressões e decisões de revisão. Não apresenta taxa de frustração sem denominador confiável. |
| 8. Pilotar e calibrar | Validar precisão, falsos positivos, utilidade dos dados, fluxo de revisão e retenção com os analistas. | Relatório de piloto e decisão de ampliar, recalibrar ou interromper. |
| 9. Fechar ciclo de melhoria | Transformar lacunas confirmadas em itens rastreáveis, aplicar correções aprovadas e comparar casos de referência/tendências. | Evidência de correção; remover itens do backlog somente quando resolvidos. |

### Contrato local da API de administração

- `GET /api/admin/feedback?view=summary&months=1` retorna resumo; `view=groups` aceita `from`, `limit` e `offset`; `view=events` exige `group_id` UUID e aceita paginação; `view=profanity` aceita `months`, `limit` e `offset`.
- `POST /api/admin/feedback` recebe ações de revisão; correção (`correct`) somente nos campos contextuais permitidos; remoção de evento (`delete`); ou remoção completa do histórico (`delete_analyst_history`) por ID OAuth. A identidade da operação vem da sessão ChatGPT autenticada. Remoção do histórico também apaga agregados identificados e clusters relacionados; contagens não identificadas permanecem separadas.
- Todas as leituras e revisões exigem papel `master`, usam RPCs via servidor e enviam `Cache-Control: no-store, private`. O endpoint não é uma ferramenta MCP e os dados não são devolvidos ao modelo.
- A interface `/admin/feedback` foi adicionada nesta worktree e usa esses contratos; ainda não foi compilada ou verificada em navegador.
- Erros da Data API são reduzidos a categorias seguras; paginação é limitada. Esta API ainda não tem interface visual e não foi validada por execução.

### Consentimento OAuth local

- A tela `/oauth/authorize` mantém confirmação manual para usuários comuns; para e-mails de `OAUTH_MASTER_EMAILS`, a caixa vem marcada e o POST é enviado após 10 segundos se o aceite continuar marcado. Desmarcar interrompe a contagem; o botão de cancelar permanece visível. O POST rejeita ausência de aceite.
- Após aceite, o servidor grava no D1 uma linha com `user_id`, e-mail autenticado, `client_id`, versão `2026-10-22-v2` e horário, na mesma operação em lote que cria o código OAuth. A versão vem do servidor, não do formulário. A atualização inclui correção/remoção de dados e a rotina de retenção planejada; versões anteriores exigem novo aceite quando esta mudança for publicada.
- `authorizeOAuthPrincipal` exige aceite da versão vigente antes de qualquer ferramenta/API protegida. Tokens sem aceite vigente recebem desafio de reconexão; isso também força usuários com autorização antiga a passar pela nova tela.
- O aceite habilita o uso sob os termos, mas não liga a captura contextual: `FEEDBACK_CAPTURE_ENABLED` continua sendo gate separado e desligado. A persistência do aceite não declara por si só a base legal da coleta; o responsável organizacional ainda precisa revisar o texto e as condições antes da produção.
- Exceção pedida pelo usuário para facilitar validação: apenas endereços presentes em `OAUTH_MASTER_EMAILS` recebem aceite pré-marcado e contagem automática de 10 segundos. Usuário pode desmarcar ou cancelar; os demais mantêm aceite manual e sem envio automático.

## Critério de conclusão global

A Beta registra apenas sinais que recebeu ou eventos técnicos que observou; explícito, inferido e operacional permanecem distinguíveis; o backend aplica identidade e autorização; os dados são minimizados e corrigíveis; o painel mostra limites de cobertura; e nenhum registro muda conhecimento ou produto sem validação humana.
