# Offline-First Architecture

"Offline-first" does not mean "offline-trusted" (`app.md #3.3`). This
document covers what's built in v0.0.1: the generic queueing mechanism.
No feature yet uses it end-to-end, because no feature with a safe offline
mutation exists yet.

## The mutation queue

`lib/offline/db.ts` opens an IndexedDB database (`bsa-offline`) with four
stores: `mutation_queue`, `drafts`, `app_metadata`, `sync_state`.

Every queued mutation (`lib/offline/schemas.ts`) has:

```text
id, type, schema_version, user_id, created_at, payload,
idempotency_key, retry_count, last_error, status
```

`status` is one of `pending | syncing | succeeded | failed |
requires_user_action`. A mutation moves to `requires_user_action` after 5
failed retries rather than retrying forever.

## The security gate

`FORBIDDEN_OFFLINE_MUTATION_TYPES` in `lib/offline/schemas.ts` hard-blocks
security-sensitive types (`payment.confirm`, `role.change`,
`moderation.decide`, ...) at two points: `registerMutationHandler()` and
`enqueueMutation()` both throw synchronously if given a forbidden type. A
feature cannot accidentally make login or payments "work offline."

## Registering a feature's mutation handler

No handlers are registered in v0.0.1. When a future feature needs one:

```ts
import { registerMutationHandler } from "@/lib/offline/mutation-queue";

registerMutationHandler("review.create_draft", async (mutation) => {
  // POST mutation.payload to the real API, throw on failure to trigger retry
});
```

`processMutationQueue()` looks up the handler by `type`; if none is
registered, the mutation is left `pending` rather than silently dropped.

## Sync triggers

Two independent triggers call `processMutationQueue()` (`app.md`'s "safe
fallback sync when Background Sync is unavailable"):

1. **Background Sync** (`service-worker/sync/mutation-queue.ts`) — the
   browser wakes the service worker even if the tab is closed. Requested
   via `requestBackgroundSync()` in `lib/pwa/sync.ts`.
2. **Foreground fallback** (`initForegroundSyncFallback()` in
   `lib/pwa/sync.ts`, wired into `AppShell`) — listens for the `online`
   window event. This is what runs on browsers without Background Sync
   support (e.g. Safari).

## Conflict resolution

Not yet applicable — no two clients can conflict over a resource that
doesn't exist yet. When the first offline-safe feature ships, choose its
conflict mode explicitly (server-wins / client-wins / merge / user
resolution) per `agents.md`'s Offline Sync Agent — never a global default.
