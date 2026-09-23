# PWA Update Model

## Lifecycle

```text
new sw.js deployed
  -> browser detects it, installs in the background ("installing")
  -> install finishes, but an existing controller is active -> "waiting"
  -> app shows the update banner (components/native/update-banner.tsx)
  -> user clicks "Refresh" -> applyUpdate() posts { type: "SKIP_WAITING" }
  -> sw.ts's message handler (service-worker/updates/lifecycle.ts) calls self.skipWaiting()
  -> new worker activates, controllerchange fires
  -> the ONE client that requested the update reloads (sessionStorage guard)
```

The guard in `lib/pwa/use-service-worker.ts` (`RELOAD_GUARD_KEY`) is what
prevents an infinite reload loop: the page only reloads on
`controllerchange` if it just set that flag itself. An unsolicited
`controllerchange` (e.g. from another tab updating) does not reload this
tab.

## Cache versioning

`service-worker/sw.ts` derives cache names from `CACHE_VERSION`. On
`activate`, every cache whose name starts with `bsa-` but doesn't match the
current version is deleted — no manual cleanup step, no accumulating stale
caches across deploys.

## The version endpoint

`GET /api/v1/system/version` reads the latest row of `public.app_versions`
and returns `{ version, build_id, minimum_supported_version, update_type }`.
`update_type` is `none | optional | recommended | required`. v0.0.1 has no
UI that reads this endpoint to force an update banner distinct from the
service-worker-detected one — that's Phase 6 (Update & Release Agent) work
once there's a real reason to force updates (a security fix, an
incompatible data model change).

## What must never happen

- `self.skipWaiting()` must never be called unconditionally on install —
  that would force-activate a new worker under content a user is actively
  using, which is exactly the "risk data loss" scenario `app.md #20` warns
  about. It's called only in response to an explicit `SKIP_WAITING` message.
- The service worker must never intercept `/api/*` (see the fetch handler
  in `service-worker/sw.ts`) — a stale cached API response for an
  authenticated or security-sensitive endpoint would be far worse than a
  slow network request.
