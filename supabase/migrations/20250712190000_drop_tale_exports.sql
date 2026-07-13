-- Remove server-side tale export history (client-side compile replaces exports)

drop policy if exists "Approved tale owners read tale exports" on storage.objects;
drop policy if exists "Approved tale owners upload tale exports" on storage.objects;
drop policy if exists "Approved tale owners update tale exports" on storage.objects;
drop policy if exists "Approved tale owners delete tale exports" on storage.objects;

delete from storage.objects where bucket_id = 'write-tale-exports';
delete from storage.buckets where id = 'write-tale-exports';

drop table if exists write.tale_exports cascade;

-- Account deletion: remove export bucket cleanup (bucket no longer exists)
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
