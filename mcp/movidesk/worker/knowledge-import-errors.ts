export type KnowledgeImportDiagnostic =
  | "ticket_not_found" | "movidesk_unavailable" | "ticket_mismatch" | "ticket_missing_title"
  | "ticket_missing_content" | "ticket_too_large" | "supabase_configuration" | "supabase_rpc_unavailable"
  | "supabase_permission_denied" | "supabase_source_not_configured" | "supabase_payload_rejected"
  | "supabase_rate_limited" | "supabase_unavailable" | "supabase_timeout" | "supabase_network_error"
  | "supabase_invalid_response" | "unexpected";

const messages: Record<KnowledgeImportDiagnostic, string> = {
  ticket_not_found: "O Movidesk não encontrou esse chamado, inclusive na busca de chamados antigos. Confira o identificador e se a conta tem acesso ao registro.",
  movidesk_unavailable: "Não foi possível obter o chamado no Movidesk. Tente novamente; se persistir, verifique o acesso do conector ao Movidesk.",
  ticket_mismatch: "O Movidesk retornou um chamado diferente do identificador solicitado. Nenhum dado foi gravado; peça revisão do conector.",
  ticket_missing_title: "O chamado foi localizado, mas não tem um assunto utilizável para indexação. Revise o registro no Movidesk antes de importar.",
  ticket_missing_content: "O chamado foi localizado, mas não contém descrição nem interações utilizáveis. Acrescente contexto ao chamado ou escolha outro registro.",
  ticket_too_large: "O chamado excede os limites máximos de conteúdo ou trechos aceitos nesta importação. Nenhuma gravação foi confirmada; peça ao administrador para avaliar os limites ou uma importação em partes.",
  supabase_configuration: "A gravação não foi iniciada porque a conexão do servidor com a base de conhecimento está sem configuração válida. Peça ao administrador para conferir a configuração Supabase do Sites.",
  supabase_rpc_unavailable: "O chamado foi preparado, mas a função de importação não está disponível na API Supabase. Confira se a migration está aplicada e se o schema beta está exposto; após mudanças recentes, atualize o cache de schema da Data API.",
  supabase_permission_denied: "O chamado foi preparado, mas a API Supabase recusou a permissão de gravação. Peça ao administrador para conferir os grants da função e a chave de serviço no servidor.",
  supabase_source_not_configured: "O chamado foi preparado, mas a fonte Movidesk não está cadastrada como fonte ativa única no Supabase. Peça ao administrador para revisar o catálogo de fontes.",
  supabase_payload_rejected: "O chamado foi preparado, mas o Supabase rejeitou o formato ou os limites dos dados. Nenhuma importação foi confirmada; revise o chamado e informe o administrador se persistir.",
  supabase_rate_limited: "A base de conhecimento limitou temporariamente as gravações. Aguarde um pouco e tente novamente.",
  supabase_unavailable: "A base de conhecimento está temporariamente indisponível. A gravação não foi confirmada; tente novamente mais tarde.",
  supabase_timeout: "A gravação excedeu o tempo limite. O resultado pode ser incerto; consulte o catálogo antes de repetir, pois o servidor pode ter concluído a operação.",
  supabase_network_error: "Não foi possível alcançar a base de conhecimento. A gravação não foi confirmada; verifique a conexão e tente novamente.",
  supabase_invalid_response: "A base de conhecimento respondeu em formato inesperado. Não foi possível confirmar a importação; peça ao administrador para verificar o serviço.",
  unexpected: "A importação falhou por uma causa não classificada. Nenhum sucesso foi confirmado; informe o administrador com o diagnóstico `unexpected`.",
};

export class KnowledgeImportError extends Error {
  constructor(readonly diagnostic: KnowledgeImportDiagnostic) {
    super(messages[diagnostic]);
    this.name = "KnowledgeImportError";
  }
}

export function knowledgeImportFailure(error: unknown): KnowledgeImportError {
  return error instanceof KnowledgeImportError ? error : new KnowledgeImportError("unexpected");
}
