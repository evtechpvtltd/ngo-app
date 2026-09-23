import "server-only";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { logger } from "@/lib/logging/logger";

interface AuditEventInput {
  requestId?: string;
  actorId?: string;
  action: string;
  resourceType?: string;
  resourceId?: string;
  result: "success" | "failure";
  metadata?: Record<string, unknown>;
}

/**
 * Writes an append-only audit log row. Uses the admin client because
 * public.audit_logs intentionally has no INSERT policy for authenticated
 * users (see supabase/migrations/0001_init.sql #14) — only trusted server
 * code, which has already performed its own authorization check, may
 * record audit events.
 */
export async function recordAuditEvent(input: AuditEventInput): Promise<void> {
  const supabase = createSupabaseAdminClient();

  const { error } = await supabase.from("audit_logs").insert({
    request_id: input.requestId ?? null,
    actor_id: input.actorId ?? null,
    action: input.action,
    resource_type: input.resourceType ?? null,
    resource_id: input.resourceId ?? null,
    result: input.result,
    metadata: input.metadata ?? {},
  });

  if (error) {
    // Audit failures must never crash the primary request, but must be loud.
    logger.error("Failed to record audit event", {
      request_id: input.requestId,
      action: input.action,
      error: error.message,
    });
  }
}
