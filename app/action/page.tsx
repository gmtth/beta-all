import { requireChatGPTUser } from "../chatgpt-auth";
import ActionInstructionsPanel from "../action-instructions-panel";

export const dynamic = "force-dynamic";

export default async function ActionPage() {
  await requireChatGPTUser("/action");
  return <main className="shell instructions-shell"><div className="ambient ambient-one" /><div className="ambient ambient-two" /><section className="card instructions-card" aria-labelledby="action-title">
    <header className="brandbar"><a className="brand" href="/"><img src="/beta-logo.svg" alt="Beta" /><span className="brand-product">MCP</span></a><a className="back-link" href="/">← Voltar ao acesso</a></header>
    <div className="admin-hero"><div className="eyebrow"><span className="pulse" /> CONFIGURAÇÃO DO CONECTOR</div><h1 id="action-title">GPT Action <em>pronta.</em></h1><p className="lead">Siga estas instruções para conectar uma Action do ChatGPT ao endpoint seguro de consulta do Movidesk.</p></div>
    <ActionInstructionsPanel />
    <footer className="card-footer"><span>Configuração protegida pela autenticação do ChatGPT</span><span className="version">BETA / GPT ACTION</span></footer>
  </section></main>;
}

