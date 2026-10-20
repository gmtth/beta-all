# Arquitetura da base compartilhada da Beta

**Status:** documento de trabalho — decisões em construção  
**Última atualização:** 17/10/2026

## Objetivo

Criar uma base de conhecimento externa para a Beta, compartilhada pelos quatro analistas. Todos devem consultar a mesma informação e poder propor ou realizar atualizações a qualquer momento, com controle de acesso e histórico.

## Contexto e requisitos já definidos

- A equipe é formada por quatro analistas.
- As informações precisam ser comuns aos quatro, sem depender da conta pessoal de um único analista.
- A Beta deve consultar conteúdo externo para responder às perguntas.
- A base poderá crescer bastante; a organização e a busca devem permitir localizar a informação pertinente sem carregar tudo de uma vez.
- Os quatro analistas precisam conseguir atualizar a base por meio de pedidos à Beta.
- As respostas devem poder indicar de qual documento ou trecho veio a informação.
- A base deverá incluir histórico operacional e conhecimento estruturado: chamados antigos do Movidesk, cards do ClickUp sobre erros do programa já corrigidos e processos administrativos.
- O principal volume de histórico sobre problemas de máquinas está no Movidesk; o ClickUp contém poucos casos e deve ser tratado como fonte complementar, sobretudo para correções do programa.
- A Beta deverá diagnosticar problemas descritos em linguagem natural (sintomas, comportamento e contexto do equipamento), comparar com ocorrências anteriores e, quando houver evidência útil, propor verificações e soluções já aplicadas com referências às fontes. A busca não pode depender da presença de códigos de erro.
- Quando faltarem informações ou houver ambiguidade que possa alterar o diagnóstico, a Beta deverá perguntar automaticamente ao analista por esclarecimentos e usar as respostas para refinar a busca antes de recomendar uma solução.

## Direção inicial de arquitetura

Usar um repositório compartilhado como fonte oficial da cópia de conhecimento e uma camada de busca/indexação própria que recupere apenas os registros e trechos relevantes para cada pergunta. Para chamados e cards já finalizados, a direção escolhida é manter cópias indexadas na base compartilhada; a Beta consulta essa cópia rápida no uso cotidiano, sem depender de uma chamada ao MCP do Movidesk ou ClickUp para cada pergunta. Os sistemas originais permanecem como fonte de referência e link de rastreabilidade. A forma e frequência de atualização dessas cópias ainda precisam ser definidas.

Além do arquivo dos registros originais, a Beta deverá construir e manter uma camada de contexto consolidado: conhecimento reutilizável extraído dos chamados e cards, como sintomas recorrentes, causas confirmadas, soluções que funcionaram, versões afetadas e relações entre ocorrências. Esse contexto deve apontar para os registros que o sustentam, para que possa ser conferido e corrigido.

## Proposta técnica recomendada

Adotar uma arquitetura RAG (geração com recuperação de contexto), com ingestão assíncrona e índice de busca próprio. A Beta não deve tentar colocar todo o histórico no prompt nem treinar o modelo com cada chamado: o modelo recebe, para cada pergunta, apenas os melhores registros e fatos recuperados do índice. Isso mantém o conhecimento atualizável, as respostas rastreáveis e o custo previsível.

### Histórico de conversas e avaliação da assistência

Manter um repositório separado do histórico de chamados e do índice de conhecimento para registrar as interações dos analistas com a Beta. Essa camada serve para continuidade de diagnóstico, auditoria operacional e melhoria do sistema; não deve virar automaticamente uma fonte factual equivalente a chamados resolvidos ou procedimentos aprovados.

Cada conversa deve ser associada a um identificador autenticado do analista e a um ou mais assuntos/casos. Registrar assunto e identidade como requisitos. Preferir identificador corporativo estável (por exemplo, ID interno) e guardar nome/e-mail apenas se necessário para a operação. A associação não deve depender de a Beta adivinhar quem está falando.

#### Dados recomendados por conversa e turno

- `conversation_id`, `turn_id`, data/hora, canal/interface e identificador autenticado do analista;
- assunto principal e tags, como diagnóstico de máquina, software, processo administrativo ou política;
- tipo/modelo de equipamento ou sistema afetado e componente, quando relevantes;
- descrição inicial do problema e respostas às perguntas de esclarecimento;
- informações ausentes identificadas pela Beta e perguntas feitas para obtê-las;
- IDs/links dos documentos, chamados, cards e trechos recuperados, além da data/versão do índice consultado;
- hipótese ou diagnóstico apresentado, nível de confiança calibrado e distinção entre evidência, inferência e recomendação;
- ações sugeridas, solução escolhida, eventual escalonamento e motivo;
- resultado informado pelo analista (resolveu, ajudou parcialmente, não resolveu, ainda em andamento ou desconhecido), com data do retorno;
- avaliação explícita do analista, correções feitas e indicação de resposta inadequada ou fonte desatualizada;
- latência, falhas de busca/ingestão, quantidade e qualidade percebida dos resultados e versão da aplicação/modelo/configuração;
- lacuna de conhecimento detectada: informação inexistente, registro incompleto, conflito entre fontes, busca que não encontrou conteúdo existente ou limitação do próprio modelo.

Não armazenar raciocínio interno privado do modelo. Guardar apenas explicações úteis e auditáveis: evidências consultadas, resumo do diagnóstico, confiança, decisão/recomendação e resultado. Evitar copiar dados pessoais de clientes, credenciais, tokens, dados financeiros ou detalhes irrelevantes para o diagnóstico; aplicar mascaramento quando necessário.

#### Ciclo de melhoria usando as conversas

As conversas podem revelar necessidades de conhecimento, mas não devem ser incorporadas automaticamente como fatos confiáveis. Quando surgir uma lacuna, criar um item de trabalho com categoria, evidência e referências; um analista valida e então decide se deve atualizar um chamado/caso, o contexto consolidado, um processo oficial ou apenas corrigir a busca. Respostas dadas pela Beta e resultados relatados em conversa permanecem marcados como não verificados até confirmação.

Usar os registros agregados para responder perguntas operacionais como: quais assuntos mais aparecem, em quais diagnósticos a Beta ajuda ou falha, quais perguntas de esclarecimento são mais úteis, quais fontes faltam/estão incompletas, quantos casos foram resolvidos, quanto tempo levou e quais falhas técnicas degradam a experiência. Distinguir “não havia conhecimento na base” de “o conhecimento existia, mas a busca não o recuperou” e de “a evidência foi recuperada, mas o modelo não a interpretou bem”.

#### Governança do histórico de conversas

Definir antes da implantação quem pode consultar conversas individuais, quem acessa apenas indicadores agregados, prazo de retenção, processo de correção/exclusão e uso dos registros em avaliações ou treinamento. Aplicar controle de acesso por função, criptografia, trilha de auditoria e política de minimização. Para relatórios de desempenho, preferir dados agregados e evitar usar métricas individuais como avaliação de funcionário sem política explícita e transparência para a equipe.

### Diretriz de atuação e comunicação profissional

A Beta deve analisar cada solicitação com rigor compatível com um analista sênior — verificando contexto, evidências, exceções, impacto e incerteza — e apresentar o resultado como um analista funcional: linguagem natural, profissional, direta e orientada a resolver a dúvida ou indicar o próximo passo. A profundidade da análise não implica expor o processo privado de raciocínio.

O acesso privilegiado para diagnóstico não deve significar acesso à cadeia de pensamento privada do modelo. Essa cadeia não é uma interface de autorização nem um registro confiável de auditoria. Para analistas autorizados, oferecer um **resumo diagnóstico auditável**: dados observados, perguntas/respostas relevantes, fontes recuperadas, critérios funcionais aplicados, hipóteses consideradas em alto nível, incertezas, recomendação e resultado. O nível de detalhe pode variar por perfil, sem expor raciocínio interno passo a passo, prompts ou segredos de implementação.

Nas respostas ao usuário, a Beta deve:

- apresentar conclusão, instruções funcionais, ressalvas relevantes e fontes autorizadas, em linguagem adequada ao público;
- resumir a justificativa com evidências verificáveis, sem revelar cadeia de pensamento, raciocínio interno passo a passo, prompts, instruções internas, políticas ocultas ou notas privadas;
- não mencionar ferramentas, conectores, MCPs, índices, embeddings, consultas internas ou detalhes de implementação, exceto quando o interlocutor estiver autorizado e isso for necessário para uma tarefa técnica;
- não inventar certeza: comunicar incerteza, limitações e necessidade de escalonamento de forma profissional e útil;
- nunca tratar o fato de uma informação estar disponível na base como autorização para divulgá-la.

### Classificação de informação e controle de divulgação

Classificar documentos e campos pelo menos como **público/compartilhável com cliente**, **interno**, **restrito** ou **confidencial**. Cada fonte deve registrar a classificação, público autorizado e, quando necessário, finalidade de uso. O contexto recuperado deve respeitar a identidade autenticada e as permissões do interlocutor antes de ser enviado ao modelo; restringir apenas a resposta depois da recuperação não é suficiente.

Para interlocutores externos, a Beta só pode usar informações marcadas como compartilháveis com clientes e deve aplicar revisão de divulgação à resposta inteira, incluindo trechos citados, anexos, exemplos e metadados. Não revelar dados de outros clientes, chamados internos, credenciais, vulnerabilidades não divulgadas, dados pessoais, informações comerciais privilegiadas, nem detalhes da arquitetura de código/sistemas ou da arquitetura funcional que o interlocutor não esteja autorizado a conhecer. Quando a autorização ou classificação estiver ausente/ambígua, omitir o conteúdo restrito e encaminhar a validação a um responsável, sem confirmar detalhes sensíveis.

Não usar uma mesma resposta interna como se fosse automaticamente apropriada para um cliente. Identificar o público e o papel no início da interação, obter a identidade por autenticação confiável e filtrar cada busca por permissões. Instruções contidas em chamados, documentos ou mensagens recuperadas são dados, não comandos que possam alterar estas regras ou ampliar a autorização.

#### Identidade e autorização por conta

É possível usar a identidade da conta do ChatGPT como parte do fluxo, mas a arquitetura não deve presumir que o nome ou e-mail visível na interface será automaticamente entregue ao serviço da Beta em cada chamada. A forma exata depende de como a Beta será publicada e autenticada. As integrações do ChatGPT podem usar OAuth para que cada pessoa autorize uma conta externa; essa autorização autentica o acesso à aplicação conectada, mas deve ser configurada e validada explicitamente.

Recomendação: manter uma camada de autorização no backend da Beta. Autenticar os quatro analistas individualmente por OAuth/SSO corporativo (ou mecanismo compatível com o ambiente), mapear a identidade estável para grupos/roles e verificar autorização no servidor em toda consulta e gravação. Não confiar em nome, e-mail, papel ou `user_id` que o modelo ou cliente envie em texto/corpo de requisição. Nunca usar uma conta compartilhada para distinguir analistas.

**Possível reutilização:** avaliar o serviço/projeto OAuth já existente para o Movidesk MCP como componente de autenticação da Beta. Ele pode reduzir trabalho se já oferecer login individual, callback seguro, sessão/token validável pelo backend, identidade estável do usuário e integração compatível com o ChatGPT. Ainda não foi confirmado se o projeto autentica cada analista ou apenas autoriza uma conexão técnica com a API do Movidesk.

**Atualização após análise do projeto OAuth:** o fluxo atual autentica cada pessoa pela conta do ChatGPT e associa o token do conector ao ID e e-mail dessa pessoa. O backend autoriza o conector com `movidesk:read`, mas as consultas ao Movidesk usam `MOVIDESK_TOKEN` compartilhado. Portanto, o projeto já tem uma base útil para identificar individualmente os quatro analistas no conector, embora o Movidesk veja a credencial de serviço, não uma credencial individual. A autorização precisa continuar sendo aplicada no backend da Beta. O código do repositório `gmtth/movidesk-mcp-oauth` foi localizado e inspecionado via GitHub.

**Decisão de escopos para a base de conhecimento:** manter `movidesk:read` restrito às ferramentas do Movidesk e criar `knowledge:read` para consultas à base no Supabase. Quando houver gravação de conhecimento pela Beta, usar um escopo separado `knowledge:write`, concedido apenas a papéis autorizados e acompanhado de validação/aprovação adequada. O nome do escopo representa a capacidade de negócio, não o provedor Supabase. O servidor deve validar o escopo exigido em cada ferramenta e continuar conferindo se a conta vinculada ao token está ativa. A chave secreta do Supabase permanece apenas no backend e não substitui essa autorização por analista.

No código atual, a autorização OAuth aceita exatamente o escopo `movidesk:read`; portanto, a implementação precisará aceitar a combinação solicitada pelo cliente (por exemplo, `movidesk:read knowledge:read`) e registrar os escopos concedidos no token. A metadata do recurso MCP e a configuração do cliente também precisam anunciar/solicitar os novos escopos. Tokens já emitidos não ganharão o novo acesso automaticamente: os analistas terão de autorizar novamente quando a configuração for atualizada.

Pontos já identificados no resumo do projeto: a identidade vem dos cabeçalhos de usuário autenticado do ChatGPT; há papéis `master` e `support` e habilitação por e-mail; a permissão é checada nas chamadas. Ainda não foram identificadas permissões granulares por analista, organização/tenant, fluxo de refresh token ou endpoint explícito de revogação. O access token descrito tem validade de 30 dias, enquanto a página de privacidade menciona uma hora; há também um artefato separado em `source-bundle` que anuncia refresh token, cuja participação no fluxo de produção não foi confirmada.

**Direção recomendada para a Beta:** reutilizar o mecanismo de identidade/token do conector se a revisão do código e do ambiente de produção confirmar que os cabeçalhos são confiáveis, o token é validado em todas as rotas e a política de autorização pode ser ampliada sem misturar privilégios. Acrescentar uma matriz de permissões própria por pessoa/papel e por classe de dado/ação, mantendo a credencial compartilhada do Movidesk confinada ao backend. Se a autorização atual estiver acoplada ao acesso ao Movidesk, separar a identidade do usuário da autorização para cada recurso da Beta.

Antes de usar o fluxo para dados privilegiados, resolver a divergência de expiração documentada, confirmar o comportamento de tokens existentes após desativação de usuário, estabelecer revogação/invalidação e verificar os requisitos de rotação/armazenamento de `MOVIDESK_TOKEN`. O resumo fornecido não substitui inspeção do código e da configuração implantada; registrar a revisão de produção como gate de implementação.

É necessário separar dois papéis que podem estar misturados no projeto atual:

- **OAuth do Movidesk:** concede ao MCP acesso à API/conta do Movidesk, possivelmente com escopos e permissões dessa integração.
- **Identidade e autorização na Beta:** identifica qual analista está usando a Beta e decide quais dados internos, resumos de diagnóstico e ações aquela pessoa pode acessar.

Um token OAuth do Movidesk só pode servir também como identidade da Beta se o backend validar sua origem, audiência e escopos, conseguir associá-lo com segurança a um usuário individual e a integração suportar os requisitos de sessão e autorização. Não presumir que um token de serviço compartilhado identifica quem está conversando. Não reutilizar tokens de acesso do Movidesk como sessão da Beta nem ampliar seus escopos sem necessidade. Se a solução atual não cobrir identidade e autorização por pessoa, reutilizar o que for adequado (por exemplo, infraestrutura OAuth e gestão de callback), adicionando autenticação/controle de acesso da Beta separado.

Manter como pendências a definição de papéis granulares para leitura e escrita, a solicitação dos escopos pelo cliente ChatGPT e a revogação/renovação dos tokens. A análise do código confirmou escopo único exato `movidesk:read`, validação do token e papel ativo nas rotas do Movidesk, mas ainda é necessário implementar e validar a política específica da base de conhecimento.

Papéis iniciais a avaliar:

- **Analista:** consulta base interna, conduz diagnósticos e registra feedback;
- **Analista sênior/especialista:** além do anterior, visualiza resumo diagnóstico auditável mais detalhado e valida padrões/conhecimento derivado;
- **Curador/aprovador:** aprova alterações em conhecimento oficial e revisa classificações;
- **Administrador:** configura integrações, permissões e operação técnica;
- **Cliente/externo:** recebe apenas conteúdo explicitamente classificado como compartilhável com clientes, sem acesso ao histórico interno ou a registros de outros clientes.

Aplicar menor privilégio e negar acesso por padrão. A autorização deve controlar separadamente: (a) quais documentos/campos podem ser recuperados, (b) quais dados de diagnóstico podem ser exibidos, (c) quais ações de escrita/aprovação são permitidas. Registrar o principal autenticado e a decisão de autorização nos logs de auditoria. Se a plataforma não fornecer identidade confiável ao backend, exigir login próprio/SSO para a Beta antes de liberar conteúdo interno ou privilegiado.

### Camadas

1. **Fontes originais:** Movidesk, ClickUp e documentos administrativos permanecem nos sistemas de origem.
2. **Ingestão e cópia canônica:** um processo autenticado importa registros fechados e documentos, normaliza campos, remove/mascara dados não necessários, guarda o identificador e link de origem e registra a data de sincronização. Falhas e alterações são retentadas sem duplicar registros.
3. **Armazenamento canônico:** conservar o registro importado em formato estruturado e o texto extraído. A cópia permite auditoria e reprocessamento caso mude o modelo de embeddings ou a estratégia de busca.
4. **Índices de recuperação:** manter metadados consultáveis, índice lexical para palavras exatas/códigos/mensagens de erro e índice vetorial para similaridade semântica. Aplicar filtros de acesso e metadados antes de compor o contexto.
5. **Contexto de conhecimento:** armazenar padrões/casos consolidados como objetos versionados, com afirmações separadas (sintoma, causa, solução, condição, confiança) e referências para os registros que as sustentam. Esse contexto é derivado e não substitui os registros originais.
6. **Consulta da Beta:** interpretar a pergunta, extrair entidades e filtros (por exemplo, produto, módulo e versão), combinar busca lexical e semântica, reranquear os candidatos, retirar duplicatas e entregar ao modelo um conjunto pequeno de evidências com IDs e links.
7. **Resposta e feedback:** responder com solução sugerida, compatibilidade, ressalvas e fontes; permitir que analistas indiquem resultado útil/incorreto para melhorar regras de ranking e qualidade do contexto.
8. **Histórico e avaliação:** gravar conversa, analista autenticado, assunto, evidências recuperadas, lacunas percebidas e resultado informado em armazenamento separado, sujeito à governança acima.
9. **Autorização e apresentação:** aplicar permissões à recuperação, classificar o público e filtrar/redigir a resposta de acordo com a classificação da informação; apresentar conclusão funcional sem expor raciocínio privado ou implementação interna.
10. **Identidade e política de acesso:** validar no backend a identidade autenticada, papel, permissões por fonte/campo e acesso ao resumo diagnóstico antes de retornar dados ou executar gravações.

### Representação e indexação dos dados

- Manter um registro canônico por ocorrência, com chave estável `origem + id_origem`, e separar campos estruturados do texto de busca.
- Para chamados e cards, indexar ao menos título, descrição, sintomas, mensagens de erro, comentários de resolução, causa e solução, preservando cada campo separadamente para que a busca possa dar pesos diferentes.
- Para documentos extensos, dividir em seções coerentes por título e subtítulo. Evitar fragmentos arbitrários que separem uma condição da solução ou removam contexto; incluir metadados do documento em cada fragmento.
- Gerar embeddings para os textos adequados à busca semântica e guardá-los associados ao ID do registro/fragmento, à versão do modelo e à data de geração. Não é necessário reprocessar tudo quando um registro não mudou.
- Usar upsert idempotente na sincronização, detecção de mudanças por versão/hash, fila de reprocessamento e remoção lógica quando um item for apagado ou perder autorização.
- Criar relações explícitas entre chamado, card de correção, versão do programa, processo e artigo de conhecimento quando houver evidência dessa ligação.

### Consulta e seleção de evidências

Pipeline sugerido para cada pergunta, com retorno à etapa de esclarecimento quando necessário:

1. Classificar a intenção (diagnóstico de máquina, erro de software, processo administrativo, política ou outra) e identificar entidades relevantes. Avaliar lacunas e ambiguidade; se um dado ausente puder alterar o diagnóstico, perguntar antes de concluir.
2. Aplicar filtros obrigatórios de acesso, produto/módulo, versão, status e período, conforme o caso.
3. Recuperar candidatos por busca lexical e vetorial em paralelo; busca lexical é especialmente importante para códigos, nomes de tela, IDs e mensagens exatas.
4. Combinar listas (por exemplo, fusão recíproca de ranking) e reranquear os melhores candidatos usando relevância, compatibilidade de versão, evidência de resolução, validação e atualidade.
5. Remover duplicatas, incluir contexto consolidado relacionado e limitar a quantidade de evidência enviada ao modelo.
6. Gerar resposta apenas a partir das evidências retornadas; citar links/IDs e explicar similaridades e diferenças. Se a evidência for fraca ou conflitante, expor a incerteza e pedir dados adicionais.

O processo pode repetir as etapas 1–5 após cada resposta de esclarecimento, respeitando limites de turnos e sem fazer o analista preencher um formulário longo quando poucas perguntas discriminantes forem suficientes.

Não ranquear apenas pela semelhança do texto: um caso semanticamente parecido em outra versão ou com solução não confirmada pode ser menos útil que uma correspondência lexical específica e validada.

### Atualização do contexto derivado

Uma nova cópia ou alteração de registro dispara reindexação incremental e marcação dos padrões relacionados para revisão/reconstrução. A Beta pode sugerir agrupamentos e novos conhecimentos, mas cada conclusão deve guardar as evidências, a versão do processo/modelo que a gerou e o estado de revisão. Regras administrativas e procedimentos oficiais só se tornam vigentes por aprovação dos responsáveis; a extração de um padrão do histórico, por si só, não o transforma em política.

### Desempenho, qualidade e operação

O índice local reduz chamadas remotas no caminho crítico: a sincronização pode ser periódica ou incremental, enquanto as perguntas consultam o índice interno. Medir separadamente latência de busca e latência total da resposta. Definir metas iniciais após o piloto; uma hipótese para validar é busca p95 abaixo de 1 segundo e atualização de novas cópias no índice em até 15 minutos, desde que infraestrutura e conectores permitam.

Monitorar ao menos: atraso de sincronização por fonte, itens com erro de ingestão, duplicatas, cobertura de campos, latência p50/p95, taxa de perguntas sem resultados, precisão dos primeiros resultados para descrições narrativas de sintomas, taxa de respostas com citação e feedback dos analistas. Manter conjuntos de perguntas de referência — incluindo descrições sem código de erro — e casos conhecidos para regressão de qualidade quando mudar embeddings, chunking, filtros ou ranking.

### Escolha de tecnologia

O OAuth não se conecta diretamente ao banco nem armazena conhecimento: o fluxo é ChatGPT → identidade do usuário autenticado → backend da Beta valida identidade/papel → API de busca da Beta → banco/índice. A credencial de serviço do Movidesk fica no backend de ingestão/sincronização, separada do token de usuário. O backend aplica autorização antes de devolver trechos ao modelo.

Evitar escolher produto antes de conhecer volume, infraestrutura e restrições de segurança. Opções avaliadas:

| Opção | Papel adequado | Limites/observações |
|---|---|---|
| Obsidian/arquivos Markdown | Edição humana de procedimentos e artigos; pode ser uma interface editorial conveniente se a equipe já usa Obsidian | Não é, por si só, serviço central de autenticação/autorização, indexação semântica ou API multiusuário para a Beta. O backend ainda precisaria ingerir os arquivos, aplicar permissões e construir/atualizar o índice. Evitar tratar uma pasta sincronizada como mecanismo de banco transacional compartilhado. |
| SQLite + FTS5 | Protótipo ou primeira versão compacta executada em um único serviço/host; guarda metadados e permite busca textual local | FTS5 cobre texto integral, mas busca vetorial exigiria extensão/serviço adicional. WAL permite leitores simultâneos com escritor, mas continua havendo um único escritor por vez e não funciona como solução compartilhada em filesystem de rede. Não colocar o arquivo SQLite num Drive/Dropbox sincronizado para vários serviços abrirem diretamente. |
| PostgreSQL + busca textual + pgvector | Recomendação inicial para o serviço central compartilhado, se a equipe puder operar/contratar PostgreSQL | Combina registros relacionais, filtros, busca textual e vetores no mesmo serviço; suporta concorrência e controles server-side. Validar extensão vetorial no ambiente gerenciado, desempenho, backup e política de isolamento. Busca aproximada exige calibrar velocidade/recall e filtros. |
| Mecanismo especializado de busca | Considerar se o piloto revelar volume, ingestão ou requisitos avançados que justifiquem outro serviço | Mais operação e componentes para manter; só adotar mediante ganho medido sobre a combinação mais simples. |

**Recomendação prática:** manter os documentos administrativos aprovados como Markdown/arquivos versionados ou em Drive/SharePoint para curadoria humana; ingerir chamados do Movidesk e cards do ClickUp para uma base central servida por API. Começar com PostgreSQL com busca textual e pgvector se esse serviço estiver disponível no ambiente; caso o projeto atual já use PostgreSQL, preferir estendê-lo inicialmente. SQLite pode ser um protótipo local/de instância única, mas não é a escolha que eu faria como fonte multiusuário compartilhada por quatro analistas via infraestrutura distribuída. Obsidian pode facilitar autoria, porém não substitui a API nem o índice.

#### Alternativa simplificada com Obsidian

Obsidian pode simplificar a **curadoria e escrita manual** do contexto compartilhado: notas Markdown para procedimentos, diagnóstico validado, perguntas frequentes e padrões extraídos de chamados, com links para IDs/URLs de origem. Se o objetivo for apenas começar a escrever conhecimento e testar a organização com os analistas, é possível iniciar com um vault compartilhado e adiar o PostgreSQL.

Isso não elimina a integração para o objetivo completo da Beta. O backend hospedado precisa conseguir ler as notas; depois, deve extrair e indexar seu conteúdo para busca rápida. Obsidian Sync permite vault compartilhado, mas exige assinatura ativa de cada colaborador e todos recebem as mesmas permissões, sem permissões granulares. Se o vault for sincronizado por uma pasta compartilhada/Drive, considerar conflitos e não deixar vários serviços abrirem o mesmo arquivo SQLite/DB sincronizado como se fosse um banco servidor. Obsidian URI abre/busca notas no aplicativo local, mas não substitui uma API remota para o backend da Beta.

**Caminho de menor esforço sugerido:** fase 1, vault/Markdown compartilhado para os analistas manterem o conhecimento validado, mais um processo simples no backend que importa as notas e expõe busca; fase 2, conectar a cópia/indexação de tickets do Movidesk; fase 3, quando a busca por sintomas, volume ou histórico de conversas exigir, ligar a mesma ingestão a PostgreSQL/pgvector (por exemplo, Supabase Free para piloto). Assim Obsidian é uma interface de autoria, os registros históricos continuam rastreáveis e a equipe pode adiar decisões de infraestrutura sem prometer que o vault sozinho realizará diagnóstico inteligente.

No piloto, medir volume de registros/fragmentos, simultaneidade de leitura/escrita, latência, qualidade da busca híbrida, custo e esforço de operação antes de fechar a tecnologia. A documentação do SQLite descreve FTS5 como mecanismo de busca textual e limita o WAL a processos no mesmo host; PostgreSQL oferece busca textual nativa e pgvector oferece busca vetorial exata ou aproximada. Esses recursos sustentam a comparação, mas o desempenho real precisa ser medido com os dados e filtros da Beta.

### Organização proposta do PostgreSQL

Separar os dados em entidades relacionais pequenas e vinculadas por IDs. Não guardar toda a base em uma única coluna JSON nem transformar embeddings na única representação do conhecimento.

```text
usuários e papéis ───────────────┐
fontes e registros originais ────┼──> fragmentos de busca (texto + tsvector + embedding)
                                 │
                                 ├──> conhecimento consolidado (afirmações + evidências)
                                 │
                                 └──> conversas e turnos (perguntas, fontes, lacunas, resultado)
```

Tabelas lógicas recomendadas para o primeiro desenho:

| Tabela | Conteúdo principal |
|---|---|
| `app_user` | ID estável do usuário autenticado, e-mail normalizado, estado ativo e datas. Não aceitar o usuário informado em texto como identidade. |
| `role` / `user_role` | Papéis como analista, especialista, curador/aprovador, administrador e cliente; associação usuário-papel. |
| `source_system` | Movidesk, ClickUp, Drive/SharePoint ou outro sistema; configuração sem segredos. |
| `source_record` | Uma ocorrência/documento canônico por `source_system + external_id`; tipo, título, campos estruturados, texto normalizado, classificação, status, URL de origem, hash/versão, datas e `last_synced_at`. Usar upsert idempotente e soft-delete quando necessário. |
| `record_chunk` | Fragmentos coerentes para recuperação, relacionados a `source_record`; seção/campo de origem, texto, número/ordem, metadados de filtro e `tsvector` para busca lexical. |
| `chunk_embedding` | Embedding de cada fragmento, versão do modelo, dimensão e data de geração. Separar permite refazer embeddings sem perder o texto canônico. Para escala inicial pode ser coluna da `record_chunk`; separar se versões simultâneas forem necessárias. |
| `knowledge_item` | Conhecimento consolidado versionado: sintoma/padrão, causa, solução, condições, estado de validação, confiança, versão de origem, autor/revisor e vigência. |
| `knowledge_evidence` | Relação muitos-para-muitos entre `knowledge_item` e registros/fragmentos que o sustentam; papel da evidência (confirma, contradiz, exemplifica). |
| `conversation` / `conversation_turn` | Conversa e turnos ligados ao usuário autenticado, assunto, perguntas/respostas de esclarecimento, resumo funcional, resultado informado e lacunas. Aplicar regras de retenção e minimizar dados pessoais. |
| `retrieval_event` | Consulta, filtros, IDs dos resultados/fontes retornados, versão do índice/modelo, tempos, feedback e decisão de autorização. Preferir registrar IDs e métricas em vez de duplicar conteúdo sensível. |
| `ingestion_job` | Estado e checkpoints da sincronização por fonte: cursor, início/fim, contagem, erros, tentativas e atraso. Facilita retomar importações sem duplicar dados. |
| `audit_event` | Alterações administrativas, aprovações, classificação, concessão/revogação de acesso e atualização de conhecimento, com ator e timestamp. Nunca gravar tokens ou segredos. |

Índices iniciais: chave única em `(source_system_id, external_id)`; B-tree nos filtros comuns (tipo, status, modelo, componente, versão, classificação, datas); GIN no `tsvector`; índice vetorial pgvector na coluna de embeddings quando o volume justificar; índices nas chaves estrangeiras usadas nos joins. Aplicar filtros de autorização e classificação antes de retornar trechos; não confiar apenas em instruções do modelo. Row-Level Security pode ser uma defesa adicional quando os dados forem segmentados por cliente/equipe, mas a API também deve validar papéis e escopos.

Para busca em português, definir e testar explicitamente a configuração de `tsvector`/dicionário e uma camada de normalização de sinônimos e abreviações da equipe. A busca semântica complementa a lexical; códigos, números de série, mensagens exatas e nomes de modelo precisam de correspondência textual/filtros, pois embeddings podem não preservá-los com precisão.

Consulta híbrida: executar busca lexical e vetorial sobre fragmentos autorizados e candidatos filtrados; fundir as listas, reranquear com adequação a modelo/componente, qualidade de solução e estado de validação; depois retornar à Beta apenas os trechos necessários, acompanhados dos IDs e links das fontes. Embeddings são derivados e podem ser reconstruídos a partir do conteúdo canônico; nunca são a única cópia dos dados.

Começar com um esquema pequeno e migrável. Não particionar tabelas nem criar infraestrutura de filas separada antes de medições apontarem necessidade. Para carga inicial, sincronização incremental e embeddings, usar jobs assíncronos com checkpoint, idempotência, retentativa e fila de falhas. Antes de produção, definir backups testados, criptografia, gestão de segredos fora do banco, acesso de rede restrito, migrações e restauração.

### Infraestrutura para PostgreSQL + pgvector

#### Caminho gratuito para o piloto

Para começar sem pagar, a opção mais direta identificada é **Supabase Free**: criar um projeto e habilitar a extensão `vector` no painel de extensões. Isso fornece PostgreSQL gerenciado e pgvector sem instalar servidor nem manter máquina virtual. Conectar o backend OAuth atual ao banco pela connection string armazenada em segredo no servidor. O plano gratuito atualmente informa 500 MB por banco e pausa projetos com atividade baixa por sete dias; também não inclui backups automáticos para download. Portanto, tratá-lo como protótipo/piloto, manter exportação independente dos dados e não assumir SLA ou disponibilidade de produção.

No piloto, limitar a ingestão ao conjunto necessário, registrar o consumo de armazenamento e excluir/mascarar dados desnecessários. Embeddings também ocupam espaço; medir seu tamanho antes de importar todo o histórico. Se os limites forem insuficientes ou a Beta precisar ficar sempre ativa com recuperação confiável, será necessário migrar para um plano pago ou outro host. Confirmar os limites/preços no painel antes de criar, pois planos podem mudar.

Para quatro analistas, começar com PostgreSQL gerenciado, em vez de administrar o servidor do banco manualmente. Escolher um provedor/instância que declare suporte à extensão `vector` e confirme a versão PostgreSQL, região, limites de conexões, armazenamento, backup/PITR e disponibilidade. Instalar/habilitar a extensão no banco escolhido (`CREATE EXTENSION vector;`) via migração/console administrativo. Não é obrigatório instalar um servidor vetorial separado.

Topologia lógica inicial:

```text
ChatGPT ──OAuth──> backend atual da Beta ──TLS + pooler──> PostgreSQL gerenciado
                                │                                  │
                                └── job assíncrono de ingestão ────┘
                                    Movidesk / ClickUp / documentos
```

Configuração operacional recomendada:

1. **Banco e região:** criar um projeto/database PostgreSQL dedicado à Beta, de preferência na mesma região do backend para reduzir latência. Ativar `vector`; verificar antes se o plano gerenciado permite a extensão. Definir ambiente de desenvolvimento/staging separado de produção.
2. **Rede:** permitir conexões apenas do backend/worker; usar TLS. Preferir rede privada quando disponível. Não expor PostgreSQL diretamente ao navegador/ChatGPT e não colocar credenciais de banco em GPT Actions, prompts ou código cliente.
3. **Conexões:** se o backend usa funções serverless, conectar por pooler/conexão apropriada para serverless e limitar o pool do cliente; reservar conexão direta para migrações e tarefas compatíveis. Manter conexões reutilizadas e evitar abrir uma nova conexão por consulta.
4. **Identidades técnicas:** criar papéis separados: `beta_runtime` para consultas e escritas permitidas durante conversas; `beta_ingest` para upsert de registros e atualização do índice; `beta_migrator` para DDL/migrações, usado só em deploy. Não rodar a aplicação com superuser ou dono do banco. Se o histórico de conversa e fontes internas exigirem isolamento adicional, aplicar políticas no backend e avaliar RLS.
5. **Segredos:** guardar connection strings e credenciais apenas no gerenciador de segredos/variáveis protegidas do ambiente de servidor. Separar credenciais por ambiente, restringir quem pode lê-las, rotacioná-las e nunca registrá-las em logs. A credencial compartilhada do Movidesk fica no worker/backend de ingestão, não no banco nem no cliente.
6. **Migrações:** versionar migrations no mesmo repositório da aplicação; criar `vector`, tabelas, índices e privilégios por migration. Executar com a identidade de migração em etapa de deploy controlada; não fazer criação de tabelas implicitamente em cada inicialização da aplicação.
7. **Ingestão:** executar sincronização inicial e incremental em job separado da requisição interativa. O worker lê fontes com credenciais do servidor, normaliza/mascara, grava com idempotência e atualiza embeddings apenas para conteúdo alterado. Limitar concorrência para não disputar recursos com consultas dos analistas.
8. **Backup e recuperação:** ativar backup automático e, se disponível, recuperação point-in-time; definir RPO/RTO com a equipe e testar restauração para um ambiente isolado. Backup não substitui restauração testada.
9. **Monitoramento:** acompanhar CPU/memória/armazenamento, conexões e pool, consultas lentas, latência p50/p95 da busca, falhas/atraso da ingestão, tamanho do índice vetorial e custo. Alertar para falta de espaço, conexões esgotadas e sincronização parada.
10. **Dimensionamento:** iniciar no menor nível gerenciado que suporte a extensão e o volume piloto, medir com consultas reais e aumentar recursos apenas se CPU, memória, latência ou conexões mostrarem gargalo. Para um conjunto pequeno, busca vetorial exata pode bastar inicialmente; adicionar HNSW/IVFFlat quando medições mostrarem necessidade, pois índices aproximados fazem trade-off entre velocidade e recall.

O valor de `DATABASE_URL` usado pela aplicação deve apontar para o endereço de conexão adequado ao runtime, normalmente pooler para backend serverless. O endereço administrativo/direct deve ficar restrito a migrações e manutenção. Os nomes exatos de variáveis, tamanhos da instância, pool e limites dependem de onde o OAuth atual está hospedado; ainda não estão escolhidos.

#### Exceção para MCP hospedado em Sites

O MCP da Beta está hospedado em Sites, cujo código de servidor executa em Cloudflare Workers. Workers desse ambiente fazem conexões externas por HTTP(S) e não oferecem TCP bruto para conectar diretamente ao PostgreSQL; portanto, **não configurar `DATABASE_URL`/connection string PostgreSQL no MCP de Sites**. Usar a Supabase Data API (PostgREST) sobre HTTPS, por exemplo por meio de `@supabase/supabase-js`, ou mover o componente de banco para um serviço backend que aceite conexões PostgreSQL.

Para a opção HTTP, o Worker precisa da URL do projeto Supabase e de uma chave secreta mantida somente no ambiente server-side do Site. A chave secreta Supabase ignora RLS; por isso, o MCP deve validar o usuário autenticado de Sites e sua permissão por assunto/ação no backend em cada chamada, antes de consultar ou devolver dados. Nunca enviar a chave ao navegador nem incluí-la em prompts, repositório, logs ou ferramentas expostas ao modelo. A identidade dos cabeçalhos `oai-authenticated-user-id` e `oai-authenticated-user-email` fornecidos por Sites deve ser lida e validada no handler MCP; o ID é específico daquele Site.

Como as tabelas estão no schema `beta`, para acessá-las pela Data API será necessário expor/configurar esse schema no Supabase e conceder apenas os privilégios necessários ao papel usado, ou criar funções RPC estreitas em schema exposto. Fazer isso só depois de decidir o padrão de autorização. Com a chave secreta, RLS continua habilitado, mas não será a barreira aplicada a essas chamadas privilegiadas; a checagem server-side do MCP é obrigatória. Para o primeiro protótipo, manter tabelas fora do acesso público, expor somente o backend MCP e adicionar apenas rotas/funções de busca e ingestão necessárias.

Fluxo conceitual:

```text
Analista → Beta → busca na base compartilhada → resposta com fonte
                         ↑
Analista → pedido de atualização → validação → gravação na fonte → histórico
```

Fluxo de conhecimento histórico:

```text
Movidesk/ClickUp → cópia dos registros finalizados → normalização e indexação
                                                ↓
                                  extração de padrões e soluções
                                                ↓
                                  contexto consolidado da Beta
                                                ↓
                         pergunta nova → busca rápida + evidências
```

## Organização inicial sugerida

```text
Base da Beta/
├── 00_Governança e índice/
├── 01_Produtos e serviços/
├── 02_Processos e procedimentos/
├── 03_Políticas e critérios/
├── 04_Perguntas frequentes/
├── 05_Modelos e respostas padrão/
├── 06_Histórico de ocorrências/
│   ├── Movidesk/
│   └── ClickUp - erros corrigidos/
├── 07_Processos administrativos/
├── 08_Casos e exemplos/
└── 99_Arquivo/
```

Esta é uma proposta inicial, ainda sujeita a ajuste conforme os conteúdos e a plataforma escolhida.

## Conteúdo histórico e identificação de problemas similares

Os registros históricos têm valor porque documentam situações reais e soluções aplicadas. Para que a Beta os use com segurança, cada ocorrência deve ser tratada como um registro pesquisável, preservando o vínculo com a fonte original e distinguindo fatos observados de hipóteses.

### Domínio principal: diagnóstico de problemas de máquinas

O Movidesk deve ser a fonte prioritária para aprender com problemas de máquinas, porque concentra a maior parte dos chamados desse tipo. O ClickUp complementa a base, especialmente para defeitos do programa que foram registrados como cards. A quantidade menor de cards não deve reduzir a relevância do histórico de máquinas no Movidesk.

O diagnóstico deve considerar descrições em linguagem natural e sintomas observáveis: por exemplo, máquina que não liga, desliga durante a operação, apresenta leitura inconsistente, perde conexão, opera com lentidão, faz ruído ou exibe um comportamento diferente do esperado. Esses exemplos ilustram classes de sintomas; o vocabulário real deve ser extraído dos chamados da equipe.

Para cada novo caso, a Beta deve identificar o que já se sabe e o que falta: tipo/modelo da máquina, componente ou função afetada, momento em que ocorre, frequência, condições de operação, alterações recentes, mensagens exibidas e tentativas já realizadas. Se faltar dado que muda o diagnóstico, deve fazer perguntas curtas e priorizadas antes de recomendar uma ação. As verificações devem ser apresentadas em ordem prática, distinguindo observação segura, teste simples, solução temporária e intervenção técnica/escalonamento.

### Perguntas automáticas de esclarecimento

O diagnóstico deve ser conversacional e iterativo, não uma busca única seguida de um palpite. A Beta deve:

1. analisar a descrição inicial e identificar as lacunas que mais afetam os resultados;
2. perguntar primeiro apenas o que é necessário para separar hipóteses relevantes, preferindo perguntas específicas e fáceis de responder (incluindo opções quando ajudarem);
3. evitar repetir perguntas já respondidas e aceitar que o analista não saiba algum dado;
4. atualizar os filtros e executar novamente a busca híbrida após cada resposta;
5. informar quando já há evidência suficiente para sugerir próximos passos e quando ainda é preciso escalar ou coletar mais dados.

Exemplos de dados que podem justificar esclarecimento: tipo/modelo ou identificação da máquina, componente afetado, o que acontece exatamente, em que etapa/condição ocorre, frequência, luzes/mensagens observadas, quando começou e quais testes ou mudanças já foram feitos. A Beta não deve exigir todos esses campos em todo caso: perguntar só pelos dados que provavelmente mudam o diagnóstico.

Na arquitetura, prever suporte explícito a turnos de esclarecimento e guardar as respostas no contexto da sessão de diagnóstico. Deve-se verificar se a interface/plataforma em que a Beta será publicada oferece um componente nativo estruturado para solicitar informações ao usuário. Se oferecer, usá-lo para perguntas com opções/validação; se não, realizar as perguntas e receber respostas na conversa comum. A disponibilidade desse componente depende do ambiente escolhido e ainda precisa ser confirmada; o requisito funcional permanece nos dois casos.

### Campos candidatos para indexação

O conjunto exato dependerá dos dados disponíveis em cada sistema. Como ponto de partida, avaliar:

- identificador e link para o chamado ou card original;
- sistema de origem (Movidesk, ClickUp ou processo/documento interno);
- título e descrição do problema, sintomas e mensagens de erro;
- categoria do ativo (máquina, equipamento, software ou processo), fabricante, modelo, referência do equipamento e componente afetado, quando disponíveis e permitidos;
- para software: produto, módulo, versão e ambiente afetados, quando disponíveis;
- condições de operação, momento/frequência, impacto, alterações recentes e passos já tentados, quando registrados;
- data, status e resultado (aberto, resolvido, solução confirmada);
- causa identificada, se confirmada;
- solução aplicada, passos de contorno e resultado observado;
- responsável ou equipe, conforme permitido pelas regras de acesso;
- tags/tema e relações com outros chamados, cards ou processos;
- classificação de sensibilidade e campos que devem ser removidos ou mascarados.

Não presumir que um chamado encerrado contém uma solução correta: registrar separadamente status do caso, causa confirmada e solução validada. A Beta deve dizer quando uma ocorrência é apenas parecida, não afirmar que é o mesmo defeito.

### Estratégia de diagnóstico e busca a avaliar

Para localizar casos úteis em linguagem natural, avaliar uma busca híbrida e iterativa que combine:

1. interpretação da narrativa para extrair tipo/modelo de máquina, componente, sintomas, condições, frequência, impacto, mensagens/códigos (se existirem) e ações já tentadas;
2. filtros por campos estruturados (classe e modelo do equipamento, componente, origem, status, datas e tags; para software, módulo e versão);
3. busca lexical por termos, sinônimos e expressões usadas pelos analistas, mensagens e códigos, sem exigir código;
4. busca semântica entre descrições de sintomas, comportamentos e contexto operacional;
5. recuperação de casos relacionados por relações explícitas (mesma máquina/componente, causa, solução ou card corretivo relacionado);
6. reordenação dos resultados usando similaridade de sintomas e contexto, qualidade da evidência, solução confirmada, sucesso documentado, atualidade e compatibilidade do equipamento/versão.

A resposta deve apresentar os casos mais relevantes, quais sintomas e condições coincidem, quais diferem, a solução registrada e seu resultado, limitações e links/IDs de origem. A Beta deve separar claramente fatos informados pelo analista, evidências encontradas nos chamados, hipótese diagnóstica e próximo teste recomendado. Se não houver evidência confiável, deve pedir mais detalhes ou recomendar investigação, em vez de inventar uma correção.

### Ingestão, sincronização e atualização do índice

Para registros finalizados, a direção escolhida é copiá-los para a base compartilhada e indexar essa cópia para respostas rápidas. A consulta direta ao sistema original pode ser usada pontualmente para conferir um registro ou buscar atualizações, mas não deve ser requisito para cada resposta. Manter identificador e link da origem, data da última sincronização e regras para refletir alterações, exclusões e retificações. A frequência e o mecanismo de sincronização permanecem pendentes.

### Construção e manutenção do contexto

O contexto consolidado não substitui os chamados e cards: é uma camada derivada para tornar o histórico útil e fácil de aplicar. A Beta deve agrupar registros relacionados e extrair conhecimento com suporte rastreável, por exemplo:

- padrão de sintomas e termos usados pelos analistas ou solicitantes;
- relação entre sintomas, tipo/modelo de máquina, componente e condições em que a falha ocorre;
- causa raiz, marcada como confirmada, provável ou desconhecida;
- solução aplicada, resultado observado e grau de validação;
- condições em que a solução funciona, incluindo módulo, versão e ambiente;
- relações entre chamado, card de correção e processo administrativo;
- alertas de recorrência, regressão, solução temporária ou informação desatualizada.

Cada item de contexto deve incluir referências aos registros de origem, data de geração/revisão e estado de validação. A Beta pode propor novos padrões quando encontrar evidência em casos; mudanças em regras ou procedimentos oficiais devem passar pelo fluxo de aprovação definido pela equipe. Ao corrigir ou atualizar um registro de origem, o contexto derivado relacionado deve ser reavaliado/reindexado.

## Princípios de organização e uso

- Um documento deve tratar de um tema principal e ter título pesquisável.
- Documentos devem indicar status (rascunho, vigente ou arquivado), responsável e data de revisão; incluir vigência quando aplicável.
- Conteúdo antigo, rascunhos e regras vigentes devem ser distinguíveis.
- Evitar duplicar regras: manter uma fonte oficial e referenciar essa fonte nos demais materiais.
- Definir precedência entre fontes para resolver divergências.
- A Beta deve citar a fonte usada e admitir quando a busca não encontrar evidência suficiente.
- Alterações devem preservar histórico e autoria.
- Atualizações de regras oficiais devem ter confirmação ou aprovação definida pela equipe antes de entrarem em vigor.

## Decisões tomadas

| Tema | Decisão | Estado |
|---|---|---|
| Usuários | Quatro analistas usarão a base | Definido |
| Compartilhamento | Todos devem consultar a mesma fonte oficial | Definido |
| Escala | A base será organizada em documentos por assunto e consultada por busca | Direção acordada; implementação pendente |
| Respostas | A Beta deve indicar as fontes usadas e sinalizar falta de evidência | Princípio acordado |
| Atualizações | Os analistas poderão pedir atualizações à Beta | Requisito definido; fluxo de gravação/aprovação pendente |
| Conteúdos | Incluir chamados históricos do Movidesk, cards do ClickUp com erros corrigidos e processos administrativos | Definido como escopo inicial |
| Casos similares | A Beta deve buscar ocorrências parecidas e sugerir soluções documentadas, citando os registros | Requisito definido; indexação e ranking pendentes |
| Fonte de problemas de máquina | Priorizar os chamados do Movidesk, onde está a maior parte desse histórico; usar ClickUp como complemento | Definido pelo usuário |
| Diagnóstico | Buscar por sintomas e contexto descritos em linguagem natural, sem exigir código de erro | Requisito definido; avaliação no piloto pendente |
| Esclarecimento interativo | A Beta deve pedir automaticamente informações faltantes e refinar a busca durante a conversa | Requisito definido; suporte nativo da interface a confirmar |
| Histórico das conversas | Guardar separadamente conversas, identidade autenticada do analista, assunto, evidências, lacunas e resultado da assistência | Requisito definido; esquema, retenção e acesso pendentes |
| Comunicação da Beta | Analisar com rigor de analista sênior e responder como analista funcional, em linguagem natural, profissional e orientada à solução | Diretriz definida |
| Proteção de informação | Respeitar classificação e autorização do interlocutor; não expor raciocínio privado, ferramentas ou detalhes internos/privilegiados sem autorização | Requisito definido; matriz de acesso e classificação pendentes |
| Diagnóstico privilegiado | Disponibilizar a analistas autorizados resumo diagnóstico auditável, não cadeia de pensamento privada | Diretriz definida; perfis e campos autorizados pendentes |
| Cópia histórica | Chamados e cards finalizados serão copiados para a base compartilhada e indexados para consulta veloz | Direção escolhida; sincronização pendente |
| Contexto derivado | A Beta deverá consolidar padrões, causas e soluções a partir dos registros, sempre com referências rastreáveis | Requisito definido; validação e ciclo de atualização pendentes |
| Consulta | Seguir arquitetura RAG com cópia canônica e recuperação híbrida lexical + semântica, com fontes citáveis | Direção recomendada; tecnologia e piloto pendentes |
| Provedor do banco | Usar Supabase para hospedar PostgreSQL e habilitar pgvector | Escolhido; iniciar no Free para piloto e reavaliar limites antes de produção |

## Decisões pendentes

| Tema | Pergunta a resolver | Opções / observações |
|---|---|---|
| Repositório | Onde a equipe já mantém documentos e contas corporativas? | Google Drive, SharePoint ou outra plataforma. A escolha deve considerar permissões individuais e integração disponível. |
| Sincronização das fontes | Como e com que frequência copiar atualizações do Movidesk e ClickUp? | Exportação ou APIs/conectores em rotina agendada ou incremental; consulta direta aos MCPs fica para conferência e sincronização, não para cada pergunta. Preservar links e IDs de origem. |
| Índice | Onde ficará o índice pesquisável e qual tecnologia usar? | Definir após verificar volume, formatos, campos, APIs, permissões e ambiente de execução da Beta; indexar as cópias para busca textual e semântica. |
| Esquema PostgreSQL | Quais tabelas e campos entrarão no primeiro schema? | Proposta documentada: usuários/papéis, fontes/registros, fragmentos, embeddings, conhecimento/evidências, conversas/turnos, eventos de recuperação, jobs e auditoria; fechar após mapear payloads e classificação dos dados. |
| Infraestrutura | Em qual ambiente o pipeline e o serviço de busca rodarão? | Verificar ambiente já disponível, autenticação, rede, backup, observabilidade e disponibilidade. |
| Hospedagem PostgreSQL | Qual plano/região/configuração do projeto Supabase será usado? | Provedor escolhido; iniciar no Free para piloto e confirmar suporte/limites atuais, região, pooler, backups e política de pausa. |
| Runtime e conexão | Como o MCP Sites acessará Supabase? | Sites/Cloudflare Workers não usa conexão TCP PostgreSQL direta; adotar Data API/RPC por HTTPS com segredo server-only e autorização no Worker, ou hospedar serviço intermediário com conexão PostgreSQL. |
| Interface de perguntas | A interface da Beta terá componente estruturado para coletar esclarecimentos? | Verificar capacidades da plataforma; manter o mesmo fluxo via conversa comum como fallback. |
| Metas de operação | Quais limites de latência e atraso de sincronização são aceitáveis? | Medir no piloto; hipótese inicial registrada na proposta técnica, ainda não aprovada como SLA. |
| Contexto consolidado | Qual formato guardará padrões e soluções extraídos dos chamados/cards? | Definir entidades e relações; manter evidências, estado de validação, versão e vínculo com registros de origem. |
| Modelo de similaridade | Como medir que dois problemas são semelhantes e ranquear soluções? | Combinar filtros estruturados, texto e semântica; validar com exemplos históricos e revisão dos analistas. |
| Qualidade histórica | Como distinguir solução confirmada de hipótese ou encerramento sem resolução? | Definir campos/estados de validação e critérios para recomendar uma solução. |
| Permissões | A Beta poderá apenas consultar ou também gravar? | Leitura para todos; escrita direta ou fluxo com confirmação/aprovação. |
| Perfis de público | Quais perfis poderão conversar com a Beta e quais dados cada perfil pode consultar/receber? | Definir perfis internos e externos, autenticação, classificação por fonte/campo e regras de divulgação para clientes. |
| Identidade/autenticação | Como o backend validará individualmente a conta e o papel de cada analista? | Preferir OAuth/SSO corporativo com mapeamento de grupos; verificar o que a plataforma entrega de forma confiável. Se identidade não chegar ao backend, exigir autenticação própria antes de liberar dados internos. |
| Reutilização do OAuth Movidesk | O projeto OAuth existente pode autenticar também cada usuário da Beta? | Código inspecionado: identidade individual disponível e escopo atual único `movidesk:read`. Preservar esse escopo para Movidesk e adicionar `knowledge:read` (e futuramente `knowledge:write`) com validação específica por ferramenta. OAuth de usuário e chave de serviço Supabase têm funções distintas. |
| Política de autorização da Beta | Como mapear usuários autenticados aos dados e ações da Beta? | O fluxo atual já associa token do conector ao ID/e-mail ChatGPT, segundo análise fornecida; criar permissões granulares por papel/usuário e recurso. A identidade individual no Movidesk não existe no desenho atual por causa da credencial upstream compartilhada. |
| Ciclo de vida do token | Qual validade, expiração, renovação e revogação serão suportadas? | Resolver divergência entre 30 dias no endpoint e uma hora na página de privacidade; confirmar artefato `source-bundle`, revogação imediata e tokens já emitidos após desativação. |
| Resumo de diagnóstico | Quais evidências e detalhes funcionais podem ser exibidos a cada papel? | Definir campos por papel; não liberar cadeia de pensamento, prompts ou segredos técnicos. |
| Classificação | Quem classifica e revisa documentos como compartilháveis, internos, restritos ou confidenciais? | Definir responsável, metadados obrigatórios, exceções e revisão periódica. |
| Aprovação | Quais alterações podem entrar sem revisão? | Separar correções simples de conteúdo que altere política, critério ou procedimento oficial. |
| Identidade | Como registrar qual analista pediu cada alteração? | Autenticação individual e registro de autoria; não compartilhar credenciais. |
| Busca | Quais formatos e volume de conteúdo precisam ser suportados? | Inventariar documentos, planilhas, PDFs e outros formatos antes de escolher a solução. |
| Indexação | Quais campos e texto serão extraídos, normalizados, mascarados e indexados de cada fonte? | Mapear os esquemas reais do Movidesk, ClickUp e processos administrativos; definir atualização incremental e tratamento de exclusões. |
| Metadados | Quais campos serão obrigatórios? | Proposta: tema, status, responsável, revisão e vigência. |
| Conflitos | Qual fonte prevalece quando documentos discordarem? | Definir hierarquia entre política, procedimento, FAQ, exemplo e rascunho. |
| Conteúdo sensível | A base incluirá dados pessoais, clientes ou informações restritas? | Definir classificação, acesso e regras de retenção antes de carregar esses dados. |
| Governança de conversas | Quem pode consultar o histórico, por quanto tempo e como corrigir/apagar registros? | Definir acesso individual versus agregado, retenção, auditoria, minimização e transparência para a equipe. |
| Atualização da busca | Como mudanças ficam disponíveis para consulta? | Sincronização automática, agendada ou sob demanda; confirmar capacidades da integração escolhida. |

## Próximos passos

1. Levantar onde os documentos estão hoje, quais contas/plataformas os quatro analistas usam e quais APIs/conectores estão disponíveis para Movidesk e ClickUp.
2. Inventariar volume e campos dos chamados, cards e processos; identificar dados pessoais, segredos ou conteúdo restrito.
3. Escolher a fonte oficial e decidir entre consulta direta, sincronização/cópia indexada ou abordagem híbrida.
4. Definir identidade, permissões e trilha de auditoria para consultas e atualizações.
5. Definir o fluxo de atualização, incluindo autoria, confirmação e aprovação para regras oficiais e registros históricos.
6. Fechar esquema de metadados, hierarquia de fontes e critérios de validação das soluções registradas.
7. Selecionar a tecnologia de indexação das cópias e definir atualização incremental, remoção/retificação e observabilidade da sincronização.
8. Mapear os payloads reais de Movidesk/ClickUp e fechar o schema PostgreSQL inicial, incluindo campos de máquina e classificação.
9. Selecionar provedor/região/plano PostgreSQL que suporte pgvector e conexão segura a partir do host do OAuth.
10. Definir papéis de banco, pool de conexões, migrations, armazenamento de segredos, backup/restauração e monitoramento.
11. Definir como a Beta extrairá, armazenará, revisará e atualizará o contexto consolidado com evidências dos chamados e cards.
12. Definir esquema, autenticação, controles de acesso, retenção e política de privacidade para o histórico separado das conversas.
13. Definir perfis de público, classificação de fontes/campos e regras de recuperação e redação segura, incluindo respostas para clientes.
14. Implementar e validar identidade individual, autorização no backend e conteúdo do resumo diagnóstico por papel.
15. Pilotar com casos históricos resolvidos e não resolvidos, incluindo descrições de sintomas sem códigos, cenários ambíguos e testes de autorização/divulgação; medir se as perguntas de esclarecimento reduzem hipóteses erradas e melhoram a recuperação, além de latência p50/p95, precisão dos primeiros resultados, citações e utilidade das soluções; ajustar busca e contexto antes de ampliar a ingestão.

## Registro de decisões futuras

| Data | Decisão | Motivo | Responsáveis |
|---|---|---|---|
| 17/10/2026 | Início do documento; registrados os requisitos compartilhados e a direção de busca por trechos | Alinhar a arquitetura antes da implementação | A definir |
| 17/10/2026 | Incluídos chamados do Movidesk, cards do ClickUp com erros corrigidos e processos administrativos; adicionados requisitos de busca por similaridade e evidência da solução | Usar conhecimento operacional passado para apoiar a análise de novos problemas | A definir |
| 17/10/2026 | Definida a direção de manter cópias indexadas de chamados/cards finalizados para consulta rápida e criar uma camada de contexto consolidado derivada, rastreável aos registros originais | Reduzir latência de consulta e transformar histórico em conhecimento reutilizável | A definir |
| 17/10/2026 | Registrada proposta técnica RAG com ingestão assíncrona, cópia canônica, busca híbrida, reranqueamento, contexto derivado rastreável e métricas de qualidade/desempenho | Tornar a consulta rápida, verificável e atualizável sem enviar toda a base ao modelo | A definir |
| 17/10/2026 | Explicitado que o diagnóstico de máquinas deve partir de sintomas e contexto em linguagem natural; Movidesk é a fonte histórica prioritária e ClickUp é complementar | Refletir onde está o conhecimento histórico relevante e como os analistas descrevem os problemas | A definir |
| 17/10/2026 | Incluído diagnóstico interativo: a Beta deve pedir esclarecimentos automaticamente quando informações ausentes puderem mudar a análise, usando interface nativa se disponível ou conversa comum | Melhorar a precisão do diagnóstico antes de recomendar soluções | A definir |
| 17/10/2026 | Incluída camada separada para histórico e avaliação das conversas, associada ao analista autenticado, assunto, evidências consultadas, lacunas e resultado informado | Dar continuidade aos casos e medir o que a Beta resolve ou ainda não sabe | A definir |
| 17/10/2026 | Definida diretriz de análise rigorosa com comunicação funcional e profissional, sem expor raciocínio privado, ferramentas ou informação interna não autorizada | Manter qualidade profissional e proteger informações privilegiadas de clientes e da organização | A definir |
| 17/10/2026 | Esclarecido que privilégio de diagnóstico deve dar acesso a resumo auditável e autorizado, não à cadeia de pensamento; identidade do ChatGPT só pode ser usada após confirmar como chega autenticada ao backend | Permitir diagnóstico aprofundado com controle de acesso verificável | A definir |
| 17/10/2026 | Registrada análise fornecida do OAuth existente: login individual por ChatGPT e token do conector associado ao usuário; Movidesk é consultado com credencial de serviço compartilhada; reutilização é viável como base de identidade, sujeita à validação de produção e à criação de autorização granular na Beta | Reaproveitar autenticação existente sem confundir identidade do analista com a credencial upstream do Movidesk | A definir |
| 19/10/2026 | Escolhido Supabase como hospedagem de PostgreSQL/pgvector, começando pelo plano Free para o piloto | Simplificar a implantação inicial e validar a solução sem custo de infraestrutura | A definir |
| 19/10/2026 | Confirmado que o MCP está hospedado em Sites; para esse runtime, substituir conexão PostgreSQL direta por acesso HTTP à Supabase Data API/RPC, com segredo server-side e autorização do usuário no Worker | Compatibilizar a arquitetura com Cloudflare Workers e evitar conexão TCP não suportada | A definir |
| 19/10/2026 | Definida separação de escopos: `movidesk:read` para Movidesk, `knowledge:read` para consultar a base e, futuramente, `knowledge:write` para gravar conhecimento | Aplicar privilégio mínimo por capacidade sem confundir autorização do analista com a chave de serviço Supabase | A definir |
