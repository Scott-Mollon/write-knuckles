-- Remove unused print_runs placeholder (compile flow does not use it).

drop policy if exists "Approved users manage own print_runs" on write.print_runs;
drop table if exists write.print_runs cascade;
