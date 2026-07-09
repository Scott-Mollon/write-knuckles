-- Reference card image galleries (characters, locations, research)

create table if not exists write.reference_images (
  id uuid primary key default gen_random_uuid(),
  tale_id uuid not null references write.tales(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  entity_type text not null check (entity_type in ('character', 'location', 'research')),
  entity_id uuid not null,
  source_type text not null check (source_type in ('upload', 'url')),
  storage_path text,
  external_url text,
  alt_text text,
  is_hero boolean not null default false,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  constraint reference_images_source_check check (
    (source_type = 'upload' and storage_path is not null and external_url is null)
    or (source_type = 'url' and external_url is not null and storage_path is null)
  )
);

create unique index if not exists reference_images_one_hero_per_entity
  on write.reference_images (entity_type, entity_id)
  where is_hero;

create index if not exists reference_images_entity_sort
  on write.reference_images (entity_type, entity_id, sort_order);

comment on table write.reference_images is
  'Image galleries for character, location, and research reference cards.';

alter table write.reference_images enable row level security;

drop policy if exists "Approved users manage reference images via tale" on write.reference_images;
create policy "Approved users manage reference images via tale"
  on write.reference_images
  for all
  using (write.can_access_tale(tale_id))
  with check (
    write.can_access_tale(tale_id)
    and auth.uid() = user_id
  );

-- Sync characters.avatar_url from hero image (storage_path or external_url).
create or replace function write.sync_character_avatar_from_hero()
returns trigger
language plpgsql
security definer
set search_path = write, public
as $$
declare
  v_character_id uuid;
  v_entity_type text;
  v_hero write.reference_images%rowtype;
begin
  v_character_id := coalesce(new.entity_id, old.entity_id);
  v_entity_type := coalesce(new.entity_type, old.entity_type);

  if v_entity_type <> 'character' then
    return coalesce(new, old);
  end if;

  select *
  into v_hero
  from write.reference_images
  where entity_type = 'character'
    and entity_id = v_character_id
    and is_hero
  limit 1;

  update write.characters
  set avatar_url = case
    when v_hero.id is null then null
    when v_hero.source_type = 'url' then v_hero.external_url
    else v_hero.storage_path
  end
  where id = v_character_id;

  return coalesce(new, old);
end;
$$;

drop trigger if exists reference_images_sync_character_avatar on write.reference_images;
create trigger reference_images_sync_character_avatar
  after insert or update or delete on write.reference_images
  for each row
  execute function write.sync_character_avatar_from_hero();

insert into write.schema_migrations (version, name)
values ('013', 'reference_images')
on conflict (version) do nothing;
