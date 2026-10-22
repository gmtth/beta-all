"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { DatabaseBrowserPage, DatabaseBrowserSchema } from "../worker/supabase-knowledge";
import { DATABASE_BROWSER_TABLES, type DatabaseBrowserTable, type DatabasePreviewTable } from "../worker/database-browser-contract";

type BrowserResponse<T> = { data: T | null; diagnostic: string | null };
const tableTitles: Record<(typeof DATABASE_BROWSER_TABLES)[number]["key"], string> = {
  source_system: "source_system",
  source_record: "source_record",
  knowledge_ingest_audit: "knowledge_ingest_audit",
  record_chunk: "record_chunk",
};
const diagnosticLabels: Record<string, string> = {
  configuration_missing: "As variáveis de acesso ao Supabase não estão configuradas no servidor.",
  rpc_not_found: "A RPC do navegador não foi encontrada. A migration precisa ser aplicada ao Supabase.",
  permission_denied: "O servidor não tem permissão para executar esta RPC. Confira os grants de service_role.",
  rate_limited: "O Supabase limitou a consulta. Tente novamente em instantes.",
  service_error: "O Supabase encontrou um erro temporário.",
  request_rejected: "O Supabase recusou a consulta. Confira a configuração do schema beta.",
  timeout: "A consulta excedeu o tempo limite.",
  network_error: "Não foi possível alcançar o Supabase.",
  invalid_response: "O Supabase retornou uma resposta incompatível com o contrato do navegador.",
};
const displayCell = (value: unknown) => value === null || value === undefined ? "—" : typeof value === "boolean" ? value ? "Sim" : "Não" : String(value);

export default function DatabaseBrowser() {
  const [schemaResult, setSchemaResult] = useState<BrowserResponse<DatabaseBrowserSchema>>({ data: null, diagnostic: null });
  const [activeTable, setActiveTable] = useState<DatabaseBrowserTable>("source_system");
  const [page, setPage] = useState<DatabaseBrowserPage | null>(null);
  const [pageCursors, setPageCursors] = useState<Array<string | null>>([null]);
  const [loadingSchema, setLoadingSchema] = useState(true);
  const [loadingPage, setLoadingPage] = useState(false);
  const [pageDiagnostic, setPageDiagnostic] = useState<string | null>(null);
  const currentCursor = pageCursors.at(-1) ?? null;

  const loadSchema = useCallback(async () => {
    setLoadingSchema(true);
    try {
      const response = await fetch("/api/admin/database/schema", { cache: "no-store" });
      const payload = await response.json() as DatabaseBrowserSchema & { diagnostic?: string };
      if (!response.ok) throw new Error(payload.diagnostic ?? "request_rejected");
      setSchemaResult({ data: payload, diagnostic: null });
      const available = payload.tables.find((table) => table.previewAllowed);
      if (available && !payload.tables.some((table) => table.key === activeTable)) setActiveTable(available.key as DatabasePreviewTable);
    } catch (error) {
      setSchemaResult({ data: null, diagnostic: error instanceof Error ? error.message : "request_rejected" });
    } finally {
      setLoadingSchema(false);
    }
  }, [activeTable]);

  const loadPage = useCallback(async (table: DatabasePreviewTable, cursor: string | null) => {
    setLoadingPage(true);
    setPageDiagnostic(null);
    try {
      const query = new URLSearchParams({ table: table, page_size: "25" });
      if (cursor) query.set("after_id", cursor);
      const response = await fetch("/api/admin/database/preview?" + query.toString(), { cache: "no-store" });
      const payload = await response.json() as DatabaseBrowserPage & { diagnostic?: string };
      if (!response.ok) throw new Error(payload.diagnostic ?? "request_rejected");
      setPage(payload);
    } catch (error) {
      setPage(null);
      setPageDiagnostic(error instanceof Error ? error.message : "request_rejected");
    } finally {
      setLoadingPage(false);
    }
  }, []);

  useEffect(() => { void loadSchema(); }, [loadSchema]);
  useEffect(() => {
    if (activeTable !== "record_chunk") void loadPage(activeTable, currentCursor);
    else { setPage(null); setPageDiagnostic(null); }
  }, [activeTable, currentCursor, loadPage]);

  const selectedTable = useMemo(() => schemaResult.data?.tables.find((table) => table.key === activeTable) ?? null, [activeTable, schemaResult.data]);
  const columns = useMemo(() => page?.rows[0] ? Object.keys(page.rows[0]) : selectedTable?.columns.map((column) => column.name) ?? [], [page, selectedTable]);
  const changeTable = (table: DatabaseBrowserTable) => {
    setPageCursors([null]);
    setPage(null);
    setActiveTable(table);
  };
  const nextPage = () => {
    if (page?.nextCursor) setPageCursors((cursors) => [...cursors, page.nextCursor]);
  };
  const previousPage = () => {
    if (pageCursors.length > 1) setPageCursors((cursors) => cursors.slice(0, -1));
  };

  return <div className="database-content">
    <div className="database-hero">
      <span className="panel-heading">SUPABASE · SCHEMA BETA</span>
      <div className="database-title-row"><div><h1>Banco de dados</h1><p className="lead">Consulte a estrutura e prévias paginadas das tabelas autorizadas.</p></div><button className="refresh-button" type="button" onClick={() => void loadSchema()} disabled={loadingSchema}>{loadingSchema ? "Atualizando…" : "Atualizar estrutura"}</button></div>
    </div>

    <section className="admin-section database-access" aria-labelledby="database-access-title">
      <div className="section-title"><div><span className="panel-heading">CONTROLE DE ACESSO</span><h2 id="database-access-title">Site e Supabase</h2></div></div>
      <div className="database-access-grid">
        <article className="data-card"><h3>Acesso pelo Site</h3><p>Esta página e suas APIs exigem sessão autenticada do ChatGPT e papel master ativo, validados no servidor pelo D1 do Site.</p><p>O acesso às ferramentas MCP usa OAuth e scopes próprios, como <code>movidesk:read</code>, <code>knowledge:read</code> e <code>knowledge:write</code>. Eles não concedem acesso a esta página administrativa.</p></article>
        <article className="data-card"><h3>Acesso ao Supabase</h3><p>O Worker chama RPCs específicas com <code>service_role</code>, mantida somente no servidor. Essa chave ignora RLS; por isso, a autorização master no Site e as consultas restritas são obrigatórias.</p><p>As permissões de schema, tabela, RLS e execução das RPCs aparecem abaixo. Nenhuma credencial ou expressão SQL de política é exibida.</p></article>
      </div>
    </section>

    <section className="admin-section" aria-labelledby="database-tables-title">
      <div className="section-title"><div><span className="panel-heading">CATÁLOGO</span><h2 id="database-tables-title">Tabelas do schema beta</h2></div></div>
      {loadingSchema && <p className="quiet-message">Carregando estrutura…</p>}
      {schemaResult.diagnostic && <div className="database-alert" role="alert"><strong>Não foi possível consultar o catálogo</strong><span>{diagnosticLabels[schemaResult.diagnostic] ?? diagnosticLabels.request_rejected}</span><button className="refresh-button" onClick={() => void loadSchema()} type="button">Tentar novamente</button></div>}
      {schemaResult.data && <>
        {schemaResult.data.missingTables.length > 0 && <p className="database-alert" role="status">Tabelas ausentes no catálogo: {schemaResult.data.missingTables.join(", ")}.</p>}
        <div className="database-layout">
          <nav className="database-table-nav" aria-label="Tabelas do schema beta">
            {DATABASE_BROWSER_TABLES.map(({ key, previewAllowed }) => {
              const present = schemaResult.data?.tables.some((table) => table.key === key);
              return <button key={key} type="button" className={"database-table-button" + (activeTable === key ? " is-active" : "")} onClick={() => changeTable(key)} disabled={!present} aria-current={activeTable === key ? "page" : undefined}>
                <strong>{tableTitles[key]}</strong><span>{!present ? "Ausente" : previewAllowed ? "Prévia disponível" : "Somente estrutura"}</span>
              </button>;
            })}
          </nav>
          <div className="database-table-detail">
            {selectedTable ? <>
              <div className="database-detail-heading"><div><h3>{tableTitles[selectedTable.key]}</h3><p>{selectedTable.previewAllowed ? "Prévia somente leitura, com campos aprovados e limite de 25 linhas por página." : "Conteúdo não exibido. Esta tabela é restrita à visualização estrutural."}</p></div><span className={"role-badge " + (selectedTable.rls.enabled ? "role-support" : "role-master")}>RLS {selectedTable.rls.enabled ? "ATIVO" : "INATIVO"}</span></div>
              <div className="database-subsection"><h4>Colunas</h4><div className="database-schema-table-wrap"><table className="database-schema-table"><thead><tr><th>Coluna</th><th>Tipo</th><th>Nulável</th><th>Gerada</th></tr></thead><tbody>{selectedTable.columns.map((column) => <tr key={column.name}><td><code>{column.name}</code></td><td>{column.type}</td><td>{column.nullable ? "Sim" : "Não"}</td><td>{column.generated ? "Sim" : "Não"}</td></tr>)}</tbody></table></div></div>
              <div className="database-structure-grid">
                <div className="database-subsection"><h4>Chaves e relações</h4>{selectedTable.constraints.length ? <ul className="database-meta-list">{selectedTable.constraints.map((constraint) => <li key={constraint.name}><strong>{constraint.type}</strong><code>{constraint.name}</code><span>{constraint.columns.join(", ")}{constraint.referencedTable ? " → " + constraint.referencedTable + " (" + constraint.referencedColumns?.join(", ") + ")" : ""}</span></li>)}</ul> : <p className="quiet-message">Nenhuma chave catalogada.</p>}</div>
                <div className="database-subsection"><h4>Índices</h4>{selectedTable.indexes.length ? <ul className="database-meta-list">{selectedTable.indexes.map((index) => <li key={index.name}><strong>{index.unique ? "Único" : index.method}</strong><code>{index.name}</code><span>{index.columns.length ? index.columns.join(", ") : "Expressão/colunas especiais"}</span></li>)}</ul> : <p className="quiet-message">Nenhum índice catalogado.</p>}</div>
              </div>
              <div className="database-structure-grid">
                <div className="database-subsection"><h4>Políticas RLS</h4>{selectedTable.rls.policies.length ? <ul className="database-meta-list">{selectedTable.rls.policies.map((policy) => <li key={policy.name}><strong>{policy.command}</strong><code>{policy.name}</code></li>)}</ul> : <p className="quiet-message">RLS {selectedTable.rls.enabled ? "está ativo, sem políticas catalogadas" : "está desativado"}.</p>}</div>
                <div className="database-subsection"><h4>Grants de tabela</h4>{selectedTable.grants.length ? <ul className="database-meta-list">{selectedTable.grants.map((grant) => <li key={grant.role}><strong>{grant.role}</strong><span>{grant.privileges.join(", ") || "Sem privilégios listados"}</span></li>)}</ul> : <p className="quiet-message">Nenhum grant de role exposto no catálogo.</p>}</div>
              </div>
              {selectedTable.previewAllowed && <div className="database-subsection database-preview"><div className="database-preview-heading"><div><h4>Prévia de dados</h4><p>Campos permitidos pela política do projeto. Conteúdo livre e dados sensíveis permanecem ocultos.</p></div><span>{loadingPage ? "Consultando…" : page ? page.rows.length + " linhas nesta página" : "—"}</span></div>
                {pageDiagnostic && <p className="database-alert" role="alert">{diagnosticLabels[pageDiagnostic] ?? diagnosticLabels.request_rejected}</p>}
                <div className="database-schema-table-wrap"><table className="database-schema-table database-preview-table"><thead><tr>{columns.map((column) => <th key={column}>{column}</th>)}</tr></thead><tbody>{page?.rows.map((row, index) => <tr key={String(row.id) + "-" + index}>{columns.map((column) => <td key={column}>{displayCell(row[column])}</td>)}</tr>)}</tbody></table>{!loadingPage && page && page.rows.length === 0 && <p className="quiet-message database-empty">Esta tabela não tem linhas para exibir.</p>}</div>
                <div className="database-pagination"><span>Página {pageCursors.length}</span><div><button type="button" className="refresh-button" onClick={previousPage} disabled={pageCursors.length <= 1 || loadingPage}>Anterior</button><button type="button" className="refresh-button" onClick={nextPage} disabled={!page?.nextCursor || loadingPage}>Próxima</button></div></div>
              </div>}
            </> : <p className="quiet-message">Selecione uma tabela disponível.</p>}
          </div>
        </div>
        <section className="database-rpc-list"><h3>RPCs administrativas e de conhecimento</h3><p>Permissões de execução reportadas pelo catálogo; sem exibir definição ou SQL.</p>{schemaResult.data.rpcs.length ? <ul className="database-meta-list">{schemaResult.data.rpcs.map((rpc) => <li key={rpc.name}><strong>{rpc.executeRoles.join(", ") || "Sem roles listados"}</strong><code>{rpc.name}</code><span>{rpc.securityDefiner ? "Executa como definidor" : "Executa como chamador"}</span></li>)}</ul> : <p className="quiet-message">Nenhuma RPC aprovada encontrada. Aplique a migration necessária para exibir essas permissões.</p>}</section>
      </>}
    </section>
  </div>;
}
