-- Phase 1 abuse guards: resource quotas on scene count and content bytes.
-- Soft-deleted scenes still count toward quotas (prevents delete-and-refill).
-- Hard DELETE (and CASCADE) subtracts from write.user_usage via AFTER DELETE.

-- ---------------------------------------------------------------------------
-- 1. Singleton config
-- ---------------------------------------------------------------------------

create table if not exists write.abuse_guards (
  id integer primary key default 1 check (id = 1),
  max_scenes_per_tale integer not null
    check (max_scenes_per_tale >= 0),
  max_scene_bytes integer not null
    check (max_scene_bytes >= 0),
  max_user_content_bytes bigint not null
    check (max_user_content_bytes >= 0),
  scene_inserts_per_minute integer not null
    check (scene_inserts_per_minute >= 0),
  scene_updates_per_minute integer not null
    check (scene_updates_per_minute >= 0),
  chapter_inserts_per_minute integer not null
    check (chapter_inserts_per_minute >= 0),
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id) on delete set null
);

comment on table write.abuse_guards is
  'Singleton abuse ceilings (id=1). Quotas apply to all plans; rate-limit columns reserved for phase 2.';

comment on column write.abuse_guards.max_scene_bytes is
  'Max octet_length(content::text) + octet_length(plain_text) per scene.';

comment on column write.abuse_guards.max_user_content_bytes is
  'Max sum of scene content bytes per user (includes soft-deleted scenes).';

insert into write.abuse_guards (
  id,
  max_scenes_per_tale,
  max_scene_bytes,
  max_user_content_bytes,
  scene_inserts_per_minute,
  scene_updates_per_minute,
  chapter_inserts_per_minute
)
values (
  1,
  2000,
  1048576,
  104857600,
  30,
  60,
  30
)
on conflict (id) do nothing;

create or replace function write.touch_abuse_guards()
returns trigger
language plpgsql
security invoker
set search_path = write, auth
as $$
begin
  new.updated_at = now();
  new.updated_by = auth.uid();
  return new;
end;
$$;

drop trigger if exists abuse_guards_touch on write.abuse_guards;
create trigger abuse_guards_touch
  before update on write.abuse_guards
  for each row
  execute function write.touch_abuse_guards();

revoke all on function write.touch_abuse_guards() from public, anon;

alter table write.abuse_guards enable row level security;

revoke all on table write.abuse_guards from anon, public;
grant select on table write.abuse_guards to authenticated;
grant update (
  max_scenes_per_tale,
  max_scene_bytes,
  max_user_content_bytes,
  scene_inserts_per_minute,
  scene_updates_per_minute,
  chapter_inserts_per_minute
) on table write.abuse_guards to authenticated;
grant all on table write.abuse_guards to service_role;

drop policy if exists "Authenticated read abuse guards" on write.abuse_guards;
create policy "Authenticated read abuse guards" on write.abuse_guards
  for select
  to authenticated
  using (true);

drop policy if exists "Magazine admins update abuse guards" on write.abuse_guards;
create policy "Magazine admins update abuse guards" on write.abuse_guards
  for update
  to authenticated
  using (
    exists (select 1 from public."Admins" a where a.admin_id = auth.uid())
  )
  with check (
    exists (select 1 from public."Admins" a where a.admin_id = auth.uid())
  );

-- ---------------------------------------------------------------------------
-- 2. Denormalized per-user content usage
-- ---------------------------------------------------------------------------

create table if not exists write.user_usage (
  user_id uuid primary key references auth.users(id) on delete cascade,
  content_bytes bigint not null default 0
    check (content_bytes >= 0)
);

comment on table write.user_usage is
  'Denormalized scene content byte totals per user; maintained by triggers only.';

alter table write.user_usage enable row level security;

revoke all on table write.user_usage from anon, public;
grant select on table write.user_usage to authenticated;
grant all on table write.user_usage to service_role;

drop policy if exists "Users read own usage" on write.user_usage;
create policy "Users read own usage" on write.user_usage
  for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "Magazine admins read all usage" on write.user_usage;
create policy "Magazine admins read all usage" on write.user_usage
  for select
  to authenticated
  using (
    exists (select 1 from public."Admins" a where a.admin_id = auth.uid())
  );

-- ---------------------------------------------------------------------------
-- 3. Helpers + quota enforcement
-- ---------------------------------------------------------------------------

create or replace function write.scene_content_bytes(p_content jsonb, p_plain_text text)
returns bigint
language sql
immutable
parallel safe
set search_path = write
as $$
  select
    coalesce(octet_length(coalesce(p_content, '{}'::jsonb)::text), 0)::bigint
    + coalesce(octet_length(coalesce(p_plain_text, '')), 0)::bigint;
$$;

revoke all on function write.scene_content_bytes(jsonb, text) from public, anon;
grant execute on function write.scene_content_bytes(jsonb, text) to authenticated;

comment on function write.scene_content_bytes(jsonb, text) is
  'Storage footprint of a scene body: jsonb text form + plain_text.';

create or replace function write.adjust_user_content_bytes(p_user_id uuid, p_delta bigint)
returns bigint
language plpgsql
security definer
set search_path = write, auth
as $$
declare
  v_total bigint;
begin
  if p_user_id is null then
    raise exception 'WK_ABUSE:user_bytes' using errcode = 'P0001';
  end if;

  if p_delta = 0 then
    select content_bytes into v_total
    from write.user_usage
    where user_id = p_user_id;

    return coalesce(v_total, 0);
  end if;

  insert into write.user_usage (user_id, content_bytes)
  values (p_user_id, greatest(p_delta, 0))
  on conflict (user_id) do update
  set content_bytes = greatest(write.user_usage.content_bytes + p_delta, 0)
  returning content_bytes into v_total;

  return v_total;
end;
$$;

revoke all on function write.adjust_user_content_bytes(uuid, bigint) from public, anon;

create or replace function write.enforce_scene_quotas()
returns trigger
language plpgsql
security definer
set search_path = write, auth, public
as $$
declare
  v_guards write.abuse_guards%rowtype;
  v_new_bytes bigint;
  v_old_bytes bigint;
  v_delta bigint;
  v_scene_count integer;
  v_total bigint;
  v_user_id uuid;
begin
  select * into v_guards from write.abuse_guards where id = 1;
  if not found then
    raise exception 'WK_ABUSE:scene_bytes' using errcode = 'P0001';
  end if;

  v_new_bytes := write.scene_content_bytes(new.content, new.plain_text);

  if v_new_bytes > v_guards.max_scene_bytes then
    raise exception 'WK_ABUSE:scene_bytes' using errcode = 'P0001';
  end if;

  if tg_op = 'INSERT' then
    select count(*)::integer into v_scene_count
    from write.scenes s
    where s.tale_id = new.tale_id;

    if v_scene_count >= v_guards.max_scenes_per_tale then
      raise exception 'WK_ABUSE:scene_limit' using errcode = 'P0001';
    end if;

    v_delta := v_new_bytes;
    v_user_id := new.user_id;
  else
    -- UPDATE OF content, plain_text
    v_old_bytes := write.scene_content_bytes(old.content, old.plain_text);
    v_delta := v_new_bytes - v_old_bytes;
    v_user_id := new.user_id;
  end if;

  if v_delta = 0 then
    return new;
  end if;

  -- Preview total before commit-style adjust when growing.
  if v_delta > 0 then
    select content_bytes into v_total
    from write.user_usage
    where user_id = v_user_id;

    if coalesce(v_total, 0) + v_delta > v_guards.max_user_content_bytes then
      raise exception 'WK_ABUSE:user_bytes' using errcode = 'P0001';
    end if;
  end if;

  perform write.adjust_user_content_bytes(v_user_id, v_delta);
  return new;
end;
$$;

revoke all on function write.enforce_scene_quotas() from public, anon;

drop trigger if exists scenes_enforce_quotas on write.scenes;
create trigger scenes_enforce_quotas
  before insert or update of content, plain_text
  on write.scenes
  for each row
  execute function write.enforce_scene_quotas();

create or replace function write.scenes_release_content_bytes()
returns trigger
language plpgsql
security definer
set search_path = write, auth
as $$
begin
  perform write.adjust_user_content_bytes(
    old.user_id,
    - write.scene_content_bytes(old.content, old.plain_text)
  );
  return old;
end;
$$;

revoke all on function write.scenes_release_content_bytes() from public, anon;

drop trigger if exists scenes_release_content_bytes on write.scenes;
create trigger scenes_release_content_bytes
  after delete on write.scenes
  for each row
  execute function write.scenes_release_content_bytes();

-- ---------------------------------------------------------------------------
-- 4. Backfill usage from existing scenes
-- ---------------------------------------------------------------------------

insert into write.user_usage (user_id, content_bytes)
select
  s.user_id,
  coalesce(sum(write.scene_content_bytes(s.content, s.plain_text)), 0)
from write.scenes s
group by s.user_id
on conflict (user_id) do update
set content_bytes = excluded.content_bytes;
