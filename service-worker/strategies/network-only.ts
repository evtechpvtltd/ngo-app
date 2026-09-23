/// <reference lib="webworker" />

/**
 * Network Only — mandatory for security-critical endpoints (app.md #13):
 * auth, MFA, permissions, admin, payments, refunds, role changes,
 * broadcaster tokens, security settings. Never touches the Cache Storage
 * API in either direction.
 */
export async function networkOnly(request: Request): Promise<Response> {
  return fetch(request);
}
