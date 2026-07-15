-- Soft delete for chapters, scenes, characters, locations, and research items.

alter table write.chapters
  add column if not exists deleted_at timestamptz;

alter table write.scenes
  add column if not exists deleted_at timestamptz;

alter table write.characters
  add column if not exists deleted_at timestamptz;

alter table write.locations
  add column if not exists deleted_at timestamptz;

alter table write.research_items
  add column if not exists deleted_at timestamptz;

create index if not exists chapters_tale_id_deleted_at_idx
  on write.chapters (tale_id, deleted_at);

create index if not exists scenes_tale_id_deleted_at_idx
  on write.scenes (tale_id, deleted_at);

create index if not exists characters_tale_id_deleted_at_idx
  on write.characters (tale_id, deleted_at);

create index if not exists locations_tale_id_deleted_at_idx
  on write.locations (tale_id, deleted_at);

create index if not exists research_items_tale_id_deleted_at_idx
  on write.research_items (tale_id, deleted_at);

create or replace function write.search_scenes(p_tale_id uuid, p_query text)
returns table (
  id uuid,
  chapter_id uuid,
  tale_id uuid,
  title text,
  synopsis text,
  plain_text text,
  word_count int,
  scene_status text,
  scene_color text,
  rank real
)
language sql
stable
security invoker
set search_path = write
as $$
  select
    s.id,
    s.chapter_id,
    s.tale_id,
    s.title,
    s.synopsis,
    s.plain_text,
    s.word_count,
    s.scene_status,
    s.scene_color,
    ts_rank(
      to_tsvector('english', coalesce(s.plain_text, '')),
      websearch_to_tsquery('english', p_query)
    ) as rank
  from write.scenes s
  where s.tale_id = p_tale_id
    and s.deleted_at is null
    and coalesce(trim(p_query), '') <> ''
    and to_tsvector('english', coalesce(s.plain_text, '')) @@ websearch_to_tsquery('english', p_query)
  order by rank desc;
$$;
