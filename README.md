# Write Knuckles

The back room where pulp gets written — a Scrivener-style writing app for [Bronze Knuckles Magazine](https://bronzeknucklesmagazine.com).

## Stack

- React 19 + Vite 7 + JavaScript
- Tailwind CSS + SCSS (auth pages)
- Supabase (shared with magazine site)
- TanStack Query

## Setup

1. Copy `.env.example` to `.env.development` and fill in your Supabase credentials (same project as bronze-knuckles):

```
VITE_SUPABASE_URL=https://rjquutusbwfrfpbwrxxd.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_APP_URL=http://localhost:5174
VITE_COOKIE_DOMAIN=.bronzeknucklesmagazine.com
```

2. Run the database migration in Supabase SQL Editor:

```
supabase/migrations/010_write_knuckles_bootstrap.sql
```

   **New instance:** run only `010` — it creates the full `write` schema in one step.

   **Existing databases** on the incremental chain (`001`–`010`) should keep applying only the migrations they are missing. Do not run `010` on top of `001`–`009`.

   After `010`, apply any newer incremental migrations (e.g. `011`–`013` for image support).

   Then add yourself to the invite list (replace with your email):

```sql
insert into write.approved_users (email, notes)
values ('you@example.com', 'Founder');
```

   Manage approvals in the app at `/admin/access` (magazine admins only).

   Verify applied migrations:

```sql
select * from write.schema_migrations order by version;
```

3. In Supabase dashboard → **Project Settings → API → Exposed schemas**, add `write` alongside `public`.

4. Install and run:

```bash
npm install
npm run dev
```

App runs at http://localhost:5174

## Database migrations

**Fresh install:** run only `010_write_knuckles_bootstrap.sql`.

**Incremental upgrades:** `001`–`013` are the historical chain for the shared Bronze Knuckles database. Check `write.schema_migrations` to see which versions are already applied. Do not run `010` on a database that already went through `001`–`009`.

Each migration records itself in `write.schema_migrations` when it completes:

| Column | Meaning |
|--------|---------|
| `version` | Numeric prefix from the filename (`001`, `002`, …) |
| `name` | Short slug for the migration |
| `applied_at` | When it was recorded |

**Check what's deployed:**

```sql
select * from write.schema_migrations order by version;
```

**Adding a new migration** — create `002_something.sql` and end the file with:

```sql
insert into write.schema_migrations (version, name)
values ('002', 'something')
on conflict (version) do nothing;
```

The migrations table is not exposed to client apps (RLS enabled, no policies).

## Production SSO

For single sign-on across `bronzeknucklesmagazine.com` and `write.bronzeknucklesmagazine.com`:

1. Set `VITE_COOKIE_DOMAIN=.bronzeknucklesmagazine.com` in both apps
2. Add Write Knuckles URLs to Supabase Auth redirect allowlist
3. Both apps use the shared `authStorage` cookie strategy (see `src/lib/authStorage.js`)

## Phase 1 Status

- [x] M1: Scaffold, auth, migrations, dashboard, New Tale wizard
- [x] M1: Tale editor shell (Write / Story Board / Beat Sheet views)
- [ ] M2: TipTap editor, autosave, Rack drag-reorder
- [ ] M3: Beat linking UI, scene editing
- [ ] M4: Characters, Locations, Research
- [ ] M5: Grammar check, export, deploy
