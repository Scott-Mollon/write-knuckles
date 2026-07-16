-- Account deletion: stop direct DELETE on storage.objects/buckets.
-- Supabase Storage blocks SQL deletes ("Use the Storage API instead").
-- The client deletes Write + magazine storage via the Storage API before this RPC.

create or replace function write.delete_my_account()
returns void
language plpgsql
security definer
set search_path = write, public, auth
as $$
declare
  v_user_id uuid := auth.uid();
  v_email text;
begin
  if v_user_id is null then
    raise exception 'Not authenticated';
  end if;

  select email into v_email from auth.users where id = v_user_id;

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

  -- Storage files must already be removed via Storage API (client).
  -- Cascades: harper_dictionaries, profiles via auth.users ON DELETE CASCADE.
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
  'Deletes the caller''s magazine DB rows, Write Knuckles data, and auth account. Caller must delete Storage objects via the Storage API first.';

revoke all on function write.delete_my_account() from public, anon;
grant execute on function write.delete_my_account() to authenticated;
