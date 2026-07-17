-- Plan limits as DB source of truth (admin-editable; Free starts at 5 active tales).

create table if not exists write.plan_limits (
  plan text primary key
    check (plan in ('free', 'paid', 'complimentary')),
  max_active_tales integer
    check (max_active_tales is null or max_active_tales >= 0),
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id) on delete set null,
  constraint plan_limits_free_requires_cap check (
    plan <> 'free' or max_active_tales is not null
  )
);

comment on table write.plan_limits is
  'Per-plan product caps. NULL max_active_tales means unlimited. Free must have a finite cap.';

comment on column write.plan_limits.max_active_tales is
  'Maximum non-archived tales for the plan; NULL = unlimited.';

insert into write.plan_limits (plan, max_active_tales)
values
  ('free', 5),
  ('paid', null),
  ('complimentary', null)
on conflict (plan) do nothing;

create or replace function write.touch_plan_limits()
returns trigger
language plpgsql
security invoker
set search_path = write, auth
as $$
begin
  new.updated_at = now();
  new.updated_by = auth.uid();
  return new;
end;
$$;

drop trigger if exists plan_limits_touch on write.plan_limits;
create trigger plan_limits_touch
  before update on write.plan_limits
  for each row
  execute function write.touch_plan_limits();

revoke all on function write.touch_plan_limits() from public, anon;

alter table write.plan_limits enable row level security;

revoke all on table write.plan_limits from anon, public;
grant select on table write.plan_limits to authenticated;
grant update (max_active_tales) on table write.plan_limits to authenticated;
grant all on table write.plan_limits to service_role;

drop policy if exists "Authenticated read plan limits" on write.plan_limits;
create policy "Authenticated read plan limits" on write.plan_limits
  for select
  to authenticated
  using (true);

drop policy if exists "Magazine admins update plan limits" on write.plan_limits;
create policy "Magazine admins update plan limits" on write.plan_limits
  for update
  to authenticated
  using (
    exists (select 1 from public."Admins" a where a.admin_id = auth.uid())
  )
  with check (
    exists (select 1 from public."Admins" a where a.admin_id = auth.uid())
  );

-- Enforce creation against configured limits (NULL = unlimited; missing row = deny).
create or replace function write.can_create_tale()
returns boolean
language sql
stable
security definer
set search_path = write, auth
as $$
  select coalesce(
    (
      select
        case
          when pl.max_active_tales is null then true
          else (
            select count(*)::int
            from write.tales t
            where t.user_id = auth.uid()
              and t.archived_at is null
          ) < pl.max_active_tales
        end
      from write.plan_limits pl
      where pl.plan = write.current_user_plan()
    ),
    false
  );
$$;

revoke all on function write.can_create_tale() from public, anon;
grant execute on function write.can_create_tale() to authenticated;

comment on function write.can_create_tale() is
  'True when the caller may create another non-archived tale based on write.plan_limits.';
