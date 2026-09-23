-- RLS assertions for public.audit_logs (app.md #14: "member cannot access
-- audit logs"; #9: "audit logs must not be deletable by ordinary admins").
-- Run with: supabase test db

begin;
select plan(4);

\i supabase/tests/_helpers.sql

select tests.create_test_user('member-no-access@example.test') as id \gset member_
select tests.create_test_user('auditor@example.test') as id \gset auditor_

select tests.grant_role(:'auditor_id'::uuid, 'admin'); -- admin role carries audit.read

-- Seed one row as the privileged/service context (bypasses RLS by being
-- run before any authenticate_as() call switches the session role).
insert into public.audit_logs (action, result) values ('test.action', 'success');

-- A plain member cannot read the audit log at all.
select tests.authenticate_as(:'member_id'::uuid);
select is_empty(
  $$ select 1 from public.audit_logs $$,
  'a member without audit.read cannot see any audit log rows'
);

-- A plain member cannot insert into the audit log (no insert policy exists).
select throws_ok(
  $$ insert into public.audit_logs (action, result) values ('forged', 'success') $$,
  '42501',
  null,
  'a member cannot write to the audit log (no INSERT policy = default deny)'
);

-- An admin with audit.read CAN read the audit log.
select tests.authenticate_as(:'auditor_id'::uuid);
select isnt_empty(
  $$ select 1 from public.audit_logs $$,
  'an admin with audit.read can read the audit log'
);

-- Even an admin cannot delete audit log rows (no delete policy exists).
select throws_ok(
  $$ delete from public.audit_logs $$,
  '42501',
  null,
  'no role can delete audit log rows through the client — append-only'
);

select * from finish();
rollback;
