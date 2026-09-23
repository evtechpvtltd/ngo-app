/// <reference lib="webworker" />

import { serviceWorkerMessageSchema } from "@/service-worker/messages/types";

/**
 * Handles the install -> waiting -> activate handshake (app.md #15/#20):
 * the new worker installs and waits; the app decides when it's safe to
 * activate by posting SKIP_WAITING (see lib/pwa/use-service-worker.ts).
 * We never call self.skipWaiting() unconditionally on install — that would
 * force-activate under content still in use and risk data loss.
 */
export function registerUpdateLifecycle(swSelf: ServiceWorkerGlobalScope) {
  swSelf.addEventListener("message", (event) => {
    const parsed = serviceWorkerMessageSchema.safeParse(event.data);
    if (!parsed.success) return;

    if (parsed.data.type === "SKIP_WAITING") {
      void swSelf.skipWaiting();
    }
  });
}
