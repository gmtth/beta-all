import { requireChatGPTUser } from "../../chatgpt-auth";
import { ensureSchema, getUserRole, isMaster } from "../../oauth/_lib";
import DatabaseBrowser from "../../database-browser";

export const dynamic = "force-dynamic";

export default async function DatabasePage() {
  const user = await requireChatGPTUser("/admin/database");
  await ensureSchema();
  const role = await getUserRole(user.email);
  if (!isMaster(role)) return <main className="shell"><section className="card"><h1>Acesso restrito</h1><p>Apenas contas master podem consultar a estrutura do banco.</p></section></main>;
  return <main className="shell"><div className="ambient ambient-one" /><div className="ambient ambient-two" /><section className="card admin-card database-card">
    <header className="brandbar internal-brandbar"><a className="back-link" href="/">← Voltar ao acesso</a></header>
    <DatabaseBrowser />
  </section></main>;
}
