"use client";

import { processMutationQueue } from "@/lib/offline/mutation-queue";

const BACKGROUND_SYNC_TAG = "bsa-mutation-queue";

interface SyncManager {
  register(tag: string): Promise<void>;
}

/**
 * Asks the browser to flush the offline mutation queue via Background
 * Sync when supported; otherwise relies on the foreground fallback
 * (initForegroundSyncFallback) that fires on the `online` event. Call this
 * right after enqueueing a mutation.
 */
export async function requestBackgroundSync(): Promise<void> {
  if (!("serviceWorker" in navigator)) return;

  const registration = await navigator.serviceWorker.ready;
  const syncManager = (registration as ServiceWorkerRegistration & { sync?: SyncManager }).sync;

  if (syncManager) {
    await syncManager.register(BACKGROUND_SYNC_TAG);
  } else {
    // Background Sync unsupported (e.g. Safari) — foreground fallback below
    // will pick this up the next time the app is online.
    if (navigator.onLine) {
      void processMutationQueue();
    }
  }
}

/**
 * Registers the safe fallback sync path required when Background Sync is
 * unavailable. Call once from the app shell.
 */
export function initForegroundSyncFallback(): () => void {
  const handleOnline = () => {
    void processMutationQueue();
  };

  window.addEventListener("online", handleOnline);
  return () => window.removeEventListener("online", handleOnline);
}
