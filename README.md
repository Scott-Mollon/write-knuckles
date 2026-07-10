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

2. Apply database migrations with the [Supabase CLI](https://supabase.com/docs/guides/cli):

```bash
supabase login
supabase link --project-ref rjquutusbwfrfpbwrxxd
supabase db push
```

   For local development (requires Docker):

```bash
supabase start
supabase db reset
```

   Then add yourself to the invite list (replace with your email):

```sql
insert into write.approved_users (email, notes)
values ('you@example.com', 'Founder');
```

   Manage approvals in the app at `/admin/access` (magazine admins only).

3. In Supabase dashboard → **Project Settings → API → Exposed schemas**, add `write` alongside `public`.

4. Install and run:

```bash
npm install
npm run dev
```

App runs at http://localhost:5174

## Database migrations

Migrations live in `supabase/migrations/` and are applied with the Supabase CLI. Legacy SQL Editor migrations (`001`–`016`) are archived in `supabase/migrations_legacy/`.

**Check what's deployed:**

```bash
supabase migration list
```

**Add a new migration:**

```bash
supabase migration new your_change_description
# edit the new file, then:
supabase db reset    # test locally
supabase db push     # deploy to remote
```

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
