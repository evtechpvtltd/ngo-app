/// <reference lib="webworker" />

import { processMutationQueue } from "@/lib/offline/mutation-queue";

export const BACKGROUND_SYNC_TAG = "bsa-mutation-queue" as const;

/**
 * Registers the Background Sync handler when the browser supports it. On
 * browsers without Background Sync, the foreground fallback in
 * lib/pwa (online event -> processMutationQueue()) is what flushes the
 * queue instead (app.md immutable stack: "safe fallback sync when
 * Background Sync is unavailable").
 */
export function registerBackgroundSync(swSelf: ServiceWorkerGlobalScope) {
  swSelf.addEventListener("sync", (event) => {
    const syncEvent = event as unknown as { tag: string; waitUntil: (p: Promise<unknown>) => void };
    if (syncEvent.tag === BACKGROUND_SYNC_TAG) {
      syncEvent.waitUntil(processMutationQueue());
    }
  });
}
