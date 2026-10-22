import Link from "next/link";
import { requireChatGPTUser } from "../chatgpt-auth";
import { clientSecretFor, GPT_ACTION_CLIENT_ID } from "../oauth/clients";
import ActionInstructionsPanel from "../action-instructions-panel";

export const dynamic = "force-dynamic";

export default async function ActionPage() {
  await requireChatGPTUser("/action");
  const clientSecretConfigured = Boolean(clientSecretFor(GPT_ACTION_CLIENT_ID, process.env));
  return <main className="shell instructions-shell"><div className="ambient ambient-one" /><div className="ambient ambient-two" /><section className="card instructions-card" aria-label="Configuração da GPT Action">
    <header className="brandbar internal-brandbar"><Link className="back-link" href="/">← Voltar ao acesso</Link></header>
    <ActionInstructionsPanel clientSecretConfigured={clientSecretConfigured} />
  </section></main>;
}
