import { BETA_TERMS_VERSION } from "../oauth/clients";

export const dynamic = "force-static";

import Link from "next/link";

export default function TermsPage() {
  return <main className="shell"><div className="ambient ambient-one" /><div className="ambient ambient-two" /><article className="card privacy-card">
    <header className="brandbar internal-brandbar"><Link className="back-link" href="/">← Voltar ao acesso</Link></header>
    <div className="hero privacy-hero"><h1>Termos de uso<br /><em>da Beta.</em></h1></div>
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
      <p>Leia o <a href="/privacy">Aviso de Privacidade</a>, que descreve os dados tratados, a separação entre métricas operacionais e feedback e as limitações atuais da retenção.</p>
    </section>
    <footer className="card-footer"><span>Versão {BETA_TERMS_VERSION} · Última atualização: 22/10/2026</span><a className="admin-link" href="/privacy">Aviso de Privacidade ↗</a></footer>
  </article></main>;
}
