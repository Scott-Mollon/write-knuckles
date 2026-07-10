-- Tale-scoped image storage: access helper + private bucket + Storage RLS
-- Path convention: {user_id}/{tale_id}/{scope}/{entity_id}/{uuid}.{ext}

-- Returns tale_id from a storage object path (segment 2), or null if invalid.
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

-- Tale access gate for RLS. Extend here when collaborators ship.
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
      select 1
      from write.tales t
      where t.id = p_tale_id
        and t.user_id = auth.uid()
    );
$$;

comment on function write.can_access_tale(uuid) is
  'True when the signed-in approved user owns the tale. Add collaborator OR branch later.';

-- Storage policy helper: approved owner + path user_id matches auth + tale access.
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

-- Private bucket for tale images (10 MB, images only)
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

-- Storage RLS on storage.objects
drop policy if exists "Approved tale owners read tale images" on storage.objects;
create policy "Approved tale owners read tale images"
  on storage.objects
  for select
  to authenticated
  using (
    bucket_id = 'write-tale-images'
    and write.can_access_storage_path(name)
  );

drop policy if exists "Approved tale owners upload tale images" on storage.objects;
create policy "Approved tale owners upload tale images"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'write-tale-images'
    and write.can_access_storage_path(name)
  );

drop policy if exists "Approved tale owners update tale images" on storage.objects;
create policy "Approved tale owners update tale images"
  on storage.objects
  for update
  to authenticated
  using (
    bucket_id = 'write-tale-images'
    and write.can_access_storage_path(name)
  )
  with check (
    bucket_id = 'write-tale-images'
    and write.can_access_storage_path(name)
  );

drop policy if exists "Approved tale owners delete tale images" on storage.objects;
create policy "Approved tale owners delete tale images"
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'write-tale-images'
    and write.can_access_storage_path(name)
  );

insert into write.schema_migrations (version, name)
values ('011', 'tale_images_storage')
on conflict (version) do nothing;
