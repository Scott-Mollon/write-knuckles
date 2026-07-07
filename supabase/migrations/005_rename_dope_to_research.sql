-- Rename dope_items to research_items (The Dope → Research)
-- Run this if you already applied 001 with write.dope_items.

do $$
begin
  if not exists (
    select 1 from information_schema.tables
    where table_schema = 'write' and table_name = 'dope_items'
  ) then
    raise notice '005 skipped: write.dope_items not found (fresh 001 install or already migrated)';
    return;
  end if;

  if exists (
    select 1 from information_schema.tables
    where table_schema = 'write' and table_name = 'research_items'
  ) then
    raise notice '005 skipped: write.research_items already exists';
    return;
  end if;

  drop policy if exists "Users manage own dope_items" on write.dope_items;
  drop policy if exists "Approved users manage own dope_items" on write.dope_items;
  drop trigger if exists dope_items_updated_at on write.dope_items;

  alter table write.dope_items rename to research_items;

  create trigger research_items_updated_at before update on write.research_items
    for each row execute function write.set_updated_at();

  create policy "Approved users manage own research_items" on write.research_items
    for all using (write.is_approved_user() and auth.uid() = user_id)
    with check (write.is_approved_user() and auth.uid() = user_id);
end $$;

insert into write.schema_migrations (version, name)
values ('005', 'rename_dope_to_research')
on conflict (version) do nothing;
