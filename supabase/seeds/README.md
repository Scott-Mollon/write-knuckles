# Write Knuckles sample seeds

Optional demo data for marketing screenshots and local walkthroughs. These are **not** migrations — they do not touch `write.schema_migrations`.

## The Maltese Falcon

Script: [`sample_maltese_falcon.sql`](sample_maltese_falcon.sql)

Public-domain sample (Dashiell Hammett, *The Maltese Falcon*, 1930 — US PD) with:

- Tale on **Save the Cat** (copied into `tale_beats`)
- 4 chapters / 15 scenes (rich Chapter 1 prose + skeleton later chapters)
- All 15 STC beats linked
- Characters, locations, research items, and scene reference links

### Preconditions

1. Migrations `001`–`007` applied
2. Target email exists in `auth.users`
3. Same email is on `write.approved_users` with `revoked_at is null`

### Run

1. Open [`sample_maltese_falcon.sql`](sample_maltese_falcon.sql)
2. Change `owner_email` near the top of the `do $$` block from `YOU@EXAMPLE.COM` to your approved user email
3. Paste the full script into the Supabase **SQL Editor** and Run
4. Sign in as that user → open **The Maltese Falcon**

Re-running for the same user+title deletes the previous seed tale (CASCADE) and inserts a fresh copy.

### Suggested screenshots

| Asset | Where to look |
|-------|----------------|
| `hero-cockpit.png` / `feature-editor.png` | Chapter 1 → **Spade & Archer** (drop cap + full prose) |
| `feature-rack.png` | Four chapters expanded in the Rack |
| `feature-story-board.png` | Story Board By Chapter (mixed Raw→Final cards) |
| `feature-beat-sheet.png` | Beat Sheet — all 15 beats linked |
| `feature-research.png` | Research → Characters or Locations (tags) |
| `feature-search.png` | Search for `Wonderly` or `falcon` |

Crop or hide the NavBar email before publishing shots. See also [`public/marketing/README.md`](../../public/marketing/README.md).

### Delete

```sql
delete from write.tales
where title = 'The Maltese Falcon'
  and user_id = (select id from auth.users where lower(email) = lower('YOU@EXAMPLE.COM'));
```

### Regenerating the SQL

If you need to rebuild the TipTap JSON / word counts:

```bash
python supabase/seeds/_gen_maltese_falcon.py
```

That overwrites `sample_maltese_falcon.sql`.
