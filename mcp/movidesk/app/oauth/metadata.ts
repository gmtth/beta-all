export function authorizationServerMetadata(issuer: string, scopes: string[], clientIds: string[]) {
  return {
    issuer,
    authorization_endpoint: `${issuer}/oauth/authorize`,
    token_endpoint: `${issuer}/oauth/token`,
    response_types_supported: ["code"],
    grant_types_supported: ["authorization_code", "refresh_token"],
    code_challenge_methods_supported: ["S256"],
    scopes_supported: [...scopes],
    token_endpoint_auth_methods_supported: ["none"],
    authorization_response_iss_parameter_supported: true,
    client_id_metadata_document_supported: true,
    client_ids_supported: [...clientIds],
  };
}

export function protectedResourceMetadata(origin: string, scopes: string[]) {
  return {
    resource: `${origin}/mcp/`,
    authorization_servers: [origin],
    scopes_supported: [...scopes],
    bearer_methods_supported: ["header"],
  };
}
