#!/usr/bin/env python3
"""Generate sample_maltese_falcon.sql — run once, commit the .sql, discard this helper if desired."""
from __future__ import annotations

import json
import re
from pathlib import Path

OWNER_EMAIL = "scottmollon@gmail.com"


def paras(*paragraphs: str) -> tuple[dict, str, int]:
    content_nodes = []
    plain_parts = []
    for i, p in enumerate(paragraphs):
        p = p.strip()
        if not p:
            continue
        plain_parts.append(p)
        node: dict = {
            "type": "paragraph",
            "content": [{"type": "text", "text": p}],
        }
        if i == 0:
            node["attrs"] = {"dropCap": True}
        content_nodes.append(node)
    plain = "\n\n".join(plain_parts)
    words = len(re.findall(r"\S+", plain))
    doc = {"type": "doc", "content": content_nodes}
    return doc, plain, words


def short_para(text: str, drop_cap: bool = False) -> tuple[dict, str, int]:
    text = text.strip()
    node: dict = {"type": "paragraph", "content": [{"type": "text", "text": text}]}
    if drop_cap:
        node["attrs"] = {"dropCap": True}
    doc = {"type": "doc", "content": [node]}
    words = len(re.findall(r"\S+", text))
    return doc, text, words


def sql_str(s: str) -> str:
    return "'" + s.replace("'", "''") + "'"


def sql_json(obj) -> str:
    return sql_str(json.dumps(obj, ensure_ascii=False, separators=(",", ":")))


# --- Public-domain excerpts (Hammett, The Maltese Falcon, 1930; US PD) ---

s1_doc, s1_plain, s1_words = paras(
    "Samuel Spade's jaw was long and bony, his chin a jutting v under the more flexible v of his mouth. His nostrils curved back to make another, smaller, v. His yellow-grey eyes were horizontal. The v motif was picked up again by thickish brows rising outward from twin creases above a hooked nose, and his pale brown hair grew down from high flat temples in a point on his forehead. He looked rather pleasantly like a blond satan.",
    'He said to Effie Perine: "Yes, sweetheart?"',
    'She was a lanky sunburned girl whose tan dress of thin woolen stuff clung to her with an effect of dampness. Her eyes were brown and playful in a shiny boyish face. She finished shutting the door behind her, leaned against it, and said: "There\'s a girl wants to see you. Her name\'s Wonderly."',
    '"A customer?"',
    '"I guess so. You\'ll want to see her anyway: she\'s a knockout."',
    '"Shoo her in, darling," said Spade. "Shoo her in."',
    'Effie Perine opened the door again, following it back into the outer office, standing with a hand on the knob while saying: "Will you come in, Miss Wonderly?"',
    'A voice said, "Thank you," so softly that only the purest articulation made the words intelligible, and a young woman came through the doorway. She advanced slowly, with tentative steps, looking at Spade with cobalt-blue eyes that were both shy and probing.',
    "She was tall and pliantly slender, without angularity anywhere. Her body was erect and high-breasted, her legs long, her hands and feet narrow. She wore two shades of blue that had been selected because of her eyes. The hair curling from under her blue hat was darkly red, her full lips more brightly red. White teeth glistened in the crescent her timid smile made.",
    "Spade rose bowing and indicating with a thick-fingered hand the oaken armchair beside his desk. He was quite six feet tall. The steep rounded slope of his shoulders made his body seem almost conical—no broader than it was thick—and kept his freshly pressed grey coat from fitting very well.",
    'Miss Wonderly murmured, "Thank you," softly as before and sat down on the edge of the chair\'s wooden seat.',
    "Spade sank into his swivel-chair, made a quarter-turn to face her, smiled politely. He smiled without separating his lips. All the v's in his face grew longer.",
    "The tappity-tap-tap and the thin bell and muffled whir of Effie Perine's typewriting came through the closed door. Somewhere in a neighboring office a power-driven machine vibrated dully. On Spade's desk a limp cigarette smoldered in a brass tray filled with the remains of limp cigarettes. Ragged grey flakes of cigarette-ash dotted the yellow top of the desk and the green blotter and the papers that were there. A buff-curtained window, eight or ten inches open, let in from the court a current of air faintly scented with ammonia. The ashes on the desk twitched and crawled in the current.",
)

s2_doc, s2_plain, s2_words = paras(
    'Miss Wonderly watched the grey flakes twitch and crawl. Her eyes were uneasy. She sat on the very edge of the chair. Her feet were flat on the floor, as if she were about to rise. Her hands in dark gloves clasped a flat dark handbag in her lap.',
    'Spade rocked back in his chair and asked: "Now what can I do for you, Miss Wonderly?"',
    'She caught her breath and looked at him. She swallowed and said hurriedly: "Could you—? I thought—I—that is—" Then she tortured her lower lip with glistening teeth and said nothing. Only her dark eyes spoke now, pleading.',
    'Spade smiled and nodded as if he understood her, but pleasantly, as if nothing serious were involved. He said: "Suppose you tell me about it, from the beginning, and then we\'ll know what needs doing. Better begin as far back as you can."',
    '"That was in New York."',
    '"Yes."',
    '"I don\'t know where she met him. I mean I don\'t know where in New York. She\'s five years younger than I—only seventeen—and we didn\'t have the same friends. I don\'t suppose we\'ve ever been as close as sisters should be. Mama and Papa are in Europe. It would kill them. I\'ve got to get her back before they come home."',
    '"Yes," he said.',
    '"They\'re coming home the first of the month."',
    'Spade\'s eyes brightened. "Then we\'ve two weeks," he said.',
    '"I didn\'t know what she had done until her letter came. I was frantic." Her lips trembled. Her hands mashed the dark handbag in her lap. "I was too afraid she had done something like this to go to the police, and the fear that something had happened to her kept urging me to go. There wasn\'t anyone I could go to for advice. I didn\'t know what to do. What could I do?"',
    '"Nothing, of course," Spade said, "but then her letter came?"',
)

s3_doc, s3_plain, s3_words = paras(
    '"Yes, and I sent her a telegram asking her to come home. I sent it to General Delivery here. That was the only address she gave me. I waited a whole week, but no answer came, not another word from her. And Mama and Papa\'s return was drawing nearer and nearer. So I came to San Francisco to get her. I wrote her I was coming. I shouldn\'t have done that, should I?"',
    '"Maybe not. It\'s not always easy to know what to do. You haven\'t found her?"',
    '"No, I haven\'t. I wrote her that I would go to the St. Mark, and I begged her to come and let me talk to her even if she didn\'t intend to go home with me. But she didn\'t come. I waited three days, and she didn\'t come, didn\'t even send me a message of any sort."',
    'Spade nodded his blond satan\'s head, frowned sympathetically, and tightened his lips together.',
    '"It was horrible," Miss Wonderly said, trying to smile. "I couldn\'t sit there like that—waiting—not knowing what had happened to her, what might be happening to her." She stopped trying to smile. She shuddered. "The only address I had was General Delivery. I wrote her another letter, and yesterday afternoon I went to the Post Office. I stayed there until after dark, but I didn\'t see her. I went there again this morning, and still didn\'t see Corinne, but I saw Floyd Thursby."',
    'Spade nodded again. His frown went away. In its place came a look of sharp attentiveness.',
    '"He wouldn\'t tell me where Corinne was," she went on, hopelessly. "He wouldn\'t tell me anything, except that she was well and happy. But how can I believe that? That is what he would tell me anyhow, isn\'t it?"',
    '"Sure," Spade agreed. "But it might be true."',
)

s4_doc, s4_plain, s4_words = paras(
    '"I hope it is. I do hope it is," she exclaimed. "But I can\'t go back home like this, without having seen her, without even having talked to her on the phone. He wouldn\'t take me to her. He said she didn\'t want to see me. I can\'t believe that. He promised to tell her he had seen me, and to bring her to see me—if she would come—this evening at the hotel. He said he knew she wouldn\'t. He promised to come himself if she wouldn\'t. He—"',
    'She broke off with a startled hand to her mouth as the door opened.',
    'The man who had opened the door came in a step, said "Oh, excuse me!" hastily took his brown hat from his head, and backed out.',
    '"It\'s all right, Miles," Spade told him. "Come in. Miss Wonderly, this is Mr. Archer, my partner."',
    'Miles Archer came into the office again, shutting the door behind him, ducking his head and smiling at Miss Wonderly, making a vaguely polite gesture with the hat in his hand. He was of medium height, solidly built, wide in the shoulders, thick in the neck, with a jovial heavy-jawed red face and some grey in his close-trimmed hair. He was apparently as many years past forty as Spade was past thirty.',
    'Spade said: "Miss Wonderly\'s sister ran away from New York with a fellow named Floyd Thursby. They\'re here. Miss Wonderly has seen Thursby and has a date with him tonight. Maybe he\'ll bring the sister with him. The chances are he won\'t. Miss Wonderly wants us to find the sister and get her away from him and back home." He looked at Miss Wonderly. "Right?"',
    '"Yes," she said indistinctly.',
    'Spade winked at his partner.',
    'Miles Archer came forward to stand at a corner of the desk. While the girl looked at her bag he looked at her. His little brown eyes ran their bold appraising gaze from her lowered face to her feet and up to her face again. Then he looked at Spade and made a silent whistling mouth of appreciation.',
)

s5_doc, s5_plain, s5_words = paras(
    'Spade lifted two fingers from the arm of his chair in a brief warning gesture and said: "We shouldn\'t have any trouble with it. It\'s simply a matter of having a man at the hotel this evening to shadow him away when he leaves, and shadow him until he leads us to your sister. If she comes with him, and you persuade her to return with you, so much the better. Otherwise—if she doesn\'t want to leave him after we\'ve found her—well, we\'ll find a way of managing that."',
    'Archer said: "Yeh." His voice was heavy, coarse.',
    'Miss Wonderly looked up at Spade, quickly, puckering her forehead between her eyebrows. "Oh, but you must be careful!" Her voice shook a little, and her lips shaped the words with nervous jerkiness. "I\'m deathly afraid of him, of what he might do. She\'s so young and his bringing her here from New York is such a serious—Mightn\'t he—mightn\'t he do—something to her?"',
    'Spade smiled and patted the arms of his chair. "Just leave that to us," he said. "We\'ll know how to handle him."',
    '"But mightn\'t he?" she insisted.',
    '"There\'s always a chance." Spade nodded judicially. "But you can trust us to take care of that."',
    '"I do trust you," she said earnestly, "but I want you to know that he\'s a dangerous man. I honestly don\'t think he\'d stop at anything. I don\'t believe he\'d hesitate to—to kill Corinne if he thought it would save him. Mightn\'t he do that?"',
    '"Mr. Spade, could either you or Mr. Archer look after it personally? I\'d expect to be charged more, of course." She opened her handbag with nervous fingers and put two hundred-dollar bills on the desk. "Would that be enough?"',
    '"Yeh," Archer said, "and I\'ll look after it myself."',
)

# Skeleton one-liners (also PD-flavored short drafts)
skel = {
    "miles_goes": short_para(
        "Archer took the shadowing job himself. The hundred-dollar bills had brothers in Miss Wonderly's bag, and he tucked one into a vest-pocket with a complacent growl.",
        drop_cap=True,
    ),
    "crossing": short_para(
        "Spade grinned wolfishly. Maybe Archer saw her first, but Spade was already weighing what the girl had left unsaid—and what Thursby might do when a partner's shadow got too close.",
        drop_cap=True,
    ),
    "cairo": short_para(
        "Joel Cairo smelled of gardenia. He was soft-spoken and Levantine, and he came into Spade's office as if the black bird itself might be nested in a drawer.",
        drop_cap=True,
    ),
    "falcon_named": short_para(
        "The bird was a black figure of a bird—a falcon—and men had killed for it across oceans and centuries. Spade listened, and filed every name.",
        drop_cap=True,
    ),
    "gutman_voice": short_para(
        "Casper Gutman's voice was soft and well-mannered, wrapping threats in courtesy. His round bulk filled the hotel suite like a occupying power.",
        drop_cap=True,
    ),
    "thursby": short_para(
        "Floyd Thursby's shadow lengthened over Bush Street. Where he went, violence seemed to follow—and Miles Archer had gone out to meet him.",
        drop_cap=True,
    ),
    "cairo_again": short_para(
        "Cairo returned with gloves and a gun and a question about the falcon. Spade answered with his fists and then his wits—whichever fit the room.",
        drop_cap=True,
    ),
    "fat_man": short_para(
        "The fat man offered partnership, then patronage, then something closer to ownership. Spade smiled his blond satan's smile and kept his powder dry.",
        drop_cap=True,
    ),
    "plays_hand": short_para(
        "Spade played each side against the other until the desk was covered with crossed motives. The falcon, if it existed, would have to choose a master.",
        drop_cap=True,
    ),
    "weight": short_para(
        "When the bird came it was heavy with history and light on truth. Spade weighed what he could keep, what he must give up, and who walked free.",
        drop_cap=True,
    ),
}

# Scene specs: key, ch, sort, title, beat, status, color, synopsis, content triple
scenes = [
    (
        "s_opening",
        1,
        0,
        "Spade & Archer",
        "stc_01",
        "Final",
        "#938938",
        "Blond Satan in the Bush Street office: Effie shows in Miss Wonderly, and the partnership's ordinary world freezes in cigarette ash.",
        (s1_doc, s1_plain, s1_words),
    ),
    (
        "s_theme",
        1,
        1,
        "Miss Wonderly",
        "stc_02",
        "Rewritten",
        "#c87533",
        "A sister's letter, parents in Europe, and a plea that says more about secrecy than sisterhood—Spade asks her to begin at the beginning.",
        (s2_doc, s2_plain, s2_words),
    ),
    (
        "s_setup",
        1,
        2,
        "The Story She Spun",
        "stc_03",
        "Drafted",
        "#3d5a80",
        "New York to the St. Mark: Corinne, General Delivery, and Floyd Thursby spotted at the Post Office—stakes, places, and the cast assemble.",
        (s3_doc, s3_plain, s3_words),
    ),
    (
        "s_catalyst",
        1,
        3,
        "Five Thousand Dollars",
        "stc_04",
        "Drafted",
        "#8b2635",
        "Thursby will come to the hotel tonight. Miles Archer walks in; the runaway-sister job becomes real—and dangerous.",
        (s4_doc, s4_plain, s4_words),
    ),
    (
        "s_debate",
        1,
        4,
        "Taking the Case",
        "stc_05",
        "Raw",
        "#5e5e5e",
        "Shadow Thursby or walk? Wonderly press cash and fear; Archer grabs the tail himself while Spade weighs the risk.",
        (s5_doc, s5_plain, s5_words),
    ),
    (
        "s_break2",
        2,
        0,
        "Miles Goes Out",
        "stc_06",
        "Drafted",
        "#938938",
        "Archer commits: he will personally shadow Thursby from the hotel. No turning back for the partnership.",
        skel["miles_goes"],
    ),
    (
        "s_bstory",
        2,
        1,
        "Crossing the Line",
        "stc_07",
        "Raw",
        "#6b4c7a",
        "Spade and Miles trade cracks about Wonderly—partners, appetites, and the first crack in the office bond.",
        skel["crossing"],
    ),
    (
        "s_fun",
        3,
        0,
        "Cairo in the Office",
        "stc_08",
        "Drafted",
        "#c87533",
        "Joel Cairo arrives smelling of gardenia, hunting a black bird Spade has never heard of—until now.",
        skel["cairo"],
    ),
    (
        "s_mid",
        3,
        1,
        "The Falcon Named",
        "stc_09",
        "Drafted",
        "#3d5a80",
        "The Maltese Falcon is named: centuries of blood and greed crystallize into one figurine worth killing for.",
        skel["falcon_named"],
    ),
    (
        "s_badguys",
        3,
        2,
        "Gutman's Soft Voice",
        "stc_10",
        "Rewritten",
        "#8b2635",
        "Casper Gutman emerges—polite, vast, and closing in with money and pressure.",
        skel["gutman_voice"],
    ),
    (
        "s_alllost",
        3,
        3,
        "Thursby's Shadow",
        "stc_11",
        "Raw",
        "#5e5e5e",
        "Thursby's trail darkens; Archer's shadow job goes wrong—gut punch to the partnership.",
        skel["thursby"],
    ),
    (
        "s_darknight",
        3,
        4,
        "Joel Cairo Again",
        "stc_12",
        "Raw",
        "#4a6741",
        "Cairo returns with steel and soft words. Spade sits in the wreckage and decides how hard to hit back.",
        skel["cairo_again"],
    ),
    (
        "s_break3",
        4,
        0,
        "The Fat Man",
        "stc_13",
        "Drafted",
        "#938938",
        "Gutman's suite: terms, lies, and a plan that binds A-story greed to B-story betrayal.",
        skel["fat_man"],
    ),
    (
        "s_finale",
        4,
        1,
        "Spade Plays His Hand",
        "stc_14",
        "Rewritten",
        "#c87533",
        "Every lesson of the case gets thrown into the ring—Spade forces the truth into the open.",
        skel["plays_hand"],
    ),
    (
        "s_finalimg",
        4,
        2,
        "The Falcon's Weight",
        "stc_15",
        "Final",
        "#4a6741",
        "The black bird's weight settles. Who walks, who falls, and what Spade keeps of himself.",
        skel["weight"],
    ),
]

characters = [
    ("Sam Spade", "Protagonist", ["protagonist", "detective"], "Hard-boiled San Francisco private detective; blond satan look, keeps his own counsel and a desk full of limp cigarettes.", 0),
    ("Miles Archer", "Partner", ["partner", "victim"], "Spade's partner—jovial, heavy-jawed, and too ready to take the pretty client's money and the dangerous shadow job.", 1),
    ("Brigid O'Shaughnessy", "Femme Fatale", ["client", "liar", "wonderly"], "Alias Miss Wonderly (and others); hunting the falcon with a sister story Spade only half believes.", 2),
    ("Effie Perine", "Girl Friday", ["ally", "office"], "Spade's loyal secretary—lanky, sunburned, and sharp enough to call Wonderly a knockout before she shoves her in.", 3),
    ("Joel Cairo", "Antagonist", ["levantine", "collector"], "Soft-spoken Levantine with gardenia cologne; wants the black bird and will pay—or shoot—for it.", 4),
    ("Casper Gutman", "Antagonist", ["fat-man", "mastermind"], "The fat man: obsessive collector of the falcon, wrapping threat in soft manners and hotel-suite hospitality.", 5),
    ("Wilmer Cook", "Henchman", ["gunman", "kid"], "Gutman's young gunsel—thin, keyed-up, and always half a step from violence.", 6),
    ("Detective Tom Polhaus", "Police", ["copper", "homicide"], "Homicide dick who knows Spade's habits and shows when a partner ends up dead.", 7),
    ("Lieutenant Dundy", "Police", ["copper", "lieutenant"], "Hard-edged lieutenant who distrusts Spade's stories and wants answers faster than Spade will give them.", 8),
]

locations = [
    ("Spade & Archer's Office", "Partnership rooms on Bush Street—oaken chairs, green blotter, ammonia from the court, and cigarette ash that crawls in the draft.", ["office", "bush-street"], "Home base for the agency; Effie guards the outer door.", 0),
    ("Hotel Belvedere", "Where Cairo and other out-of-town operators put up while hunting the bird.", ["hotel", "cairo"], "Gardenia and gloves in the corridor.", 1),
    ("St. Mark Hotel", "Miss Wonderly's hotel—lobby shadow work and the Thursby rendezvous after eight.", ["hotel", "wonderly"], "Archer's tail starts here.", 2),
    ("Geary Street Flat", "Spade's apartment—night calls, coffee, and the soft edge of the city after the office closes.", ["spade", "home"], "Where Spade ends long days.", 3),
    ("Gutman's Suite", "The fat man's hotel quarters—soft voice, hard bargains, and a room that feels occupied by bulk alone.", ["hotel", "fat-man"], "Center of Act Three pressure.", 4),
    ("San Francisco Docks", "Fog, ships, and rumor—where a black bird might step off a boat into murder.", ["waterfront", "fog"], "Arrival point for the falcon lore.", 5),
]

research = [
    (
        "The Maltese Tribute Bird",
        "Twelve centuries ago the Knights of Malta allegedly paid yearly tribute to the King of Spain with a jeweled falcon. The token became legend—and then an object men would kill to possess. Use as mythic MacGuffin backstory when Gutman holds court.",
        None,
        ["falcon", "history", "macguffin"],
        0,
    ),
    (
        "1920s San Francisco Private Eyes",
        "Continental agencies, partnership letterheads, shadow work from hotel lobbies, and cash retainers on the blotter. Tone: hardboiled, not cozy. Keep city geography tight—Bush, Geary, the hills, and the waterfront.",
        None,
        ["period", "detective", "sf"],
        1,
    ),
    (
        "City Geography Stub",
        "Bush Street office → St. Mark / Belvedere hotels → Geary flat → waterfront. Short hops keep scenes moving; fog and hill grades do atmosphere work for free.",
        None,
        ["geography", "sf", "research"],
        2,
    ),
    (
        "Wonderly Alias List",
        "Miss Wonderly · Brigid O'Shaughnessy · other hotel names as needed. Track which alias Spade and the cops know in each scene so Inspector links stay honest.",
        None,
        ["falcon", "alias", "brigid"],
        3,
    ),
]

# Character / location link maps by scene key
char_links = {
    "s_opening": ["Sam Spade", "Miles Archer", "Effie Perine", "Brigid O'Shaughnessy"],
    "s_theme": ["Sam Spade", "Brigid O'Shaughnessy"],
    "s_setup": ["Sam Spade", "Brigid O'Shaughnessy"],
    "s_catalyst": ["Sam Spade", "Miles Archer", "Brigid O'Shaughnessy"],
    "s_debate": ["Sam Spade", "Miles Archer", "Brigid O'Shaughnessy"],
    "s_break2": ["Miles Archer", "Brigid O'Shaughnessy", "Sam Spade"],
    "s_bstory": ["Sam Spade", "Miles Archer"],
    "s_fun": ["Sam Spade", "Joel Cairo"],
    "s_mid": ["Sam Spade", "Joel Cairo", "Casper Gutman"],
    "s_badguys": ["Sam Spade", "Casper Gutman", "Wilmer Cook"],
    "s_alllost": ["Miles Archer", "Sam Spade"],
    "s_darknight": ["Sam Spade", "Joel Cairo"],
    "s_break3": ["Sam Spade", "Casper Gutman", "Wilmer Cook"],
    "s_finale": ["Sam Spade", "Brigid O'Shaughnessy", "Casper Gutman", "Joel Cairo"],
    "s_finalimg": ["Sam Spade", "Brigid O'Shaughnessy", "Detective Tom Polhaus"],
}

loc_links = {
    "s_opening": ["Spade & Archer's Office"],
    "s_theme": ["Spade & Archer's Office"],
    "s_setup": ["Spade & Archer's Office", "St. Mark Hotel"],
    "s_catalyst": ["Spade & Archer's Office"],
    "s_debate": ["Spade & Archer's Office", "St. Mark Hotel"],
    "s_break2": ["St. Mark Hotel"],
    "s_bstory": ["Spade & Archer's Office"],
    "s_fun": ["Spade & Archer's Office"],
    "s_mid": ["Spade & Archer's Office"],
    "s_badguys": ["Gutman's Suite"],
    "s_alllost": ["San Francisco Docks"],
    "s_darknight": ["Spade & Archer's Office"],
    "s_break3": ["Gutman's Suite"],
    "s_finale": ["Gutman's Suite"],
    "s_finalimg": ["Geary Street Flat", "Spade & Archer's Office"],
}

chapters = [
    (1, "A Woman Calls", 0, "Miss Wonderly walks into Spade & Archer—sister story, Thursby, and a retainer that smells of trouble."),
    (2, "Partners End", 1, "Archer takes the tail; the partnership crosses a line it cannot uncross."),
    (3, "The Black Bird", 2, "Cairo, Gutman, and the falcon named—pressure mounts until someone hits the pavement."),
    (4, "Gutman", 3, "The fat man's terms, Spade's hand, and the bird's final weight."),
]

lines: list[str] = []
a = lines.append

a("-- SAMPLE SEED: maltese-falcon")
a("-- Public-domain marketing sample for Write Knuckles.")
a("-- Source text: Dashiell Hammett, The Maltese Falcon (1930) — public domain in the US.")
a("--")
a("-- HOW TO RUN")
a("-- 1. Edit owner_email below to an existing auth.users email that is also on write.approved_users.")
a("-- 2. Paste this entire script into the Supabase SQL Editor and Run.")
a("-- 3. Sign in as that user and open The Maltese Falcon.")
a("--")
a("-- Idempotent for that user+title: deletes any prior The Maltese Falcon tale (CASCADE) then inserts fresh.")
a("--")
a("")
a("do $$")
a("declare")
a(f"  owner_email text := {sql_str(OWNER_EMAIL)};")
a("  v_user_id uuid;")
a("  v_beat_template_id uuid;")
a("  v_beats jsonb;")
a("  v_tale_id uuid;")
a("  v_ch1 uuid; v_ch2 uuid; v_ch3 uuid; v_ch4 uuid;")
for key, *_rest in scenes:
    a(f"  v_{key} uuid;")
for name, *_r in characters:
    slug = re.sub(r"[^a-z0-9]+", "_", name.lower()).strip("_")
    a(f"  v_char_{slug} uuid;")
for name, *_r in locations:
    slug = re.sub(r"[^a-z0-9]+", "_", name.lower()).strip("_")
    a(f"  v_loc_{slug} uuid;")
a("begin")
a("  select u.id into v_user_id")
a("  from auth.users u")
a("  where lower(u.email) = lower(owner_email);")
a("")
a("  if v_user_id is null then")
a("    raise exception 'Seed aborted: no auth.users row for %', owner_email;")
a("  end if;")
a("")
a("  if not exists (")
a("    select 1 from write.approved_users au")
a("    where au.revoked_at is null")
a("      and (")
a("        au.user_id = v_user_id")
a("        or lower(au.email) = lower(owner_email)")
a("      )")
a("  ) then")
a("    raise exception 'Seed aborted: % is not on write.approved_users (unrevoked)', owner_email;")
a("  end if;")
a("")
a("  select bt.id, bt.structure")
a("    into v_beat_template_id, v_beats")
a("  from write.beat_templates bt")
a("  where bt.slug = 'save-the-cat' and bt.user_id is null;")
a("")
a("  if v_beat_template_id is null then")
a("    raise exception 'Seed aborted: system beat template save-the-cat not found (run migration 001)';")
a("  end if;")
a("")
a("  -- Replace any prior seed tale for this owner")
a("  delete from write.tales")
a("  where user_id = v_user_id")
a("    and title = 'The Maltese Falcon';")
a("")
a("  insert into write.tales (")
a("    user_id, title, subtitle, genre, target_word_count, beat_template_id")
a("  ) values (")
a("    v_user_id,")
a("    'The Maltese Falcon',")
a("    'A Sam Spade Case',")
a("    'Pulp',")
a("    80000,")
a("    v_beat_template_id")
a("  )")
a("  returning id into v_tale_id;")
a("")
a("  insert into write.tale_beats (tale_id, beat_template_id, beats)")
a("  values (v_tale_id, v_beat_template_id, v_beats);")
a("")

for n, title, sort, synopsis in chapters:
    a(f"  insert into write.chapters (tale_id, user_id, title, sort_order, synopsis)")
    a(f"  values (v_tale_id, v_user_id, {sql_str(title)}, {sort}, {sql_str(synopsis)})")
    a(f"  returning id into v_ch{n};")
    a("")

for key, ch, sort, title, beat, status, color, synopsis, (doc, plain, words) in scenes:
    a(f"  insert into write.scenes (")
    a(f"    chapter_id, tale_id, user_id, title, sort_order,")
    a(f"    scene_color, scene_status, synopsis, content, plain_text, word_count")
    a(f"  ) values (")
    a(f"    v_ch{ch}, v_tale_id, v_user_id, {sql_str(title)}, {sort},")
    a(f"    {sql_str(color)}, {sql_str(status)}, {sql_str(synopsis)},")
    a(f"    {sql_json(doc)}::jsonb,")
    a(f"    {sql_str(plain)},")
    a(f"    {words}")
    a(f"  )")
    a(f"  returning id into v_{key};")
    a("")

# Characters
for name, role, tags, bio, sort in characters:
    slug = re.sub(r"[^a-z0-9]+", "_", name.lower()).strip("_")
    tags_sql = "array[" + ", ".join(sql_str(t) for t in tags) + "]::text[]"
    bio_sql = sql_json({"summary": bio})
    a(f"  insert into write.characters (")
    a(f"    tale_id, user_id, name, role, bio, sort_order, tags")
    a(f"  ) values (")
    a(f"    v_tale_id, v_user_id, {sql_str(name)}, {sql_str(role)},")
    a(f"    {bio_sql}::jsonb, {sort}, {tags_sql}")
    a(f"  )")
    a(f"  returning id into v_char_{slug};")
    a("")

for name, desc, tags, notes, sort in locations:
    slug = re.sub(r"[^a-z0-9]+", "_", name.lower()).strip("_")
    tags_sql = "array[" + ", ".join(sql_str(t) for t in tags) + "]::text[]"
    notes_sql = sql_json({"summary": notes})
    a(f"  insert into write.locations (")
    a(f"    tale_id, user_id, name, description, notes, sort_order, tags")
    a(f"  ) values (")
    a(f"    v_tale_id, v_user_id, {sql_str(name)}, {sql_str(desc)},")
    a(f"    {notes_sql}::jsonb, {sort}, {tags_sql}")
    a(f"  )")
    a(f"  returning id into v_loc_{slug};")
    a("")

for title, body, url, tags, sort in research:
    tags_sql = "array[" + ", ".join(sql_str(t) for t in tags) + "]::text[]"
    url_sql = "null" if url is None else sql_str(url)
    a(f"  insert into write.research_items (")
    a(f"    tale_id, user_id, title, body, url, tags, sort_order")
    a(f"  ) values (")
    a(f"    v_tale_id, v_user_id, {sql_str(title)}, {sql_str(body)},")
    a(f"    {url_sql}, {tags_sql}, {sort}")
    a(f"  );")
    a("")

# beat links
a("  insert into write.beat_links (tale_id, beat_key, scene_id) values")
beat_rows = []
for key, _ch, _sort, _title, beat, *_rest in scenes:
    beat_rows.append(f"    (v_tale_id, {sql_str(beat)}, v_{key})")
a(",\n".join(beat_rows) + ";")
a("")

# scene character links
char_rows = []
for scene_key, names in char_links.items():
    for name in names:
        slug = re.sub(r"[^a-z0-9]+", "_", name.lower()).strip("_")
        char_rows.append(
            f"    (v_tale_id, v_{scene_key}, v_char_{slug})"
        )
a("  insert into write.scene_character_links (tale_id, scene_id, character_id) values")
a(",\n".join(char_rows) + ";")
a("")

loc_rows = []
for scene_key, names in loc_links.items():
    for name in names:
        slug = re.sub(r"[^a-z0-9]+", "_", name.lower()).strip("_")
        loc_rows.append(f"    (v_tale_id, v_{scene_key}, v_loc_{slug})")
a("  insert into write.scene_location_links (tale_id, scene_id, location_id) values")
a(",\n".join(loc_rows) + ";")
a("")

a("  raise notice 'Seeded The Maltese Falcon (tale_id=%) for %', v_tale_id, owner_email;")
a("end $$;")
a("")

out = Path(__file__).with_name("sample_maltese_falcon.sql")
out.write_text("\n".join(lines) + "\n", encoding="utf-8")
print(f"Wrote {out} ({out.stat().st_size} bytes)")
print(f"Ch1 word counts: opening={s1_words} theme={s2_words} setup={s3_words} catalyst={s4_words} debate={s5_words}")
