-- Narrow account stats to authors who have created at least one tale
-- (excludes magazine-only profiles that share auth.users).

create or replace function write.admin_usage_stats()
returns table (
  accounts bigint,
  accounts_free bigint,
  accounts_paid bigint,
  accounts_complimentary bigint,
  tales bigint,
  scenes bigint,
  total_words bigint,
  avg_words_per_tale numeric,
  avg_scenes_per_tale numeric,
  avg_words_per_scene numeric,
  max_words_per_tale bigint,
  max_scenes_per_tale bigint,
  max_words_per_scene bigint,
  avg_images_per_tale numeric,
  max_images_per_tale bigint
)
language plpgsql
security definer
set search_path = auth, public, write, storage
as $$
begin
  if not exists (
    select 1 from public."Admins" a where a.admin_id = auth.uid()
  ) then
    raise exception 'Not authorized';
  end if;

  return query
  with
  -- Only authors who have created at least one tale (excludes magazine-only accounts).
  account_stats as (
    select
      count(*)::bigint as accounts,
      count(*) filter (where coalesce(p.plan, 'free') = 'free')::bigint as accounts_free,
      count(*) filter (where coalesce(p.plan, 'free') = 'paid')::bigint as accounts_paid,
      count(*) filter (
        where coalesce(p.plan, 'free') = 'complimentary'
      )::bigint as accounts_complimentary
    from (
      select distinct t.user_id
      from write.tales t
    ) writers
    left join write.profiles p on p.user_id = writers.user_id
  ),
  active_tales as (
    select t.id
    from write.tales t
    where t.archived_at is null
  ),
  tale_content as (
    select
      at.id as tale_id,
      count(s.id)::bigint as scene_count,
      coalesce(sum(s.word_count), 0)::bigint as word_count
    from active_tales at
    left join write.scenes s
      on s.tale_id = at.id
      and s.deleted_at is null
    group by at.id
  ),
  content_stats as (
    select
      count(*)::bigint as tales,
      coalesce(sum(tc.scene_count), 0)::bigint as scenes,
      coalesce(sum(tc.word_count), 0)::bigint as total_words,
      coalesce(max(tc.word_count), 0)::bigint as max_words_per_tale,
      coalesce(max(tc.scene_count), 0)::bigint as max_scenes_per_tale
    from tale_content tc
  ),
  scene_stats as (
    select coalesce(max(s.word_count), 0)::bigint as max_words_per_scene
    from write.scenes s
    inner join write.tales t on t.id = s.tale_id
    where t.archived_at is null
      and s.deleted_at is null
  ),
  images_by_tale as (
    select
      write.tale_id_from_storage_path(o.name) as tale_id,
      count(*)::bigint as image_count
    from storage.objects o
    where o.bucket_id = 'write-tale-images'
      and write.tale_id_from_storage_path(o.name) is not null
    group by 1
  ),
  image_stats as (
    select
      coalesce(avg(coalesce(i.image_count, 0)), 0)::numeric as avg_images_per_tale,
      coalesce(max(coalesce(i.image_count, 0)), 0)::bigint as max_images_per_tale
    from active_tales at
    left join images_by_tale i on i.tale_id = at.id
  )
  select
    a.accounts,
    a.accounts_free,
    a.accounts_paid,
    a.accounts_complimentary,
    c.tales,
    c.scenes,
    c.total_words,
    case when c.tales = 0 then 0::numeric else round(c.total_words::numeric / c.tales, 1) end,
    case when c.tales = 0 then 0::numeric else round(c.scenes::numeric / c.tales, 1) end,
    case when c.scenes = 0 then 0::numeric else round(c.total_words::numeric / c.scenes, 1) end,
    c.max_words_per_tale,
    c.max_scenes_per_tale,
    ss.max_words_per_scene,
    round(img.avg_images_per_tale, 1),
    img.max_images_per_tale
  from account_stats a
  cross join content_stats c
  cross join scene_stats ss
  cross join image_stats img;
end;
$$;

comment on function write.admin_usage_stats() is
  'Magazine-admin aggregate usage: accounts-with-tales by plan, tale/scene/word totals with avg/max, and storage image avg/max per tale.';
