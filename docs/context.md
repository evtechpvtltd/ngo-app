# context.md — Bhoirwadi Sanskritik Association Dynamic Project Memory

> **Purpose:** Living project state.  
> **Rule:** Update after every significant architectural or implementation task.  
> **Project State:** v0.0.1 Foundation Release shipped — Phase 1 (Platform Foundation) substantially complete; no domain features (gallery/video/reviews/events/livestream/payments) implemented yet.  
> **Last Updated:** 2026-09-21

---

# 1. Project Identity

## Name
Bhoirwadi Sanskritik Association

## Product Type
Progressive Native Web App (PNWA) with future/parallel Android + iOS clients.

## Core Product Principles

```text
Security First
API First
Offline First where safe
Native-feeling UX
Open Source
Scalable
```

---

# 2. Confirmed Feature Scope

Current confirmed features:

- public photo gallery
- user reviews
- signed-in user video uploads
- moderation before public video publication
- public video viewing
- public WebRTC livestream
- authentication
- member profiles
- admin/moderation
- events
- payments/donations — provider not yet selected
- installable PWA
- self-update flow
- offline capability
- API-first backend

---

# 3. Immutable Stack

```text
Next.js App Router
React Server Components
Server Actions where appropriate
Supabase Auth
Supabase PostgreSQL
Supabase Storage
Supabase Realtime
Supabase Edge Functions
shadcn/ui
Radix primitives
Tailwind CSS
Zod
Lucide React
Custom Service Worker / Workbox-compatible tooling
IndexedDB
Background Sync + fallback sync
```

Livestream direction:

```text
WebRTC
LiveKit self-hosted preferred
TURN/STUN
Optional HLS/CDN egress later
```

---

# 4. Current Architecture Decisions

## API
- canonical prefix: `/api/v1`
- API is the product
- web/mobile are clients
- response shape uses `data`, `error`, `meta`
- request IDs should be present
- Zod validation required on mutations

## Security
- client is always untrusted
- authorization is server-side
- RLS is mandatory for exposed data
- default-deny mindset
- service-role secrets never reach clients
- admin/super-admin flows require stronger controls
- security-sensitive actions are network-only
- audit logs required for privileged actions

## PWA
- static immutable assets: Cache First
- appropriate public content: Stale While Revalidate
- freshness-sensitive public data: Network First
- security-sensitive endpoints: Network Only
- authenticated RSC payloads: no indiscriminate aggressive caching
- IndexedDB used for safe offline mutation queue
- service worker update UI required
- update flow must not destroy pending user work

## Media
- signed-in users may upload video
- uploads are quarantined/private first
- upload does not imply publication
- moderation required before public visibility
- resumable upload architecture preferred
- generated server-side storage identifiers

## Livestream
- public viewers can subscribe
- public viewers cannot publish
- broadcaster authorization is server-issued
- short-lived tokens
- LiveKit secret remains backend-only

## Payments
- provider undecided
- provider adapter architecture required
- payment success never trusted from frontend
- verified webhook is authoritative
- idempotent webhook handling required

---

# 5. Proposed Initial Roles

```text
member
moderator
content_manager
event_manager
finance_manager
admin
super_admin
```

Permission-based authorization is preferred over role checks alone.

---

# 6. Proposed Permission Families

```text
gallery.*
video.*
review.*
event.*
livestream.*
payment.*
user.*
role.*
audit.*
system.*
```

Detailed permission matrix still pending.

---

# 7. Offline Policy

## Safe Offline Candidates
- review drafts
- profile drafts
- content drafts
- local bookmarks
- local UI preferences
- upload metadata preparation

## Must Stay Server-Verified
- auth/session creation
- MFA
- role changes
- moderation
- payment confirmation
- refunds
- admin actions
- broadcaster authorization
- livestream control
- destructive security-sensitive actions

---

# 8. Service Worker State

Current state:

```text
IMPLEMENTED (v0.0.1 foundation)
```

Done: versioned caches (`service-worker/sw.ts`, `CACHE_VERSION`), static
precache (offline fallback doc), runtime cache-first/network-first/
stale-while-revalidate/network-only strategies (`service-worker/strategies/`),
offline fallback (`public/offline.html`), Background Sync registration
(`service-worker/sync/mutation-queue.ts`) with foreground fallback
(`lib/pwa/sync.ts`), waiting-worker update prompt
(`components/native/update-banner.tsx` + `lib/pwa/use-service-worker.ts`),
stale cache cleanup on `activate`.

Not yet done: a distinct "required update" channel UI that reads
`update_type` from `/api/v1/system/version` (currently only the SW's own
waiting-state detection drives the banner) — tracked for Phase 6
(Update & Release Agent) once there's a real reason to force an update.

---

# 9. IndexedDB State

Current state:

```text
IMPLEMENTED (v0.0.1 foundation — architecture only, no feature uses it yet)
```

`lib/offline/db.ts` opens `bsa-offline` (v1) with the four stores below.
`lib/offline/schemas.ts` defines the Zod schema and the
`FORBIDDEN_OFFLINE_MUTATION_TYPES` guard. `lib/offline/mutation-queue.ts`
provides `enqueueMutation` / `registerMutationHandler` / `processMutationQueue`.
No feature has registered a handler yet — see `docs/architecture/offline-first.md`.

Stores (implemented):

```text
mutation_queue
drafts
app_metadata
sync_state
```

(`cached_public_data`, originally planned, was dropped for now — no public
read data exists yet to cache; add it back when the first feature needs a
local projection of server data rather than blindly caching RSC/network
responses.)

Potential mutation fields:

```text
id
type
schema_version
user_id
created_at
payload
idempotency_key
retry_count
last_error
status
```

---

# 10. Database State

Current state:

```text
IMPLEMENTED (platform schema only): profiles, roles, permissions,
user_roles, role_permissions, app_versions, audit_logs, security_events.
See supabase/migrations/0001_init.sql. All tables have RLS enabled with
explicit policies (default deny). Seed data in supabase/seed/seed.sql.
NOT YET IMPLEMENTED: every domain table below.
```

Planned domains:

```text
gallery_albums
gallery_photos

videos
video_reports

reviews

events
event_registrations

livestreams
livestream_sessions

payments
payment_attempts
payment_events
refunds
donations
receipts

feature_flags
notifications
system_settings
```

(`app_versions`, `audit_logs`, and `security_events` moved from "planned"
to implemented above.)

---

# 11. Storage State

Current state:

```text
NOT IMPLEMENTED
```

Planned conceptual buckets:

```text
gallery-originals      private
gallery-public         public/processed

video-quarantine       private
video-originals        private
video-public           public/processed

avatars                controlled
```

Exact bucket naming to be finalized before first migration.

---

# 12. API State

Current state:

```text
IMPLEMENTED (foundation only): canonical response envelope + error
taxonomy (lib/api/response.ts), request IDs (middleware.ts sets
x-request-id, propagated end to end), GET /api/v1/health,
GET /api/v1/system/version. See docs/api/v1.md for the per-endpoint
contract. NOT YET IMPLEMENTED: every other endpoint family below.
```

Planned endpoint families:

```text
/api/v1/auth/*
/api/v1/users/*
/api/v1/profile/*
/api/v1/gallery/*
/api/v1/videos/*
/api/v1/reviews/*
/api/v1/events/*
/api/v1/livestreams/*
/api/v1/payments/*
/api/v1/donations/*
/api/v1/notifications/*
/api/v1/admin/*
```

---

# 13. Native UX State

Current state:

```text
IMPLEMENTED (v0.0.1 foundation)
```

Done: `viewport-fit=cover` + safe-area CSS (`app/globals.css`,
`components/shell/app-shell.tsx`), standalone-mode support (manifest
`display: standalone`), `overscroll-behavior-y: none`, `min-touch-target`
utility (44px), offline indicator (`components/native/offline-indicator.tsx`),
update indicator (`components/native/update-banner.tsx`), reduced-motion
support (`prefers-reduced-motion` media query in `app/globals.css`),
focus-visible styling.

Not yet done: keyboard-aware form layouts (no forms exist yet), install-UX
prompt (relying on browser default install affordance for now), native
share API integration, haptics — all deferred until a feature needs them.

---

# 14. Security State

Current maturity:

```text
THREAT MODEL WRITTEN (docs/threat-model.md)
PERMISSION MATRIX IMPLEMENTED (lib/permissions/catalog.ts + supabase/seed/seed.sql — 7 roles, ~30 permissions)
RLS IMPLEMENTED on the platform schema (supabase/migrations/0001_init.sql), default-deny
CSP WITH PER-REQUEST NONCE IMPLEMENTED (middleware.ts) — no unsafe-inline for scripts
SERVICE-ROLE ISOLATION IMPLEMENTED (server-only + runtime guard + eslint rule, lib/supabase/admin.ts)
PGTAP RLS TESTS WRITTEN BUT NOT YET EXECUTED (no local Postgres/Docker stack in this environment — see supabase/tests/, tests/README.md)
RATE LIMITING NOT YET IMPLEMENTED (no mutating endpoints exist to protect)
MFA NOT YET IMPLEMENTED (no sign-in UI exists yet)
```

Highest-priority protected surfaces:

1. identity/admin
2. video uploads
3. payments
4. livestream publishing
5. offline mutation integrity
6. service-worker/update supply chain

---

# 15. Testing State

Current:

```text
IMPLEMENTED (foundation coverage): 36 Vitest unit/integration tests
covering env validation, API response contract, permission catalog,
offline mutation queue guards/schemas, manifest, and health/version routes.
pgTAP RLS suite written (supabase/tests/) but not yet executed — see
tests/README.md. CI runs typecheck/lint/test/build/audit on every PR
(.github/workflows/ci.yml).
```

Required test families still missing:

```text
unit
integration
e2e
authorization
RLS
offline sync
service worker
update lifecycle
media upload security
payment webhooks
livestream token permissions
accessibility
```

---

# 16. Observability State

Current:

```text
IMPLEMENTED (foundation): request IDs (middleware.ts + lib/api/response.ts),
structured secret-redacting logs (lib/logging/logger.ts), audit logs and
security_events tables + writer (server/services/audit.ts).
NOT YET IMPLEMENTED: API latency/error metrics dashboards, sync failure
telemetry beyond the mutation's own last_error field, SW update telemetry,
livestream error visibility (no livestream feature yet).
```

---

# 17. Open Source State

Current:

```text
REPOSITORY-READY, LICENSE STILL PENDING
```

Done: README.md, CONTRIBUTING.md, CODE_OF_CONDUCT.md, SECURITY.md,
CHANGELOG.md, .env.example, .github/ISSUE_TEMPLATE/*, pull_request_template.md,
CODEOWNERS, CI workflow. See `docs/architecture/LICENSE-DECISION.md` for
the license options under consideration — Apache-2.0 is recommended but
not yet decided by the project owner.

Pending:
- choose and add the LICENSE file
- configure a dedicated security-reporting address (SECURITY.md currently
  points to the owner's direct email as an interim contact)
- configure Dependabot / GitHub secret scanning at the repo-settings level (org-level toggle, outside code)

---

# 18. Current Blockers / Decisions Needed

1. Payment provider not selected.
2. Open-source license not selected (see `docs/architecture/LICENSE-DECISION.md`).
3. LiveKit deployment topology not finalized.
4. Video transcoding/scanning implementation not selected.
5. Android/iOS implementation approach beyond shared API has not yet been finalized.
6. Branding/design system not yet defined (placeholder icons/colors in use — see `scripts/generate-placeholder-icons.mjs`).
7. No provisioned Supabase project/local Postgres stack was available in this environment — migrations and pgTAP RLS tests are written and typechecked/lint-clean, but the migration has not been applied to, or exercised against, a real database yet.
8. Dedicated security-reporting email/PGP not yet set up (interim: owner's direct email in `SECURITY.md`).

None of these block Phase 1 continuing (the next domain feature).

---

# 19. Immediate Next Steps

Phase 0 (Security Constitution) and Phase 1 (Platform Foundation) are
substantially complete as of v0.0.1. Recommended next milestone:

```text
PHASE 2 — PUBLIC EXPERIENCE (first real domain feature)
```

Before writing feature code for gallery/events/reviews:

1. Apply `supabase/migrations/0001_init.sql` and `supabase/seed/seed.sql`
   to a real Supabase project (local or hosted) and run `supabase test db`
   to actually execute the pgTAP RLS suite for the first time — fix
   forward if anything doesn't pass as written.
2. Pick the first domain feature per `docs/app.md #28` Phase 2 (home/about
   are already covered by the status page; gallery is the next logical
   vertical slice since it has read-only public data, no upload/moderation
   complexity yet).
3. For that feature: add its migration, RLS policies + pgTAP tests, API
   endpoint(s) documented in `docs/api/v1.md`, and — if it has a public
   GET endpoint — its first real `stale-while-revalidate` cache rule in
   `service-worker/sw.ts` (currently everything under `/api/*` is
   network-only, which is safe but not yet using the SWR strategy for
   anything).
4. Resolve the open-source license decision before any public announcement
   of the repository (code can stay in a private/unlisted repo without a
   license; publishing it broadly should not).

---

## 2026-09-21 PNWA Update: Context Trinity Established
- **Action Taken:** Defined the Bhoirwadi Sanskritik Association Context Trinity architecture and established the security-first, API-first, offline-aware PNWA operating model.
- **Files Modified:** `docs/app.md`, `docs/agents.md`, `docs/context.md`
- **Caching/SW Strategy:** Defined Cache-First for immutable static assets, Stale-While-Revalidate for suitable public content, Network-First for freshness-sensitive public data, Network-Only for security-critical operations, and prohibited indiscriminate caching of authenticated RSC payloads.
- **Native UX Adjustments:** Established viewport safe areas, standalone-mode behavior, touch-first UI, install/update indicators, offline/sync states, accessible motion behavior, and native-feeling navigation requirements.
- **Current Blockers/Next Steps:** Build Phase 0 security constitution, threat model, permission matrix, RLS architecture, secrets policy, upload quarantine flow, livestream token rules, payment security contract, and CI security gates.

## 2026-09-21 PNWA Update: v0.0.1 Open-Source Foundation
- **Action Taken:** Established the initial production-grade open-source foundation, security architecture, API v1 base, Supabase integration, RBAC/RLS foundation, PWA infrastructure, service-worker lifecycle, offline persistence layer, contributor documentation, and CI safeguards. Moved the Context Trinity into `docs/`. Verified end-to-end locally: `npm run typecheck`, `npm run lint`, and `npm run test` (36/36 passing) are clean, and `npm run build` (Next.js production build) succeeds; the dev server was started and `/`, `/api/v1/health`, `/api/v1/system/version`, `/manifest.webmanifest`, `/sw.js`, and `/offline.html` were all curled and confirmed working, including the version endpoint's graceful `INTERNAL_ERROR` fallback against an unreachable placeholder Supabase project.
- **Files Modified:** `package.json`, `tsconfig.json`, `next.config.ts`, `middleware.ts`, `tailwind.config.ts`, `postcss.config.mjs`, `eslint.config.mjs`, `vitest.config.ts`, `.gitignore`, `.env.example`; `app/{layout,page,error,not-found,loading,manifest,globals.css}.tsx`; `app/api/v1/{health,system/version}/route.ts`; `components/ui/{card,badge}.tsx`; `components/shell/app-shell.tsx`; `components/native/{offline-indicator,update-banner}.tsx`; `lib/config/{env.public,env.server}.ts`; `lib/supabase/{browser,server,admin,types}.ts`; `lib/api/response.ts`; `lib/logging/logger.ts`; `lib/permissions/catalog.ts`; `lib/offline/{db,schemas,mutation-queue}.ts`; `lib/pwa/{use-online-status,use-service-worker,sync}.ts`; `lib/utils/cn.ts`; `server/policies/authorize.ts`; `server/services/audit.ts`; `service-worker/sw.ts` + `strategies/*`, `updates/lifecycle.ts`, `sync/mutation-queue.ts`, `messages/types.ts`; `supabase/migrations/0001_init.sql`; `supabase/seed/seed.sql`; `supabase/tests/*.test.sql`; `public/offline.html`, `public/icons/*` (placeholder), `scripts/generate-placeholder-icons.mjs`; `tests/**`; `docs/{security,threat-model}.md`, `docs/architecture/*.md`, `docs/api/v1.md`; `README.md`, `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`, `SECURITY.md`, `CHANGELOG.md`; `.github/**`. Placeholder `README.md` files added to empty directories (`features/`, `server/repositories/`, `lib/{auth,security,validation}/`, `tests/{security,rls}/`, `supabase/functions/`) to track intent under git.
- **Caching/SW Strategy:** Implemented for real (not just documented): `service-worker/sw.ts` routes static `/_next/static/` and `/icons/` assets through cache-first, navigations through network-first with `public/offline.html` as the bounded fallback, and everything under `/api/*` through an explicit network-only fallthrough (no public GET domain endpoints exist yet to justify stale-while-revalidate — that strategy function exists and is ready in `service-worker/strategies/stale-while-revalidate.ts` for the first one that needs it). Cache names are versioned (`CACHE_VERSION`) and stale caches are deleted on `activate`.
- **Native UX Adjustments:** `viewport-fit=cover` + `env(safe-area-inset-*)` padding in `components/shell/app-shell.tsx` and `public/offline.html`; `overscroll-behavior-y: none`; a `min-touch-target` (44px) utility; `prefers-reduced-motion` support in `app/globals.css`; offline and update-available status surfaces as `role="status" aria-live="polite"` regions.
- **Current Blockers/Next Steps:** See section 18/19 above — license decision pending, no live Supabase project was available to actually apply the migration or run the pgTAP RLS suite against (both are written and reviewed but unexecuted), rate limiting and MFA are deferred until there's a mutating endpoint / sign-in UI to protect, and the next milestone is the first real domain feature (recommended: gallery, per Phase 2 in `docs/app.md #28`).
