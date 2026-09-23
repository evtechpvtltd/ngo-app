/// <reference lib="webworker" />

/**
 * Network First with bounded fallback — for freshness-sensitive public data
 * and navigations (app.md #13). Falls back to the cache, then to an
 * explicit offline document for navigations only.
 */
export async function networkFirst(
  request: Request,
  cacheName: string,
  offlineFallbackUrl?: string,
): Promise<Response> {
  const cache = await caches.open(cacheName);

  try {
    const response = await fetch(request);
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await cache.match(request);
    if (cached) return cached;

    if (offlineFallbackUrl) {
      const offline = await caches.match(offlineFallbackUrl);
      if (offline) return offline;
    }

    return new Response("Offline and no cached response available.", {
      status: 503,
      statusText: "Service Unavailable",
    });
  }
}
