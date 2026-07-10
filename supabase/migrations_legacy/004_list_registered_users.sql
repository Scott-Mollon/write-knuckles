-- Admin-only view of registered auth users for Write Knuckles access management

create or replace function write.list_registered_users()
returns table (
  user_id uuid,
  email text,
  created_at timestamptz,
  last_sign_in_at timestamptz
)
language plpgsql
security definer
set search_path = auth, public, write
as $$
begin
  if not exists (
    select 1 from public."Admins" a where a.admin_id = auth.uid()
  ) then
    raise exception 'Not authorized';
  end if;

  return query
    select
      u.id,
      u.email::text,
      u.created_at,
      u.last_sign_in_at
    from auth.users u
    where u.email is not null
    order by u.created_at desc;
end;
$$;

grant execute on function write.list_registered_users() to authenticated;

insert into write.schema_migrations (version, name)
values ('004', 'list_registered_users')
on conflict (version) do nothing;
