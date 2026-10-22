import type { OAuthTokenFailure } from "../app/oauth/clients";

const RECONNECTION_DESCRIPTION = "A conexão expirou ou foi revogada. Reconecte sua conta para continuar.";
const SCOPE_DESCRIPTION = "Esta autorização não inclui as permissões necessárias. Reconecte sua conta para continuar.";
const TERMS_DESCRIPTION = "Leia e aceite os Termos de Uso e o Aviso de Privacidade na tela de autorização para continuar.";

export function protectedResourceMetadataUrl(resource: string) {
  return new URL("/.well-known/oauth-protected-resource", resource).toString();
}

export function bearerAuthenticateChallenge(error: OAuthTokenFailure, resource: string, scopes: string[] = []) {
  const wireError = error === "terms_not_accepted" ? "invalid_token" : error;
  const description = error === "terms_not_accepted" ? TERMS_DESCRIPTION : error === "insufficient_scope" ? SCOPE_DESCRIPTION : RECONNECTION_DESCRIPTION;
  const scope = error === "insufficient_scope" && scopes.length ? `, scope="${scopes.join(" ")}"` : "";
  return `Bearer error="${wireError}", error_description="${description}", resource_metadata="${protectedResourceMetadataUrl(resource)}"${scope}`;
}

export function missingMcpAuthorizationResponse(resource: string) {
  return Response.json({ error: "invalid_token" }, {
    status: 401,
    headers: { "WWW-Authenticate": bearerAuthenticateChallenge("invalid_token", resource) },
  });
}

export class McpAuthorizationFailure extends Error {
  constructor(readonly reason: OAuthTokenFailure) {
    super(reason);
    this.name = "McpAuthorizationFailure";
  }
}

export function mcpAuthorizationError(error: OAuthTokenFailure, resource: string, requiredScopes: string[]) {
  const description = error === "terms_not_accepted" ? TERMS_DESCRIPTION : error === "insufficient_scope" ? SCOPE_DESCRIPTION : RECONNECTION_DESCRIPTION;
  const challenge = bearerAuthenticateChallenge(error, resource, requiredScopes);
  return {
    isError: true,
    content: [{ type: "text" as const, text: description }],
    _meta: { "mcp/www_authenticate": [challenge] },
  };
}
