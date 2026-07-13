#!/usr/bin/env python3
"""Generate / insert full Maltese Falcon export stress-test seed.

Source: Project Gutenberg #77600 (Dashiell Hammett, The Maltese Falcon, 1930 — US PD).
Bundled text: sources/maltese_falcon.txt (or fetch with --download).

Usage:
  python supabase/seeds/_gen_maltese_falcon_full.py --insert
  python supabase/seeds/_gen_maltese_falcon_full.py --insert --email you@example.com
  python supabase/seeds/_gen_maltese_falcon_full.py --write-sql   # optional ~1.1 MB SQL for psql
"""
from __future__ import annotations

import argparse
import json
import os
import re
import sys
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path

DEFAULT_OWNER_EMAIL = "scottmollon@gmail.com"
TALE_TITLE = "The Maltese Falcon (Full)"
WORDS_PER_SCENE = 2500
GUTENBERG_URL = "https://www.gutenberg.org/cache/epub/77600/pg77600.txt"

# TipTap font-family values (matches src/constants/sceneFonts.js)
SCENE_FONTS = [
    "",
    '"EB Garamond", Garamond, serif',
    "Literata, Georgia, serif",
    "Lora, Georgia, serif",
    '"Libre Baskerville", Baskerville, serif',
    '"Crimson Pro", Georgia, serif',
    "Merriweather, Georgia, serif",
    "Georgia, serif",
]

ORNAMENT_RE = re.compile(r"^\*(\s+\*)+$")
CHAPTER_NUM_RE = re.compile(r"^\d{1,2}$")


def sql_str(s: str) -> str:
    return "'" + s.replace("'", "''") + "'"


def sql_json(obj) -> str:
    return sql_str(json.dumps(obj, ensure_ascii=False, separators=(",", ":")))


def word_count(text: str) -> int:
    return len(re.findall(r"\S+", text))


def load_source_text(path: Path, download: bool) -> str:
    if download or not path.is_file():
        print(f"Downloading {GUTENBERG_URL} …")
        with urllib.request.urlopen(GUTENBERG_URL, timeout=120) as resp:
            data = resp.read()
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_bytes(data)
        print(f"Saved {path} ({len(data):,} bytes)")
    return path.read_text(encoding="utf-8")


def strip_gutenberg_wrapper(text: str) -> str:
    start = text.find("*** START OF THE PROJECT GUTENBERG EBOOK")
    end = text.find("*** END OF THE PROJECT GUTENBERG EBOOK")
    if start == -1 or end == -1:
        raise ValueError("Could not find Gutenberg start/end markers in source text.")
    start = text.find("\n", start) + 1
    return text[start:end]


def is_chapter_title_line(line: str) -> bool:
    stripped = line.strip()
    if not stripped or len(stripped) < 4 or len(stripped) > 55:
        return False
    if ORNAMENT_RE.match(stripped):
        return False
    if CHAPTER_NUM_RE.match(stripped):
        return False
    if stripped.startswith("[") or stripped.startswith("TO "):
        return False
    if "COPYRIGHT" in stripped or "Knopf" in stripped or stripped == "NEW YORK":
        return False
    letters = re.sub(r"[^A-Za-z]", "", stripped)
    if len(letters) < 3:
        return False
    upper_ratio = sum(1 for c in letters if c.isupper()) / len(letters)
    return upper_ratio > 0.8


def parse_chapters(body: str) -> list[tuple[int, str, list[str]]]:
    """Return list of (chapter_number, title, paragraphs)."""
    lines = body.splitlines()
    chapters: list[tuple[int, str, list[str]]] = []
    i = 0
    n = len(lines)

    def flush_paragraph(buf: list[str], paragraphs: list[str]) -> None:
        if not buf:
            return
        text = " ".join(part.strip() for part in buf if part.strip())
        text = re.sub(r"\s+", " ", text).strip()
        if text:
            paragraphs.append(text)

    while i < n:
        stripped = lines[i].strip()
        if CHAPTER_NUM_RE.match(stripped):
            num = int(stripped)
            j = i + 1
            while j < n and not lines[j].strip():
                j += 1
            if j < n and is_chapter_title_line(lines[j]):
                title = lines[j].strip().title() if lines[j].strip().isupper() else lines[j].strip()
                # Keep classic title casing from source when ALL CAPS
                if lines[j].strip().isupper():
                    title = lines[j].strip().title()
                    # Fix small words? "In The" - keep simple title()
                k = j + 1
                paragraphs: list[str] = []
                buf: list[str] = []
                while k < n:
                    line = lines[k]
                    s = line.strip()
                    if CHAPTER_NUM_RE.match(s):
                        nxt = k + 1
                        while nxt < n and not lines[nxt].strip():
                            nxt += 1
                        if nxt < n and is_chapter_title_line(lines[nxt]):
                            flush_paragraph(buf, paragraphs)
                            chapters.append((num, title, paragraphs))
                            i = k
                            break
                    if not s:
                        flush_paragraph(buf, paragraphs)
                        buf = []
                    elif ORNAMENT_RE.match(s):
                        paragraphs.append("__DIVIDER__")
                    else:
                        buf.append(s)
                    k += 1
                else:
                    flush_paragraph(buf, paragraphs)
                    chapters.append((num, title, paragraphs))
                    return chapters
                continue
        i += 1

    raise ValueError("No chapters parsed — check source format.")


def split_scenes(paragraphs: list[str], target_words: int) -> list[list[str]]:
    scenes: list[list[str]] = []
    current: list[str] = []
    count = 0
    for para in paragraphs:
        if para == "__DIVIDER__":
            if current:
                scenes.append(current)
                current = []
                count = 0
            continue
        w = word_count(para)
        if current and count + w > target_words and count > 800:
            scenes.append(current)
            current = [para]
            count = w
        else:
            current.append(para)
            count += w
    if current:
        scenes.append(current)
    return scenes


def text_node(text: str, marks: list[dict] | None = None) -> dict:
    node: dict = {"type": "text", "text": text}
    if marks:
        node["marks"] = marks
    return node


def apply_emphasis_marks(text: str, para_index: int) -> list[dict]:
    """Light formatting so exports exercise bold/italic/font paths."""
    marks: list[dict] = []
    font = SCENE_FONTS[para_index % len(SCENE_FONTS)]
    if font:
        marks.append({"type": "textStyle", "attrs": {"fontFamily": font}})

    # Italicize occasional short emphasis phrases
    if para_index % 11 == 3:
        m = re.search(r"\b(Yes|No|Perhaps|Suddenly|Certainly)\b", text)
        if m:
            before, mid, after = text[: m.start()], m.group(1), text[m.end() :]
            nodes: list[dict] = []
            if before:
                nodes.append(text_node(before, marks.copy() if marks else None))
            italic_marks = marks + [{"type": "italic"}]
            nodes.append(text_node(mid, italic_marks))
            if after:
                nodes.append(text_node(after, marks.copy() if marks else None))
            return nodes  # type: ignore[return-value]

    # Bold a proper name early in paragraph
    if para_index % 9 == 1:
        m = re.search(r"\b(Spade|Brigid|Gutman|Cairo|Archer|Effie)\b", text)
        if m:
            before, mid, after = text[: m.start()], m.group(1), text[m.end() :]
            nodes = []
            if before:
                nodes.append(text_node(before, marks.copy() if marks else None))
            bold_marks = marks + [{"type": "bold"}]
            nodes.append(text_node(mid, bold_marks))
            if after:
                nodes.append(text_node(after, marks.copy() if marks else None))
            return nodes  # type: ignore[return-value]

    return [text_node(text, marks or None)]


def paragraph_to_node(para: str, para_index: int, is_first: bool) -> dict:
    content = apply_emphasis_marks(para, para_index)
    if isinstance(content, dict):
        content = [content]
    attrs: dict = {}
    if is_first:
        attrs["dropCap"] = True
    if para_index % 17 == 5:
        attrs["textAlign"] = "center"
    if para_index % 23 == 7:
        attrs["indent"] = 1
    node: dict = {"type": "paragraph", "content": content}
    if attrs:
        node["attrs"] = attrs
    return node


def scene_to_doc(paragraphs: list[str], scene_index: int) -> tuple[dict, str, int]:
    nodes: list[dict] = []
    if scene_index > 0:
        nodes.append({"type": "sceneDivider"})
    plain_parts: list[str] = []
    for i, para in enumerate(paragraphs):
        nodes.append(paragraph_to_node(para, i + scene_index * 3, is_first=(i == 0)))
        plain_parts.append(para)
    plain = "\n\n".join(plain_parts)
    doc = {"type": "doc", "content": nodes}
    return doc, plain, word_count(plain)


def slug_key(prefix: str, *parts: str) -> str:
    raw = "_".join(parts)
    slug = re.sub(r"[^a-z0-9]+", "_", raw.lower()).strip("_")
    return f"{prefix}_{slug}"[:48]


def chapter_synopsis(ch_num: int, ch_title: str, scenes: list[list[str]]) -> str:
    ch_words = sum(word_count(p) for scene in scenes for p in scene)
    scene_label = "scene" if len(scenes) == 1 else "scenes"
    return f"Chapter {ch_num}: {ch_title} (~{ch_words:,} words, {len(scenes)} {scene_label})"


def scene_row(ch_num: int, ch_title: str, scenes: list[list[str]], s_idx: int, scene_paras: list[str]) -> dict:
    doc, plain, words = scene_to_doc(scene_paras, s_idx)
    scene_title = ch_title if len(scenes) == 1 else f"{ch_title} ({s_idx + 1})"
    status = "Final" if ch_num <= 5 else "Rewritten" if ch_num <= 12 else "Drafted"
    color = "#938938" if ch_num <= 7 else "#3d5a80" if ch_num <= 15 else "#c87533"
    synopsis = plain[:180] + ("…" if len(plain) > 180 else "")
    return {
        "title": scene_title,
        "sort_order": s_idx,
        "scene_color": color,
        "scene_status": status,
        "synopsis": synopsis,
        "content": doc,
        "plain_text": plain,
        "word_count": words,
    }


def build_seed_payload(owner_email: str, chapters_data: list[tuple[int, str, list[list[str]]]]) -> dict:
    chapters: list[dict] = []
    for ch_num, ch_title, scenes in chapters_data:
        chapters.append(
            {
                "number": ch_num,
                "title": ch_title,
                "sort_order": ch_num - 1,
                "synopsis": chapter_synopsis(ch_num, ch_title, scenes),
                "scenes": [scene_row(ch_num, ch_title, scenes, s_idx, paras) for s_idx, paras in enumerate(scenes)],
            }
        )
    total_words = sum(scene["word_count"] for chapter in chapters for scene in chapter["scenes"])
    return {
        "owner_email": owner_email,
        "tale": {
            "title": TALE_TITLE,
            "subtitle": "A Sam Spade Case",
            "author": "Dashiell Hammett",
            "genre": "Pulp",
            "target_word_count": total_words,
        },
        "chapters": chapters,
        "stats": {
            "chapters": len(chapters),
            "scenes": sum(len(chapter["scenes"]) for chapter in chapters),
            "words": total_words,
        },
    }


def load_dotenv_file(path: Path) -> dict[str, str]:
    if not path.is_file():
        return {}
    env: dict[str, str] = {}
    for line in path.read_text(encoding="utf-8").splitlines():
        stripped = line.strip()
        if not stripped or stripped.startswith("#") or "=" not in stripped:
            continue
        key, _, value = stripped.partition("=")
        env[key.strip()] = value.strip().strip('"').strip("'")
    return env


def resolve_supabase_config(url: str | None, service_key: str | None) -> tuple[str, str]:
    repo_root = Path(__file__).resolve().parents[2]
    file_env: dict[str, str] = {}
    for name in (".env.development", ".env"):
        file_env.update(load_dotenv_file(repo_root / name))

    resolved_url = url or os.environ.get("SUPABASE_URL") or file_env.get("SUPABASE_URL") or file_env.get("VITE_SUPABASE_URL")
    resolved_key = (
        service_key
        or os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
        or file_env.get("SUPABASE_SERVICE_ROLE_KEY")
    )
    if not resolved_url or not resolved_key:
        raise RuntimeError(
            "Supabase credentials required for --insert. Set SUPABASE_URL (or VITE_SUPABASE_URL) and "
            "SUPABASE_SERVICE_ROLE_KEY in the environment, .env.development, or pass --url / --service-key."
        )
    return resolved_url.rstrip("/"), resolved_key


class SupabaseSeeder:
    """Insert seed rows via Supabase REST + Auth Admin APIs (service role)."""

    def __init__(self, url: str, service_key: str) -> None:
        self.url = url.rstrip("/")
        self.service_key = service_key

    def _request(
        self,
        method: str,
        path: str,
        *,
        profile: str | None = "write",
        prefer: str | None = None,
        params: dict[str, str] | None = None,
        body: object | None = None,
        timeout: int = 180,
    ) -> object | None:
        query = f"?{urllib.parse.urlencode(params)}" if params else ""
        headers = {
            "apikey": self.service_key,
            "Authorization": f"Bearer {self.service_key}",
        }
        if profile:
            headers["Accept-Profile"] = profile
            headers["Content-Profile"] = profile
        if prefer:
            headers["Prefer"] = prefer
        payload = None
        if body is not None:
            headers["Content-Type"] = "application/json"
            payload = json.dumps(body).encode("utf-8")
        req = urllib.request.Request(
            f"{self.url}{path}{query}",
            data=payload,
            headers=headers,
            method=method,
        )
        try:
            with urllib.request.urlopen(req, timeout=timeout) as resp:
                raw = resp.read()
                if not raw:
                    return None
                return json.loads(raw.decode("utf-8"))
        except urllib.error.HTTPError as exc:
            detail = exc.read().decode("utf-8", errors="replace")
            raise RuntimeError(f"{method} {path} failed ({exc.code}): {detail}") from exc

    def resolve_user_id(self, email: str) -> str:
        rows = self._request(
            "GET",
            "/rest/v1/approved_users",
            params={
                "select": "user_id,email",
                "revoked_at": "is.null",
                "email": f"ilike.{email}",
                "limit": "5",
            },
        )
        for row in rows or []:
            if row.get("user_id") and str(row.get("email", "")).lower() == email.lower():
                return row["user_id"]

        # GoTrue filter values with @ must be quoted or the address is parsed incorrectly.
        data = self._request(
            "GET",
            "/auth/v1/admin/users",
            profile=None,
            params={"filter": f'email.eq."{email}"'},
        )
        users = (data or {}).get("users") or []
        for user in users:
            if str(user.get("email", "")).lower() == email.lower():
                return user["id"]
        raise RuntimeError(f"Seed aborted: no auth.users row for {email}")

    def assert_approved(self, email: str, user_id: str) -> None:
        rows = self._request(
            "GET",
            "/rest/v1/approved_users",
            params={
                "select": "id",
                "revoked_at": "is.null",
                "or": f"(user_id.eq.{user_id},email.ilike.{email})",
                "limit": "1",
            },
        )
        if not rows:
            raise RuntimeError(f"Seed aborted: {email} is not on write.approved_users (unrevoked)")

    def get_beat_template(self) -> tuple[str, object]:
        rows = self._request(
            "GET",
            "/rest/v1/beat_templates",
            params={
                "select": "id,structure",
                "slug": "eq.save-the-cat",
                "user_id": "is.null",
                "limit": "1",
            },
        )
        if not rows:
            raise RuntimeError("Seed aborted: system beat template save-the-cat not found (run migrations)")
        return rows[0]["id"], rows[0]["structure"]

    def delete_existing_tale(self, user_id: str, title: str) -> None:
        self._request(
            "DELETE",
            "/rest/v1/tales",
            params={"user_id": f"eq.{user_id}", "title": f"eq.{title}"},
        )

    def insert_tale(self, user_id: str, tale: dict, beat_template_id: str) -> str:
        rows = self._request(
            "POST",
            "/rest/v1/tales",
            prefer="return=representation",
            body=[
                {
                    "user_id": user_id,
                    "title": tale["title"],
                    "subtitle": tale["subtitle"],
                    "author": tale["author"],
                    "genre": tale["genre"],
                    "target_word_count": tale["target_word_count"],
                    "beat_template_id": beat_template_id,
                }
            ],
        )
        return rows[0]["id"]

    def insert_tale_beats(self, tale_id: str, beat_template_id: str, beats: object) -> None:
        self._request(
            "POST",
            "/rest/v1/tale_beats",
            body=[{"tale_id": tale_id, "beat_template_id": beat_template_id, "beats": beats}],
        )

    def insert_chapter(self, tale_id: str, user_id: str, chapter: dict) -> str:
        rows = self._request(
            "POST",
            "/rest/v1/chapters",
            prefer="return=representation",
            body=[
                {
                    "tale_id": tale_id,
                    "user_id": user_id,
                    "title": chapter["title"],
                    "sort_order": chapter["sort_order"],
                    "synopsis": chapter["synopsis"],
                }
            ],
        )
        return rows[0]["id"]

    def insert_scenes(self, rows: list[dict]) -> None:
        self._request("POST", "/rest/v1/scenes", body=rows)


def insert_seed(
    payload: dict,
    *,
    url: str,
    service_key: str,
    batch_size: int = 5,
) -> str:
    seeder = SupabaseSeeder(url, service_key)
    email = payload["owner_email"]
    tale = payload["tale"]
    stats = payload["stats"]

    print(f"Resolving user {email} …")
    user_id = seeder.resolve_user_id(email)
    seeder.assert_approved(email, user_id)

    beat_template_id, beats = seeder.get_beat_template()

    print(f"Replacing prior tale {tale['title']!r} …")
    seeder.delete_existing_tale(user_id, tale["title"])

    print("Inserting tale + beats …")
    tale_id = seeder.insert_tale(user_id, tale, beat_template_id)
    seeder.insert_tale_beats(tale_id, beat_template_id, beats)

    scene_total = stats["scenes"]
    inserted_scenes = 0
    for chapter in payload["chapters"]:
        print(f"  Chapter {chapter['number']}: {chapter['title']} ({len(chapter['scenes'])} scenes)")
        chapter_id = seeder.insert_chapter(tale_id, user_id, chapter)
        pending: list[dict] = []
        for scene in chapter["scenes"]:
            pending.append(
                {
                    "chapter_id": chapter_id,
                    "tale_id": tale_id,
                    "user_id": user_id,
                    "title": scene["title"],
                    "sort_order": scene["sort_order"],
                    "scene_color": scene["scene_color"],
                    "scene_status": scene["scene_status"],
                    "synopsis": scene["synopsis"],
                    "content": scene["content"],
                    "plain_text": scene["plain_text"],
                    "word_count": scene["word_count"],
                }
            )
            if len(pending) >= batch_size:
                seeder.insert_scenes(pending)
                inserted_scenes += len(pending)
                print(f"    inserted {inserted_scenes}/{scene_total} scenes")
                pending = []
        if pending:
            seeder.insert_scenes(pending)
            inserted_scenes += len(pending)
            print(f"    inserted {inserted_scenes}/{scene_total} scenes")

    print(
      f"Seeded {tale['title']} (tale_id={tale_id}, "
      f"~{stats['words']:,} words, {stats['scenes']} scenes) for {email}"
    )
    return tale_id


def generate_sql(owner_email: str, chapters_data: list[tuple[int, str, list[list[str]]]]) -> str:
    payload = build_seed_payload(owner_email, chapters_data)
    total_words = payload["stats"]["words"]
    total_scenes = payload["stats"]["scenes"]

    lines: list[str] = []
    a = lines.append

    a("-- SAMPLE SEED: maltese-falcon-full")
    a("-- Export stress-test: complete Maltese Falcon (~67k words) with mixed TipTap formatting.")
    a("-- Source: Project Gutenberg #77600 — Dashiell Hammett (1930, US public domain).")
    a("--")
    a("-- HOW TO RUN")
    a("-- Preferred: python supabase/seeds/_gen_maltese_falcon_full.py --insert")
    a("-- Optional SQL: add --write-sql and run with psql (too large for SQL Editor).")
    a("-- 4. Export the full tale as PDF/DOCX/HTML to stress-test edge functions.")
    a("--")
    a(f"-- Stats: {len(chapters_data)} chapters, {total_scenes} scenes, ~{total_words:,} words")
    a("--")
    a("")

    a("do $$")
    a("declare")
    a(f"  owner_email text := {sql_str(owner_email)};")
    a("  v_user_id uuid;")
    a("  v_beat_template_id uuid;")
    a("  v_beats jsonb;")
    a("  v_tale_id uuid;")
    for ch_num, ch_title, scenes in chapters_data:
        a(f"  v_ch_{ch_num} uuid;")
        for s_idx, _scene in enumerate(scenes):
            a(f"  v_s_{ch_num}_{s_idx} uuid;")
    a("begin")
    a("  select u.id into v_user_id from auth.users u where lower(u.email) = lower(owner_email);")
    a("  if v_user_id is null then raise exception 'Seed aborted: no auth.users row for %', owner_email; end if;")
    a("  if not exists (")
    a("    select 1 from write.approved_users au")
    a("    where au.revoked_at is null and (au.user_id = v_user_id or lower(au.email) = lower(owner_email))")
    a("  ) then raise exception 'Seed aborted: % is not on write.approved_users', owner_email; end if;")
    a("  select bt.id, bt.structure into v_beat_template_id, v_beats")
    a("  from write.beat_templates bt where bt.slug = 'save-the-cat' and bt.user_id is null;")
    a("  if v_beat_template_id is null then raise exception 'Seed aborted: save-the-cat template missing'; end if;")
    a("  delete from write.tales where user_id = v_user_id and title = " + sql_str(TALE_TITLE) + ";")
    a("  insert into write.tales (user_id, title, subtitle, author, genre, target_word_count, beat_template_id)")
    a("  values (")
    a(f"    v_user_id, {sql_str(TALE_TITLE)}, 'A Sam Spade Case', 'Dashiell Hammett', 'Pulp', {total_words},")
    a("    v_beat_template_id")
    a("  ) returning id into v_tale_id;")
    a("  insert into write.tale_beats (tale_id, beat_template_id, beats) values (v_tale_id, v_beat_template_id, v_beats);")
    a("")

    for chapter in payload["chapters"]:
        ch_num = chapter["number"]
        ch_title = chapter["title"]
        a(f"  insert into write.chapters (tale_id, user_id, title, sort_order, synopsis)")
        a(f"  values (v_tale_id, v_user_id, {sql_str(ch_title)}, {chapter['sort_order']}, {sql_str(chapter['synopsis'])})")
        a(f"  returning id into v_ch_{ch_num};")
        a("")

        for s_idx, scene in enumerate(chapter["scenes"]):
            a(f"  insert into write.scenes (")
            a(f"    chapter_id, tale_id, user_id, title, sort_order,")
            a(f"    scene_color, scene_status, synopsis, content, plain_text, word_count")
            a(f"  ) values (")
            a(f"    v_ch_{ch_num}, v_tale_id, v_user_id, {sql_str(scene['title'])}, {scene['sort_order']},")
            a(f"    {sql_str(scene['scene_color'])}, {sql_str(scene['scene_status'])}, {sql_str(scene['synopsis'])},")
            a(f"    {sql_json(scene['content'])}::jsonb,")
            a(f"    {sql_str(scene['plain_text'])},")
            a(f"    {scene['word_count']}")
            a(f"  ) returning id into v_s_{ch_num}_{s_idx};")
            a("")

    a(f"  raise notice 'Seeded {TALE_TITLE} (tale_id=%, ~{total_words:,} words, {total_scenes} scenes) for %', v_tale_id, owner_email;")
    a("end $$;")
    a("")
    return "\n".join(lines)


def main() -> int:
    parser = argparse.ArgumentParser(description="Generate / insert full Maltese Falcon export test seed")
    parser.add_argument("--email", default=DEFAULT_OWNER_EMAIL, help="Seed owner email")
    parser.add_argument("--download", action="store_true", help="Re-download Gutenberg source text")
    parser.add_argument("--words-per-scene", type=int, default=WORDS_PER_SCENE)
    parser.add_argument(
        "--insert",
        action="store_true",
        help="Insert via Supabase API (recommended; bypasses SQL Editor size limit)",
    )
    parser.add_argument(
        "--write-sql",
        action="store_true",
        help="Also write sample_maltese_falcon_full.sql (~1.1 MB; use with psql, not SQL Editor)",
    )
    parser.add_argument("--url", help="Supabase project URL (or SUPABASE_URL / VITE_SUPABASE_URL)")
    parser.add_argument("--service-key", help="Service role key (or SUPABASE_SERVICE_ROLE_KEY)")
    parser.add_argument("--batch-size", type=int, default=5, help="Scenes per REST insert batch")
    args = parser.parse_args()

    if not args.insert and not args.write_sql:
        parser.error("choose at least one output mode: --insert (recommended) and/or --write-sql")

    root = Path(__file__).parent
    source_path = root / "sources" / "maltese_falcon.txt"
    out_path = root / "sample_maltese_falcon_full.sql"

    raw = load_source_text(source_path, args.download)
    body = strip_gutenberg_wrapper(raw)
    parsed = parse_chapters(body)

    chapters_data: list[tuple[int, str, list[list[str]]]] = []
    for num, title, paragraphs in parsed:
        if title.upper().startswith("TRANSCRIBER"):
            break
        scenes = split_scenes(paragraphs, args.words_per_scene)
        if not scenes:
            continue
        chapters_data.append((num, title, scenes))

    if not chapters_data:
        print("No chapters parsed.", file=sys.stderr)
        return 1

    payload = build_seed_payload(args.email, chapters_data)
    stats = payload["stats"]

    if args.write_sql:
        sql = generate_sql(args.email, chapters_data)
        out_path.write_text(sql, encoding="utf-8")
        print(f"Wrote {out_path} ({out_path.stat().st_size:,} bytes)")

    if args.insert:
        url, service_key = resolve_supabase_config(args.url, args.service_key)
        insert_seed(
            payload,
            url=url,
            service_key=service_key,
            batch_size=max(1, args.batch_size),
        )
    elif args.write_sql:
        print(f"  {stats['chapters']} chapters, {stats['scenes']} scenes, ~{stats['words']:,} words")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
