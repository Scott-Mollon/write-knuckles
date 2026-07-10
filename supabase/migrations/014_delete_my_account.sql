-- Self-service account deletion: magazine + Write Knuckles data, storage files, and auth user.

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

comment on function write.delete_my_account() is
  'Deletes the caller''s magazine submissions, Write Knuckles data, storage files, and auth account.';

revoke all on function write.delete_my_account() from public;
grant execute on function write.delete_my_account() to authenticated;

insert into write.schema_migrations (version, name)
values ('014', 'delete_my_account')
on conflict (version) do nothing;
