-- Per-tale Harper dictionaries (replaces per-user global dictionary).
-- Existing global dictionary rows are discarded (fresh start).

drop function if exists write.set_harper_dictionary(text[]);

drop table if exists write.harper_dictionaries;

create table write.harper_dictionaries (
  tale_id uuid primary key references write.tales(id) on delete cascade,
  words text[] not null default '{}',
  updated_at timestamptz not null default now()
);

comment on table write.harper_dictionaries is
  'Per-tale Harper.js custom dictionary words; cascades when the tale is deleted.';

comment on column write.harper_dictionaries.words is
  'Custom dictionary words for Harper.js for this tale; synced across devices.';

alter table write.harper_dictionaries enable row level security;

revoke all on table write.harper_dictionaries from anon, public;
grant select, insert, update, delete on table write.harper_dictionaries to authenticated;
grant all on table write.harper_dictionaries to service_role;

drop policy if exists "Approved users manage harper dictionaries via tale" on write.harper_dictionaries;
create policy "Approved users manage harper dictionaries via tale" on write.harper_dictionaries
  for all using (
    write.is_approved_user()
    and exists (select 1 from write.tales t where t.id = tale_id and t.user_id = auth.uid())
  ) with check (
    write.is_approved_user()
    and exists (select 1 from write.tales t where t.id = tale_id and t.user_id = auth.uid())
  );

-- Upsert path for the client (validated / deduped); requires tale ownership.
create or replace function write.set_harper_dictionary(p_tale_id uuid, words text[])
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

  if p_tale_id is null then
    raise exception 'tale_id is required';
  end if;

  if not exists (
    select 1 from write.tales t
    where t.id = p_tale_id and t.user_id = auth.uid()
  ) then
    raise exception 'Tale not found or not owned by caller';
  end if;

  select coalesce(
    array_agg(distinct trim(w) order by trim(w)),
    '{}'::text[]
  )
  into cleaned
  from unnest(coalesce(words, '{}'::text[])) as w
  where length(trim(w)) > 0;

  insert into write.harper_dictionaries (tale_id, words, updated_at)
  values (p_tale_id, cleaned, now())
  on conflict (tale_id) do update
  set
    words = excluded.words,
    updated_at = excluded.updated_at
  returning write.harper_dictionaries.words into result;

  return result;
end;
$$;

revoke all on function write.set_harper_dictionary(uuid, text[]) from public, anon;
grant execute on function write.set_harper_dictionary(uuid, text[]) to authenticated;

comment on function write.set_harper_dictionary(uuid, text[]) is
  'Replace the calling user''s Harper custom dictionary for a tale they own. Cascades via write.tales ON DELETE CASCADE (not auth.users).';
