import { requireChatGPTUser } from "../../chatgpt-auth";
import { ensureSchema, getUserRole, isMaster } from "../../oauth/_lib";
import FeedbackAdminPanel from "../../feedback-admin-panel";

export const dynamic = "force-dynamic";

export default async function FeedbackPage() {
  const user = await requireChatGPTUser("/admin/feedback");
  await ensureSchema();
  const role = await getUserRole(user.email);
  if (!isMaster(role)) return <main className="shell"><section className="card"><h1>Acesso restrito</h1><p>Apenas contas master podem consultar feedback e autodiagnósticos.</p></section></main>;

  return <main className="shell"><div className="ambient ambient-one" /><div className="ambient ambient-two" /><section className="card admin-card">
    <header className="brandbar internal-brandbar"><a className="back-link" href="/">← Voltar ao acesso</a></header>
    <FeedbackAdminPanel />
  </section></main>;
}
