-- Remove legacy write.schema_migrations tracking (replaced by Supabase CLI
-- supabase_migrations.schema_migrations).

drop table if exists write.schema_migrations;
