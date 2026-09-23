# Bhoirwadi Sanskritik Association

An open-source, security-first Progressive Native Web App (PNWA) for the
Bhoirwadi Sanskritik Association — a community platform intended to
eventually support a public gallery, member video uploads, reviews, events,
livestreaming, and donations, built as one API-first codebase that serves
the web app, the installable PWA, and future native Android/iOS clients.

> **Release status: `v0.0.1` — Foundation Release.**
> This release contains **no community-facing features yet.** It exists to
> establish a secure, documented, reproducible, contributor-ready
> foundation: authentication/RBAC scaffolding, a versioned API, RLS-backed
> database schema, an installable PWA shell with a real service-worker
> update lifecycle, and an offline mutation-queue architecture. Gallery,
> videos, reviews, events, livestream, and payments are **not implemented**
> — see [`CHANGELOG.md`](./CHANGELOG.md) and
> [`docs/context.md`](./docs/context.md) for what's planned next.

## What this project intends to become

A single Next.js codebase, backed by Supabase, that is simultaneously:

- a fast, public **website** (gallery, events, reviews, livestream)
- an **installable PWA** with offline-safe drafts and a real update flow
- the **API backend** for future native Android/iOS clients

See [`docs/app.md`](./docs/app.md) — the architecture constitution every
change in this repository must comply with — and
[`docs/agents.md`](./docs/agents.md) for how responsibilities are divided
across security, offline sync, PWA, RBAC, and other concerns.

## Architecture at a glance

- **Framework:** Next.js (App Router, React Server Components, Server Actions)
- **Backend:** Supabase (Auth, Postgres + RLS, Storage, Realtime, Edge Functions)
- **UI:** shadcn/ui-compatible components, Radix primitives, Tailwind CSS, Lucide icons
- **Validation:** Zod everywhere data crosses a boundary — env vars, API payloads, offline mutations, service-worker messages
- **PWA:** a hand-written, Workbox-strategy-equivalent service worker (esbuild-bundled), Web App Manifest, IndexedDB-backed offline mutation queue

Deeper docs: [`docs/architecture/overview.md`](./docs/architecture/overview.md) ·
[`docs/architecture/repository-structure.md`](./docs/architecture/repository-structure.md) ·
[`docs/architecture/api-first.md`](./docs/architecture/api-first.md) ·
[`docs/architecture/offline-first.md`](./docs/architecture/offline-first.md) ·
[`docs/architecture/pwa-update-model.md`](./docs/architecture/pwa-update-model.md) ·
[`docs/security.md`](./docs/security.md) · [`docs/threat-model.md`](./docs/threat-model.md)

## Local development

### Prerequisites

- Node.js >= 20
- npm
- A Supabase project (free tier is fine) — or the [Supabase CLI](https://supabase.com/docs/guides/cli) for a local stack

### Setup

```bash
git clone <this-repo-url>
cd bhoirwadi-sanskritik-association
npm install
cp .env.example .env.local
```

Fill in `.env.local` with your Supabase project's URL, anon key, and
service-role key (see [Environment variables](#environment-variables)
below). The app **fails fast at startup** with a clear error if a required
variable is missing or malformed — this is intentional (`lib/config/env.public.ts`,
`lib/config/env.server.ts`).

### Supabase setup

Apply the schema and seed data to your project:

```bash
# using the Supabase CLI against a local stack:
supabase start
supabase db reset   # applies supabase/migrations/ then supabase/seed/seed.sql

# or, against a hosted project, via the SQL editor / supabase db push:
supabase link --project-ref <your-project-ref>
supabase db push
psql "$SUPABASE_DB_URL" -f supabase/seed/seed.sql   # or run seed.sql via the SQL editor
```

This creates `profiles`, the RBAC tables (`roles`, `permissions`,
`user_roles`, `role_permissions`), `app_versions`, `audit_logs`, and
`security_events`, all with RLS enabled — see
`supabase/migrations/0001_init.sql`.

### Development commands

```bash
npm run dev         # start the dev server (also rebuilds the service worker)
npm run build       # production build
npm run start        # run the production build
npm run lint          # ESLint
npm run typecheck     # tsc --noEmit
npm run test           # Vitest unit + integration tests
npm run build:sw        # rebuild public/sw.js from service-worker/sw.ts
```

Database/RLS tests use pgTAP via the Supabase CLI (`supabase test db`) —
see [`tests/README.md`](./tests/README.md) for current status (written,
not yet executed in this environment).

## Environment variables

See [`.env.example`](./.env.example) for the full, commented list. In
short: `NEXT_PUBLIC_*` variables are safe for the browser (validated in
`lib/config/env.public.ts`); `SUPABASE_SERVICE_ROLE_KEY` and friends are
server-only (validated in `lib/config/env.server.ts`, structurally
prevented from reaching client bundles via the `server-only` package).
Never commit a file other than `.env.example`.

## Project structure

See [`docs/architecture/repository-structure.md`](./docs/architecture/repository-structure.md)
for the annotated tree.

## Contributing

See [`CONTRIBUTING.md`](./CONTRIBUTING.md) for the fork/branch/PR workflow,
and [`CODE_OF_CONDUCT.md`](./CODE_OF_CONDUCT.md) for community standards.

## Security

See [`SECURITY.md`](./SECURITY.md) to report a vulnerability, and
[`docs/security.md`](./docs/security.md) / [`docs/threat-model.md`](./docs/threat-model.md)
for the security architecture.

## License

**Pending.** No license has been finalized yet — see
[`docs/architecture/LICENSE-DECISION.md`](./docs/architecture/LICENSE-DECISION.md)
for the options under consideration and why a decision hasn't been made
silently. Until a `LICENSE` file is added, no license is granted for reuse
beyond what's necessary to view and contribute to this repository.

## Current release status

`v0.0.1` — Foundation Release. See [`CHANGELOG.md`](./CHANGELOG.md).
