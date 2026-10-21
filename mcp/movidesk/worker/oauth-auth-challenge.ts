import type { OAuthTokenFailure } from "../app/oauth/clients";

const RECONNECTION_DESCRIPTION = "A conexão expirou ou foi revogada. Reconecte sua conta para continuar.";
const SCOPE_DESCRIPTION = "Esta autorização não inclui as permissões necessárias. Reconecte sua conta para continuar.";

export function protectedResourceMetadataUrl(resource: string) {
  return new URL("/.well-known/oauth-protected-resource", resource).toString();
}

export function bearerAuthenticateChallenge(error: OAuthTokenFailure, resource: string, scopes: string[] = []) {
  const description = error === "insufficient_scope" ? SCOPE_DESCRIPTION : RECONNECTION_DESCRIPTION;
  const scope = error === "insufficient_scope" && scopes.length ? `, scope="${scopes.join(" ")}"` : "";
  return `Bearer error="${error}", error_description="${description}", resource_metadata="${protectedResourceMetadataUrl(resource)}"${scope}`;
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
  const description = error === "insufficient_scope" ? SCOPE_DESCRIPTION : RECONNECTION_DESCRIPTION;
  const challenge = bearerAuthenticateChallenge(error, resource, requiredScopes);
  return {
    isError: true,
    content: [{ type: "text" as const, text: description }],
    _meta: { "mcp/www_authenticate": [challenge] },
  };
}
