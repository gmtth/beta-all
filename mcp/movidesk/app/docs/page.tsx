import { chatGPTSignInPath, getChatGPTUser } from "../chatgpt-auth";
import { clientSecretFor, GPT_ACTION_CLIENT_ID } from "../oauth/clients";
import ActionInstructionsPanel from "../action-instructions-panel";
import McpInstructionsPanel from "../mcp-instructions-panel";
import { PrivacyDocument, TermsDocument } from "./legal-documents";

export const dynamic = "force-dynamic";

export default async function DocsPage() {
  const user = await getChatGPTUser();
  const clientSecretConfigured = user ? Boolean(clientSecretFor(GPT_ACTION_CLIENT_ID, process.env)) : false;

  return <main className="shell instructions-shell">
    <div className="ambient ambient-one" /><div className="ambient ambient-two" />
    <section className="card instructions-card docs-card" aria-labelledby="docs-title">
      <header className="brandbar internal-brandbar">
        {/* Use a full navigation to restore ChatGPT identity headers on the access page. */}
        {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
        <a className="back-link" href="/">← Voltar ao acesso</a>
      </header>
      <div className="docs-heading"><div className="section-kicker">GUIAS E POLÍTICAS</div><h1 id="docs-title">Documentação da Beta</h1><p>Configuração das integrações, termos de uso e aviso de privacidade em um só lugar.</p></div>
      <nav className="docs-nav" aria-label="Seções da documentação">
        <a href="#action">GPT Action</a><a href="#mcp">Conector MCP</a><a href="#terms">Termos de Uso</a><a href="#privacy">Privacidade</a>
      </nav>
      <div className="docs-sections">
        <section id="action" className="docs-section" aria-label="Configuração da GPT Action">
          {user ? <ActionInstructionsPanel clientSecretConfigured={clientSecretConfigured} /> : <div className="docs-auth-required"><h2>Configuração da GPT Action</h2><p>Entre pelo ChatGPT para consultar os dados de configuração da integração.</p><a className="admin-link" href={chatGPTSignInPath("/docs")}>Entrar pelo ChatGPT ↗</a></div>}
        </section>
        <section id="mcp" className="docs-section" aria-label="Configuração do conector MCP">
          {user ? <McpInstructionsPanel /> : <div className="docs-auth-required"><h2>Configuração do conector MCP</h2><p>Entre pelo ChatGPT para consultar os dados de configuração da integração.</p><a className="admin-link" href={chatGPTSignInPath("/docs")}>Entrar pelo ChatGPT ↗</a></div>}
        </section>
        <section id="terms" className="docs-section docs-legal-section" aria-label="Termos de Uso da Beta">
          <TermsDocument />
        </section>
        <section id="privacy" className="docs-section docs-legal-section" aria-label="Aviso de Privacidade">
          <PrivacyDocument />
        </section>
      </div>
    </section>
  </main>;
}
