-- Tale exports: versioned TXT/PDF/DOCX files per manuscript

create table if not exists write.tale_exports (
  id uuid primary key default gen_random_uuid(),
  tale_id uuid not null references write.tales(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  format text not null check (format in ('txt', 'pdf', 'docx')),
  version int not null check (version > 0),
  status text not null default 'complete' check (status in ('complete', 'failed')),
  error_message text,
  file_name text not null,
  storage_path text,
  file_size_bytes bigint not null default 0 check (file_size_bytes >= 0),
  options jsonb not null default '{}'::jsonb,
  scope jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique (tale_id, version)
);

create index if not exists tale_exports_tale_id_created_at
  on write.tale_exports (tale_id, created_at desc);

create index if not exists tale_exports_tale_id_version
  on write.tale_exports (tale_id, version);

alter table write.tale_exports enable row level security;

drop policy if exists "Approved users manage own tale_exports" on write.tale_exports;
create policy "Approved users manage own tale_exports"
  on write.tale_exports
  for all
  using (write.is_approved_user() and auth.uid() = user_id)
  with check (write.is_approved_user() and auth.uid() = user_id);

-- Private bucket for export files: {user_id}/{tale_id}/exports/{export_id}.{ext}
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'write-tale-exports',
  'write-tale-exports',
  false,
  52428800,
  array[
    'text/plain',
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ]
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Approved tale owners read tale exports" on storage.objects;
create policy "Approved tale owners read tale exports"
  on storage.objects for select to authenticated
  using (bucket_id = 'write-tale-exports' and write.can_access_storage_path(name));

drop policy if exists "Approved tale owners upload tale exports" on storage.objects;
create policy "Approved tale owners upload tale exports"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'write-tale-exports' and write.can_access_storage_path(name));

drop policy if exists "Approved tale owners update tale exports" on storage.objects;
create policy "Approved tale owners update tale exports"
  on storage.objects for update to authenticated
  using (bucket_id = 'write-tale-exports' and write.can_access_storage_path(name))
  with check (bucket_id = 'write-tale-exports' and write.can_access_storage_path(name));

drop policy if exists "Approved tale owners delete tale exports" on storage.objects;
create policy "Approved tale owners delete tale exports"
  on storage.objects for delete to authenticated
  using (bucket_id = 'write-tale-exports' and write.can_access_storage_path(name));

-- Extend account deletion to remove export files
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

  delete from storage.objects
  where bucket_id = 'write-tale-exports'
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
