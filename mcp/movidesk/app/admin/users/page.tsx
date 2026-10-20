import { requireChatGPTUser } from "../../chatgpt-auth";
import { ensureSchema, getUserRole, isMaster } from "../../oauth/_lib";
import UserAdminPanel from "../../user-admin-panel";
export const dynamic = "force-dynamic";
export default async function UsersPage() {
  const user = await requireChatGPTUser("/admin/users");
  await ensureSchema();
  const role = await getUserRole(user.email);
  if (!isMaster(role)) return <main className="shell"><section className="card"><h1>Acesso restrito</h1><p>Apenas contas master podem gerenciar usuários.</p></section></main>;
  return <main className="shell"><div className="ambient ambient-one" /><div className="ambient ambient-two" /><section className="card admin-card">
    <header className="brandbar internal-brandbar"><a className="back-link" href="/">← Voltar ao acesso</a></header>
    <UserAdminPanel />
    <footer className="card-footer"><span>Alterações protegidas pela conta master</span><span className="version">BETA / ACCESS CONTROL</span></footer>
  </section></main>;
}
