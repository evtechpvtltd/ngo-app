# Tests

Two separate test suites exist, run by two different tools:

## Application tests (Vitest)

```bash
npm run test
```

Covers: environment validation, the API response contract, the permission
catalog, offline mutation queue guards/schemas, the manifest, and the
health/version route handlers (`tests/unit/`, `tests/integration/`).

## Database / RLS tests (pgTAP)

```bash
supabase test db
```

Requires the [Supabase CLI](https://supabase.com/docs/guides/cli) and a
local Postgres/Supabase stack (Docker). Covers the RLS policies in
`supabase/migrations/0001_init.sql` — see `supabase/tests/*.test.sql`.

> **Status:** these pgTAP files were authored against the migration's
> intended behavior but have **not been executed** in this repository yet —
> this v0.0.1 release was built without a provisioned local Postgres/Docker
> environment. Run `supabase test db` before relying on them, and fix
> forward if anything doesn't pass as written.

Categories still to be added in later releases: e2e, upload security,
payment webhooks, livestream token permissions, accessibility.
