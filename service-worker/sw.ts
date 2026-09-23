/// <reference lib="webworker" />

import { cacheFirst } from "@/service-worker/strategies/cache-first";
import { networkFirst } from "@/service-worker/strategies/network-first";
import { registerUpdateLifecycle } from "@/service-worker/updates/lifecycle";
import { registerBackgroundSync } from "@/service-worker/sync/mutation-queue";

declare const self: ServiceWorkerGlobalScope;

// Bump this on every release that changes cached asset shapes — activate()
// deletes any cache whose name doesn't match, so stale caches never linger
// (app.md #15).
const CACHE_VERSION = "v1";
const STATIC_CACHE = `bsa-static-${CACHE_VERSION}`;
const OFFLINE_FALLBACK_URL = "/offline.html";

const PRECACHE_URLS = [OFFLINE_FALLBACK_URL];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => cache.addAll(PRECACHE_URLS)),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames
          .filter((name) => name.startsWith("bsa-") && name !== STATIC_CACHE)
          .map((name) => caches.delete(name)),
      );
      await self.clients.claim();
    })(),
  );
});

registerUpdateLifecycle(self);
registerBackgroundSync(self);

self.addEventListener("fetch", (event) => {
  const { request } = event;

  // Only ever intercept same-origin GET requests. Everything else
  // (cross-origin, POST/PUT/DELETE, Supabase Realtime websockets) passes
  // straight through to the network untouched.
  if (request.method !== "GET" || new URL(request.url).origin !== self.location.origin) {
    return;
  }

  const url = new URL(request.url);

  // Security-critical and not-yet-defined API surfaces: network-only.
  // Never add a caching strategy here for auth, admin, payments, or role
  // endpoints (app.md #13/#19) — new PUBLIC read endpoints should be added
  // to the stale-while-revalidate branch explicitly, one at a time, never
  // by broadening this fallthrough.
  if (url.pathname.startsWith("/api/")) {
    return;
  }

  // Immutable static assets: cache-first.
  if (
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.startsWith("/icons/")
  ) {
    event.respondWith(cacheFirst(request, STATIC_CACHE));
    return;
  }

  // Navigations: network-first with the offline document as a bounded
  // fallback so the installed app never shows a browser error page.
  if (request.mode === "navigate") {
    event.respondWith(networkFirst(request, STATIC_CACHE, OFFLINE_FALLBACK_URL));
    return;
  }

  // Everything else passes through untouched for v0.0.1.
});
