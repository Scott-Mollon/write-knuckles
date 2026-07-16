-- Phase 2: Lock down write.* RPC grants.
-- Bootstrap granted ALL routines to anon; revoke that and re-grant only what
-- authenticated clients (and RLS/triggers) need. Stop default privileges from
-- re-granting new routines to anon.

-- ---------------------------------------------------------------------------
-- A. Revoke broad execute from anonymous / public
-- ---------------------------------------------------------------------------
revoke execute on all functions in schema write from anon, public;

alter default privileges in schema write
  revoke all on routines from anon, public;

-- Future routines created by postgres (migrations) should not auto-grant to anon.
alter default privileges for role postgres in schema write
  revoke all on routines from anon, public;

-- ---------------------------------------------------------------------------
-- B. Re-grant intentional client RPCs to authenticated
-- ---------------------------------------------------------------------------
grant execute on function write.link_approved_user() to authenticated;
grant execute on function write.list_registered_users() to authenticated;
grant execute on function write.set_user_plan(uuid, text) to authenticated;
grant execute on function write.search_scenes(uuid, text) to authenticated;
grant execute on function write.delete_my_account() to authenticated;
grant execute on function write.merge_feature_requests(uuid, uuid) to authenticated;
grant execute on function write.set_harper_dictionary(text[]) to authenticated;

-- ---------------------------------------------------------------------------
-- C. Re-grant RLS / entitlement helpers (policies and nested calls need EXECUTE)
-- ---------------------------------------------------------------------------
grant execute on function write.current_user_email() to authenticated;
grant execute on function write.is_approved_user() to authenticated;
grant execute on function write.current_user_plan() to authenticated;
grant execute on function write.is_paid_user() to authenticated;
grant execute on function write.can_create_tale() to authenticated;
grant execute on function write.tale_id_from_storage_path(text) to authenticated;
grant execute on function write.can_access_tale(uuid) to authenticated;
grant execute on function write.can_access_storage_path(text) to authenticated;

-- Trigger functions fired by authenticated DML still require EXECUTE for the
-- session role in Postgres. Harmless if exposed via PostgREST (trigger signature).
grant execute on function write.set_updated_at() to authenticated;
grant execute on function write.sync_character_avatar_from_hero() to authenticated;

-- Auth-hook profile trigger: only the auth/inserter role needs this — not clients.
revoke all on function write.handle_new_user_profile() from anon, public, authenticated;

-- ---------------------------------------------------------------------------
-- D. Harden list_feature_requests: require a signed-in user (not approved_users)
-- ---------------------------------------------------------------------------
create or replace function write.list_feature_requests()
returns table (
  id uuid,
  title text,
  description text,
  created_by uuid,
  created_at timestamptz,
  vote_count bigint,
  user_has_voted boolean
)
language plpgsql
stable
security definer
set search_path = write, public, auth
as $$
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  return query
    select
      fr.id,
      fr.title,
      fr.description,
      fr.created_by,
      fr.created_at,
      count(frv.id) as vote_count,
      coalesce(bool_or(frv.user_id = auth.uid()), false) as user_has_voted
    from write.feature_requests fr
    left join write.feature_request_votes frv on frv.feature_request_id = fr.id
    group by fr.id
    order by vote_count desc, fr.created_at asc;
end;
$$;

grant execute on function write.list_feature_requests() to authenticated;

comment on function write.list_feature_requests() is
  'Lists feature requests with vote counts. Requires a signed-in user (auth.uid()).';

-- ---------------------------------------------------------------------------
-- E. Pin search_path on set_updated_at (advisor: function_search_path_mutable)
-- ---------------------------------------------------------------------------
create or replace function write.set_updated_at()
returns trigger
language plpgsql
set search_path = write
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

grant execute on function write.set_updated_at() to authenticated;
