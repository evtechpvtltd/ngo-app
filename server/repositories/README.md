# server/repositories/

Reserved for data-access modules that wrap Supabase queries for a specific
domain (e.g. `gallery-repository.ts`, `reviews-repository.ts`), keeping
raw query construction out of `server/services/`. Empty in v0.0.1 — no
domain table exists yet beyond the platform schema in
`supabase/migrations/0001_init.sql`, which is accessed directly from
`server/services/audit.ts` and `server/policies/authorize.ts` for now.
