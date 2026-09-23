# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project uses a `MAJOR.MINOR.PATCH` scheme that will adopt
[Semantic Versioning](https://semver.org/) proper once a 1.0 release ships.

## [0.0.1] — 2026-09-21 — Foundation Release

This release establishes the platform's architecture. **No
community-facing features are implemented yet** — no gallery, video
uploads, reviews, events, livestream, or payments. Those arrive in
subsequent releases per the build order in `docs/app.md #28`.

### Added

- Initial open-source repository structure (`app/`, `components/`,
  `features/`, `lib/`, `server/`, `service-worker/`, `supabase/`, `docs/`,
  `tests/`) per the EVTECH PNWA architecture.
- The Context Trinity moved to `docs/` (`app.md`, `agents.md`, `context.md`).
- Zod-validated environment variables, split into public
  (`lib/config/env.public.ts`) and server-only (`lib/config/env.server.ts`,
  structurally isolated via the `server-only` package).
- Three-tier Supabase client architecture: browser, server (SSR, RLS-scoped),
  and admin (service-role, server-only-reachable, guarded three ways).
- Initial database migration (`supabase/migrations/0001_init.sql`):
  `profiles`, `roles`, `permissions`, `user_roles`, `role_permissions`,
  `app_versions`, `audit_logs`, `security_events` — every table has RLS
  enabled with an explicit, default-deny policy set.
- Centralized permission engine: `public.has_permission()` in Postgres,
  called from both RLS policies and `server/policies/authorize.ts`'s
  `requirePermission()`. Privilege escalation to `super_admin` is
  structurally blocked for ordinary admins.
- Seed data: the 7 initial roles and ~30 initial permissions from
  `docs/app.md #7`, with role → permission grants.
- `/api/v1` foundation: canonical response envelope, request IDs, a typed
  error taxonomy, and two endpoints — `GET /api/v1/health` and
  `GET /api/v1/system/version`.
- PWA foundation: a complete Web App Manifest (`app/manifest.ts`),
  placeholder installable icons, `viewport-fit=cover` + safe-area CSS,
  and `overscroll-behavior: none`.
- A hand-written, Workbox-strategy-equivalent service worker
  (`service-worker/sw.ts`, bundled via esbuild): cache-first for static
  assets, network-first with an offline fallback for navigations,
  network-only for `/api/*`, and an explicit install → waiting → activate
  update lifecycle with a reload-loop guard.
- Offline mutation-queue architecture: IndexedDB-backed
  (`lib/offline/db.ts`), Zod-validated (`lib/offline/schemas.ts`), with a
  hard-coded list of security-sensitive mutation types that can never be
  queued offline, and both Background Sync and foreground-fallback sync
  triggers (`lib/pwa/sync.ts`).
- Per-request CSP via a nonce generated in `middleware.ts` (no
  `unsafe-inline` for scripts), plus `X-Content-Type-Options`,
  `Referrer-Policy`, `Permissions-Policy`, `X-Frame-Options`, and HSTS in
  production.
- Structured, secret-redacting logging (`lib/logging/logger.ts`) and an
  append-only audit log writer (`server/services/audit.ts`).
- Open-source contributor tooling: `README.md`, `CONTRIBUTING.md`,
  `CODE_OF_CONDUCT.md`, `SECURITY.md`, `.env.example`, GitHub issue/PR
  templates, `CODEOWNERS`.
- CI (`.github/workflows/ci.yml`): install → typecheck → lint → test →
  build → `npm audit`, gating merges on all of the above passing.
- Vitest unit/integration test suite (36 tests) covering environment
  validation, the API response contract, the permission catalog, the
  offline mutation queue's security guards, the manifest, and the
  health/version route handlers.
- pgTAP RLS test suite (`supabase/tests/`) — written but **not yet
  executed** in this environment (no provisioned local Postgres/Docker
  stack was available during this release); run `supabase test db` and
  fix forward before relying on it.

### Known gaps (tracked, not silent)

- Open-source license not yet selected — see
  `docs/architecture/LICENSE-DECISION.md`.
- No rate limiting yet (no mutating endpoints exist to protect).
- No MFA enforcement yet (no sign-in UI exists yet).
- RLS pgTAP tests are unexecuted (see above).
- Payment provider, LiveKit deployment topology, and video
  transcoding/scanning approach are all undecided — tracked in
  `docs/context.md`.
