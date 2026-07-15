-- Tale type (prose | comic) and comic script style preferences.
-- Existing rows stay prose via column default.

alter table write.tales
  add column if not exists tale_type text not null default 'prose';

alter table write.tales
  drop constraint if exists tales_tale_type_check;

alter table write.tales
  add constraint tales_tale_type_check
  check (tale_type in ('prose', 'comic'));

comment on column write.tales.tale_type is
  'prose (default) | comic — set only at creation; comic uses Issue/Page labels and script editor';

alter table write.tales
  add column if not exists script_style_preferences jsonb not null default '{}'::jsonb;

comment on column write.tales.script_style_preferences is
  'Per-element live editor styles for comic script tales (page, panel, character, dialogue, etc.)';

-- beat_template_id is already nullable in bootstrap; comics leave it null.
