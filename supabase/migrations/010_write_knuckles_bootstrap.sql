-- Write Knuckles bootstrap (consolidated starting point)
-- Run this alone on a new Supabase project to create the full write schema.
-- Includes migrations 011–015 (image storage, tale covers, reference images, account deletion).
-- Databases already on migrations 001–009 should continue with incremental files instead.

create schema if not exists write;

grant usage on schema write to postgres, anon, authenticated, service_role;
grant all privileges on all tables in schema write to postgres, anon, authenticated, service_role;
grant all privileges on all routines in schema write to postgres, anon, authenticated, service_role;
alter default privileges in schema write
  grant all on tables to postgres, anon, authenticated, service_role;
alter default privileges in schema write
  grant all on routines to postgres, anon, authenticated, service_role;

-- Migration tracking (SQL Editor workflow — not exposed to client apps)
create table if not exists write.schema_migrations (
  version text primary key,
  name text not null,
  applied_at timestamptz not null default now()
);

comment on table write.schema_migrations is
  'Records which write-knuckles SQL migrations have been applied. Check via Supabase SQL Editor.';

alter table write.schema_migrations enable row level security;
revoke all on table write.schema_migrations from anon, authenticated;

-- Invite-only access
create table if not exists write.approved_users (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  user_id uuid references auth.users(id) on delete set null,
  approved_at timestamptz not null default now(),
  approved_by uuid references auth.users(id) on delete set null,
  revoked_at timestamptz,
  notes text,
  created_at timestamptz not null default now()
);

create unique index if not exists approved_users_active_email
  on write.approved_users (lower(email))
  where revoked_at is null;

create index if not exists approved_users_user_id
  on write.approved_users (user_id)
  where revoked_at is null;

comment on table write.approved_users is
  'Invite list for Write Knuckles. Users must appear here (by email) before accessing the write schema.';

-- Tales (manuscripts)
create table if not exists write.tales (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  author text,
  subtitle text,
  genre text,
  target_word_count int default 80000,
  beat_template_id uuid,
  progress jsonb default '{}'::jsonb,
  cover_source_type text check (cover_source_type is null or cover_source_type in ('upload', 'url')),
  cover_storage_path text,
  cover_external_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz,
  constraint tales_cover_source_check check (
    (cover_source_type is null and cover_storage_path is null and cover_external_url is null)
    or (
      cover_source_type = 'upload'
      and cover_storage_path is not null
      and cover_external_url is null
    )
    or (
      cover_source_type = 'url'
      and cover_external_url is not null
      and cover_storage_path is null
    )
  )
);

comment on column write.tales.cover_source_type is 'upload | url — null when no cover';
comment on column write.tales.cover_storage_path is 'Path in write-tale-images when cover_source_type = upload';
comment on column write.tales.cover_external_url is 'HTTPS URL when cover_source_type = url';

-- Chapters
create table if not exists write.chapters (
  id uuid primary key default gen_random_uuid(),
  tale_id uuid not null references write.tales(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  parent_id uuid references write.chapters(id) on delete set null,
  title text not null,
  sort_order int not null default 0,
  synopsis text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Scenes
create table if not exists write.scenes (
  id uuid primary key default gen_random_uuid(),
  chapter_id uuid not null references write.chapters(id) on delete cascade,
  tale_id uuid not null references write.tales(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  sort_order int not null default 0,
  scene_color text default '#938938',
  scene_status text default 'Raw' check (scene_status in ('Raw', 'Drafted', 'Rewritten', 'Final')),
  synopsis text,
  content jsonb default '{"type":"doc","content":[]}'::jsonb,
  plain_text text default '',
  word_count int default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Beat templates (system + user)
create table if not exists write.beat_templates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  name text not null,
  slug text not null,
  description text,
  structure jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create unique index if not exists beat_templates_system_slug
  on write.beat_templates (slug) where user_id is null;

-- Beat sheets (instantiated per tale)
create table if not exists write.tale_beats (
  id uuid primary key default gen_random_uuid(),
  tale_id uuid not null references write.tales(id) on delete cascade unique,
  beat_template_id uuid references write.beat_templates(id) on delete set null,
  beats jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Beat links (story beat <-> scene)
create table if not exists write.beat_links (
  id uuid primary key default gen_random_uuid(),
  tale_id uuid not null references write.tales(id) on delete cascade,
  beat_key text not null,
  scene_id uuid references write.scenes(id) on delete set null,
  notes text,
  created_at timestamptz not null default now(),
  unique (tale_id, beat_key, scene_id)
);

-- Characters
create table if not exists write.characters (
  id uuid primary key default gen_random_uuid(),
  tale_id uuid not null references write.tales(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  role text,
  bio jsonb default '{}'::jsonb,
  avatar_url text,
  tags text[] default '{}',
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Locations
create table if not exists write.locations (
  id uuid primary key default gen_random_uuid(),
  tale_id uuid not null references write.tales(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  description text,
  notes jsonb default '{}'::jsonb,
  tags text[] default '{}',
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Research notes
create table if not exists write.research_items (
  id uuid primary key default gen_random_uuid(),
  tale_id uuid not null references write.tales(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  body text,
  url text,
  tags text[] default '{}',
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Reference card images
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

-- Scene ↔ character/location links
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

-- Phase 2 hook
create table if not exists write.print_runs (
  id uuid primary key default gen_random_uuid(),
  tale_id uuid not null references write.tales(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  layout_template_id uuid,
  settings jsonb default '{}'::jsonb,
  status text default 'draft',
  output_urls jsonb default '{}'::jsonb,
  created_at timestamptz not null default now()
);

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'tales_beat_template_id_fkey'
      and connamespace = 'write'::regnamespace
  ) then
    alter table write.tales
      add constraint tales_beat_template_id_fkey
      foreign key (beat_template_id) references write.beat_templates(id) on delete set null;
  end if;
end $$;

-- Indexes
create index if not exists idx_chapters_tale_id on write.chapters(tale_id);
create index if not exists idx_scenes_chapter_id on write.scenes(chapter_id);
create index if not exists idx_scenes_tale_id on write.scenes(tale_id);
create index if not exists idx_scenes_plain_text on write.scenes using gin(to_tsvector('english', plain_text));
create index if not exists idx_beat_links_tale_id on write.beat_links(tale_id);
create index if not exists idx_tales_user_id on write.tales(user_id);
create index if not exists idx_scene_character_links_tale on write.scene_character_links(tale_id);
create index if not exists idx_scene_character_links_scene on write.scene_character_links(scene_id);
create index if not exists idx_scene_location_links_tale on write.scene_location_links(tale_id);
create index if not exists idx_scene_location_links_scene on write.scene_location_links(scene_id);

-- updated_at trigger
create or replace function write.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists tales_updated_at on write.tales;
create trigger tales_updated_at before update on write.tales
  for each row execute function write.set_updated_at();
drop trigger if exists chapters_updated_at on write.chapters;
create trigger chapters_updated_at before update on write.chapters
  for each row execute function write.set_updated_at();
drop trigger if exists scenes_updated_at on write.scenes;
create trigger scenes_updated_at before update on write.scenes
  for each row execute function write.set_updated_at();
drop trigger if exists tale_beats_updated_at on write.tale_beats;
create trigger tale_beats_updated_at before update on write.tale_beats
  for each row execute function write.set_updated_at();
drop trigger if exists characters_updated_at on write.characters;
create trigger characters_updated_at before update on write.characters
  for each row execute function write.set_updated_at();
drop trigger if exists locations_updated_at on write.locations;
create trigger locations_updated_at before update on write.locations
  for each row execute function write.set_updated_at();
drop trigger if exists research_items_updated_at on write.research_items;
create trigger research_items_updated_at before update on write.research_items
  for each row execute function write.set_updated_at();

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
  select * into v_hero
  from write.reference_images
  where entity_type = 'character' and entity_id = v_character_id and is_hero
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
  for each row execute function write.sync_character_avatar_from_hero();

-- Access helpers
create or replace function write.current_user_email()
returns text
language sql
stable
security definer
set search_path = auth, public
as $$
  select coalesce(
    auth.jwt() ->> 'email',
    (select email from auth.users where id = auth.uid())
  );
$$;

create or replace function write.is_approved_user()
returns boolean
language sql
stable
security definer
set search_path = write, public, auth
as $$
  select exists (
    select 1
    from write.approved_users au
    where au.revoked_at is null
      and (
        au.user_id = auth.uid()
        or lower(au.email) = lower(coalesce(write.current_user_email(), ''))
      )
  );
$$;

create or replace function write.link_approved_user()
returns void
language plpgsql
security definer
set search_path = write, public, auth
as $$
begin
  update write.approved_users
  set user_id = auth.uid()
  where revoked_at is null
    and user_id is null
    and lower(email) = lower(coalesce(write.current_user_email(), ''));
end;
$$;

create or replace function write.list_registered_users()
returns table (
  user_id uuid,
  email text,
  created_at timestamptz,
  last_sign_in_at timestamptz
)
language plpgsql
security definer
set search_path = auth, public, write
as $$
begin
  if not exists (
    select 1 from public."Admins" a where a.admin_id = auth.uid()
  ) then
    raise exception 'Not authorized';
  end if;

  return query
    select
      u.id,
      u.email::text,
      u.created_at,
      u.last_sign_in_at
    from auth.users u
    where u.email is not null
    order by u.created_at desc;
end;
$$;

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

grant execute on function write.current_user_email() to authenticated;
grant execute on function write.is_approved_user() to authenticated;
grant execute on function write.link_approved_user() to authenticated;
grant execute on function write.list_registered_users() to authenticated;
grant execute on function write.search_scenes(uuid, text) to authenticated;

create or replace function write.delete_my_account()
returns void
language plpgsql
security definer
set search_path = write, public, auth, storage
as $$
declare
  v_user_id uuid := auth.uid();
  v_email text;
  v_submission record;
  v_bucket_id text;
begin
  if v_user_id is null then
    raise exception 'Not authenticated';
  end if;

  select email into v_email from auth.users where id = v_user_id;

  for v_submission in
    select s.id
    from public."Submissions" s
    left join public."Contributors" c on c.id = s.contributor_id
    where s.user_id = v_user_id
       or c.user_id = v_user_id
  loop
    v_bucket_id := 'sub-bucket-' || v_submission.id::text;

    delete from storage.objects
    where bucket_id = v_bucket_id;

    delete from storage.buckets
    where id = v_bucket_id;
  end loop;

  delete from public."Texts"
  where submission_id in (
    select s.id
    from public."Submissions" s
    left join public."Contributors" c on c.id = s.contributor_id
    where s.user_id = v_user_id
       or c.user_id = v_user_id
  );

  delete from public."Submissions"
  where user_id = v_user_id
     or contributor_id in (
       select id from public."Contributors" where user_id = v_user_id
     );

  delete from public."Contributors"
  where user_id = v_user_id;

  delete from storage.objects
  where bucket_id = 'write-tale-images'
    and name like v_user_id::text || '/%';

  delete from write.tales where user_id = v_user_id;

  delete from write.beat_templates where user_id = v_user_id;

  update write.approved_users
  set
    revoked_at = now(),
    user_id = null
  where user_id = v_user_id
    or (
      revoked_at is null
      and v_email is not null
      and lower(email) = lower(v_email)
    );

  delete from public."Admins" where admin_id = v_user_id;

  delete from auth.users where id = v_user_id;
end;
$$;

comment on function write.delete_my_account() is
  'Deletes the caller''s magazine submissions, Write Knuckles data, storage files, and auth account.';

revoke all on function write.delete_my_account() from public;
grant execute on function write.delete_my_account() to authenticated;

-- RLS
alter table write.approved_users enable row level security;
alter table write.tales enable row level security;
alter table write.chapters enable row level security;
alter table write.scenes enable row level security;
alter table write.beat_templates enable row level security;
alter table write.tale_beats enable row level security;
alter table write.beat_links enable row level security;
alter table write.characters enable row level security;
alter table write.locations enable row level security;
alter table write.research_items enable row level security;
alter table write.reference_images enable row level security;
alter table write.scene_character_links enable row level security;
alter table write.scene_location_links enable row level security;
alter table write.print_runs enable row level security;

drop policy if exists "Users check own approval" on write.approved_users;
create policy "Users check own approval" on write.approved_users
  for select using (
    user_id = auth.uid()
    or lower(email) = lower(coalesce(write.current_user_email(), ''))
  );

drop policy if exists "Magazine admins manage approvals" on write.approved_users;
create policy "Magazine admins manage approvals" on write.approved_users
  for all using (
    exists (select 1 from public."Admins" a where a.admin_id = auth.uid())
  ) with check (
    exists (select 1 from public."Admins" a where a.admin_id = auth.uid())
  );

drop policy if exists "Approved users manage own tales" on write.tales;
create policy "Approved users manage own tales" on write.tales
  for all using (write.is_approved_user() and auth.uid() = user_id)
  with check (write.is_approved_user() and auth.uid() = user_id);

drop policy if exists "Approved users manage own chapters" on write.chapters;
create policy "Approved users manage own chapters" on write.chapters
  for all using (write.is_approved_user() and auth.uid() = user_id)
  with check (write.is_approved_user() and auth.uid() = user_id);

drop policy if exists "Approved users manage own scenes" on write.scenes;
create policy "Approved users manage own scenes" on write.scenes
  for all using (write.is_approved_user() and auth.uid() = user_id)
  with check (write.is_approved_user() and auth.uid() = user_id);

drop policy if exists "Approved users read beat templates" on write.beat_templates;
drop policy if exists "Approved users insert beat templates" on write.beat_templates;
drop policy if exists "Approved users update beat templates" on write.beat_templates;
drop policy if exists "Approved users delete beat templates" on write.beat_templates;
create policy "Approved users read beat templates" on write.beat_templates
  for select using (write.is_approved_user() and (user_id is null or auth.uid() = user_id));
create policy "Approved users insert beat templates" on write.beat_templates
  for insert with check (write.is_approved_user() and auth.uid() = user_id);
create policy "Approved users update beat templates" on write.beat_templates
  for update using (write.is_approved_user() and auth.uid() = user_id);
create policy "Approved users delete beat templates" on write.beat_templates
  for delete using (write.is_approved_user() and auth.uid() = user_id);

drop policy if exists "Approved users manage tale beats via tale" on write.tale_beats;
create policy "Approved users manage tale beats via tale" on write.tale_beats
  for all using (
    write.is_approved_user()
    and exists (select 1 from write.tales t where t.id = tale_id and t.user_id = auth.uid())
  ) with check (
    write.is_approved_user()
    and exists (select 1 from write.tales t where t.id = tale_id and t.user_id = auth.uid())
  );

drop policy if exists "Approved users manage beat links via tale" on write.beat_links;
create policy "Approved users manage beat links via tale" on write.beat_links
  for all using (
    write.is_approved_user()
    and exists (select 1 from write.tales t where t.id = tale_id and t.user_id = auth.uid())
  ) with check (
    write.is_approved_user()
    and exists (select 1 from write.tales t where t.id = tale_id and t.user_id = auth.uid())
  );

drop policy if exists "Approved users manage own characters" on write.characters;
create policy "Approved users manage own characters" on write.characters
  for all using (write.is_approved_user() and auth.uid() = user_id)
  with check (write.is_approved_user() and auth.uid() = user_id);

drop policy if exists "Approved users manage own locations" on write.locations;
create policy "Approved users manage own locations" on write.locations
  for all using (write.is_approved_user() and auth.uid() = user_id)
  with check (write.is_approved_user() and auth.uid() = user_id);

drop policy if exists "Approved users manage own research_items" on write.research_items;
create policy "Approved users manage own research_items" on write.research_items
  for all using (write.is_approved_user() and auth.uid() = user_id)
  with check (write.is_approved_user() and auth.uid() = user_id);

drop policy if exists "Approved users manage reference images via tale" on write.reference_images;
create policy "Approved users manage reference images via tale" on write.reference_images
  for all using (write.can_access_tale(tale_id))
  with check (write.can_access_tale(tale_id) and auth.uid() = user_id);

drop policy if exists "Approved users manage scene character links via tale" on write.scene_character_links;
create policy "Approved users manage scene character links via tale" on write.scene_character_links
  for all using (
    write.is_approved_user()
    and exists (select 1 from write.tales t where t.id = tale_id and t.user_id = auth.uid())
  ) with check (
    write.is_approved_user()
    and exists (select 1 from write.tales t where t.id = tale_id and t.user_id = auth.uid())
  );

drop policy if exists "Approved users manage scene location links via tale" on write.scene_location_links;
create policy "Approved users manage scene location links via tale" on write.scene_location_links
  for all using (
    write.is_approved_user()
    and exists (select 1 from write.tales t where t.id = tale_id and t.user_id = auth.uid())
  ) with check (
    write.is_approved_user()
    and exists (select 1 from write.tales t where t.id = tale_id and t.user_id = auth.uid())
  );

drop policy if exists "Approved users manage own print_runs" on write.print_runs;
create policy "Approved users manage own print_runs" on write.print_runs
  for all using (write.is_approved_user() and auth.uid() = user_id)
  with check (write.is_approved_user() and auth.uid() = user_id);

-- Seed beat templates (idempotent)
do $$
begin
  if not exists (select 1 from write.beat_templates where slug = 'save-the-cat' and user_id is null) then
    insert into write.beat_templates (user_id, name, slug, description, structure) values
(null, 'Save the Cat', 'save-the-cat', 'Blake Snyder''s 15-beat story structure', '[
  {"key":"stc_01","title":"Opening Image","act":1,"target_percent":1,"guidance":"A snapshot of the hero and their world before the fist flies."},
  {"key":"stc_02","title":"Theme Stated","act":1,"target_percent":5,"guidance":"Someone states the moral — the lesson this tale will beat into the hero."},
  {"key":"stc_03","title":"Setup","act":1,"target_percent":10,"guidance":"Establish the stakes, the locations, the characters. Show what the hero stands to lose."},
  {"key":"stc_04","title":"Catalyst","act":1,"target_percent":12,"guidance":"The inciting incident. The letter, the body, the knock at the door."},
  {"key":"stc_05","title":"Debate","act":1,"target_percent":18,"guidance":"Should the hero take the case? Walk away? The last chance to stay safe."},
  {"key":"stc_06","title":"Break into Two","act":2,"target_percent":25,"guidance":"The hero commits. Crosses the threshold. No turning back now."},
  {"key":"stc_07","title":"B Story","act":2,"target_percent":30,"guidance":"The relationship that carries the theme — partner, love interest, mentor."},
  {"key":"stc_08","title":"Fun and Games","act":2,"target_percent":40,"guidance":"The promise of the premise. Investigation, seduction, gunfights in the rain."},
  {"key":"stc_09","title":"Midpoint","act":2,"target_percent":50,"guidance":"False victory or false defeat. Stakes double. The clock starts ticking."},
  {"key":"stc_10","title":"Bad Guys Close In","act":2,"target_percent":60,"guidance":"Pressure mounts. Allies crumble. The hero''s flaws come back to haunt them."},
  {"key":"stc_11","title":"All Is Lost","act":2,"target_percent":75,"guidance":"The gut punch. Rock bottom. The darkest hour before dawn."},
  {"key":"stc_12","title":"Dark Night of the Soul","act":2,"target_percent":78,"guidance":"The hero wallows, then finds the resolve to fight one more round."},
  {"key":"stc_13","title":"Break into Three","act":3,"target_percent":80,"guidance":"The plan comes together. Synthesis of A and B stories. Time to throw the knockout."},
  {"key":"stc_14","title":"Finale","act":3,"target_percent":90,"guidance":"The final confrontation. Every lesson learned gets thrown into the ring."},
  {"key":"stc_15","title":"Final Image","act":3,"target_percent":100,"guidance":"Mirror the opening. Show how the world — and the hero — have changed."}
]'::jsonb),
(null, 'Hero''s Journey', 'heros-journey', 'Campbell''s monomyth in twelve stages', '[
  {"key":"hj_01","title":"Ordinary World","act":1,"target_percent":5,"guidance":"Life before the call. The hero in their element."},
  {"key":"hj_02","title":"Call to Adventure","act":1,"target_percent":10,"guidance":"The case lands on the desk. The map arrives. Destiny knocks."},
  {"key":"hj_03","title":"Refusal of the Call","act":1,"target_percent":15,"guidance":"Too dangerous. Too personal. The hero hesitates."},
  {"key":"hj_04","title":"Meeting the Mentor","act":1,"target_percent":20,"guidance":"Wisdom, tools, or a warning from someone who''s been in the ring before."},
  {"key":"hj_05","title":"Crossing the Threshold","act":2,"target_percent":25,"guidance":"Enter the special world. Leave the ordinary behind."},
  {"key":"hj_06","title":"Tests, Allies, Enemies","act":2,"target_percent":35,"guidance":"Learn the rules. Find friends. Identify foes."},
  {"key":"hj_07","title":"Approach to the Inmost Cave","act":2,"target_percent":50,"guidance":"Prepare for the central ordeal. Plans form, tensions rise."},
  {"key":"hj_08","title":"Ordeal","act":2,"target_percent":60,"guidance":"Face the greatest fear. Die and be reborn."},
  {"key":"hj_09","title":"Reward","act":2,"target_percent":70,"guidance":"Seize the sword. Claim the truth. Survive the ordeal."},
  {"key":"hj_10","title":"The Road Back","act":3,"target_percent":80,"guidance":"Chase intensifies. Consequences of the ordeal catch up."},
  {"key":"hj_11","title":"Resurrection","act":3,"target_percent":90,"guidance":"Final test. Purified by fire. The last stand."},
  {"key":"hj_12","title":"Return with the Elixir","act":3,"target_percent":100,"guidance":"Bring the treasure home. The world is changed."}
]'::jsonb),
(null, 'Three-Act Pulp', 'three-act-pulp', 'Bronze Knuckles hard-hitting pulp arc', '[
  {"key":"tap_01","title":"Hook","act":1,"target_percent":5,"guidance":"Grab them by the collar in the first page. Blood, mystery, or a promise of violence."},
  {"key":"tap_02","title":"The Setup","act":1,"target_percent":15,"guidance":"The characters, the locations, the score. Establish the world and the wound."},
  {"key":"tap_03","title":"Complication","act":1,"target_percent":25,"guidance":"Nothing is what it seems. The case twists."},
  {"key":"tap_04","title":"Gut Punch","act":2,"target_percent":50,"guidance":"The midpoint betrayal or revelation. The air leaves the room."},
  {"key":"tap_05","title":"Reversal","act":2,"target_percent":70,"guidance":"The hero flips the script. New information, new tactics."},
  {"key":"tap_06","title":"Knockout","act":3,"target_percent":90,"guidance":"The final brawl. Truth revealed. Justice dealt the hard way."},
  {"key":"tap_07","title":"The Smoke Clears","act":3,"target_percent":100,"guidance":"Aftermath. Who''s standing? What did it cost?"}
]'::jsonb),
(null, 'Story Circle', 'story-circle', 'Dan Harmon''s 8-step story circle', '[
  {"key":"sc_01","title":"You","act":1,"target_percent":10,"guidance":"A character in a zone of comfort."},
  {"key":"sc_02","title":"Need","act":1,"target_percent":20,"guidance":"They want something."},
  {"key":"sc_03","title":"Go","act":1,"target_percent":30,"guidance":"They enter an unfamiliar situation."},
  {"key":"sc_04","title":"Search","act":2,"target_percent":50,"guidance":"They adapt. They search."},
  {"key":"sc_05","title":"Find","act":2,"target_percent":60,"guidance":"They find what they wanted."},
  {"key":"sc_06","title":"Take","act":2,"target_percent":75,"guidance":"They pay a heavy price for it."},
  {"key":"sc_07","title":"Return","act":3,"target_percent":90,"guidance":"They return to their familiar situation."},
  {"key":"sc_08","title":"Change","act":3,"target_percent":100,"guidance":"They have changed."}
]'::jsonb),
(null, 'Blank Beat Sheet', 'blank', 'Empty beat sheet — fill in your own beats', '[]'::jsonb);
  end if;
end $$;

-- Bootstrap: add your email before signing in to Write Knuckles.
-- insert into write.approved_users (email, notes)
-- values ('you@example.com', 'Founder');

-- Tale-scoped image storage
-- Path convention: {user_id}/{tale_id}/{scope}/{entity_id}/{uuid}.{ext}
create or replace function write.tale_id_from_storage_path(p_path text)
returns uuid
language plpgsql
immutable
set search_path = write, public
as $$
declare
  v_parts text[];
  v_tale_id uuid;
begin
  v_parts := string_to_array(p_path, '/');
  if v_parts is null or coalesce(array_length(v_parts, 1), 0) < 2 then
    return null;
  end if;
  begin
    v_tale_id := v_parts[2]::uuid;
  exception
    when invalid_text_representation then
      return null;
  end;
  return v_tale_id;
end;
$$;

comment on function write.tale_id_from_storage_path(text) is
  'Extracts tale_id (2nd path segment) from write-tale-images object keys.';

create or replace function write.can_access_tale(p_tale_id uuid)
returns boolean
language sql
stable
security definer
set search_path = write, public, auth
as $$
  select p_tale_id is not null
    and write.is_approved_user()
    and exists (
      select 1 from write.tales t
      where t.id = p_tale_id and t.user_id = auth.uid()
    );
$$;

comment on function write.can_access_tale(uuid) is
  'True when the signed-in approved user owns the tale. Add collaborator OR branch later.';

create or replace function write.can_access_storage_path(p_path text)
returns boolean
language sql
stable
security definer
set search_path = write, public, auth
as $$
  select write.is_approved_user()
    and (string_to_array(p_path, '/'))[1] = auth.uid()::text
    and write.can_access_tale(write.tale_id_from_storage_path(p_path));
$$;

comment on function write.can_access_storage_path(text) is
  'Validates write-tale-images object paths against user ownership and tale access.';

grant execute on function write.tale_id_from_storage_path(text) to authenticated;
grant execute on function write.can_access_tale(uuid) to authenticated;
grant execute on function write.can_access_storage_path(text) to authenticated;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'write-tale-images',
  'write-tale-images',
  false,
  10485760,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Approved tale owners read tale images" on storage.objects;
create policy "Approved tale owners read tale images"
  on storage.objects for select to authenticated
  using (bucket_id = 'write-tale-images' and write.can_access_storage_path(name));

drop policy if exists "Approved tale owners upload tale images" on storage.objects;
create policy "Approved tale owners upload tale images"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'write-tale-images' and write.can_access_storage_path(name));

drop policy if exists "Approved tale owners update tale images" on storage.objects;
create policy "Approved tale owners update tale images"
  on storage.objects for update to authenticated
  using (bucket_id = 'write-tale-images' and write.can_access_storage_path(name))
  with check (bucket_id = 'write-tale-images' and write.can_access_storage_path(name));

drop policy if exists "Approved tale owners delete tale images" on storage.objects;
create policy "Approved tale owners delete tale images"
  on storage.objects for delete to authenticated
  using (bucket_id = 'write-tale-images' and write.can_access_storage_path(name));

insert into write.schema_migrations (version, name)
values ('010', 'write_knuckles_bootstrap')
on conflict (version) do nothing;

insert into write.schema_migrations (version, name)
values ('011', 'tale_images_storage')
on conflict (version) do nothing;

insert into write.schema_migrations (version, name)
values ('012', 'tale_cover')
on conflict (version) do nothing;

insert into write.schema_migrations (version, name)
values ('013', 'reference_images')
on conflict (version) do nothing;

insert into write.schema_migrations (version, name)
values ('014', 'delete_my_account')
on conflict (version) do nothing;

insert into write.schema_migrations (version, name)
values ('015', 'delete_my_account_magazine')
on conflict (version) do nothing;
