-- Persist per-tale compile options and page layout in the database.

alter table write.tales
  add column if not exists compile_preferences jsonb not null default '{}'::jsonb;

comment on column write.tales.compile_preferences is
  'Compile content options and page layout (page size, margins, orientation). Viewer-only prefs stay local.';
