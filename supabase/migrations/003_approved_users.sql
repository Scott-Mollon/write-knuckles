-- Write Knuckles invite-only access
-- Run after 001 (and 002 if applicable)

create table if not exists write.approved_users (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  user_id uuid references auth.users(id) on delete set null,
  approved_at timestamptz not null default now(),
  approved_by uuid references auth.users(id) on delete set null,
  revoked_at timestamptz,
  notes text,
  created_at timestamptz not null default now()
);

create unique index if not exists approved_users_active_email
  on write.approved_users (lower(email))
  where revoked_at is null;

create index if not exists approved_users_user_id
  on write.approved_users (user_id)
  where revoked_at is null;

comment on table write.approved_users is
  'Invite list for Write Knuckles. Users must appear here (by email) before accessing the write schema.';

-- Returns true when the signed-in user is on the active invite list.
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
        or lower(au.email) = lower(coalesce(auth.jwt() ->> 'email', ''))
      )
  );
$$;

-- Link auth user on first successful access check
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
    and lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''));
end;
$$;

alter table write.approved_users enable row level security;

-- Users can verify their own approval status
create policy "Users check own approval" on write.approved_users
  for select using (
    user_id = auth.uid()
    or lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  );

-- Magazine admins manage the invite list (public.Admins table)
create policy "Magazine admins manage approvals" on write.approved_users
  for all using (
    exists (select 1 from public."Admins" a where a.admin_id = auth.uid())
  ) with check (
    exists (select 1 from public."Admins" a where a.admin_id = auth.uid())
  );

-- Tighten write schema policies: approved users only
drop policy if exists "Users manage own tales" on write.tales;
create policy "Approved users manage own tales" on write.tales
  for all using (write.is_approved_user() and auth.uid() = user_id)
  with check (write.is_approved_user() and auth.uid() = user_id);

drop policy if exists "Users manage own chapters" on write.chapters;
create policy "Approved users manage own chapters" on write.chapters
  for all using (write.is_approved_user() and auth.uid() = user_id)
  with check (write.is_approved_user() and auth.uid() = user_id);

drop policy if exists "Users manage own scenes" on write.scenes;
create policy "Approved users manage own scenes" on write.scenes
  for all using (write.is_approved_user() and auth.uid() = user_id)
  with check (write.is_approved_user() and auth.uid() = user_id);

drop policy if exists "Anyone reads system beat templates" on write.beat_templates;
drop policy if exists "Users manage own beat templates" on write.beat_templates;
drop policy if exists "Users update own beat templates" on write.beat_templates;
drop policy if exists "Users delete own beat templates" on write.beat_templates;

create policy "Approved users read beat templates" on write.beat_templates
  for select using (write.is_approved_user() and (user_id is null or auth.uid() = user_id));
create policy "Approved users insert beat templates" on write.beat_templates
  for insert with check (write.is_approved_user() and auth.uid() = user_id);
create policy "Approved users update beat templates" on write.beat_templates
  for update using (write.is_approved_user() and auth.uid() = user_id);
create policy "Approved users delete beat templates" on write.beat_templates
  for delete using (write.is_approved_user() and auth.uid() = user_id);

drop policy if exists "Users manage tale beats via tale" on write.tale_beats;
create policy "Approved users manage tale beats via tale" on write.tale_beats
  for all using (
    write.is_approved_user()
    and exists (select 1 from write.tales t where t.id = tale_id and t.user_id = auth.uid())
  ) with check (
    write.is_approved_user()
    and exists (select 1 from write.tales t where t.id = tale_id and t.user_id = auth.uid())
  );

drop policy if exists "Users manage beat links via tale" on write.beat_links;
create policy "Approved users manage beat links via tale" on write.beat_links
  for all using (
    write.is_approved_user()
    and exists (select 1 from write.tales t where t.id = tale_id and t.user_id = auth.uid())
  ) with check (
    write.is_approved_user()
    and exists (select 1 from write.tales t where t.id = tale_id and t.user_id = auth.uid())
  );

drop policy if exists "Users manage own characters" on write.characters;
create policy "Approved users manage own characters" on write.characters
  for all using (write.is_approved_user() and auth.uid() = user_id)
  with check (write.is_approved_user() and auth.uid() = user_id);

drop policy if exists "Users manage own locations" on write.locations;
create policy "Approved users manage own locations" on write.locations
  for all using (write.is_approved_user() and auth.uid() = user_id)
  with check (write.is_approved_user() and auth.uid() = user_id);

drop policy if exists "Users manage own dope_items" on write.dope_items;
create policy "Approved users manage own dope_items" on write.dope_items
  for all using (write.is_approved_user() and auth.uid() = user_id)
  with check (write.is_approved_user() and auth.uid() = user_id);

drop policy if exists "Users manage own print_runs" on write.print_runs;
create policy "Approved users manage own print_runs" on write.print_runs
  for all using (write.is_approved_user() and auth.uid() = user_id)
  with check (write.is_approved_user() and auth.uid() = user_id);

grant execute on function write.is_approved_user() to authenticated;
grant execute on function write.link_approved_user() to authenticated;

-- Bootstrap: add your email before signing in to Write Knuckles.
-- Replace with your account email, then run this migration.
-- insert into write.approved_users (email, notes)
-- values ('you@example.com', 'Founder');

insert into write.schema_migrations (version, name)
values ('003', 'approved_users')
on conflict (version) do nothing;
