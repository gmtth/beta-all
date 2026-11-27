export function hasFormElicitationCapability(clientCapabilities: unknown): boolean {
  if (!clientCapabilities || typeof clientCapabilities !== "object" || Array.isArray(clientCapabilities)) return false;

  const elicitation = (clientCapabilities as Record<string, unknown>).elicitation;
  if (!elicitation || typeof elicitation !== "object" || Array.isArray(elicitation)) return false;

  const modes = elicitation as Record<string, unknown>;
  return Object.prototype.hasOwnProperty.call(modes, "form") || Object.keys(modes).length === 0;
}
