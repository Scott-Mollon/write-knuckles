-- Allow HTML tale exports

alter table write.tale_exports drop constraint if exists tale_exports_format_check;
alter table write.tale_exports add constraint tale_exports_format_check
  check (format in ('txt', 'pdf', 'docx', 'html'));

update storage.buckets
set allowed_mime_types = array[
  'text/plain',
  'text/html',
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
]
where id = 'write-tale-exports';
