# Repository Structure

```text
app/
  (public)/              reserved for public route groups as they're added
  api/v1/
    health/route.ts       GET /api/v1/health
    system/version/route.ts  GET /api/v1/system/version
  layout.tsx, page.tsx, error.tsx, not-found.tsx, loading.tsx, manifest.ts

components/
  ui/                     small presentational primitives (Card, Badge) — hand-written, shadcn-compatible API
  shell/app-shell.tsx      app-wide chrome: safe-area, offline/update banners
  native/                 offline-indicator, update-banner — native-feeling status surfaces

features/                 empty in v0.0.1 — future feature modules (gallery/, videos/, reviews/, ...) live here

lib/
  api/response.ts          canonical API response/error helpers
  auth/                    reserved for auth helpers as sign-in UI is built
  config/env.public.ts, env.server.ts   Zod-validated environment variables
  logging/logger.ts         structured, secret-redacting logger
  offline/db.ts, schemas.ts, mutation-queue.ts   IndexedDB mutation queue
  permissions/catalog.ts    the permission/role catalog (source of truth: supabase/seed/seed.sql)
  pwa/                      service worker registration/update hooks, background sync glue
  security/                 reserved for future security helpers (rate limiting, etc.)
  supabase/browser.ts, server.ts, admin.ts, types.ts   the three Supabase client tiers
  utils/cn.ts               Tailwind class-merging utility

server/
  policies/authorize.ts     centralized permission-checking (requirePermission())
  services/audit.ts         append-only audit log writer
  repositories/             reserved for data-access modules as domain features land

service-worker/
  sw.ts                     entry point, bundled to public/sw.js via esbuild
  strategies/                cache-first, network-first, stale-while-revalidate, network-only
  updates/lifecycle.ts       SKIP_WAITING message handling
  sync/mutation-queue.ts     Background Sync registration
  messages/types.ts          Zod schema for postMessage payloads

supabase/
  migrations/0001_init.sql   profiles, RBAC, app_versions, audit_logs, security_events + RLS
  seed/seed.sql               initial roles/permissions/grants
  tests/*.test.sql            pgTAP RLS tests (written, not yet executed — see tests/README.md)
  functions/                  reserved for Edge Functions

docs/
  app.md, agents.md, context.md    the Context Trinity
  security.md, threat-model.md
  architecture/                    this file and its siblings
  api/v1.md                        endpoint-by-endpoint API contract

tests/
  unit/, integration/               Vitest — run via `npm run test`
  security/, rls/                   reserved; RLS suite currently lives in supabase/tests/

.github/
  workflows/ci.yml                  install → typecheck → lint → test → build → audit
  ISSUE_TEMPLATE/, pull_request_template.md, CODEOWNERS
```

## Naming conventions

- Route handlers: `app/api/v1/<resource>/route.ts`, exporting `GET`/`POST`/etc.
- Every Supabase-table-adjacent permission key follows `<domain>.<action>`
  (enforced by a CHECK constraint on `public.permissions.key` and mirrored
  in `lib/permissions/catalog.ts`'s regex test).
- Service-worker code never imports from `app/` or `components/` — only
  from `lib/` and `service-worker/` — so it can be bundled standalone.
