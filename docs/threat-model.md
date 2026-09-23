# Threat Model — v0.0.1

Scope: the platform foundation shipped in this release (identity/RBAC,
API v1 skeleton, PWA/service worker, offline queue architecture). Domain
features (gallery, video, livestream, payments) are out of scope until
they're actually built — their threat models arrive with their own
migrations, per `app.md`'s build order.

## 1. Assets

- User identity and session tokens (Supabase Auth)
- Profile data (`public.profiles`)
- RBAC assignments (`user_roles`, `role_permissions`) — the "keys to the
  kingdom" for every future feature
- Audit trail (`audit_logs`, `security_events`)
- Service-role key (bypasses all RLS)
- The service worker itself (a supply-chain target: whoever controls
  `public/sw.js` controls what every installed client runs next)

## 2. Actors

- Anonymous visitor
- Authenticated member
- Moderator / content_manager / event_manager / finance_manager
- Admin
- Super admin
- A malicious actor with: network position (MITM), a compromised dependency,
  or a compromised CI runner
- A malicious or compromised authenticated user (insider threat)

## 3. Threats and mitigations (STRIDE-flavored)

### Spoofing
- **Threat:** forging another user's identity via a tampered JWT or session cookie.
- **Mitigation:** `getAuthenticatedUser()` (`server/policies/authorize.ts`)
  calls `supabase.auth.getUser()`, which re-validates the token with
  Supabase Auth rather than trusting decoded claims. Never trust
  `request.headers` for identity.

### Tampering
- **Threat:** a client submits a role/permission it shouldn't have via a
  crafted API request.
- **Mitigation:** `has_permission()` is evaluated server-side (Postgres),
  never client-supplied. RLS re-enforces this at the database layer even if
  an API route forgot to check (defense in depth).
- **Threat:** tampering with the offline mutation queue in IndexedDB to
  fake a "succeeded" security-sensitive action.
- **Mitigation:** `FORBIDDEN_OFFLINE_MUTATION_TYPES` in
  `lib/offline/schemas.ts` blocks security-sensitive types from ever being
  queued; the server remains authoritative for anything that is queued.

### Repudiation
- **Threat:** an admin denies having performed a privileged action.
- **Mitigation:** `audit_logs` is append-only (no UPDATE/DELETE policy for
  any client role) and written only by trusted server code
  (`server/services/audit.ts`) using the service-role client.

### Information Disclosure
- **Threat:** a stack trace or DB error message leaks schema/internal details.
- **Mitigation:** `apiError()` responses carry a fixed safe message; the
  real error is logged server-side only (see the `version` route for the
  pattern). `lib/logging/logger.ts` redacts sensitive-looking keys.
- **Threat:** the service-role key leaks into a client bundle.
- **Mitigation:** three independent layers — see `docs/security.md #2`.

### Denial of Service
- **Threat:** a flood of requests to a mutation endpoint (once one exists).
- **Mitigation:** **not yet implemented** — no domain mutation endpoints
  exist yet to protect. Rate-limit classes must be defined per-endpoint in
  `docs/api/v1.md` before the first mutating domain endpoint ships.
- **Threat:** an infinite service-worker reload loop degrades the app into
  unusability.
- **Mitigation:** `lib/pwa/use-service-worker.ts` only reloads in response
  to a `controllerchange` the client itself triggered (tracked via a
  `sessionStorage` guard cleared on use) — an unsolicited controllerchange
  never reloads the page.

### Elevation of Privilege
- **Threat:** an `admin` grants themselves or another user `super_admin`.
- **Mitigation:** the `user_roles_insert_privileged` / `..._delete_privileged`
  RLS policies require `system.manage` (held only by `super_admin` in seed
  data) to touch the `super_admin` role assignment. See
  `supabase/tests/rls_user_roles.test.sql` for the intended test coverage
  (pgTAP, not yet executed — see `docs/security.md #4`).
- **Threat:** a compromised dependency in the service-worker bundle rewrites
  cached responses or exfiltrates data.
- **Mitigation:** the SW never caches `/api/*` responses (network-only
  fallthrough in `service-worker/sw.ts`), narrowing what a compromised SW
  could tamper with; `npm audit` runs in CI to catch known-vulnerable
  dependencies before they're bundled.

## 4. Offline-sync specific threat model (`app.md #3.3`)

| Scenario | Outcome |
|---|---|
| Device queues a `payment.confirm`-shaped mutation while offline | Rejected at `enqueueMutation()` — throws before it ever reaches IndexedDB |
| Device is offline for days, then reconnects with a stale queue | Each mutation is re-validated with Zod and re-authorized server-side on sync; nothing is treated as pre-approved |
| Two devices queue conflicting drafts for the same resource | **Not yet resolved** — conflict resolution mode (server-wins/client-wins/merge/user-resolution) must be chosen per entity when that entity's offline sync is built (`agents.md` Offline Sync Agent) |
| Background Sync is unavailable (e.g. Safari) | Foreground fallback (`lib/pwa/sync.ts`'s `online` listener) flushes the queue instead |

## 5. Service-worker / update supply-chain threat model

| Scenario | Outcome |
|---|---|
| A new SW version is deployed | Installs and waits; only activates when the app posts `SKIP_WAITING` after the user (or an automated required-update policy) approves it |
| An attacker gets write access to `public/sw.js` via a compromised CI pipeline | Out of scope for app-level mitigation — this is a CI/CD supply-chain risk; mitigate via branch protection, required reviews, and not auto-deploying from untrusted PRs (`app.md #26`) |
| A required update needs to be forced (critical security fix) | `update_type: "required"` in `GET /api/v1/system/version`; the update UI (not yet built) must refuse to let the user dismiss it indefinitely — tracked as Phase 1/6 work |

## 6. Explicitly out of scope for v0.0.1

Upload security (malware scanning, quarantine), livestream token security,
payment webhook security, and MFA enforcement all have their own threat
models to be written when those features are actually implemented — writing
them now would be aspirational documentation contradicting the "no
premature complexity" rule (`app.md #34`).
