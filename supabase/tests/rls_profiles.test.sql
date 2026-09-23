-- RLS assertions for public.profiles (app.md #14).
-- Run with: supabase test db

begin;
select plan(5);

\i supabase/tests/_helpers.sql

select tests.create_test_user('owner@example.test') as id \gset owner_
select tests.create_test_user('stranger@example.test') as id \gset stranger_

-- Anonymous cannot read any profile row at all.
select tests.authenticate_as_anon();
select is_empty(
  $$ select 1 from public.profiles $$,
  'anonymous cannot access profile information'
);

-- A member can read their own profile.
select tests.authenticate_as(:'owner_id'::uuid);
select isnt_empty(
  format($$ select 1 from public.profiles where id = %L $$, :'owner_id'::uuid),
  'a member can read their own profile'
);

-- A member cannot read a stranger's profile without user.read.
select is_empty(
  format($$ select 1 from public.profiles where id = %L $$, :'stranger_id'::uuid),
  'a member cannot read another member''s profile without user.read'
);

-- A member cannot update another member's profile (RLS excludes the row,
-- so the UPDATE affects zero rows rather than erroring).
select tests.authenticate_as(:'owner_id'::uuid);
select results_eq(
  format($$ update public.profiles set display_name = 'hacked' where id = %L returning 1 $$, :'stranger_id'::uuid),
  $$ select 1 where false $$,
  'a member cannot update another member''s profile'
);

-- Granting the admin role (which carries user.read) allows reading other profiles.
select tests.clear_authentication();
select tests.grant_role(:'owner_id'::uuid, 'admin');
select tests.authenticate_as(:'owner_id'::uuid);
select isnt_empty(
  format($$ select 1 from public.profiles where id = %L $$, :'stranger_id'::uuid),
  'admin (user.read via role) can read another member''s profile'
);

select * from finish();
rollback;
