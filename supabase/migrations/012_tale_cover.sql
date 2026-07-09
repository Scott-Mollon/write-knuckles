-- Tale cover image columns on write.tales (one cover per tale)

alter table write.tales
  add column if not exists cover_source_type text,
  add column if not exists cover_storage_path text,
  add column if not exists cover_external_url text;

alter table write.tales
  drop constraint if exists tales_cover_source_type_check;

alter table write.tales
  add constraint tales_cover_source_type_check
  check (cover_source_type is null or cover_source_type in ('upload', 'url'));

alter table write.tales
  drop constraint if exists tales_cover_source_check;

alter table write.tales
  add constraint tales_cover_source_check
  check (
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
  );

comment on column write.tales.cover_source_type is 'upload | url — null when no cover';
comment on column write.tales.cover_storage_path is 'Path in write-tale-images when cover_source_type = upload';
comment on column write.tales.cover_external_url is 'HTTPS URL when cover_source_type = url';

insert into write.schema_migrations (version, name)
values ('012', 'tale_cover')
on conflict (version) do nothing;
