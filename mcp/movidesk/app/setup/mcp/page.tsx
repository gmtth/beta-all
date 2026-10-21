import { requireChatGPTUser } from "../../chatgpt-auth";
import McpInstructionsPanel from "../../mcp-instructions-panel";

export const dynamic = "force-dynamic";

export default async function McpSetupPage() {
  await requireChatGPTUser("/setup/mcp");
  return <main className="shell instructions-shell"><div className="ambient ambient-one" /><div className="ambient ambient-two" /><section className="card instructions-card" aria-labelledby="mcp-title">
    <header className="brandbar internal-brandbar"><a className="back-link" href="/">← Voltar ao acesso</a></header>
    <div className="admin-hero"><h1 id="mcp-title">MCP <em>pronto.</em></h1><p className="lead">Siga estas instruções para conectar o MCP da Beta ao ChatGPT com OAuth e PKCE. O conector Movidesk está disponível nesta integração.</p></div>
    <McpInstructionsPanel />
    <footer className="card-footer"><span>Configuração protegida pela autenticação do ChatGPT</span></footer>
  </section></main>;
}
