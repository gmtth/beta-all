export const dynamic = "force-static";

export default function PrivacyPage() {
  return <main className="shell"><div className="ambient ambient-one" /><div className="ambient ambient-two" /><article className="card privacy-card">
    <header className="brandbar internal-brandbar"><a className="back-link" href="/">← Voltar ao acesso</a></header>
    <div className="hero privacy-hero"><h1>Privacidade<br /><em>e dados.</em></h1></div>
    <section className="access-panel privacy-content" aria-label="Aviso de privacidade">
      <h2>Conta e autenticação</h2>
      <p>Ao entrar com o ChatGPT, o serviço recebe o identificador e o e-mail da conta para confirmar quem está usando a Beta e verificar se essa conta está autorizada. O nome completo pode estar disponível na autenticação, mas a aplicação usa o e-mail e o identificador da conta. O serviço mantém o papel e o estado de acesso da equipe, além do cliente, dos escopos e da validade das autorizações. Códigos OAuth e tokens são armazenados como hashes; seus valores originais não são necessários para validar uma chamada.</p>

      <h2>Consultas às integrações</h2>
      <p>Os parâmetros necessários para executar uma ferramenta são enviados ao serviço correspondente. As consultas ao Movidesk usam uma credencial de serviço compartilhada da integração; a Beta não recebe uma credencial Movidesk individual de cada analista. Os resultados solicitados são devolvidos ao ChatGPT para compor a resposta. A telemetria própria da Beta não guarda os argumentos nem o conteúdo desses resultados. O tratamento da conversa pelo ChatGPT segue os avisos e controles da sua conta OpenAI.</p>

      <h2>Base de conhecimento</h2>
      <p>Um chamado só é incluído quando o analista solicita explicitamente a importação. A base compartilhada pode guardar o identificador e os metadados do chamado, atributos técnicos permitidos, trechos da descrição e das interações selecionadas, uma impressão digital do conteúdo e a classificação interna. A trilha de auditoria registra o e-mail autenticado de quem solicitou a inclusão, o registro afetado, a impressão digital, a quantidade de trechos e o horário.</p>
      <p>Antes da gravação, o serviço remove padrões reconhecidos de e-mail, documentos, telefone rotulado e URLs. Essa limpeza é automatizada e não garante anonimização: nomes ou outros dados pessoais podem permanecer no texto quando não forem reconhecidos pelos filtros. O conteúdo importado é classificado como interno e não deve ser tratado como material para clientes.</p>

      <h2>Métricas de uso</h2>
      <p>Para acompanhar o funcionamento e diagnosticar falhas, a Beta registra o nome da ferramenta, sucesso ou falha, uma categoria segura de erro, duração e horário. Em chamadas que falham após autenticação, o evento também associa o e-mail da conta autenticada; falhas sem identidade validada não recebem e-mail. O status HTTP é guardado quando disponível. Esses eventos não incluem argumentos, respostas ou mensagens brutas de erro. Ao gravar novas métricas, o serviço remove eventos anteriores a 90 dias; essa limpeza ocorre durante o uso, sem uma rotina periódica independente.</p>

      <h2>Serviços envolvidos</h2>
      <p>O ChatGPT fornece a autenticação e recebe as solicitações e respostas das ferramentas. O Movidesk recebe as consultas feitas pela integração. O ChatGPT Sites/Cloudflare hospeda a aplicação e os dados operacionais de autenticação e métricas; o Supabase hospeda a base de conhecimento. Cada serviço também está sujeito aos próprios termos e avisos de privacidade.</p>

      <h2>Validade e retenção</h2>
      <p>Códigos de autorização são de uso único e expiram em cinco minutos. A validade dos tokens de acesso é configurável pelo administrador entre um minuto e 30 dias; tokens já emitidos mantêm a validade registrada na emissão. Quando a autorização permite renovação, refresh tokens podem durar até 90 dias e não prolongam esse limite a cada uso. Os eventos de métricas são removidos após até 90 dias. A base de conhecimento ainda não tem um prazo automático de expiração definido.</p>
      <p>Desconectar ou encerrar as sessões revoga tokens de acesso, mas não apaga chamados já importados nem eventos de métricas ainda retidos. Para pedir avaliação de acesso, correção ou remoção de informações, contate o administrador responsável pela integração Beta.</p>

      <h2>Privacidade no ChatGPT</h2>
      <p>Este aviso trata do serviço Beta. Para entender como a OpenAI trata dados da sua conta e das conversas no ChatGPT, consulte a <a href="https://openai.com/policies/privacy-policy/" target="_blank" rel="noreferrer">Política de Privacidade da OpenAI</a>.</p>
    </section>
    <footer className="card-footer"><span>Última atualização: 22/10/2026</span></footer>
  </article></main>;
}
