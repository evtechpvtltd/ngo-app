# tests/rls/

The actual RLS test suite lives in `supabase/tests/` (pgTAP, run via
`supabase test db` — see `tests/README.md`), since pgTAP tests must run
inside Postgres itself rather than through Vitest. This directory is
reserved in case a future release adds RLS tests driven from the
application side (e.g. asserting that a Supabase client call gets exactly
the rows RLS should allow, exercised via an integration test against a
real local Supabase instance).
