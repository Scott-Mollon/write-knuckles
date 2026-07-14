-- Synced custom dictionary for Harper.js proofreading (character/place names, etc.).

alter table write.profiles
  add column if not exists harper_dictionary text[] not null default '{}';

comment on column write.profiles.harper_dictionary is
  'User custom dictionary words for Harper.js; synced across devices.';

-- Narrow write path: only updates harper_dictionary for the calling user.
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

  insert into write.profiles (user_id, harper_dictionary, updated_at)
  values (auth.uid(), cleaned, now())
  on conflict (user_id) do update
  set
    harper_dictionary = excluded.harper_dictionary,
    updated_at = excluded.updated_at
  returning write.profiles.harper_dictionary into result;

  return result;
end;
$$;

grant execute on function write.set_harper_dictionary(text[]) to authenticated;

comment on function write.set_harper_dictionary(text[]) is
  'Replace the calling user''s Harper custom dictionary. Does not touch plan columns.';
