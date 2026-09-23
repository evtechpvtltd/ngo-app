import { z } from "zod";

/**
 * Every queued mutation is validated with this schema before local
 * persistence, before sync, and again (independently) on the server
 * (app.md #14/#21). The server remains authoritative regardless of what
 * the client claims here.
 */
export const mutationStatusSchema = z.enum([
  "pending",
  "syncing",
  "succeeded",
  "failed",
  "requires_user_action",
]);
export type MutationStatus = z.infer<typeof mutationStatusSchema>;

export const queuedMutationSchema = z.object({
  id: z.string().uuid(),
  type: z.string().min(1),
  schema_version: z.number().int().positive(),
  user_id: z.string().uuid().nullable(),
  created_at: z.string().datetime(),
  payload: z.unknown(),
  idempotency_key: z.string().uuid(),
  retry_count: z.number().int().min(0),
  last_error: z.string().nullable(),
  status: mutationStatusSchema,
});
export type QueuedMutation = z.infer<typeof queuedMutationSchema>;

export const draftRecordSchema = z.object({
  id: z.string().uuid(),
  kind: z.string().min(1),
  updated_at: z.string().datetime(),
  data: z.unknown(),
});
export type DraftRecord = z.infer<typeof draftRecordSchema>;

/**
 * Security-sensitive operations MUST NEVER be represented as a queueable
 * mutation type (app.md #3.3). This is a defense-in-depth check callers
 * can use before enqueueing; the authoritative rule remains this list
 * living alongside the mutation handler registry in mutation-queue.ts.
 */
export const FORBIDDEN_OFFLINE_MUTATION_TYPES = [
  "auth.login",
  "auth.password_reset",
  "auth.mfa_enroll",
  "role.change",
  "permission.change",
  "moderation.decide",
  "payment.confirm",
  "payment.refund",
  "livestream.broadcaster_auth",
  "livestream.control",
  "user.ban",
  "security.settings_change",
] as const;
