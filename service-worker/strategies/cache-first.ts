/// <reference lib="webworker" />

/**
 * Cache First — for immutable static assets (app.md #13). Falls through to
 * network only on a cache miss, and opportunistically stores the result.
 */
export async function cacheFirst(
  request: Request,
  cacheName: string,
): Promise<Response> {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  if (cached) return cached;

  const response = await fetch(request);
  if (response.ok) {
    cache.put(request, response.clone());
  }
  return response;
}
