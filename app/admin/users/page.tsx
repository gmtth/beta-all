import { requireChatGPTUser } from "../../chatgpt-auth";
import { ensureSchema, getUserRole, isMaster } from "../../oauth/_lib";
import UserAdminPanel from "../../user-admin-panel";
export const dynamic = "force-dynamic";
export default async function UsersPage() {
  const user = await requireChatGPTUser("/admin/users");
  await ensureSchema();
  const role = await getUserRole(user.email);
  if (!isMaster(role)) return <main className="shell"><section className="card"><h1>Acesso restrito</h1><p>Apenas contas master podem gerenciar usuários.</p></section></main>;
  return <main className="shell"><div className="ambient ambient-one" /><div className="ambient ambient-two" /><section className="card admin-card" aria-labelledby="users-title">
    <header className="brandbar"><a className="brand" href="/"><img src="/beta-logo.svg" alt="Beta" /><span className="brand-product">MCP</span></a><a className="back-link" href="/">← Voltar ao acesso</a></header>
    <div className="admin-hero"><div className="eyebrow"><span className="pulse" /> CONTROLE DE ACESSO</div><h1 id="users-title">Usuários <em>autorizados.</em></h1><p className="lead">Libere o acesso da equipe ao MCP da Beta. Você pode adicionar ou remover permissões por pessoa.</p></div>
    <UserAdminPanel />
    <footer className="card-footer"><span>Alterações protegidas pela conta master</span><span className="version">BETA / ACCESS CONTROL</span></footer>
  </section></main>;
}
