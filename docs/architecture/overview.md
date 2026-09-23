# Architecture Overview

Bhoirwadi Sanskritik Association is a Progressive Native Web App (PNWA):
one Next.js codebase that is simultaneously a website, an installable PWA,
and — via the same API — the future backend for native Android/iOS clients.

## The Context Trinity

Three documents govern this repository and must be read before any
significant change:

- [`app.md`](../app.md) — the immutable architecture constitution. If code
  conflicts with it, the code is wrong.
- [`agents.md`](../agents.md) — the specialist-agent registry describing
  which concerns (security, offline sync, PWA, RBAC, ...) own which parts
  of the system, and how they collaborate.
- [`context.md`](../context.md) — living project state, updated after every
  significant change. Read this to understand what's actually built today
  versus what's planned.

## Layered structure

```text
app/            Next.js App Router routes (UI + API)
components/     Presentational + shell components (no business logic)
features/       Reserved for future feature modules (empty in v0.0.1)
lib/            Cross-cutting concerns: config, auth, supabase, offline, pwa, security, logging, validation
server/         Server-only business logic: services, repositories, policies
service-worker/ The service worker source (bundled separately, see below)
supabase/       Migrations, seed data, Edge Functions, pgTAP tests
```

The boundary that matters most: **`lib/supabase/admin.ts` (service-role,
bypasses RLS) is reachable only from `server/` and `app/api/**`.** UI code
talks to Supabase through `lib/supabase/browser.ts` or
`lib/supabase/server.ts`, both of which stay subject to RLS. See
`docs/security.md #2`.

## Why the service worker is a separate build step

`service-worker/sw.ts` is TypeScript, imports Zod and `idb`, and shares code
with `lib/offline/`. It is **not** part of the Next.js webpack build — it's
bundled independently with esbuild (`npm run build:sw`, wired into `predev`
/ `prebuild`) into `public/sw.js`, because a service worker has its own
global scope (`ServiceWorkerGlobalScope`, not `window`) and must be served
from the origin root to control the whole app.

## API-first

The website is a client of `/api/v1`, same as any future mobile app would
be. See [`api-first.md`](./api-first.md).

## Offline-first where safe

See [`offline-first.md`](./offline-first.md) and `app.md #3.3` for exactly
which operations are allowed to be queued offline.

## What v0.0.1 deliberately does not include

No gallery, videos, reviews, events, livestream, or payments — see the
repository root `README.md` "Current release status" section and
`CHANGELOG.md`.
