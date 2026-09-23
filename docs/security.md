# Security Architecture — v0.0.1

> Constitution: [`app.md`](./app.md). This document explains how the
> constitution is actually implemented in this codebase; if the two ever
> disagree, `app.md` wins and this file needs fixing.

## 1. Trust boundaries

Every boundary below is treated as untrusted by default (`app.md #3.1`):

| Boundary | Trusted for | Never trusted for |
|---|---|---|
| Browser / installed PWA | Rendering, optimistic UI, offline queueing | Authorization decisions, final payment state |
| Android/iOS clients (future) | Same as browser, once built | Same as browser |
| Service worker | Caching strategy, offline fallback | Bypassing auth, caching secrets |
| IndexedDB / offline mutation queue | Storing safe drafts | Representing a completed security-sensitive action |
| `/api/v1/*` | Enforcing auth + RLS before touching data | — (this is the trust boundary itself) |
| Supabase Postgres (via RLS) | Enforcing row-level access | — (co-authoritative with the API layer) |
| Supabase Storage (future) | Serving approved public assets | Serving un-moderated/private assets publicly |
| CI/CD, GitHub repository | Running typecheck/lint/tests/build | Holding real secrets (none are committed) |

## 2. What's actually implemented in v0.0.1

- **CSP with per-request nonce, no `unsafe-inline` for scripts** — `middleware.ts`
  generates a nonce and sets `Content-Security-Policy: script-src 'self'
  'nonce-<value>' 'strict-dynamic'`; Next.js applies that nonce automatically
  to its own hydration/streaming scripts. `'unsafe-eval'` is added in dev
  only (React Fast Refresh needs it). Documented exception: `style-src`
  allows `'unsafe-inline'` because Tailwind's runtime and React's inline
  `style` props both need it; there's no practical nonce story for styles
  yet.
- **Default-deny RLS** on every table in `supabase/migrations/0001_init.sql`
  — no table is created without `ENABLE ROW LEVEL SECURITY` and an explicit
  policy set. Anonymous has zero policies on `profiles`, `roles`,
  `permissions`, `role_permissions`, `user_roles`, `audit_logs`,
  `security_events` — meaning zero access, not "read-only".
- **Centralized permission checks** — `public.has_permission(user_id, key)`
  in Postgres is the single source of truth, called both from RLS policies
  and from `server/policies/authorize.ts`'s `requirePermission()`. No code
  path checks `role === "admin"` directly.
- **Privilege escalation prevention** — granting the `super_admin` role
  additionally requires the `system.manage` permission (see the
  `user_roles_insert_privileged` / `user_roles_delete_privileged` policies).
  Only `super_admin` holds `system.manage` in the seed data, so an ordinary
  `admin` cannot mint another `super_admin`.
- **Service-role isolation** — `lib/supabase/admin.ts` is guarded three
  ways: the `server-only` package fails the build if a Client Component
  imports it, a runtime `typeof window !== "undefined"` check throws as a
  second line of defense, and `eslint.config.mjs` blocks the import path
  from `app/**` (except `app/api/**`), `components/**`, and `features/**`.
- **Env validation fails fast** — `lib/config/env.public.ts` and
  `lib/config/env.server.ts` parse `process.env` with Zod at import time and
  throw immediately (with no secret values in the thrown message) if
  anything required is missing or malformed. `env.server.ts` imports
  `server-only` so it cannot end up in a client bundle.
- **Append-only audit log** — `public.audit_logs` has no INSERT/UPDATE/DELETE
  policy for `authenticated`/`anon` at all; only `server/services/audit.ts`,
  using the service-role client, can write to it. No role — not even
  `admin` — can delete rows through the API.
- **Structured logging with redaction** — `lib/logging/logger.ts` redacts
  any field whose key matches `password|secret|token|otp|refresh|api[_-]?key|
  service[_-]?role` before logging.
- **Generic error responses** — `lib/api/response.ts`'s `apiError()` never
  receives a raw exception; route handlers log the real error via `logger`
  and return a fixed, safe message (see `app/api/v1/system/version/route.ts`
  for the pattern).

## 3. Security principles and where they live

| Principle | Implementation |
|---|---|
| Default deny | RLS on every table; no policy = no access |
| Least privilege | Permission catalog (`lib/permissions/catalog.ts`) is granular, not just role checks |
| Zero trust client | All authorization re-checked server-side via `requirePermission()` |
| Server-side authorization | `server/policies/authorize.ts` |
| RLS enforcement | `supabase/migrations/0001_init.sql` |
| Input validation | Zod schemas throughout (`lib/config`, `lib/offline/schemas.ts`, `lib/api/response.ts`) |
| Output encoding | React's default JSX escaping; no `dangerouslySetInnerHTML` anywhere in v0.0.1 |
| Secret isolation | `env.server.ts` + `server-only`; `.env.example` has placeholders only |
| Auditability | `audit_logs` / `security_events` tables, `server/services/audit.ts` |
| Rate limiting | **Not yet implemented** — flagged below |
| Idempotency | `idempotency_key` field on every queued offline mutation (`lib/offline/schemas.ts`) |
| Secure updates | Service worker waits for explicit `SKIP_WAITING`; see `docs/architecture/pwa-update-model.md` |
| Dependency hygiene | `npm audit`, Dependabot-style review expected in CI (see `.github/workflows/ci.yml`) |

## 4. Known gaps in v0.0.1 (tracked, not silently ignored)

- **No rate limiting yet.** No domain mutation endpoints exist yet to rate-limit;
  this must land before `/api/v1/reviews`, `/api/v1/videos`, etc. are added.
- **RLS pgTAP tests are written but unexecuted** (`supabase/tests/*.test.sql`)
  — this release was built without a provisioned local Postgres/Docker
  environment. Run `supabase test db` and fix forward before relying on them.
- **MFA is not implemented.** `app.md` requires it for `super_admin`; this is
  Phase 1/3 work once Supabase Auth is wired into actual sign-in UI.
- **No dependency/secret scanning bot configured yet** beyond `npm audit` in
  CI — enabling GitHub's Dependabot/secret-scanning is an org-level setting
  the repository owner needs to turn on post-publish.

## 5. Reporting a vulnerability

See [`SECURITY.md`](../SECURITY.md).
