import { requireChatGPTUser } from "../chatgpt-auth";
import McpInstructionsPanel from "../mcp-instructions-panel";

export const dynamic = "force-dynamic";

export default async function McpPage() {
  await requireChatGPTUser("/mcp");
  return <main className="shell instructions-shell"><div className="ambient ambient-one" /><div className="ambient ambient-two" /><section className="card instructions-card" aria-label="Configuração do conector MCP">
    <header className="brandbar internal-brandbar"><a className="back-link" href="/">← Voltar ao acesso</a></header>
    <McpInstructionsPanel />
  </section></main>;
}
