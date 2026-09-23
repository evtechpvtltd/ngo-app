-- ============================================================================
-- 0001_init.sql
-- Bhoirwadi Sanskritik Association — v0.0.1 platform foundation schema
--
-- Scope (per app.md #12): identity/profiles, RBAC (roles/permissions),
-- app_versions (self-update contract), audit_logs, security_events.
-- No domain tables (gallery/video/events/payments) are created yet — those
-- arrive with their own migrations in later releases.
--
-- Security posture (app.md #9): RLS is enabled on every table with an
-- explicit, default-deny policy set. Anything not explicitly allowed is
-- denied by Postgres RLS's default behavior.
-- ============================================================================

create extension if not exists "pgcrypto";

-- ----------------------------------------------------------------------------
-- 1. profiles — one row per authenticated user, keyed to auth.users
-- ----------------------------------------------------------------------------

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  avatar_url text,
  bio text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_display_name_length check (
    display_name is null or char_length(display_name) between 1 and 80
  ),
  constraint profiles_bio_length check (bio is null or char_length(bio) <= 500)
);

comment on table public.profiles is 'One row per authenticated user. Public directory features are a future release.';

-- ----------------------------------------------------------------------------
-- 2. RBAC — roles, permissions, user_roles, role_permissions
-- ----------------------------------------------------------------------------

create table if not exists public.roles (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  name text not null,
  description text,
  created_at timestamptz not null default now(),
  constraint roles_key_format check (key ~ '^[a-z][a-z0-9_]*$')
);

create table if not exists public.permissions (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  description text,
  created_at timestamptz not null default now(),
  constraint permissions_key_format check (key ~ '^[a-z][a-z0-9_]*\.[a-z][a-z0-9_]*$')
);

create table if not exists public.role_permissions (
  role_id uuid not null references public.roles (id) on delete cascade,
  permission_id uuid not null references public.permissions (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (role_id, permission_id)
);

create table if not exists public.user_roles (
  user_id uuid not null references auth.users (id) on delete cascade,
  role_id uuid not null references public.roles (id) on delete cascade,
  granted_by uuid references auth.users (id),
  created_at timestamptz not null default now(),
  primary key (user_id, role_id)
);

create index if not exists user_roles_user_id_idx on public.user_roles (user_id);
create index if not exists role_permissions_role_id_idx on public.role_permissions (role_id);

-- ----------------------------------------------------------------------------
-- 3. app_versions — backs GET /api/v1/system/version and update prompts
-- ----------------------------------------------------------------------------

create table if not exists public.app_versions (
  id uuid primary key default gen_random_uuid(),
  version text not null,
  build_id text not null,
  minimum_supported_version text not null,
  update_type text not null default 'none',
  release_notes text,
  released_at timestamptz not null default now(),
  constraint app_versions_update_type_check check (
    update_type in ('none', 'optional', 'recommended', 'required')
  )
);

create index if not exists app_versions_released_at_idx on public.app_versions (released_at desc);

-- ----------------------------------------------------------------------------
-- 4. audit_logs / security_events — append-only, never client-writable
-- ----------------------------------------------------------------------------

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  request_id uuid,
  actor_id uuid references auth.users (id) on delete set null,
  action text not null,
  resource_type text,
  resource_id text,
  result text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  constraint audit_logs_result_check check (result in ('success', 'failure'))
);

create index if not exists audit_logs_actor_id_idx on public.audit_logs (actor_id);
create index if not exists audit_logs_created_at_idx on public.audit_logs (created_at desc);

create table if not exists public.security_events (
  id uuid primary key default gen_random_uuid(),
  event_type text not null,
  severity text not null,
  actor_id uuid references auth.users (id) on delete set null,
  request_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  constraint security_events_severity_check check (severity in ('info', 'warning', 'critical'))
);

create index if not exists security_events_created_at_idx on public.security_events (created_at desc);

-- ----------------------------------------------------------------------------
-- 5. Shared trigger: keep updated_at current
-- ----------------------------------------------------------------------------

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
  before update on public.profiles
  for each row
  execute function public.set_updated_at();

-- ----------------------------------------------------------------------------
-- 6. New-user provisioning: create a profile row on signup
-- ----------------------------------------------------------------------------

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id) values (new.id)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

-- ----------------------------------------------------------------------------
-- 7. Centralized permission check — single source of truth for both RLS
--    policies and application code (server/policies/authorize.ts calls this
--    via RPC so there is exactly one place permission logic lives).
-- ----------------------------------------------------------------------------

create or replace function public.has_permission(p_user_id uuid, p_permission_key text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.user_roles ur
    join public.role_permissions rp on rp.role_id = ur.role_id
    join public.permissions p on p.id = rp.permission_id
    where ur.user_id = p_user_id
      and p.key = p_permission_key
  );
$$;

comment on function public.has_permission is
  'Single source of truth for permission checks. SECURITY DEFINER so it can read RBAC tables regardless of the caller''s own RLS visibility; only ever returns a boolean, never row data.';

grant execute on function public.has_permission(uuid, text) to authenticated, anon;

-- ----------------------------------------------------------------------------
-- 8. Enable RLS on every table (default posture: DENY)
-- ----------------------------------------------------------------------------

alter table public.profiles enable row level security;
alter table public.roles enable row level security;
alter table public.permissions enable row level security;
alter table public.role_permissions enable row level security;
alter table public.user_roles enable row level security;
alter table public.app_versions enable row level security;
alter table public.audit_logs enable row level security;
alter table public.security_events enable row level security;

-- ----------------------------------------------------------------------------
-- 9. Policies — profiles
-- ----------------------------------------------------------------------------

create policy profiles_select_own_or_privileged on public.profiles
  for select to authenticated
  using (auth.uid() = id or public.has_permission(auth.uid(), 'user.read'));

create policy profiles_insert_own on public.profiles
  for insert to authenticated
  with check (auth.uid() = id);

create policy profiles_update_own_or_privileged on public.profiles
  for update to authenticated
  using (auth.uid() = id or public.has_permission(auth.uid(), 'user.manage'))
  with check (auth.uid() = id or public.has_permission(auth.uid(), 'user.manage'));

create policy profiles_delete_privileged on public.profiles
  for delete to authenticated
  using (public.has_permission(auth.uid(), 'user.manage'));

-- No anon policy of any kind exists on profiles -> anonymous access is denied.

-- ----------------------------------------------------------------------------
-- 10. Policies — roles / permissions (reference tables)
-- ----------------------------------------------------------------------------

create policy roles_select_privileged on public.roles
  for select to authenticated
  using (
    public.has_permission(auth.uid(), 'role.assign')
    or public.has_permission(auth.uid(), 'system.manage')
  );

create policy roles_mutate_system_manage on public.roles
  for all to authenticated
  using (public.has_permission(auth.uid(), 'system.manage'))
  with check (public.has_permission(auth.uid(), 'system.manage'));

create policy permissions_select_privileged on public.permissions
  for select to authenticated
  using (
    public.has_permission(auth.uid(), 'role.assign')
    or public.has_permission(auth.uid(), 'system.manage')
  );

create policy permissions_mutate_system_manage on public.permissions
  for all to authenticated
  using (public.has_permission(auth.uid(), 'system.manage'))
  with check (public.has_permission(auth.uid(), 'system.manage'));

-- ----------------------------------------------------------------------------
-- 11. Policies — role_permissions (defines what a role can do)
-- ----------------------------------------------------------------------------

create policy role_permissions_select_privileged on public.role_permissions
  for select to authenticated
  using (
    public.has_permission(auth.uid(), 'role.assign')
    or public.has_permission(auth.uid(), 'system.manage')
  );

create policy role_permissions_mutate_system_manage on public.role_permissions
  for all to authenticated
  using (public.has_permission(auth.uid(), 'system.manage'))
  with check (public.has_permission(auth.uid(), 'system.manage'));

-- ----------------------------------------------------------------------------
-- 12. Policies — user_roles (privilege escalation is prevented HERE)
--
-- role.assign lets an admin grant ordinary roles. Assigning the
-- super_admin role additionally requires system.manage, which in seed data
-- only super_admin itself holds — so normal admins structurally cannot
-- mint another super_admin (app.md #7 "Super Admin Rules").
-- ----------------------------------------------------------------------------

create policy user_roles_select_own_or_privileged on public.user_roles
  for select to authenticated
  using (auth.uid() = user_id or public.has_permission(auth.uid(), 'role.assign'));

create policy user_roles_insert_privileged on public.user_roles
  for insert to authenticated
  with check (
    public.has_permission(auth.uid(), 'role.assign')
    and (
      role_id not in (select id from public.roles where key = 'super_admin')
      or public.has_permission(auth.uid(), 'system.manage')
    )
  );

create policy user_roles_delete_privileged on public.user_roles
  for delete to authenticated
  using (
    public.has_permission(auth.uid(), 'role.assign')
    and (
      role_id not in (select id from public.roles where key = 'super_admin')
      or public.has_permission(auth.uid(), 'system.manage')
    )
  );

-- No update policy: role grants are removed and re-added, never mutated in place.

-- ----------------------------------------------------------------------------
-- 13. Policies — app_versions (public read; needed for update banners)
-- ----------------------------------------------------------------------------

create policy app_versions_select_public on public.app_versions
  for select to authenticated, anon
  using (true);

create policy app_versions_mutate_system_manage on public.app_versions
  for all to authenticated
  using (public.has_permission(auth.uid(), 'system.manage'))
  with check (public.has_permission(auth.uid(), 'system.manage'));

-- ----------------------------------------------------------------------------
-- 14. Policies — audit_logs / security_events
--
-- Deliberately NO insert/update/delete policy for authenticated/anon roles:
-- these tables are written exclusively by trusted server code using the
-- service-role client (lib/supabase/admin.ts), which bypasses RLS by
-- design. This makes the log append-only and tamper-resistant from the
-- client's perspective, including for ordinary admins.
-- ----------------------------------------------------------------------------

create policy audit_logs_select_privileged on public.audit_logs
  for select to authenticated
  using (public.has_permission(auth.uid(), 'audit.read'));

create policy security_events_select_privileged on public.security_events
  for select to authenticated
  using (public.has_permission(auth.uid(), 'system.manage'));
