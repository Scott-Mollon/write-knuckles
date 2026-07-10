-- Fix approval checks when auth.jwt() ->> 'email' is empty but auth.users.email matches.

create or replace function write.current_user_email()
returns text
language sql
stable
security definer
set search_path = auth, public
as $$
  select coalesce(
    auth.jwt() ->> 'email',
    (select email from auth.users where id = auth.uid())
  );
$$;

create or replace function write.is_approved_user()
returns boolean
language sql
stable
security definer
set search_path = write, public, auth
as $$
  select exists (
    select 1
    from write.approved_users au
    where au.revoked_at is null
      and (
        au.user_id = auth.uid()
        or lower(au.email) = lower(coalesce(write.current_user_email(), ''))
      )
  );
$$;

create or replace function write.link_approved_user()
returns void
language plpgsql
security definer
set search_path = write, public, auth
as $$
begin
  update write.approved_users
  set user_id = auth.uid()
  where revoked_at is null
    and user_id is null
    and lower(email) = lower(coalesce(write.current_user_email(), ''));
end;
$$;

drop policy if exists "Users check own approval" on write.approved_users;
create policy "Users check own approval" on write.approved_users
  for select using (
    user_id = auth.uid()
    or lower(email) = lower(coalesce(write.current_user_email(), ''))
  );

grant execute on function write.current_user_email() to authenticated;

insert into write.schema_migrations (version, name)
values ('008', 'fix_approval_email')
on conflict (version) do nothing;
