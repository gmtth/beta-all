import { requireChatGPTUser } from "../../chatgpt-auth";
import McpInstructionsPanel from "../../mcp-instructions-panel";

export const dynamic = "force-dynamic";

export default async function McpSetupPage() {
  await requireChatGPTUser("/setup/mcp");
  return <main className="shell instructions-shell"><div className="ambient ambient-one" /><div className="ambient ambient-two" /><section className="card instructions-card" aria-labelledby="mcp-title">
    <header className="brandbar"><a className="brand" href="/"><img src="/favicon.png" alt="" /><span>movidesk</span></a><a className="back-link" href="/">← Voltar ao acesso</a></header>
    <div className="admin-hero"><div className="eyebrow"><span className="pulse" /> CONFIGURAÇÃO DO CONECTOR</div><h1 id="mcp-title">MCP <em>pronto.</em></h1><p className="lead">Siga estas instruções para conectar o servidor MCP do Movidesk ao ChatGPT com OAuth e PKCE.</p></div>
    <McpInstructionsPanel />
    <footer className="card-footer"><span>Configuração protegida pela autenticação do ChatGPT</span><span className="version">MOVI / MCP ACCESS</span></footer>
  </section></main>;
}
