export const dynamic = "force-static";

export default function PrivacyPage() {
  return <main className="shell"><div className="ambient ambient-one" /><div className="ambient ambient-two" /><article className="card privacy-card">
    <header className="brandbar internal-brandbar"><a className="back-link" href="/">← Voltar ao acesso</a></header>
    <div className="hero"><h1>Dados tratados<br /><em>com propósito.</em></h1><p className="lead">Esta página explica como a Beta trata os dados necessários para autenticar usuários e consultar integrações autorizadas. Atualmente, este projeto inclui o conector Movidesk e a base interna de conhecimento.</p></div>
    <section className="access-panel privacy-content">
      <h2>O que é processado</h2><p>O serviço recebe sua identidade do ChatGPT para validar se a conta está autorizada. Consultas processam dados retornados pelo Movidesk. Quando um analista solicita explicitamente a inclusão de um chamado na base, o serviço guarda assunto, descrição, interações selecionadas e metadados técnicos do chamado no Supabase; e-mails, documentos pessoais, contatos, nomes de solicitantes e autores não são incluídos como campos estruturados, e padrões detectáveis de e-mail, documento, telefone identificado e URL são removidos do texto.</p>
      <h2>Como os dados são protegidos</h2><p>Tokens são armazenados somente em formato hash, têm validade limitada e são enviados apenas em conexões HTTPS. Segredos e tokens não são exibidos em respostas nem registrados em logs.</p>
      <h2>Uso e retenção</h2><p>Os dados são usados para autenticação, controle de acesso, consulta e inclusão explícita de conhecimento interno. O histórico de inclusão registra o e-mail autenticado do analista, o chamado, a impressão digital do conteúdo e a quantidade de trechos. Códigos OAuth são de uso único e expiram rapidamente; tokens de acesso expiram em 30 dias.</p>
      <h2>Contato</h2><p>Para solicitar esclarecimentos ou remoção de acesso, contate o administrador responsável pela integração Movidesk.</p>
    </section>
    <footer className="card-footer"><span>OAuth · acesso por escopo</span></footer>
  </article></main>;
}
