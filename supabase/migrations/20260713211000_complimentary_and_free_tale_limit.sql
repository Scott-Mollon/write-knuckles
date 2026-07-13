-- Complimentary (gifted, never billable) + Free plan max of 3 active tales.

-- A. Extend plan values
alter table write.profiles drop constraint if exists profiles_plan_check;
alter table write.profiles
  add constraint profiles_plan_check
  check (plan in ('free', 'paid', 'complimentary'));

comment on table write.profiles is
  'Per-user account plan (free/paid/complimentary). Independent of invite approval.';

comment on column write.profiles.plan is
  'free = limited; paid = billable full access; complimentary = gifted full access, never charge.';

-- Entitlements: paid-tier features for both paid and complimentary.
-- Future Stripe must key off plan = 'paid' only, not this helper.
create or replace function write.is_paid_user()
returns boolean
language sql
stable
security definer
set search_path = write, auth
as $$
  select write.current_user_plan() in ('paid', 'complimentary');
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

  if new_plan is null or new_plan not in ('free', 'paid', 'complimentary') then
    raise exception 'new_plan must be free, paid, or complimentary';
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

-- B. Free tale create limit (active / non-archived)
create or replace function write.can_create_tale()
returns boolean
language sql
stable
security definer
set search_path = write, auth
as $$
  select write.is_paid_user()
    or (
      select count(*)::int
      from write.tales t
      where t.user_id = auth.uid()
        and t.archived_at is null
    ) < 3;
$$;

drop policy if exists "Approved users manage own tales" on write.tales;

drop policy if exists "Approved users select own tales" on write.tales;
create policy "Approved users select own tales" on write.tales
  for select
  using (write.is_approved_user() and auth.uid() = user_id);

drop policy if exists "Approved users insert own tales" on write.tales;
create policy "Approved users insert own tales" on write.tales
  for insert
  with check (
    write.is_approved_user()
    and auth.uid() = user_id
    and write.can_create_tale()
  );

drop policy if exists "Approved users update own tales" on write.tales;
create policy "Approved users update own tales" on write.tales
  for update
  using (write.is_approved_user() and auth.uid() = user_id)
  with check (write.is_approved_user() and auth.uid() = user_id);

drop policy if exists "Approved users delete own tales" on write.tales;
create policy "Approved users delete own tales" on write.tales
  for delete
  using (write.is_approved_user() and auth.uid() = user_id);

grant execute on function write.is_paid_user() to authenticated;
grant execute on function write.set_user_plan(uuid, text) to authenticated;
grant execute on function write.can_create_tale() to authenticated;
