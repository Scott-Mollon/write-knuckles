-- Rename hits/punches/mugshots/joints terminology to chapters/scenes/characters/locations
-- Run this ONLY if you already applied 001 with the old table names.

do $$
begin
  if not exists (
    select 1 from information_schema.tables
    where table_schema = 'write' and table_name = 'hits'
  ) then
    raise notice '002 skipped: write.hits not found (fresh 001 install or already migrated)';
    return;
  end if;

  if exists (
    select 1 from information_schema.tables
    where table_schema = 'write' and table_name = 'chapters'
  ) then
    raise notice '002 skipped: write.chapters already exists';
    return;
  end if;

  drop policy if exists "Users manage own hits" on write.hits;
  drop policy if exists "Users manage own punches" on write.punches;
  drop policy if exists "Users manage own mugshots" on write.mugshots;
  drop policy if exists "Users manage own joints" on write.joints;

  drop trigger if exists hits_updated_at on write.hits;
  drop trigger if exists punches_updated_at on write.punches;
  drop trigger if exists mugshots_updated_at on write.mugshots;
  drop trigger if exists joints_updated_at on write.joints;

  alter table write.hits rename to chapters;
  alter table write.punches rename to scenes;
  alter table write.mugshots rename to characters;
  alter table write.joints rename to locations;

  alter table write.scenes rename column hit_id to chapter_id;
  alter table write.scenes rename column slug_color to scene_color;
  alter table write.scenes rename column slug_status to scene_status;
  alter table write.beat_links rename column punch_id to scene_id;

  alter index if exists write.idx_hits_tale_id rename to idx_chapters_tale_id;
  alter index if exists write.idx_punches_hit_id rename to idx_scenes_chapter_id;
  alter index if exists write.idx_punches_tale_id rename to idx_scenes_tale_id;
  alter index if exists write.idx_punches_plain_text rename to idx_scenes_plain_text;

  create trigger chapters_updated_at before update on write.chapters
    for each row execute function write.set_updated_at();
  create trigger scenes_updated_at before update on write.scenes
    for each row execute function write.set_updated_at();
  create trigger characters_updated_at before update on write.characters
    for each row execute function write.set_updated_at();
  create trigger locations_updated_at before update on write.locations
    for each row execute function write.set_updated_at();

  create policy "Users manage own chapters" on write.chapters
    for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
  create policy "Users manage own scenes" on write.scenes
    for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
  create policy "Users manage own characters" on write.characters
    for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
  create policy "Users manage own locations" on write.locations
    for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

  update write.chapters set title = 'Chapter One' where title = 'Act I';
  update write.scenes set title = 'Scene One' where title = 'Opening Punch';
  update write.beat_templates
    set name = 'Blank Beat Sheet',
        description = 'Empty beat sheet — fill in your own beats'
    where slug = 'blank' and user_id is null;

  insert into write.schema_migrations (version, name)
  values ('002', 'terminology_rename')
  on conflict (version) do nothing;
end $$;
