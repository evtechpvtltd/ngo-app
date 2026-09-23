-- RLS assertions for public.user_roles — privilege escalation prevention
-- (app.md #14: "admin cannot arbitrarily become super_admin").
-- Run with: supabase test db

begin;
select plan(4);

\i supabase/tests/_helpers.sql

select tests.create_test_user('plain-member@example.test') as id \gset member_
select tests.create_test_user('an-admin@example.test') as id \gset admin_
select tests.create_test_user('the-super@example.test') as id \gset super_

select tests.grant_role(:'admin_id'::uuid, 'admin');
select tests.grant_role(:'super_id'::uuid, 'super_admin');

-- A plain member cannot grant themselves a role.
select tests.authenticate_as(:'member_id'::uuid);
select throws_ok(
  format(
    $$ insert into public.user_roles (user_id, role_id) select %L, id from public.roles where key = 'admin' $$,
    :'member_id'::uuid
  ),
  null, null,
  'a member without role.assign cannot grant themselves a role'
);

-- An admin (role.assign, no system.manage) CAN grant the "moderator" role.
select tests.authenticate_as(:'admin_id'::uuid);
select lives_ok(
  format(
    $$ insert into public.user_roles (user_id, role_id) select %L, id from public.roles where key = 'moderator' $$,
    :'member_id'::uuid
  ),
  'an admin with role.assign can grant an ordinary role'
);

-- An admin CANNOT grant super_admin (requires system.manage, which admin
-- lacks) — INSERT's WITH CHECK failure raises a policy violation error.
select throws_ok(
  format(
    $$ insert into public.user_roles (user_id, role_id)
       select %L, id from public.roles where key = 'super_admin' $$,
    :'member_id'::uuid
  ),
  '42501',
  null,
  'an admin without system.manage cannot grant super_admin'
);

-- A super_admin CAN grant super_admin.
select tests.authenticate_as(:'super_id'::uuid);
select lives_ok(
  format(
    $$ insert into public.user_roles (user_id, role_id) select %L, id from public.roles where key = 'super_admin' $$,
    :'member_id'::uuid
  ),
  'a super_admin (system.manage) can grant super_admin'
);

select * from finish();
rollback;
