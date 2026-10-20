export const dynamic = "force-static";

export default function PrivacyPage() {
  return <main className="shell"><div className="ambient ambient-one" /><div className="ambient ambient-two" /><article className="card privacy-card">
    <header className="brandbar"><div className="brand"><img src="/favicon.png" alt="" /><span>movidesk</span></div><a className="back-link" href="/">Voltar ao acesso</a></header>
    <div className="hero"><div className="eyebrow"><span className="pulse" /> PRIVACIDADE</div><h1>Dados tratados<br /><em>com propósito.</em></h1><p className="lead">Esta página explica como o conector Movidesk trata os dados necessários para autenticar usuários e consultar tickets autorizados.</p></div>
    <section className="access-panel privacy-content">
      <h2>O que é processado</h2><p>O serviço recebe sua identidade do ChatGPT para validar se a conta está autorizada. Quando uma consulta é feita, processa o identificador do ticket e os dados retornados pelo Movidesk.</p>
      <h2>Como os dados são protegidos</h2><p>Tokens são armazenados somente em formato hash, têm validade limitada e são enviados apenas em conexões HTTPS. Segredos e tokens não são exibidos em respostas nem registrados em logs.</p>
      <h2>Uso e retenção</h2><p>Os dados são usados exclusivamente para autenticação, controle de acesso e consultas de leitura. Códigos OAuth são de uso único e expiram rapidamente; tokens de acesso expiram após uma hora.</p>
      <h2>Contato</h2><p>Para solicitar esclarecimentos ou remoção de acesso, contate o administrador responsável pela integração Movidesk.</p>
    </section>
    <footer className="card-footer"><span>OAuth 2.1 · acesso somente leitura</span><span className="version">MOVI / PRIVACY</span></footer>
  </article></main>;
}
