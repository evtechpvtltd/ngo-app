-- ============================================================================
-- Shared pgTAP test helpers for RLS suites.
--
-- Run with the Supabase CLI: `supabase test db`
-- Requires the `pgtap` extension (enabled automatically by the CLI's test
-- runner) and a local Postgres/Supabase stack — these files are not
-- executed as part of `npm run test` (that runs application-level Vitest
-- unit tests only; see tests/README.md).
-- ============================================================================

create schema if not exists tests;

-- Impersonate a given auth.users row as the `authenticated` Postgres role,
-- the same way PostgREST does when it verifies a request's JWT.
create or replace function tests.authenticate_as(user_id uuid)
returns void
language plpgsql
as $$
begin
  perform set_config('request.jwt.claims', json_build_object('sub', user_id, 'role', 'authenticated')::text, true);
  perform set_config('role', 'authenticated', true);
end;
$$;

create or replace function tests.authenticate_as_anon()
returns void
language plpgsql
as $$
begin
  perform set_config('request.jwt.claims', '{}', true);
  perform set_config('role', 'anon', true);
end;
$$;

create or replace function tests.clear_authentication()
returns void
language plpgsql
as $$
begin
  perform set_config('request.jwt.claims', '{}', true);
  reset role;
end;
$$;

-- Creates a minimal auth.users + public.profiles row for test fixtures
-- without going through the real signup flow.
create or replace function tests.create_test_user(email text)
returns uuid
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  new_id uuid := gen_random_uuid();
begin
  insert into auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at, aud, role)
  values (new_id, email, 'not-a-real-hash', now(), now(), now(), 'authenticated', 'authenticated');

  return new_id;
end;
$$;

create or replace function tests.grant_role(p_user_id uuid, p_role_key text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.user_roles (user_id, role_id)
  select p_user_id, id from public.roles where key = p_role_key
  on conflict do nothing;
end;
$$;
