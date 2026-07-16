-- Phase 3: Admin-only profiles; Harper dictionaries in their own table.

-- ---------------------------------------------------------------------------
-- A. write.harper_dictionaries (owner RLS)
-- ---------------------------------------------------------------------------
create table if not exists write.harper_dictionaries (
  user_id uuid primary key references auth.users(id) on delete cascade,
  words text[] not null default '{}',
  updated_at timestamptz not null default now()
);

comment on table write.harper_dictionaries is
  'Per-user Harper.js custom dictionary words; separate from write.profiles plans.';

comment on column write.harper_dictionaries.words is
  'Custom dictionary words for Harper.js; synced across devices.';

-- Migrate existing dictionary data off profiles (if column still present).
do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'write'
      and table_name = 'profiles'
      and column_name = 'harper_dictionary'
  ) then
    insert into write.harper_dictionaries (user_id, words, updated_at)
    select
      p.user_id,
      coalesce(p.harper_dictionary, '{}'::text[]),
      coalesce(p.updated_at, now())
    from write.profiles p
    where coalesce(cardinality(p.harper_dictionary), 0) > 0
    on conflict (user_id) do update
    set
      words = excluded.words,
      updated_at = excluded.updated_at;

    alter table write.profiles drop column harper_dictionary;
  end if;
end;
$$;

alter table write.harper_dictionaries enable row level security;

revoke all on table write.harper_dictionaries from anon, public;
grant select, insert, update, delete on table write.harper_dictionaries to authenticated;
grant all on table write.harper_dictionaries to service_role;

drop policy if exists "Users read own harper dictionary" on write.harper_dictionaries;
create policy "Users read own harper dictionary" on write.harper_dictionaries
  for select
  using (auth.uid() = user_id);

drop policy if exists "Users insert own harper dictionary" on write.harper_dictionaries;
create policy "Users insert own harper dictionary" on write.harper_dictionaries
  for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users update own harper dictionary" on write.harper_dictionaries;
create policy "Users update own harper dictionary" on write.harper_dictionaries
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users delete own harper dictionary" on write.harper_dictionaries;
create policy "Users delete own harper dictionary" on write.harper_dictionaries
  for delete
  using (auth.uid() = user_id);

-- Upsert path for the client (validated / deduped).
create or replace function write.set_harper_dictionary(words text[])
returns text[]
language plpgsql
security definer
set search_path = write, auth
as $$
declare
  cleaned text[];
  result text[];
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  select coalesce(
    array_agg(distinct trim(w) order by trim(w)),
    '{}'::text[]
  )
  into cleaned
  from unnest(coalesce(words, '{}'::text[])) as w
  where length(trim(w)) > 0;

  insert into write.harper_dictionaries (user_id, words, updated_at)
  values (auth.uid(), cleaned, now())
  on conflict (user_id) do update
  set
    words = excluded.words,
    updated_at = excluded.updated_at
  returning write.harper_dictionaries.words into result;

  return result;
end;
$$;

revoke all on function write.set_harper_dictionary(text[]) from public, anon;
grant execute on function write.set_harper_dictionary(text[]) to authenticated;

comment on function write.set_harper_dictionary(text[]) is
  'Replace the calling user''s Harper custom dictionary in write.harper_dictionaries.';

-- ---------------------------------------------------------------------------
-- B. write.profiles — admin SELECT only; plan changes via set_user_plan RPC
-- ---------------------------------------------------------------------------
drop policy if exists "Users read own profile" on write.profiles;
drop policy if exists "Magazine admins update profiles" on write.profiles;

-- Admin read remains (may already exist from prior migration).
drop policy if exists "Magazine admins read profiles" on write.profiles;
create policy "Magazine admins read profiles" on write.profiles
  for select
  using (
    exists (select 1 from public."Admins" a where a.admin_id = auth.uid())
  );

comment on table write.profiles is
  'Admin-managed account plans (free/paid/complimentary). End users read plan via write.current_user_plan(); no direct table access.';
