import { openOfflineDb } from "./db";
import {
  queuedMutationSchema,
  FORBIDDEN_OFFLINE_MUTATION_TYPES,
  type QueuedMutation,
  type MutationStatus,
} from "./schemas";

type MutationHandler = (mutation: QueuedMutation) => Promise<void>;

/**
 * No handlers are registered yet in v0.0.1 — no domain feature has an
 * offline-safe mutation to sync. Later releases call
 * `registerMutationHandler("review.create", handler)` etc. from their own
 * feature module; this file only owns the generic queue/retry mechanics.
 */
const handlers = new Map<string, MutationHandler>();

export function registerMutationHandler(type: string, handler: MutationHandler) {
  if (FORBIDDEN_OFFLINE_MUTATION_TYPES.includes(type as never)) {
    throw new Error(
      `"${type}" is a security-sensitive operation and must never be queued offline (app.md #3.3).`,
    );
  }
  handlers.set(type, handler);
}

export async function enqueueMutation(
  input: Omit<QueuedMutation, "retry_count" | "status" | "last_error">,
): Promise<QueuedMutation> {
  if (FORBIDDEN_OFFLINE_MUTATION_TYPES.includes(input.type as never)) {
    throw new Error(
      `"${input.type}" is a security-sensitive operation and must never be queued offline (app.md #3.3).`,
    );
  }

  const mutation = queuedMutationSchema.parse({
    ...input,
    retry_count: 0,
    status: "pending" satisfies MutationStatus,
    last_error: null,
  });

  const db = await openOfflineDb();
  await db.put("mutation_queue", mutation);
  return mutation;
}

export async function listMutationsByStatus(
  status: MutationStatus,
): Promise<QueuedMutation[]> {
  const db = await openOfflineDb();
  return db.getAllFromIndex("mutation_queue", "by-status", status);
}

async function updateMutation(
  id: string,
  patch: Partial<Pick<QueuedMutation, "status" | "retry_count" | "last_error">>,
) {
  const db = await openOfflineDb();
  const existing = await db.get("mutation_queue", id);
  if (!existing) return;
  await db.put("mutation_queue", { ...existing, ...patch });
}

/**
 * Processes every pending mutation with a registered handler. Safe to call
 * from the foreground (online event, manual "retry" button) or from the
 * service worker's `sync` event — see service-worker/sync/mutation-queue.ts.
 */
export async function processMutationQueue(): Promise<void> {
  const pending = await listMutationsByStatus("pending");

  for (const mutation of pending) {
    const handler = handlers.get(mutation.type);
    if (!handler) continue; // No feature owns this type yet; leave pending.

    await updateMutation(mutation.id, { status: "syncing" });

    try {
      await handler(mutation);
      await updateMutation(mutation.id, { status: "succeeded", last_error: null });
    } catch (error) {
      const retryCount = mutation.retry_count + 1;
      await updateMutation(mutation.id, {
        status: retryCount >= 5 ? "requires_user_action" : "pending",
        retry_count: retryCount,
        last_error: error instanceof Error ? error.message : "Unknown sync error",
      });
    }
  }
}
