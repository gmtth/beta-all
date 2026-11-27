import { BETA_TERMS_VERSION } from "../oauth/clients";

export function TermsDocument() {
  return <>
    <div className="docs-legal-heading"><div className="section-kicker">POLÍTICAS</div><h2>Termos de uso da Beta</h2><span>Versão {BETA_TERMS_VERSION} · Última atualização: 22/10/2026</span></div>
    <section className="access-panel privacy-content" aria-label="Termos de Uso da Beta">
      <h2>Uso autorizado</h2>
      <p>A Beta é uma ferramenta interna para apoiar a análise de chamados, o diagnóstico de ocorrências e a consulta a procedimentos e registros autorizados. Use a conexão da sua própria conta e somente para atividades relacionadas ao trabalho para o qual recebeu acesso.</p>
      <p>As consultas ao Movidesk são somente leitura. A inclusão de um chamado na base interna ocorre apenas quando solicitada explicitamente. Respeite as permissões, classificações e regras de confidencialidade da sua equipe; não tente acessar dados de outras pessoas ou contornar controles técnicos.</p>

      <h2>Respostas e revisão</h2>
      <p>A Beta organiza informações disponíveis para apoiar a análise, mas uma resposta automatizada pode estar incompleta ou incorreta. Confirme evidências e procedimentos antes de tomar decisões operacionais. Hipóteses não devem ser apresentadas como causas confirmadas, e conteúdo de chamados não se torna procedimento oficial sem validação humana.</p>

      <h2>Feedback e melhoria</h2>
      <p>Quando a função estiver habilitada, a Beta poderá registrar feedback explícito e limitações observadas para identificar melhorias de conhecimento, ferramentas, desempenho e experiência. O registro pode conter resumos sanitizados do objetivo, resultado e lacuna, categorias, nível de fricção, motivo declarado ou hipótese identificada, referências técnicas e, quando aplicável, termos ofensivos presentes na mensagem recebida. A identidade autenticada do analista será associada ao registro; situações sem identidade conhecida serão marcadas separadamente.</p>
      <p>Não são armazenadas conversas completas nem cadeia privada de raciocínio. Eventos e hipóteses ficam sujeitos a revisão humana e não alteram automaticamente a base ou o produto. Se não quiser que um feedback seja registrado, avise a Beta antes da gravação. Masters podem corrigir o resumo sanitizado ou apagar um evento. Um pedido de remoção apaga todo o histórico de feedback identificado da pessoa, incluindo contagens mensais e termos ofensivos; grupos que também contenham eventos de outras pessoas são desfeitos, sem apagar os eventos restantes. Para solicitar acesso, correção ou remoção, contate o administrador responsável pela integração. A função de registro está desativada enquanto os controles e avisos necessários não forem concluídos.</p>

      <h2>Acesso e retenção</h2>
      <p>Os registros contextuais, quando habilitados, ficam acessíveis a administradores master para investigação e priorização de melhorias. O desenho prevê retenção dos detalhes por até 90 dias e de agregados mensais por até 12 meses; os agregados por analista continuam identificáveis e também ficam restritos a masters. A desconexão revoga a sessão, mas não remove automaticamente registros já criados. A configuração local prevê limpeza automática horária, mas ainda precisa ser aplicada e validada no banco antes de a captura ser ativada.</p>

      <h2>Conexão e aceite</h2>
      <p>Antes de autorizar a conexão, confirme a caixa de aceite dos Termos de Uso e do Aviso de Privacidade. A Beta registra o identificador e e-mail autenticados, a versão aceita, o cliente e o horário. Em contas administrativas explicitamente configuradas para validação, a caixa vem pré-marcada e a autorização é enviada após 10 segundos, salvo se o aceite for desmarcado ou a solicitação cancelada; nas demais contas, a confirmação é manual. Ao conectar e usar as ferramentas, você confirma que leu esses documentos. Para dúvidas, correções ou pedidos relacionados aos dados, contate o administrador responsável pela integração Beta.</p>

      <h2>Documentos relacionados</h2>
      <p>Leia o <a href="/docs#privacy">Aviso de Privacidade</a>, que descreve os dados tratados, a separação entre métricas operacionais e feedback e as limitações atuais da retenção.</p>
    </section>
  </>;
}

export function PrivacyDocument() {
  return <>
    <div className="docs-legal-heading"><div className="section-kicker">POLÍTICAS</div><h2>Privacidade e dados</h2><span>Última atualização: 22/10/2026</span></div>
    <section className="access-panel privacy-content" aria-label="Aviso de privacidade">
      <h2>Conta e autenticação</h2>
      <p>Ao entrar com o ChatGPT, o serviço recebe o identificador e o e-mail da conta para confirmar quem está usando a Beta e verificar se essa conta está autorizada. O serviço mantém o papel e o estado de acesso da equipe, os escopos autorizados e a validade das sessões. Códigos OAuth e tokens são armazenados como hashes. Ao conectar, também é registrado o aceite dos Termos de Uso: identificador e e-mail autenticados, versão dos termos, cliente e horário. Contas administrativas explicitamente configuradas para validação recebem o aceite pré-marcado e uma contagem de 10 segundos antes do envio; é possível desmarcar ou cancelar. Para as demais contas, a confirmação é manual.</p>

      <h2>Consultas às integrações</h2>
      <p>Os parâmetros necessários para executar uma ferramenta são enviados ao serviço correspondente. As consultas ao Movidesk usam uma credencial de serviço compartilhada da integração; a Beta não recebe uma credencial Movidesk individual de cada analista. Os resultados solicitados são devolvidos ao ChatGPT para compor a resposta. A telemetria operacional da Beta não guarda argumentos, conteúdo dos resultados ou identidade. O tratamento da conversa pelo ChatGPT segue os avisos e controles da sua conta OpenAI.</p>

      <h2>Base de conhecimento</h2>
      <p>Um chamado só é incluído quando o analista solicita explicitamente a importação. A base compartilhada pode guardar o identificador e os metadados do chamado, atributos técnicos permitidos, trechos da descrição e das interações selecionadas, uma impressão digital do conteúdo e a classificação interna. A trilha de auditoria registra o e-mail autenticado de quem solicitou a inclusão, o registro afetado, a impressão digital, a quantidade de trechos e o horário.</p>
      <p>Antes da gravação, o serviço remove padrões reconhecidos de e-mail, documentos, telefone rotulado e URLs. Essa limpeza é automatizada e não garante anonimização: nomes ou outros dados pessoais podem permanecer no texto quando não forem reconhecidos pelos filtros. O conteúdo importado é classificado como interno e não deve ser tratado como material para clientes.</p>

      <h2>Feedback e autodiagnóstico</h2>
      <p>A função de registrar feedback contextual está desativada neste momento. Quando habilitada, poderá guardar resumos curtos do objetivo, do resultado e da lacuna percebida; categoria e nível de fricção; motivo declarado pelo analista ou hipótese da Beta claramente identificada; referências técnicas permitidas; e, quando houver linguagem ofensiva explicitamente recebida, o termo detectado e seu contexto sanitizado. O identificador e o e-mail autenticados do analista são associados ao evento para rastreabilidade e para as contagens por analista. Casos sem identidade ficam marcados como não identificados.</p>
      <p>Não se guarda a conversa completa nem o raciocínio interno da Beta. As classificações produzidas pelo modelo são sugestões não verificadas até revisão humana. Masters poderão consultar eventos individuais no painel restrito, corrigir o resumo sanitizado ou apagar um evento. Também poderão apagar todo o histórico identificado de um analista, incluindo detalhes ainda retidos, contagens mensais, termos ofensivos e agrupamentos associados. Quando um agrupamento incluir outras pessoas, os eventos delas permanecem, mas deixam de pertencer àquele grupo. As correções não preservam o texto substituído. A Beta não transforma esses registros automaticamente em conhecimento, alterações de ferramentas ou mudanças de produto. Enquanto a função estiver desativada, nenhum evento desse tipo é gravado.</p>

      <h2>Retenção e controle</h2>
      <p>Os detalhes de feedback têm retenção de até 90 dias; a rotina automática agrega as contagens mensais antes de remover os detalhes, e mantém agregados identificáveis por até 12 meses. Os agregados não são anônimos; seu acesso será restrito a masters. Um pedido de remoção apaga também as contagens daquele analista. A rotina horária e a limpeza do histórico Cron da Beta estão configuradas no Supabase; a primeira execução ainda aguarda confirmação. A captura contextual permanece desligada.</p>
      <p>Tokens de acesso expiram conforme a validade configurada pelo administrador, entre um minuto e 30 dias. Refresh tokens podem durar até 90 dias e não prolongam esse limite a cada uso. Desconectar revoga as sessões, mas não apaga automaticamente chamados já importados, registros de aceite nem eventos ainda retidos. Os registros de aceite não têm prazo automático de descarte definido nesta versão. Para pedir acesso, correção ou remoção de informações, contate o administrador responsável pela integração Beta.</p>

      <h2>Métricas de uso</h2>
      <p>Para acompanhar o funcionamento e diagnosticar falhas, a Beta registra o nome da ferramenta, sucesso ou falha, uma categoria segura de erro, duração e horário. Em chamadas que falham após autenticação, o evento também associa o e-mail da conta autenticada; falhas sem identidade validada não recebem e-mail. O status HTTP é guardado quando disponível. Esses eventos não incluem argumentos, respostas ou mensagens brutas de erro. Ao gravar novas métricas, o serviço remove eventos anteriores a 90 dias; essa limpeza ocorre durante o uso, sem uma rotina periódica independente.</p>

      <h2>Serviços envolvidos</h2>
      <p>O ChatGPT fornece a autenticação e recebe as solicitações e respostas das ferramentas. O Movidesk recebe consultas feitas pela integração. O ChatGPT Sites/Cloudflare hospeda a aplicação e os dados operacionais de autenticação e métricas; o Supabase hospeda a base de conhecimento e, quando habilitado, os registros contextuais de feedback. Cada serviço também está sujeito aos próprios termos e avisos de privacidade.</p>

      <h2>Privacidade no ChatGPT</h2>
      <p>Este aviso trata do serviço Beta. Para entender como a OpenAI trata dados da sua conta e das conversas no ChatGPT, consulte a <a href="https://openai.com/policies/privacy-policy/" target="_blank" rel="noreferrer">Política de Privacidade da OpenAI</a>. Consulte também os <a href="/docs#terms">Termos de Uso da Beta</a>.</p>
    </section>
  </>;
}
