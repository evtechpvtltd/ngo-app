/// <reference lib="webworker" />

/**
 * Stale While Revalidate — for public, non-user-specific content where an
 * instant (possibly slightly stale) response is preferable to a network
 * round-trip (app.md #13). Never use this for authenticated/user-specific
 * responses.
 */
export async function staleWhileRevalidate(
  request: Request,
  cacheName: string,
): Promise<Response> {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);

  const networkFetch = fetch(request)
    .then((response) => {
      if (response.ok) {
        cache.put(request, response.clone());
      }
      return response;
    })
    .catch(() => undefined);

  if (cached) {
    // Revalidate in the background; don't block the response on it.
    networkFetch.catch(() => undefined);
    return cached;
  }

  const networkResponse = await networkFetch;
  if (networkResponse) return networkResponse;

  return new Response("Offline and no cached response available.", {
    status: 503,
    statusText: "Service Unavailable",
  });
}
