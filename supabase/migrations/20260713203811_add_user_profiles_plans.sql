-- Free / Paid account plans layered on top of invite-only approval.
-- Product access still requires write.approved_users; plan is for future entitlements.

create table if not exists write.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  plan text not null default 'free' check (plan in ('free', 'paid')),
  plan_updated_at timestamptz,
  plan_updated_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists profiles_plan_idx on write.profiles (plan);

comment on table write.profiles is
  'Per-user account plan (free/paid). Independent of invite approval.';

comment on column write.profiles.plan is
  'Account plan: free (default on signup) or paid (admin-set for now; checkout later).';

-- Keep profiles in sync when auth users are created.
create or replace function write.handle_new_user_profile()
returns trigger
language plpgsql
security definer
set search_path = write, auth
as $$
begin
  insert into write.profiles (user_id, plan)
  values (new.id, 'free')
  on conflict (user_id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created_profile on auth.users;
create trigger on_auth_user_created_profile
  after insert on auth.users
  for each row
  execute function write.handle_new_user_profile();

-- Backfill existing auth users as free.
insert into write.profiles (user_id, plan)
select u.id, 'free'
from auth.users u
where not exists (
  select 1 from write.profiles p where p.user_id = u.id
);

create or replace function write.current_user_plan()
returns text
language sql
stable
security definer
set search_path = write, auth
as $$
  select coalesce(
    (select p.plan from write.profiles p where p.user_id = auth.uid()),
    'free'
  );
$$;

create or replace function write.is_paid_user()
returns boolean
language sql
stable
security definer
set search_path = write, auth
as $$
  select write.current_user_plan() = 'paid';
$$;

create or replace function write.set_user_plan(target_user_id uuid, new_plan text)
returns void
language plpgsql
security definer
set search_path = write, public, auth
as $$
begin
  if target_user_id is null then
    raise exception 'target_user_id is required';
  end if;

  if new_plan is null or new_plan not in ('free', 'paid') then
    raise exception 'new_plan must be free or paid';
  end if;

  if not exists (
    select 1 from public."Admins" a where a.admin_id = auth.uid()
  ) then
    raise exception 'Not authorized';
  end if;

  if not exists (
    select 1 from auth.users u where u.id = target_user_id
  ) then
    raise exception 'User not found';
  end if;

  insert into write.profiles (user_id, plan, plan_updated_at, plan_updated_by, updated_at)
  values (target_user_id, new_plan, now(), auth.uid(), now())
  on conflict (user_id) do update
  set
    plan = excluded.plan,
    plan_updated_at = excluded.plan_updated_at,
    plan_updated_by = excluded.plan_updated_by,
    updated_at = excluded.updated_at;
end;
$$;

-- Include plan for the admin access UI.
-- Must drop first: CREATE OR REPLACE cannot change RETURNS TABLE shape.
drop function if exists write.list_registered_users();

create or replace function write.list_registered_users()
returns table (
  user_id uuid,
  email text,
  created_at timestamptz,
  last_sign_in_at timestamptz,
  plan text
)
language plpgsql
security definer
set search_path = auth, public, write
as $$
begin
  if not exists (
    select 1 from public."Admins" a where a.admin_id = auth.uid()
  ) then
    raise exception 'Not authorized';
  end if;

  return query
    select
      u.id,
      u.email::text,
      u.created_at,
      u.last_sign_in_at,
      coalesce(p.plan, 'free')::text as plan
    from auth.users u
    left join write.profiles p on p.user_id = u.id
    where u.email is not null
    order by u.created_at desc;
end;
$$;

alter table write.profiles enable row level security;

drop policy if exists "Users read own profile" on write.profiles;
create policy "Users read own profile" on write.profiles
  for select
  using (auth.uid() = user_id);

drop policy if exists "Magazine admins read profiles" on write.profiles;
create policy "Magazine admins read profiles" on write.profiles
  for select
  using (
    exists (select 1 from public."Admins" a where a.admin_id = auth.uid())
  );

drop policy if exists "Magazine admins update profiles" on write.profiles;
create policy "Magazine admins update profiles" on write.profiles
  for update
  using (
    exists (select 1 from public."Admins" a where a.admin_id = auth.uid())
  )
  with check (
    exists (select 1 from public."Admins" a where a.admin_id = auth.uid())
  );

grant execute on function write.current_user_plan() to authenticated;
grant execute on function write.is_paid_user() to authenticated;
grant execute on function write.set_user_plan(uuid, text) to authenticated;
grant execute on function write.list_registered_users() to authenticated;
