import "server-only";
import type { User } from "@supabase/supabase-js";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Permission } from "@/lib/permissions/catalog";

/**
 * Centralized permission-checking architecture (app.md #13, #7).
 *
 * Every privileged server-side action should go through
 * `requirePermission()` rather than checking `role === "admin"` inline —
 * that keeps authorization logic in one place and lets RBAC evolve (new
 * roles, finer-grained permissions) without touching call sites.
 *
 * The actual grant lookup lives in Postgres (public.has_permission), so
 * this is a thin, structurally-enforced wrapper: it is impossible to reach
 * a "privileged" code path without a real, currently-valid Supabase
 * session, because getAuthenticatedUser() re-validates the session token
 * with Supabase Auth rather than trusting client-supplied claims.
 */

export class UnauthenticatedError extends Error {
  constructor() {
    super("Authentication required.");
    this.name = "UnauthenticatedError";
  }
}

export class ForbiddenError extends Error {
  constructor(public readonly permission: Permission) {
    super(`Missing required permission: ${permission}`);
    this.name = "ForbiddenError";
  }
}

export async function getAuthenticatedUser(): Promise<User | null> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) {
    return null;
  }

  return data.user;
}

export async function hasPermission(
  userId: string,
  permission: Permission,
): Promise<boolean> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.rpc("has_permission", {
    p_user_id: userId,
    p_permission_key: permission,
  });

  if (error) {
    throw error;
  }

  return Boolean(data);
}

/**
 * Throws UnauthenticatedError or ForbiddenError if the check fails;
 * otherwise returns the authenticated user. Route handlers should catch
 * these two error types and map them to 401/403 (see lib/api/response.ts).
 */
export async function requirePermission(permission: Permission): Promise<User> {
  const user = await getAuthenticatedUser();

  if (!user) {
    throw new UnauthenticatedError();
  }

  const allowed = await hasPermission(user.id, permission);

  if (!allowed) {
    throw new ForbiddenError(permission);
  }

  return user;
}
