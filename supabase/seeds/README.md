# Write Knuckles sample seeds

Optional demo data for marketing screenshots, walkthroughs, and compile stress-testing. These are **not** migrations.

### Preconditions (all seeds)

1. Migrations applied through compile migration (`drop_tale_exports`)
2. Target email exists in `auth.users`
3. Same email is on `write.approved_users` with `revoked_at is null`

---

## The Maltese Falcon (marketing)

Script: [`sample_maltese_falcon.sql`](sample_maltese_falcon.sql)

Public-domain sample (Dashiell Hammett, *The Maltese Falcon*, 1930 — US PD) with:

- Tale on **Save the Cat** (copied into `tale_beats`)
- 4 chapters / 15 scenes (rich Chapter 1 prose + skeleton later chapters)
- All 15 STC beats linked
- Characters, locations, research items, and scene reference links

### Run

1. Open [`sample_maltese_falcon.sql`](sample_maltese_falcon.sql)
2. Change `owner_email` in the `do $$` block to your approved user email
3. Paste into the Supabase **SQL Editor** and Run
4. Sign in → open **The Maltese Falcon**

Re-running for the same user+title deletes the previous seed tale (CASCADE) and inserts fresh.

### Delete

```sql
delete from write.tales
where title = 'The Maltese Falcon'
  and user_id = (select id from auth.users where lower(email) = lower('YOU@EXAMPLE.COM'));
```

### Regenerate

```bash
python supabase/seeds/_gen_maltese_falcon.py
```

---

## The Maltese Falcon (Full) — compile stress test

Generator: [`_gen_maltese_falcon_full.py`](_gen_maltese_falcon_full.py)

Complete novel (~67k words) for realistic compile / pagination testing:

| | Marketing seed | Full seed |
|--|----------------|-----------|
| Title | `The Maltese Falcon` | `The Maltese Falcon (Full)` |
| Words | ~3–5k | ~67k |
| Chapters / scenes | 4 / 15 | 20 / ~65 |
| Beats / research | Full STC + refs | Tale + beats only |
| Formatting | Drop caps, light | Drop caps, bold/italic, fonts, dividers, align, indent |

Source: Project Gutenberg [#77600](https://www.gutenberg.org/ebooks/77600) — bundled as [`sources/maltese_falcon.txt`](sources/maltese_falcon.txt).

The generated SQL file (`sample_maltese_falcon_full.sql`, ~1.1 MB) is **gitignored** — too large for the Supabase SQL Editor.

### Run (recommended)

Requires `SUPABASE_SERVICE_ROLE_KEY` in `.env.development` (or pass `--service-key`). `VITE_SUPABASE_URL` is read automatically.

```bash
python supabase/seeds/_gen_maltese_falcon_full.py --insert
python supabase/seeds/_gen_maltese_falcon_full.py --insert --email you@example.com
python supabase/seeds/_gen_maltese_falcon_full.py --insert --download   # refresh from Gutenberg
```

Inserts in batches via the Supabase REST API (service role). Re-running deletes the prior `The Maltese Falcon (Full)` tale for that user (CASCADE) and inserts fresh.

Then open **The Maltese Falcon (Full)** → Compile with full scope.

### Optional: SQL file for psql

```bash
python supabase/seeds/_gen_maltese_falcon_full.py --write-sql
psql "$DATABASE_URL" -f supabase/seeds/sample_maltese_falcon_full.sql
```

Do **not** paste the SQL file into the Supabase SQL Editor — it exceeds the request size limit.

### Delete

```sql
delete from write.tales
where title = 'The Maltese Falcon (Full)'
  and user_id = (select id from auth.users where lower(email) = lower('YOU@EXAMPLE.COM'));
```

### Compile testing tips

- Compile **full tale** with cover off first (baseline timing)
- Then enable **include cover** / **include images** if you add test scene images
- Use Print → Save as PDF from the compile viewer for a paginated file

---

## Marketing screenshots

See [`public/marketing/README.md`](../../public/marketing/README.md). Use the **marketing** seed, not the full seed, for UI shots.
