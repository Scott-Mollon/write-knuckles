-- Scene ↔ character/location links + full-text scene search (M4)

create table if not exists write.scene_character_links (
  id uuid primary key default gen_random_uuid(),
  tale_id uuid not null references write.tales(id) on delete cascade,
  scene_id uuid not null references write.scenes(id) on delete cascade,
  character_id uuid not null references write.characters(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (scene_id, character_id)
);

create table if not exists write.scene_location_links (
  id uuid primary key default gen_random_uuid(),
  tale_id uuid not null references write.tales(id) on delete cascade,
  scene_id uuid not null references write.scenes(id) on delete cascade,
  location_id uuid not null references write.locations(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (scene_id, location_id)
);

create index if not exists idx_scene_character_links_tale on write.scene_character_links(tale_id);
create index if not exists idx_scene_character_links_scene on write.scene_character_links(scene_id);
create index if not exists idx_scene_location_links_tale on write.scene_location_links(tale_id);
create index if not exists idx_scene_location_links_scene on write.scene_location_links(scene_id);

alter table write.scene_character_links enable row level security;
alter table write.scene_location_links enable row level security;

create policy "Approved users manage scene character links via tale" on write.scene_character_links
  for all using (
    write.is_approved_user()
    and exists (select 1 from write.tales t where t.id = tale_id and t.user_id = auth.uid())
  ) with check (
    write.is_approved_user()
    and exists (select 1 from write.tales t where t.id = tale_id and t.user_id = auth.uid())
  );

create policy "Approved users manage scene location links via tale" on write.scene_location_links
  for all using (
    write.is_approved_user()
    and exists (select 1 from write.tales t where t.id = tale_id and t.user_id = auth.uid())
  ) with check (
    write.is_approved_user()
    and exists (select 1 from write.tales t where t.id = tale_id and t.user_id = auth.uid())
  );

-- Full-text search across scene prose for a tale
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
    and coalesce(trim(p_query), '') <> ''
    and to_tsvector('english', coalesce(s.plain_text, '')) @@ websearch_to_tsquery('english', p_query)
  order by rank desc;
$$;

grant execute on function write.search_scenes(uuid, text) to authenticated;

insert into write.schema_migrations (version, name)
values ('006', 'scene_reference_links')
on conflict (version) do nothing;
