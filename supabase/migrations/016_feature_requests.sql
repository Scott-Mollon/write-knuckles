-- Feature request ranker: submissions, upvotes, admin merge

create table if not exists write.feature_requests (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null,
  created_by uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists write.feature_request_votes (
  id uuid primary key default gen_random_uuid(),
  feature_request_id uuid not null references write.feature_requests(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (feature_request_id, user_id)
);

create index if not exists feature_request_votes_request_id
  on write.feature_request_votes (feature_request_id);

create trigger feature_requests_updated_at
  before update on write.feature_requests
  for each row execute function write.set_updated_at();

alter table write.feature_requests enable row level security;
alter table write.feature_request_votes enable row level security;

create policy "Authenticated users read feature requests" on write.feature_requests
  for select using (auth.uid() is not null);

create policy "Authenticated users create feature requests" on write.feature_requests
  for insert with check (auth.uid() = created_by);

create policy "Magazine admins update feature requests" on write.feature_requests
  for update using (
    exists (select 1 from public."Admins" a where a.admin_id = auth.uid())
  ) with check (
    exists (select 1 from public."Admins" a where a.admin_id = auth.uid())
  );

create policy "Magazine admins delete feature requests" on write.feature_requests
  for delete using (
    exists (select 1 from public."Admins" a where a.admin_id = auth.uid())
  );

create policy "Authenticated users read feature request votes" on write.feature_request_votes
  for select using (auth.uid() is not null);

create policy "Authenticated users vote on feature requests" on write.feature_request_votes
  for insert with check (auth.uid() = user_id);

create policy "Authenticated users remove own votes" on write.feature_request_votes
  for delete using (auth.uid() = user_id);

grant select, insert on write.feature_requests to authenticated;
grant update, delete on write.feature_requests to authenticated;
grant select, insert, delete on write.feature_request_votes to authenticated;

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
language sql
stable
security definer
set search_path = write, public, auth
as $$
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
$$;

create or replace function write.merge_feature_requests(p_source_id uuid, p_target_id uuid)
returns void
language plpgsql
security definer
set search_path = write, public, auth
as $$
declare
  v_source write.feature_requests%rowtype;
  v_target write.feature_requests%rowtype;
begin
  if not exists (
    select 1 from public."Admins" a where a.admin_id = auth.uid()
  ) then
    raise exception 'Not authorized';
  end if;

  if p_source_id = p_target_id then
    raise exception 'Cannot merge a feature request into itself';
  end if;

  select * into v_source from write.feature_requests where id = p_source_id;
  if not found then
    raise exception 'Source feature request not found';
  end if;

  select * into v_target from write.feature_requests where id = p_target_id;
  if not found then
    raise exception 'Target feature request not found';
  end if;

  update write.feature_requests
  set description = v_target.description
    || E'\n\n---\nMerged: '
    || v_source.title
    || E'\n'
    || v_source.description
  where id = p_target_id;

  insert into write.feature_request_votes (feature_request_id, user_id)
  select p_target_id, user_id
  from write.feature_request_votes
  where feature_request_id = p_source_id
  on conflict (feature_request_id, user_id) do nothing;

  delete from write.feature_requests where id = p_source_id;
end;
$$;

grant execute on function write.list_feature_requests() to authenticated;
grant execute on function write.merge_feature_requests(uuid, uuid) to authenticated;

insert into write.schema_migrations (version, name)
values ('016', 'feature_requests')
on conflict (version) do nothing;
