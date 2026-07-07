-- Write Knuckles Phase 1 schema
-- Run against the shared Bronze Knuckles Supabase project

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

-- Tales (manuscripts)
create table if not exists write.tales (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  subtitle text,
  genre text,
  target_word_count int default 80000,
  beat_template_id uuid,
  progress jsonb default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz
);

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

alter table write.tales
  add constraint tales_beat_template_id_fkey
  foreign key (beat_template_id) references write.beat_templates(id) on delete set null;

-- Indexes
create index if not exists idx_chapters_tale_id on write.chapters(tale_id);
create index if not exists idx_scenes_chapter_id on write.scenes(chapter_id);
create index if not exists idx_scenes_tale_id on write.scenes(tale_id);
create index if not exists idx_scenes_plain_text on write.scenes using gin(to_tsvector('english', plain_text));
create index if not exists idx_beat_links_tale_id on write.beat_links(tale_id);
create index if not exists idx_tales_user_id on write.tales(user_id);

-- updated_at trigger
create or replace function write.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger tales_updated_at before update on write.tales
  for each row execute function write.set_updated_at();
create trigger chapters_updated_at before update on write.chapters
  for each row execute function write.set_updated_at();
create trigger scenes_updated_at before update on write.scenes
  for each row execute function write.set_updated_at();
create trigger tale_beats_updated_at before update on write.tale_beats
  for each row execute function write.set_updated_at();
create trigger characters_updated_at before update on write.characters
  for each row execute function write.set_updated_at();
create trigger locations_updated_at before update on write.locations
  for each row execute function write.set_updated_at();
create trigger research_items_updated_at before update on write.research_items
  for each row execute function write.set_updated_at();

-- RLS
alter table write.tales enable row level security;
alter table write.chapters enable row level security;
alter table write.scenes enable row level security;
alter table write.beat_templates enable row level security;
alter table write.tale_beats enable row level security;
alter table write.beat_links enable row level security;
alter table write.characters enable row level security;
alter table write.locations enable row level security;
alter table write.research_items enable row level security;
alter table write.print_runs enable row level security;

-- Tales policies
create policy "Users manage own tales" on write.tales
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Chapters policies
create policy "Users manage own chapters" on write.chapters
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Scenes policies
create policy "Users manage own scenes" on write.scenes
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Beat templates: system (user_id null) readable by all; user templates owned
create policy "Anyone reads system beat templates" on write.beat_templates
  for select using (user_id is null or auth.uid() = user_id);
create policy "Users manage own beat templates" on write.beat_templates
  for insert with check (auth.uid() = user_id);
create policy "Users update own beat templates" on write.beat_templates
  for update using (auth.uid() = user_id);
create policy "Users delete own beat templates" on write.beat_templates
  for delete using (auth.uid() = user_id);

-- Tale beats (via tale ownership)
create policy "Users manage tale beats via tale" on write.tale_beats
  for all using (
    exists (select 1 from write.tales t where t.id = tale_id and t.user_id = auth.uid())
  ) with check (
    exists (select 1 from write.tales t where t.id = tale_id and t.user_id = auth.uid())
  );

-- Beat links
create policy "Users manage beat links via tale" on write.beat_links
  for all using (
    exists (select 1 from write.tales t where t.id = tale_id and t.user_id = auth.uid())
  ) with check (
    exists (select 1 from write.tales t where t.id = tale_id and t.user_id = auth.uid())
  );

-- Characters, locations, research
create policy "Users manage own characters" on write.characters
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users manage own locations" on write.locations
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users manage own research_items" on write.research_items
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users manage own print_runs" on write.print_runs
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

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

insert into write.schema_migrations (version, name)
values ('001', 'write_knuckles_schema')
on conflict (version) do nothing;
