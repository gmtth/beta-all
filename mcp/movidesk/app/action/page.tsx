import { requireChatGPTUser } from "../chatgpt-auth";
import ActionInstructionsPanel from "../action-instructions-panel";

export const dynamic = "force-dynamic";

export default async function ActionPage() {
  await requireChatGPTUser("/action");
  return <main className="shell instructions-shell"><div className="ambient ambient-one" /><div className="ambient ambient-two" /><section className="card instructions-card" aria-label="Configuração da GPT Action">
    <header className="brandbar internal-brandbar"><a className="back-link" href="/">← Voltar ao acesso</a></header>
    <ActionInstructionsPanel />
  </section></main>;
}
