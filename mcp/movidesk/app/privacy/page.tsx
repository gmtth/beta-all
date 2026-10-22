export const dynamic = "force-static";

export default function PrivacyPage() {
  return <main className="shell"><div className="ambient ambient-one" /><div className="ambient ambient-two" /><article className="card privacy-card">
    <header className="brandbar internal-brandbar"><a className="back-link" href="/">← Voltar ao acesso</a></header>
    <div className="hero privacy-hero"><h1>Privacidade<br /><em>e dados.</em></h1></div>
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
      <p>Este aviso trata do serviço Beta. Para entender como a OpenAI trata dados da sua conta e das conversas no ChatGPT, consulte a <a href="https://openai.com/policies/privacy-policy/" target="_blank" rel="noreferrer">Política de Privacidade da OpenAI</a>. Consulte também os <a href="/terms">Termos de Uso da Beta</a>.</p>
    </section>
    <footer className="card-footer"><span>Última atualização: 22/10/2026</span><a className="admin-link" href="/terms">Termos de Uso ↗</a></footer>
  </article></main>;
}
