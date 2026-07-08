---
name: Sample Tale Seed
overview: Add a runnable SQL seed that inserts a marketing-ready The Maltese Falcon sample tale (rich Chapter 1 + skeleton Chapters 2–4) with Save the Cat beats, characters, locations, research, and scene links — owned by a configurable approved auth user.
todos:
  - id: seed-sql
    content: Create supabase/seeds/sample_maltese_falcon.sql with full sample dataset
    status: completed
  - id: seed-readme
    content: Create supabase/seeds/README.md with run/delete instructions
    status: completed
  - id: marketing-readme
    content: Point public/marketing/README.md at the seed for screenshot tips
    status: completed
isProject: false
---

# Sample Tale Seed — The Maltese Falcon

## Choices locked in

- **Story:** Dashiell Hammett, *The Maltese Falcon* (1929) — US public domain
- **Scope:** Rich **Chapter 1** (full prose + links) + skeleton **Chapters 2–4** so Rack, Story Board, and Save the Cat look populated for marketing screenshots listed in [public/marketing/README.md](c:\Users\scott\Documents\code\write-knuckles\public\marketing\README.md)

## Deliverables

1. [supabase/seeds/sample_maltese_falcon.sql](c:\Users\scott\Documents\code\write-knuckles\supabase\seeds\sample_maltese_falcon.sql) — single SQL Editor script
2. [supabase/seeds/README.md](c:\Users\scott\Documents\code\write-knuckles\supabase\seeds\README.md) — how to run / re-run / delete
3. Small note in [public/marketing/README.md](c:\Users\scott\Documents\code\write-knuckles\public\marketing\README.md) pointing at the seed

Not a numbered migration (no `write.schema_migrations` bump) — this is optional demo data.

## How the seed runs

Run in **Supabase SQL Editor** (

).

Postgres SQL Editor does not support `\set`; use a CTE config block:

```sql
with cfg as (
  select
    u.id as user_id,
    bt.id as beat_template_id,
    bt.structure as beats
  from auth.users u
  cross join write.beat_templates bt
  where lower(u.email) = lower('YOU@EXAMPLE.COM')  -- <-- edit this
    and bt.slug = 'save-the-cat'
    and bt.user_id is null
)
-- ... inserts using cfg.user_id / beat_template_id / beats
```

**Preconditions:**

- Migrations `001`–`007` applied
- Target email exists in `auth.users`
- Target email is on `write.approved_users` (unrevoked)

**Idempotency:** delete any prior seed tale for that user titled `The Maltese Falcon` (cascade removes children), then insert fresh. Marker comment `-- SAMPLE SEED: maltese-falcon` at top.

## Tale metadata

- title: `The Maltese Falcon`
- subtitle: `A Sam Spade Case`
- genre: `Pulp`
- target_word_count: `80000`
- beat_template_id: system `save-the-cat`
- tale_beats.beats: copy of that template `structure` JSON

## Structure and beat mapping

```mermaid
flowchart TD
  tale[Tale Maltese Falcon]
  tb[tale_beats Save the Cat]
  ch1[Chapter 1 A Woman Calls]
  ch2[Chapter 2 Partners End]
  ch3[Chapter 3 The Black Bird]
  ch4[Chapter 4 Gutman]
  tale --> tb
  tale --> ch1
  tale --> ch2
  tale --> ch3
  tale --> ch4
  ch1 --> s1a[Opening Image scene]
  ch1 --> s1b[Theme Stated]
  ch1 --> s1c[Setup]
  ch1 --> s1d[Catalyst]
  ch1 --> s1e[Debate]
  ch2 --> s2[Break into Two]
  ch3 --> mid[Fun and Games through All Is Lost]
  ch4 --> end[Break into Three through Final Image]
```



### Chapter 1 — A Woman Calls (rich)

Five scenes for STC Act 1 (`stc_01`–`stc_05`), mixed statuses/colors from [src/constants/taleEditor.js](c:\Users\scott\Documents\code\write-knuckles\src\constants\taleEditor.js):

- **Spade & Archer** — Opening Image — Final — full TipTap prose (~250–400 words PD), drop cap, `plain_text` + `word_count`
- **Miss Wonderly** — Theme Stated — Rewritten — full prose + synopsis
- **The Story She Spun** — Setup — Drafted — full prose + synopsis
- **Five Thousand Dollars** — Catalyst — Drafted — full prose + synopsis
- **Taking the Case** — Debate — Raw — synopsis + shorter draft

TipTap shape uses `paragraph` + `attrs.dropCap: true` on the first paragraph.

### Chapters 2–4 — skeleton

- **2. Partners End** — Miles Goes Out; Crossing the Line → `stc_06`, `stc_07`
- **3. The Black Bird** — five scenes → `stc_08`–`stc_12`
- **4. Gutman** — three scenes → `stc_13`–`stc_15`

Skeleton scenes: synopsis + status/color mix; empty or 1-paragraph body. All 15 beats linked via `beat_links`.

## Reference desk

**Characters (~8):** Sam Spade, Miles Archer, Brigid O'Shaughnessy, Effie Perine, Joel Cairo, Casper Gutman, Wilmer Cook, Detective Polhaus (and optionally Lt. Dundy) — with roles, tags, `bio.summary`.

**Locations (~5–6):** Spade & Archer's Office, Hotel Belvedere, Geary Street Flat, Gutman's Suite, San Francisco Docks — with tags/descriptions.

**Research (~4):** falcon tribute history, 1920s SF detectives, city geography, alias list.

**Scene links:** Chapter 1 scenes fully linked to characters/locations; sprinkle Ch.2–3 links for Inspector shots.

## Insert order (one transaction)

1. Resolve `user_id` + Save the Cat template
2. Delete prior same-titled seed for that user
3. `tales` → `tale_beats`
4. `chapters` → `scenes`
5. `characters`, `locations`, `research_items`
6. `beat_links`
7. `scene_character_links`, `scene_location_links`

## Out of scope

No app UI changes, no `print_runs`, no beat template edits, no auto-run from migrations.