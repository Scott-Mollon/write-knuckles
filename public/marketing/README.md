# Place product screenshots here for the marketing landing page.

## Shot list (must match filenames exactly)

### Hero (crossfade)
| File | Shot |
|------|------|
| `hero-cockpit.png` | **Prose** Write mode: Rack \| TipTap prose \| Inspector (dark theme), ~1920×1080+ |
| `hero-cockpit-comic.png` | **Comic script** Write mode: Issues/Pages Rack \| script editor (panels/dialogue/SFX visible) \| Inspector (dark theme), same crop/framing as prose hero |

The landing hero slowly crossfades between these two when both files exist. Match framing so the fade feels like the same desk switching Tale types.

### Feature sections
| File | Shot |
|------|------|
| `feature-rack.png` | Rack with several chapters/scenes, one selected *(optional: a second comic Rack shot later)* |
| `feature-editor.png` | Editor toolbar, drop cap or divider, word count / "Locked in." |
| `feature-comic-script.png` | Comic script page: panel indicators, dialogue, SFX; script toolbar visible |
| `feature-story-board.png` | Story Board By Chapter with status-colored cards |
| `feature-beat-sheet.png` | Beat Sheet timeline, linked scene chips, word bars |
| `feature-research.png` | Research Characters or Locations with tags |
| `feature-search.png` | Search results with snippets |
| `feature-compile.png` | Compile modal: scope/settings + manuscript preview |

## Tips

- Use a demo Tale with realistic pulp titles; crop or hide NavBar email
- Prefer PNG; hero works best at ~2400px wide for Retina
- Keep prose and comic hero shots at the **same aspect ratio and roughly the same UI chrome position** so the crossfade does not jump
- Prefer dark editor theme for brand match

## Demo data

Run `supabase/seeds/sample_maltese_falcon.sql` (see `supabase/seeds/README.md`) for prose shots.

For comic: create a Comic Script Tale with a few Issues/Pages, fill panel descriptions and dialogue, then capture hero + `feature-comic-script.png` + `feature-compile.png`.
