-- Add tags to characters and locations (same shape as research_items.tags)

alter table write.characters
  add column if not exists tags text[] default '{}';

alter table write.locations
  add column if not exists tags text[] default '{}';

update write.characters set tags = '{}' where tags is null;
update write.locations set tags = '{}' where tags is null;

insert into write.schema_migrations (version, name)
values ('007', 'character_location_tags')
on conflict (version) do nothing;
