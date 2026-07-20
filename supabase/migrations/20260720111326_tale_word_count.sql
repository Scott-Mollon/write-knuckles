-- Denormalized active-scene word total on tales for dashboard O(tales) reads.

alter table write.tales
  add column if not exists word_count int not null default 0;

comment on column write.tales.word_count is
  'Sum of active (deleted_at is null) scene word_count values; maintained by trigger.';

create or replace function write.recompute_tale_word_count(p_tale_id uuid)
returns void
language plpgsql
security invoker
set search_path = write
as $$
begin
  if p_tale_id is null then
    return;
  end if;

  update write.tales t
  set word_count = coalesce((
    select sum(s.word_count)::int
    from write.scenes s
    where s.tale_id = p_tale_id
      and s.deleted_at is null
  ), 0)
  where t.id = p_tale_id;
end;
$$;

revoke all on function write.recompute_tale_word_count(uuid) from public, anon;
grant execute on function write.recompute_tale_word_count(uuid) to authenticated;

create or replace function write.scenes_recompute_tale_word_count()
returns trigger
language plpgsql
security invoker
set search_path = write
as $$
begin
  if tg_op = 'UPDATE'
     and old.word_count is not distinct from new.word_count
     and old.deleted_at is not distinct from new.deleted_at
     and old.tale_id is not distinct from new.tale_id then
    return new;
  end if;

  if tg_op = 'DELETE' then
    perform write.recompute_tale_word_count(old.tale_id);
    return old;
  end if;

  perform write.recompute_tale_word_count(new.tale_id);

  if tg_op = 'UPDATE' and old.tale_id is distinct from new.tale_id then
    perform write.recompute_tale_word_count(old.tale_id);
  end if;

  return new;
end;
$$;

drop trigger if exists scenes_recompute_tale_word_count on write.scenes;
create trigger scenes_recompute_tale_word_count
  after insert or update of word_count, deleted_at, tale_id or delete
  on write.scenes
  for each row
  execute function write.scenes_recompute_tale_word_count();

-- Backfill existing tales (trigger will keep them in sync going forward).
update write.tales t
set word_count = coalesce((
  select sum(s.word_count)::int
  from write.scenes s
  where s.tale_id = t.id
    and s.deleted_at is null
), 0);
