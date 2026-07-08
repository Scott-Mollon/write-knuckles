-- SAMPLE SEED: maltese-falcon
-- Public-domain marketing sample for Write Knuckles.
-- Source text: Dashiell Hammett, The Maltese Falcon (1930) — public domain in the US.
--
-- HOW TO RUN
-- 1. Edit owner_email below to an existing auth.users email that is also on write.approved_users.
-- 2. Paste this entire script into the Supabase SQL Editor and Run.
-- 3. Sign in as that user and open The Maltese Falcon.
--
-- Idempotent for that user+title: deletes any prior The Maltese Falcon tale (CASCADE) then inserts fresh.
--

do $$
declare
  owner_email text := 'scottmollon@gmail.com';
  v_user_id uuid;
  v_beat_template_id uuid;
  v_beats jsonb;
  v_tale_id uuid;
  v_ch1 uuid; v_ch2 uuid; v_ch3 uuid; v_ch4 uuid;
  v_s_opening uuid;
  v_s_theme uuid;
  v_s_setup uuid;
  v_s_catalyst uuid;
  v_s_debate uuid;
  v_s_break2 uuid;
  v_s_bstory uuid;
  v_s_fun uuid;
  v_s_mid uuid;
  v_s_badguys uuid;
  v_s_alllost uuid;
  v_s_darknight uuid;
  v_s_break3 uuid;
  v_s_finale uuid;
  v_s_finalimg uuid;
  v_char_sam_spade uuid;
  v_char_miles_archer uuid;
  v_char_brigid_o_shaughnessy uuid;
  v_char_effie_perine uuid;
  v_char_joel_cairo uuid;
  v_char_casper_gutman uuid;
  v_char_wilmer_cook uuid;
  v_char_detective_tom_polhaus uuid;
  v_char_lieutenant_dundy uuid;
  v_loc_spade_archer_s_office uuid;
  v_loc_hotel_belvedere uuid;
  v_loc_st_mark_hotel uuid;
  v_loc_geary_street_flat uuid;
  v_loc_gutman_s_suite uuid;
  v_loc_san_francisco_docks uuid;
begin
  select u.id into v_user_id
  from auth.users u
  where lower(u.email) = lower(owner_email);

  if v_user_id is null then
    raise exception 'Seed aborted: no auth.users row for %', owner_email;
  end if;

  if not exists (
    select 1 from write.approved_users au
    where au.revoked_at is null
      and (
        au.user_id = v_user_id
        or lower(au.email) = lower(owner_email)
      )
  ) then
    raise exception 'Seed aborted: % is not on write.approved_users (unrevoked)', owner_email;
  end if;

  select bt.id, bt.structure
    into v_beat_template_id, v_beats
  from write.beat_templates bt
  where bt.slug = 'save-the-cat' and bt.user_id is null;

  if v_beat_template_id is null then
    raise exception 'Seed aborted: system beat template save-the-cat not found (run migration 001)';
  end if;

  -- Replace any prior seed tale for this owner
  delete from write.tales
  where user_id = v_user_id
    and title = 'The Maltese Falcon';

  insert into write.tales (
    user_id, title, subtitle, genre, target_word_count, beat_template_id
  ) values (
    v_user_id,
    'The Maltese Falcon',
    'A Sam Spade Case',
    'Pulp',
    80000,
    v_beat_template_id
  )
  returning id into v_tale_id;

  insert into write.tale_beats (tale_id, beat_template_id, beats)
  values (v_tale_id, v_beat_template_id, v_beats);

  insert into write.chapters (tale_id, user_id, title, sort_order, synopsis)
  values (v_tale_id, v_user_id, 'A Woman Calls', 0, 'Miss Wonderly walks into Spade & Archer—sister story, Thursby, and a retainer that smells of trouble.')
  returning id into v_ch1;

  insert into write.chapters (tale_id, user_id, title, sort_order, synopsis)
  values (v_tale_id, v_user_id, 'Partners End', 1, 'Archer takes the tail; the partnership crosses a line it cannot uncross.')
  returning id into v_ch2;

  insert into write.chapters (tale_id, user_id, title, sort_order, synopsis)
  values (v_tale_id, v_user_id, 'The Black Bird', 2, 'Cairo, Gutman, and the falcon named—pressure mounts until someone hits the pavement.')
  returning id into v_ch3;

  insert into write.chapters (tale_id, user_id, title, sort_order, synopsis)
  values (v_tale_id, v_user_id, 'Gutman', 3, 'The fat man''s terms, Spade''s hand, and the bird''s final weight.')
  returning id into v_ch4;

  insert into write.scenes (
    chapter_id, tale_id, user_id, title, sort_order,
    scene_color, scene_status, synopsis, content, plain_text, word_count
  ) values (
    v_ch1, v_tale_id, v_user_id, 'Spade & Archer', 0,
    '#938938', 'Final', 'Blond Satan in the Bush Street office: Effie shows in Miss Wonderly, and the partnership''s ordinary world freezes in cigarette ash.',
    '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"Samuel Spade''s jaw was long and bony, his chin a jutting v under the more flexible v of his mouth. His nostrils curved back to make another, smaller, v. His yellow-grey eyes were horizontal. The v motif was picked up again by thickish brows rising outward from twin creases above a hooked nose, and his pale brown hair grew down from high flat temples in a point on his forehead. He looked rather pleasantly like a blond satan."}],"attrs":{"dropCap":true}},{"type":"paragraph","content":[{"type":"text","text":"He said to Effie Perine: \"Yes, sweetheart?\""}]},{"type":"paragraph","content":[{"type":"text","text":"She was a lanky sunburned girl whose tan dress of thin woolen stuff clung to her with an effect of dampness. Her eyes were brown and playful in a shiny boyish face. She finished shutting the door behind her, leaned against it, and said: \"There''s a girl wants to see you. Her name''s Wonderly.\""}]},{"type":"paragraph","content":[{"type":"text","text":"\"A customer?\""}]},{"type":"paragraph","content":[{"type":"text","text":"\"I guess so. You''ll want to see her anyway: she''s a knockout.\""}]},{"type":"paragraph","content":[{"type":"text","text":"\"Shoo her in, darling,\" said Spade. \"Shoo her in.\""}]},{"type":"paragraph","content":[{"type":"text","text":"Effie Perine opened the door again, following it back into the outer office, standing with a hand on the knob while saying: \"Will you come in, Miss Wonderly?\""}]},{"type":"paragraph","content":[{"type":"text","text":"A voice said, \"Thank you,\" so softly that only the purest articulation made the words intelligible, and a young woman came through the doorway. She advanced slowly, with tentative steps, looking at Spade with cobalt-blue eyes that were both shy and probing."}]},{"type":"paragraph","content":[{"type":"text","text":"She was tall and pliantly slender, without angularity anywhere. Her body was erect and high-breasted, her legs long, her hands and feet narrow. She wore two shades of blue that had been selected because of her eyes. The hair curling from under her blue hat was darkly red, her full lips more brightly red. White teeth glistened in the crescent her timid smile made."}]},{"type":"paragraph","content":[{"type":"text","text":"Spade rose bowing and indicating with a thick-fingered hand the oaken armchair beside his desk. He was quite six feet tall. The steep rounded slope of his shoulders made his body seem almost conical—no broader than it was thick—and kept his freshly pressed grey coat from fitting very well."}]},{"type":"paragraph","content":[{"type":"text","text":"Miss Wonderly murmured, \"Thank you,\" softly as before and sat down on the edge of the chair''s wooden seat."}]},{"type":"paragraph","content":[{"type":"text","text":"Spade sank into his swivel-chair, made a quarter-turn to face her, smiled politely. He smiled without separating his lips. All the v''s in his face grew longer."}]},{"type":"paragraph","content":[{"type":"text","text":"The tappity-tap-tap and the thin bell and muffled whir of Effie Perine''s typewriting came through the closed door. Somewhere in a neighboring office a power-driven machine vibrated dully. On Spade''s desk a limp cigarette smoldered in a brass tray filled with the remains of limp cigarettes. Ragged grey flakes of cigarette-ash dotted the yellow top of the desk and the green blotter and the papers that were there. A buff-curtained window, eight or ten inches open, let in from the court a current of air faintly scented with ammonia. The ashes on the desk twitched and crawled in the current."}]}]}'::jsonb,
    'Samuel Spade''s jaw was long and bony, his chin a jutting v under the more flexible v of his mouth. His nostrils curved back to make another, smaller, v. His yellow-grey eyes were horizontal. The v motif was picked up again by thickish brows rising outward from twin creases above a hooked nose, and his pale brown hair grew down from high flat temples in a point on his forehead. He looked rather pleasantly like a blond satan.

He said to Effie Perine: "Yes, sweetheart?"

She was a lanky sunburned girl whose tan dress of thin woolen stuff clung to her with an effect of dampness. Her eyes were brown and playful in a shiny boyish face. She finished shutting the door behind her, leaned against it, and said: "There''s a girl wants to see you. Her name''s Wonderly."

"A customer?"

"I guess so. You''ll want to see her anyway: she''s a knockout."

"Shoo her in, darling," said Spade. "Shoo her in."

Effie Perine opened the door again, following it back into the outer office, standing with a hand on the knob while saying: "Will you come in, Miss Wonderly?"

A voice said, "Thank you," so softly that only the purest articulation made the words intelligible, and a young woman came through the doorway. She advanced slowly, with tentative steps, looking at Spade with cobalt-blue eyes that were both shy and probing.

She was tall and pliantly slender, without angularity anywhere. Her body was erect and high-breasted, her legs long, her hands and feet narrow. She wore two shades of blue that had been selected because of her eyes. The hair curling from under her blue hat was darkly red, her full lips more brightly red. White teeth glistened in the crescent her timid smile made.

Spade rose bowing and indicating with a thick-fingered hand the oaken armchair beside his desk. He was quite six feet tall. The steep rounded slope of his shoulders made his body seem almost conical—no broader than it was thick—and kept his freshly pressed grey coat from fitting very well.

Miss Wonderly murmured, "Thank you," softly as before and sat down on the edge of the chair''s wooden seat.

Spade sank into his swivel-chair, made a quarter-turn to face her, smiled politely. He smiled without separating his lips. All the v''s in his face grew longer.

The tappity-tap-tap and the thin bell and muffled whir of Effie Perine''s typewriting came through the closed door. Somewhere in a neighboring office a power-driven machine vibrated dully. On Spade''s desk a limp cigarette smoldered in a brass tray filled with the remains of limp cigarettes. Ragged grey flakes of cigarette-ash dotted the yellow top of the desk and the green blotter and the papers that were there. A buff-curtained window, eight or ten inches open, let in from the court a current of air faintly scented with ammonia. The ashes on the desk twitched and crawled in the current.',
    491
  )
  returning id into v_s_opening;

  insert into write.scenes (
    chapter_id, tale_id, user_id, title, sort_order,
    scene_color, scene_status, synopsis, content, plain_text, word_count
  ) values (
    v_ch1, v_tale_id, v_user_id, 'Miss Wonderly', 1,
    '#c87533', 'Rewritten', 'A sister''s letter, parents in Europe, and a plea that says more about secrecy than sisterhood—Spade asks her to begin at the beginning.',
    '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"Miss Wonderly watched the grey flakes twitch and crawl. Her eyes were uneasy. She sat on the very edge of the chair. Her feet were flat on the floor, as if she were about to rise. Her hands in dark gloves clasped a flat dark handbag in her lap."}],"attrs":{"dropCap":true}},{"type":"paragraph","content":[{"type":"text","text":"Spade rocked back in his chair and asked: \"Now what can I do for you, Miss Wonderly?\""}]},{"type":"paragraph","content":[{"type":"text","text":"She caught her breath and looked at him. She swallowed and said hurriedly: \"Could you—? I thought—I—that is—\" Then she tortured her lower lip with glistening teeth and said nothing. Only her dark eyes spoke now, pleading."}]},{"type":"paragraph","content":[{"type":"text","text":"Spade smiled and nodded as if he understood her, but pleasantly, as if nothing serious were involved. He said: \"Suppose you tell me about it, from the beginning, and then we''ll know what needs doing. Better begin as far back as you can.\""}]},{"type":"paragraph","content":[{"type":"text","text":"\"That was in New York.\""}]},{"type":"paragraph","content":[{"type":"text","text":"\"Yes.\""}]},{"type":"paragraph","content":[{"type":"text","text":"\"I don''t know where she met him. I mean I don''t know where in New York. She''s five years younger than I—only seventeen—and we didn''t have the same friends. I don''t suppose we''ve ever been as close as sisters should be. Mama and Papa are in Europe. It would kill them. I''ve got to get her back before they come home.\""}]},{"type":"paragraph","content":[{"type":"text","text":"\"Yes,\" he said."}]},{"type":"paragraph","content":[{"type":"text","text":"\"They''re coming home the first of the month.\""}]},{"type":"paragraph","content":[{"type":"text","text":"Spade''s eyes brightened. \"Then we''ve two weeks,\" he said."}]},{"type":"paragraph","content":[{"type":"text","text":"\"I didn''t know what she had done until her letter came. I was frantic.\" Her lips trembled. Her hands mashed the dark handbag in her lap. \"I was too afraid she had done something like this to go to the police, and the fear that something had happened to her kept urging me to go. There wasn''t anyone I could go to for advice. I didn''t know what to do. What could I do?\""}]},{"type":"paragraph","content":[{"type":"text","text":"\"Nothing, of course,\" Spade said, \"but then her letter came?\""}]}]}'::jsonb,
    'Miss Wonderly watched the grey flakes twitch and crawl. Her eyes were uneasy. She sat on the very edge of the chair. Her feet were flat on the floor, as if she were about to rise. Her hands in dark gloves clasped a flat dark handbag in her lap.

Spade rocked back in his chair and asked: "Now what can I do for you, Miss Wonderly?"

She caught her breath and looked at him. She swallowed and said hurriedly: "Could you—? I thought—I—that is—" Then she tortured her lower lip with glistening teeth and said nothing. Only her dark eyes spoke now, pleading.

Spade smiled and nodded as if he understood her, but pleasantly, as if nothing serious were involved. He said: "Suppose you tell me about it, from the beginning, and then we''ll know what needs doing. Better begin as far back as you can."

"That was in New York."

"Yes."

"I don''t know where she met him. I mean I don''t know where in New York. She''s five years younger than I—only seventeen—and we didn''t have the same friends. I don''t suppose we''ve ever been as close as sisters should be. Mama and Papa are in Europe. It would kill them. I''ve got to get her back before they come home."

"Yes," he said.

"They''re coming home the first of the month."

Spade''s eyes brightened. "Then we''ve two weeks," he said.

"I didn''t know what she had done until her letter came. I was frantic." Her lips trembled. Her hands mashed the dark handbag in her lap. "I was too afraid she had done something like this to go to the police, and the fear that something had happened to her kept urging me to go. There wasn''t anyone I could go to for advice. I didn''t know what to do. What could I do?"

"Nothing, of course," Spade said, "but then her letter came?"',
    317
  )
  returning id into v_s_theme;

  insert into write.scenes (
    chapter_id, tale_id, user_id, title, sort_order,
    scene_color, scene_status, synopsis, content, plain_text, word_count
  ) values (
    v_ch1, v_tale_id, v_user_id, 'The Story She Spun', 2,
    '#3d5a80', 'Drafted', 'New York to the St. Mark: Corinne, General Delivery, and Floyd Thursby spotted at the Post Office—stakes, places, and the cast assemble.',
    '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"\"Yes, and I sent her a telegram asking her to come home. I sent it to General Delivery here. That was the only address she gave me. I waited a whole week, but no answer came, not another word from her. And Mama and Papa''s return was drawing nearer and nearer. So I came to San Francisco to get her. I wrote her I was coming. I shouldn''t have done that, should I?\""}],"attrs":{"dropCap":true}},{"type":"paragraph","content":[{"type":"text","text":"\"Maybe not. It''s not always easy to know what to do. You haven''t found her?\""}]},{"type":"paragraph","content":[{"type":"text","text":"\"No, I haven''t. I wrote her that I would go to the St. Mark, and I begged her to come and let me talk to her even if she didn''t intend to go home with me. But she didn''t come. I waited three days, and she didn''t come, didn''t even send me a message of any sort.\""}]},{"type":"paragraph","content":[{"type":"text","text":"Spade nodded his blond satan''s head, frowned sympathetically, and tightened his lips together."}]},{"type":"paragraph","content":[{"type":"text","text":"\"It was horrible,\" Miss Wonderly said, trying to smile. \"I couldn''t sit there like that—waiting—not knowing what had happened to her, what might be happening to her.\" She stopped trying to smile. She shuddered. \"The only address I had was General Delivery. I wrote her another letter, and yesterday afternoon I went to the Post Office. I stayed there until after dark, but I didn''t see her. I went there again this morning, and still didn''t see Corinne, but I saw Floyd Thursby.\""}]},{"type":"paragraph","content":[{"type":"text","text":"Spade nodded again. His frown went away. In its place came a look of sharp attentiveness."}]},{"type":"paragraph","content":[{"type":"text","text":"\"He wouldn''t tell me where Corinne was,\" she went on, hopelessly. \"He wouldn''t tell me anything, except that she was well and happy. But how can I believe that? That is what he would tell me anyhow, isn''t it?\""}]},{"type":"paragraph","content":[{"type":"text","text":"\"Sure,\" Spade agreed. \"But it might be true.\""}]}]}'::jsonb,
    '"Yes, and I sent her a telegram asking her to come home. I sent it to General Delivery here. That was the only address she gave me. I waited a whole week, but no answer came, not another word from her. And Mama and Papa''s return was drawing nearer and nearer. So I came to San Francisco to get her. I wrote her I was coming. I shouldn''t have done that, should I?"

"Maybe not. It''s not always easy to know what to do. You haven''t found her?"

"No, I haven''t. I wrote her that I would go to the St. Mark, and I begged her to come and let me talk to her even if she didn''t intend to go home with me. But she didn''t come. I waited three days, and she didn''t come, didn''t even send me a message of any sort."

Spade nodded his blond satan''s head, frowned sympathetically, and tightened his lips together.

"It was horrible," Miss Wonderly said, trying to smile. "I couldn''t sit there like that—waiting—not knowing what had happened to her, what might be happening to her." She stopped trying to smile. She shuddered. "The only address I had was General Delivery. I wrote her another letter, and yesterday afternoon I went to the Post Office. I stayed there until after dark, but I didn''t see her. I went there again this morning, and still didn''t see Corinne, but I saw Floyd Thursby."

Spade nodded again. His frown went away. In its place came a look of sharp attentiveness.

"He wouldn''t tell me where Corinne was," she went on, hopelessly. "He wouldn''t tell me anything, except that she was well and happy. But how can I believe that? That is what he would tell me anyhow, isn''t it?"

"Sure," Spade agreed. "But it might be true."',
    304
  )
  returning id into v_s_setup;

  insert into write.scenes (
    chapter_id, tale_id, user_id, title, sort_order,
    scene_color, scene_status, synopsis, content, plain_text, word_count
  ) values (
    v_ch1, v_tale_id, v_user_id, 'Five Thousand Dollars', 3,
    '#8b2635', 'Drafted', 'Thursby will come to the hotel tonight. Miles Archer walks in; the runaway-sister job becomes real—and dangerous.',
    '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"\"I hope it is. I do hope it is,\" she exclaimed. \"But I can''t go back home like this, without having seen her, without even having talked to her on the phone. He wouldn''t take me to her. He said she didn''t want to see me. I can''t believe that. He promised to tell her he had seen me, and to bring her to see me—if she would come—this evening at the hotel. He said he knew she wouldn''t. He promised to come himself if she wouldn''t. He—\""}],"attrs":{"dropCap":true}},{"type":"paragraph","content":[{"type":"text","text":"She broke off with a startled hand to her mouth as the door opened."}]},{"type":"paragraph","content":[{"type":"text","text":"The man who had opened the door came in a step, said \"Oh, excuse me!\" hastily took his brown hat from his head, and backed out."}]},{"type":"paragraph","content":[{"type":"text","text":"\"It''s all right, Miles,\" Spade told him. \"Come in. Miss Wonderly, this is Mr. Archer, my partner.\""}]},{"type":"paragraph","content":[{"type":"text","text":"Miles Archer came into the office again, shutting the door behind him, ducking his head and smiling at Miss Wonderly, making a vaguely polite gesture with the hat in his hand. He was of medium height, solidly built, wide in the shoulders, thick in the neck, with a jovial heavy-jawed red face and some grey in his close-trimmed hair. He was apparently as many years past forty as Spade was past thirty."}]},{"type":"paragraph","content":[{"type":"text","text":"Spade said: \"Miss Wonderly''s sister ran away from New York with a fellow named Floyd Thursby. They''re here. Miss Wonderly has seen Thursby and has a date with him tonight. Maybe he''ll bring the sister with him. The chances are he won''t. Miss Wonderly wants us to find the sister and get her away from him and back home.\" He looked at Miss Wonderly. \"Right?\""}]},{"type":"paragraph","content":[{"type":"text","text":"\"Yes,\" she said indistinctly."}]},{"type":"paragraph","content":[{"type":"text","text":"Spade winked at his partner."}]},{"type":"paragraph","content":[{"type":"text","text":"Miles Archer came forward to stand at a corner of the desk. While the girl looked at her bag he looked at her. His little brown eyes ran their bold appraising gaze from her lowered face to her feet and up to her face again. Then he looked at Spade and made a silent whistling mouth of appreciation."}]}]}'::jsonb,
    '"I hope it is. I do hope it is," she exclaimed. "But I can''t go back home like this, without having seen her, without even having talked to her on the phone. He wouldn''t take me to her. He said she didn''t want to see me. I can''t believe that. He promised to tell her he had seen me, and to bring her to see me—if she would come—this evening at the hotel. He said he knew she wouldn''t. He promised to come himself if she wouldn''t. He—"

She broke off with a startled hand to her mouth as the door opened.

The man who had opened the door came in a step, said "Oh, excuse me!" hastily took his brown hat from his head, and backed out.

"It''s all right, Miles," Spade told him. "Come in. Miss Wonderly, this is Mr. Archer, my partner."

Miles Archer came into the office again, shutting the door behind him, ducking his head and smiling at Miss Wonderly, making a vaguely polite gesture with the hat in his hand. He was of medium height, solidly built, wide in the shoulders, thick in the neck, with a jovial heavy-jawed red face and some grey in his close-trimmed hair. He was apparently as many years past forty as Spade was past thirty.

Spade said: "Miss Wonderly''s sister ran away from New York with a fellow named Floyd Thursby. They''re here. Miss Wonderly has seen Thursby and has a date with him tonight. Maybe he''ll bring the sister with him. The chances are he won''t. Miss Wonderly wants us to find the sister and get her away from him and back home." He looked at Miss Wonderly. "Right?"

"Yes," she said indistinctly.

Spade winked at his partner.

Miles Archer came forward to stand at a corner of the desk. While the girl looked at her bag he looked at her. His little brown eyes ran their bold appraising gaze from her lowered face to her feet and up to her face again. Then he looked at Spade and made a silent whistling mouth of appreciation.',
    349
  )
  returning id into v_s_catalyst;

  insert into write.scenes (
    chapter_id, tale_id, user_id, title, sort_order,
    scene_color, scene_status, synopsis, content, plain_text, word_count
  ) values (
    v_ch1, v_tale_id, v_user_id, 'Taking the Case', 4,
    '#5e5e5e', 'Raw', 'Shadow Thursby or walk? Wonderly press cash and fear; Archer grabs the tail himself while Spade weighs the risk.',
    '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"Spade lifted two fingers from the arm of his chair in a brief warning gesture and said: \"We shouldn''t have any trouble with it. It''s simply a matter of having a man at the hotel this evening to shadow him away when he leaves, and shadow him until he leads us to your sister. If she comes with him, and you persuade her to return with you, so much the better. Otherwise—if she doesn''t want to leave him after we''ve found her—well, we''ll find a way of managing that.\""}],"attrs":{"dropCap":true}},{"type":"paragraph","content":[{"type":"text","text":"Archer said: \"Yeh.\" His voice was heavy, coarse."}]},{"type":"paragraph","content":[{"type":"text","text":"Miss Wonderly looked up at Spade, quickly, puckering her forehead between her eyebrows. \"Oh, but you must be careful!\" Her voice shook a little, and her lips shaped the words with nervous jerkiness. \"I''m deathly afraid of him, of what he might do. She''s so young and his bringing her here from New York is such a serious—Mightn''t he—mightn''t he do—something to her?\""}]},{"type":"paragraph","content":[{"type":"text","text":"Spade smiled and patted the arms of his chair. \"Just leave that to us,\" he said. \"We''ll know how to handle him.\""}]},{"type":"paragraph","content":[{"type":"text","text":"\"But mightn''t he?\" she insisted."}]},{"type":"paragraph","content":[{"type":"text","text":"\"There''s always a chance.\" Spade nodded judicially. \"But you can trust us to take care of that.\""}]},{"type":"paragraph","content":[{"type":"text","text":"\"I do trust you,\" she said earnestly, \"but I want you to know that he''s a dangerous man. I honestly don''t think he''d stop at anything. I don''t believe he''d hesitate to—to kill Corinne if he thought it would save him. Mightn''t he do that?\""}]},{"type":"paragraph","content":[{"type":"text","text":"\"Mr. Spade, could either you or Mr. Archer look after it personally? I''d expect to be charged more, of course.\" She opened her handbag with nervous fingers and put two hundred-dollar bills on the desk. \"Would that be enough?\""}]},{"type":"paragraph","content":[{"type":"text","text":"\"Yeh,\" Archer said, \"and I''ll look after it myself.\""}]}]}'::jsonb,
    'Spade lifted two fingers from the arm of his chair in a brief warning gesture and said: "We shouldn''t have any trouble with it. It''s simply a matter of having a man at the hotel this evening to shadow him away when he leaves, and shadow him until he leads us to your sister. If she comes with him, and you persuade her to return with you, so much the better. Otherwise—if she doesn''t want to leave him after we''ve found her—well, we''ll find a way of managing that."

Archer said: "Yeh." His voice was heavy, coarse.

Miss Wonderly looked up at Spade, quickly, puckering her forehead between her eyebrows. "Oh, but you must be careful!" Her voice shook a little, and her lips shaped the words with nervous jerkiness. "I''m deathly afraid of him, of what he might do. She''s so young and his bringing her here from New York is such a serious—Mightn''t he—mightn''t he do—something to her?"

Spade smiled and patted the arms of his chair. "Just leave that to us," he said. "We''ll know how to handle him."

"But mightn''t he?" she insisted.

"There''s always a chance." Spade nodded judicially. "But you can trust us to take care of that."

"I do trust you," she said earnestly, "but I want you to know that he''s a dangerous man. I honestly don''t think he''d stop at anything. I don''t believe he''d hesitate to—to kill Corinne if he thought it would save him. Mightn''t he do that?"

"Mr. Spade, could either you or Mr. Archer look after it personally? I''d expect to be charged more, of course." She opened her handbag with nervous fingers and put two hundred-dollar bills on the desk. "Would that be enough?"

"Yeh," Archer said, "and I''ll look after it myself."',
    297
  )
  returning id into v_s_debate;

  insert into write.scenes (
    chapter_id, tale_id, user_id, title, sort_order,
    scene_color, scene_status, synopsis, content, plain_text, word_count
  ) values (
    v_ch2, v_tale_id, v_user_id, 'Miles Goes Out', 0,
    '#938938', 'Drafted', 'Archer commits: he will personally shadow Thursby from the hotel. No turning back for the partnership.',
    '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"Archer took the shadowing job himself. The hundred-dollar bills had brothers in Miss Wonderly''s bag, and he tucked one into a vest-pocket with a complacent growl."}],"attrs":{"dropCap":true}}]}'::jsonb,
    'Archer took the shadowing job himself. The hundred-dollar bills had brothers in Miss Wonderly''s bag, and he tucked one into a vest-pocket with a complacent growl.',
    26
  )
  returning id into v_s_break2;

  insert into write.scenes (
    chapter_id, tale_id, user_id, title, sort_order,
    scene_color, scene_status, synopsis, content, plain_text, word_count
  ) values (
    v_ch2, v_tale_id, v_user_id, 'Crossing the Line', 1,
    '#6b4c7a', 'Raw', 'Spade and Miles trade cracks about Wonderly—partners, appetites, and the first crack in the office bond.',
    '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"Spade grinned wolfishly. Maybe Archer saw her first, but Spade was already weighing what the girl had left unsaid—and what Thursby might do when a partner''s shadow got too close."}],"attrs":{"dropCap":true}}]}'::jsonb,
    'Spade grinned wolfishly. Maybe Archer saw her first, but Spade was already weighing what the girl had left unsaid—and what Thursby might do when a partner''s shadow got too close.',
    30
  )
  returning id into v_s_bstory;

  insert into write.scenes (
    chapter_id, tale_id, user_id, title, sort_order,
    scene_color, scene_status, synopsis, content, plain_text, word_count
  ) values (
    v_ch3, v_tale_id, v_user_id, 'Cairo in the Office', 0,
    '#c87533', 'Drafted', 'Joel Cairo arrives smelling of gardenia, hunting a black bird Spade has never heard of—until now.',
    '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"Joel Cairo smelled of gardenia. He was soft-spoken and Levantine, and he came into Spade''s office as if the black bird itself might be nested in a drawer."}],"attrs":{"dropCap":true}}]}'::jsonb,
    'Joel Cairo smelled of gardenia. He was soft-spoken and Levantine, and he came into Spade''s office as if the black bird itself might be nested in a drawer.',
    28
  )
  returning id into v_s_fun;

  insert into write.scenes (
    chapter_id, tale_id, user_id, title, sort_order,
    scene_color, scene_status, synopsis, content, plain_text, word_count
  ) values (
    v_ch3, v_tale_id, v_user_id, 'The Falcon Named', 1,
    '#3d5a80', 'Drafted', 'The Maltese Falcon is named: centuries of blood and greed crystallize into one figurine worth killing for.',
    '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"The bird was a black figure of a bird—a falcon—and men had killed for it across oceans and centuries. Spade listened, and filed every name."}],"attrs":{"dropCap":true}}]}'::jsonb,
    'The bird was a black figure of a bird—a falcon—and men had killed for it across oceans and centuries. Spade listened, and filed every name.',
    25
  )
  returning id into v_s_mid;

  insert into write.scenes (
    chapter_id, tale_id, user_id, title, sort_order,
    scene_color, scene_status, synopsis, content, plain_text, word_count
  ) values (
    v_ch3, v_tale_id, v_user_id, 'Gutman''s Soft Voice', 2,
    '#8b2635', 'Rewritten', 'Casper Gutman emerges—polite, vast, and closing in with money and pressure.',
    '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"Casper Gutman''s voice was soft and well-mannered, wrapping threats in courtesy. His round bulk filled the hotel suite like a occupying power."}],"attrs":{"dropCap":true}}]}'::jsonb,
    'Casper Gutman''s voice was soft and well-mannered, wrapping threats in courtesy. His round bulk filled the hotel suite like a occupying power.',
    22
  )
  returning id into v_s_badguys;

  insert into write.scenes (
    chapter_id, tale_id, user_id, title, sort_order,
    scene_color, scene_status, synopsis, content, plain_text, word_count
  ) values (
    v_ch3, v_tale_id, v_user_id, 'Thursby''s Shadow', 3,
    '#5e5e5e', 'Raw', 'Thursby''s trail darkens; Archer''s shadow job goes wrong—gut punch to the partnership.',
    '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"Floyd Thursby''s shadow lengthened over Bush Street. Where he went, violence seemed to follow—and Miles Archer had gone out to meet him."}],"attrs":{"dropCap":true}}]}'::jsonb,
    'Floyd Thursby''s shadow lengthened over Bush Street. Where he went, violence seemed to follow—and Miles Archer had gone out to meet him.',
    22
  )
  returning id into v_s_alllost;

  insert into write.scenes (
    chapter_id, tale_id, user_id, title, sort_order,
    scene_color, scene_status, synopsis, content, plain_text, word_count
  ) values (
    v_ch3, v_tale_id, v_user_id, 'Joel Cairo Again', 4,
    '#4a6741', 'Raw', 'Cairo returns with steel and soft words. Spade sits in the wreckage and decides how hard to hit back.',
    '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"Cairo returned with gloves and a gun and a question about the falcon. Spade answered with his fists and then his wits—whichever fit the room."}],"attrs":{"dropCap":true}}]}'::jsonb,
    'Cairo returned with gloves and a gun and a question about the falcon. Spade answered with his fists and then his wits—whichever fit the room.',
    25
  )
  returning id into v_s_darknight;

  insert into write.scenes (
    chapter_id, tale_id, user_id, title, sort_order,
    scene_color, scene_status, synopsis, content, plain_text, word_count
  ) values (
    v_ch4, v_tale_id, v_user_id, 'The Fat Man', 0,
    '#938938', 'Drafted', 'Gutman''s suite: terms, lies, and a plan that binds A-story greed to B-story betrayal.',
    '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"The fat man offered partnership, then patronage, then something closer to ownership. Spade smiled his blond satan''s smile and kept his powder dry."}],"attrs":{"dropCap":true}}]}'::jsonb,
    'The fat man offered partnership, then patronage, then something closer to ownership. Spade smiled his blond satan''s smile and kept his powder dry.',
    23
  )
  returning id into v_s_break3;

  insert into write.scenes (
    chapter_id, tale_id, user_id, title, sort_order,
    scene_color, scene_status, synopsis, content, plain_text, word_count
  ) values (
    v_ch4, v_tale_id, v_user_id, 'Spade Plays His Hand', 1,
    '#c87533', 'Rewritten', 'Every lesson of the case gets thrown into the ring—Spade forces the truth into the open.',
    '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"Spade played each side against the other until the desk was covered with crossed motives. The falcon, if it existed, would have to choose a master."}],"attrs":{"dropCap":true}}]}'::jsonb,
    'Spade played each side against the other until the desk was covered with crossed motives. The falcon, if it existed, would have to choose a master.',
    26
  )
  returning id into v_s_finale;

  insert into write.scenes (
    chapter_id, tale_id, user_id, title, sort_order,
    scene_color, scene_status, synopsis, content, plain_text, word_count
  ) values (
    v_ch4, v_tale_id, v_user_id, 'The Falcon''s Weight', 2,
    '#4a6741', 'Final', 'The black bird''s weight settles. Who walks, who falls, and what Spade keeps of himself.',
    '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"When the bird came it was heavy with history and light on truth. Spade weighed what he could keep, what he must give up, and who walked free."}],"attrs":{"dropCap":true}}]}'::jsonb,
    'When the bird came it was heavy with history and light on truth. Spade weighed what he could keep, what he must give up, and who walked free.',
    28
  )
  returning id into v_s_finalimg;

  insert into write.characters (
    tale_id, user_id, name, role, bio, sort_order, tags
  ) values (
    v_tale_id, v_user_id, 'Sam Spade', 'Protagonist',
    '{"summary":"Hard-boiled San Francisco private detective; blond satan look, keeps his own counsel and a desk full of limp cigarettes."}'::jsonb, 0, array['protagonist', 'detective']::text[]
  )
  returning id into v_char_sam_spade;

  insert into write.characters (
    tale_id, user_id, name, role, bio, sort_order, tags
  ) values (
    v_tale_id, v_user_id, 'Miles Archer', 'Partner',
    '{"summary":"Spade''s partner—jovial, heavy-jawed, and too ready to take the pretty client''s money and the dangerous shadow job."}'::jsonb, 1, array['partner', 'victim']::text[]
  )
  returning id into v_char_miles_archer;

  insert into write.characters (
    tale_id, user_id, name, role, bio, sort_order, tags
  ) values (
    v_tale_id, v_user_id, 'Brigid O''Shaughnessy', 'Femme Fatale',
    '{"summary":"Alias Miss Wonderly (and others); hunting the falcon with a sister story Spade only half believes."}'::jsonb, 2, array['client', 'liar', 'wonderly']::text[]
  )
  returning id into v_char_brigid_o_shaughnessy;

  insert into write.characters (
    tale_id, user_id, name, role, bio, sort_order, tags
  ) values (
    v_tale_id, v_user_id, 'Effie Perine', 'Girl Friday',
    '{"summary":"Spade''s loyal secretary—lanky, sunburned, and sharp enough to call Wonderly a knockout before she shoves her in."}'::jsonb, 3, array['ally', 'office']::text[]
  )
  returning id into v_char_effie_perine;

  insert into write.characters (
    tale_id, user_id, name, role, bio, sort_order, tags
  ) values (
    v_tale_id, v_user_id, 'Joel Cairo', 'Antagonist',
    '{"summary":"Soft-spoken Levantine with gardenia cologne; wants the black bird and will pay—or shoot—for it."}'::jsonb, 4, array['levantine', 'collector']::text[]
  )
  returning id into v_char_joel_cairo;

  insert into write.characters (
    tale_id, user_id, name, role, bio, sort_order, tags
  ) values (
    v_tale_id, v_user_id, 'Casper Gutman', 'Antagonist',
    '{"summary":"The fat man: obsessive collector of the falcon, wrapping threat in soft manners and hotel-suite hospitality."}'::jsonb, 5, array['fat-man', 'mastermind']::text[]
  )
  returning id into v_char_casper_gutman;

  insert into write.characters (
    tale_id, user_id, name, role, bio, sort_order, tags
  ) values (
    v_tale_id, v_user_id, 'Wilmer Cook', 'Henchman',
    '{"summary":"Gutman''s young gunsel—thin, keyed-up, and always half a step from violence."}'::jsonb, 6, array['gunman', 'kid']::text[]
  )
  returning id into v_char_wilmer_cook;

  insert into write.characters (
    tale_id, user_id, name, role, bio, sort_order, tags
  ) values (
    v_tale_id, v_user_id, 'Detective Tom Polhaus', 'Police',
    '{"summary":"Homicide dick who knows Spade''s habits and shows when a partner ends up dead."}'::jsonb, 7, array['copper', 'homicide']::text[]
  )
  returning id into v_char_detective_tom_polhaus;

  insert into write.characters (
    tale_id, user_id, name, role, bio, sort_order, tags
  ) values (
    v_tale_id, v_user_id, 'Lieutenant Dundy', 'Police',
    '{"summary":"Hard-edged lieutenant who distrusts Spade''s stories and wants answers faster than Spade will give them."}'::jsonb, 8, array['copper', 'lieutenant']::text[]
  )
  returning id into v_char_lieutenant_dundy;

  insert into write.locations (
    tale_id, user_id, name, description, notes, sort_order, tags
  ) values (
    v_tale_id, v_user_id, 'Spade & Archer''s Office', 'Partnership rooms on Bush Street—oaken chairs, green blotter, ammonia from the court, and cigarette ash that crawls in the draft.',
    '{"summary":"Home base for the agency; Effie guards the outer door."}'::jsonb, 0, array['office', 'bush-street']::text[]
  )
  returning id into v_loc_spade_archer_s_office;

  insert into write.locations (
    tale_id, user_id, name, description, notes, sort_order, tags
  ) values (
    v_tale_id, v_user_id, 'Hotel Belvedere', 'Where Cairo and other out-of-town operators put up while hunting the bird.',
    '{"summary":"Gardenia and gloves in the corridor."}'::jsonb, 1, array['hotel', 'cairo']::text[]
  )
  returning id into v_loc_hotel_belvedere;

  insert into write.locations (
    tale_id, user_id, name, description, notes, sort_order, tags
  ) values (
    v_tale_id, v_user_id, 'St. Mark Hotel', 'Miss Wonderly''s hotel—lobby shadow work and the Thursby rendezvous after eight.',
    '{"summary":"Archer''s tail starts here."}'::jsonb, 2, array['hotel', 'wonderly']::text[]
  )
  returning id into v_loc_st_mark_hotel;

  insert into write.locations (
    tale_id, user_id, name, description, notes, sort_order, tags
  ) values (
    v_tale_id, v_user_id, 'Geary Street Flat', 'Spade''s apartment—night calls, coffee, and the soft edge of the city after the office closes.',
    '{"summary":"Where Spade ends long days."}'::jsonb, 3, array['spade', 'home']::text[]
  )
  returning id into v_loc_geary_street_flat;

  insert into write.locations (
    tale_id, user_id, name, description, notes, sort_order, tags
  ) values (
    v_tale_id, v_user_id, 'Gutman''s Suite', 'The fat man''s hotel quarters—soft voice, hard bargains, and a room that feels occupied by bulk alone.',
    '{"summary":"Center of Act Three pressure."}'::jsonb, 4, array['hotel', 'fat-man']::text[]
  )
  returning id into v_loc_gutman_s_suite;

  insert into write.locations (
    tale_id, user_id, name, description, notes, sort_order, tags
  ) values (
    v_tale_id, v_user_id, 'San Francisco Docks', 'Fog, ships, and rumor—where a black bird might step off a boat into murder.',
    '{"summary":"Arrival point for the falcon lore."}'::jsonb, 5, array['waterfront', 'fog']::text[]
  )
  returning id into v_loc_san_francisco_docks;

  insert into write.research_items (
    tale_id, user_id, title, body, url, tags, sort_order
  ) values (
    v_tale_id, v_user_id, 'The Maltese Tribute Bird', 'Twelve centuries ago the Knights of Malta allegedly paid yearly tribute to the King of Spain with a jeweled falcon. The token became legend—and then an object men would kill to possess. Use as mythic MacGuffin backstory when Gutman holds court.',
    null, array['falcon', 'history', 'macguffin']::text[], 0
  );

  insert into write.research_items (
    tale_id, user_id, title, body, url, tags, sort_order
  ) values (
    v_tale_id, v_user_id, '1920s San Francisco Private Eyes', 'Continental agencies, partnership letterheads, shadow work from hotel lobbies, and cash retainers on the blotter. Tone: hardboiled, not cozy. Keep city geography tight—Bush, Geary, the hills, and the waterfront.',
    null, array['period', 'detective', 'sf']::text[], 1
  );

  insert into write.research_items (
    tale_id, user_id, title, body, url, tags, sort_order
  ) values (
    v_tale_id, v_user_id, 'City Geography Stub', 'Bush Street office → St. Mark / Belvedere hotels → Geary flat → waterfront. Short hops keep scenes moving; fog and hill grades do atmosphere work for free.',
    null, array['geography', 'sf', 'research']::text[], 2
  );

  insert into write.research_items (
    tale_id, user_id, title, body, url, tags, sort_order
  ) values (
    v_tale_id, v_user_id, 'Wonderly Alias List', 'Miss Wonderly · Brigid O''Shaughnessy · other hotel names as needed. Track which alias Spade and the cops know in each scene so Inspector links stay honest.',
    null, array['falcon', 'alias', 'brigid']::text[], 3
  );

  insert into write.beat_links (tale_id, beat_key, scene_id) values
    (v_tale_id, 'stc_01', v_s_opening),
    (v_tale_id, 'stc_02', v_s_theme),
    (v_tale_id, 'stc_03', v_s_setup),
    (v_tale_id, 'stc_04', v_s_catalyst),
    (v_tale_id, 'stc_05', v_s_debate),
    (v_tale_id, 'stc_06', v_s_break2),
    (v_tale_id, 'stc_07', v_s_bstory),
    (v_tale_id, 'stc_08', v_s_fun),
    (v_tale_id, 'stc_09', v_s_mid),
    (v_tale_id, 'stc_10', v_s_badguys),
    (v_tale_id, 'stc_11', v_s_alllost),
    (v_tale_id, 'stc_12', v_s_darknight),
    (v_tale_id, 'stc_13', v_s_break3),
    (v_tale_id, 'stc_14', v_s_finale),
    (v_tale_id, 'stc_15', v_s_finalimg);

  insert into write.scene_character_links (tale_id, scene_id, character_id) values
    (v_tale_id, v_s_opening, v_char_sam_spade),
    (v_tale_id, v_s_opening, v_char_miles_archer),
    (v_tale_id, v_s_opening, v_char_effie_perine),
    (v_tale_id, v_s_opening, v_char_brigid_o_shaughnessy),
    (v_tale_id, v_s_theme, v_char_sam_spade),
    (v_tale_id, v_s_theme, v_char_brigid_o_shaughnessy),
    (v_tale_id, v_s_setup, v_char_sam_spade),
    (v_tale_id, v_s_setup, v_char_brigid_o_shaughnessy),
    (v_tale_id, v_s_catalyst, v_char_sam_spade),
    (v_tale_id, v_s_catalyst, v_char_miles_archer),
    (v_tale_id, v_s_catalyst, v_char_brigid_o_shaughnessy),
    (v_tale_id, v_s_debate, v_char_sam_spade),
    (v_tale_id, v_s_debate, v_char_miles_archer),
    (v_tale_id, v_s_debate, v_char_brigid_o_shaughnessy),
    (v_tale_id, v_s_break2, v_char_miles_archer),
    (v_tale_id, v_s_break2, v_char_brigid_o_shaughnessy),
    (v_tale_id, v_s_break2, v_char_sam_spade),
    (v_tale_id, v_s_bstory, v_char_sam_spade),
    (v_tale_id, v_s_bstory, v_char_miles_archer),
    (v_tale_id, v_s_fun, v_char_sam_spade),
    (v_tale_id, v_s_fun, v_char_joel_cairo),
    (v_tale_id, v_s_mid, v_char_sam_spade),
    (v_tale_id, v_s_mid, v_char_joel_cairo),
    (v_tale_id, v_s_mid, v_char_casper_gutman),
    (v_tale_id, v_s_badguys, v_char_sam_spade),
    (v_tale_id, v_s_badguys, v_char_casper_gutman),
    (v_tale_id, v_s_badguys, v_char_wilmer_cook),
    (v_tale_id, v_s_alllost, v_char_miles_archer),
    (v_tale_id, v_s_alllost, v_char_sam_spade),
    (v_tale_id, v_s_darknight, v_char_sam_spade),
    (v_tale_id, v_s_darknight, v_char_joel_cairo),
    (v_tale_id, v_s_break3, v_char_sam_spade),
    (v_tale_id, v_s_break3, v_char_casper_gutman),
    (v_tale_id, v_s_break3, v_char_wilmer_cook),
    (v_tale_id, v_s_finale, v_char_sam_spade),
    (v_tale_id, v_s_finale, v_char_brigid_o_shaughnessy),
    (v_tale_id, v_s_finale, v_char_casper_gutman),
    (v_tale_id, v_s_finale, v_char_joel_cairo),
    (v_tale_id, v_s_finalimg, v_char_sam_spade),
    (v_tale_id, v_s_finalimg, v_char_brigid_o_shaughnessy),
    (v_tale_id, v_s_finalimg, v_char_detective_tom_polhaus);

  insert into write.scene_location_links (tale_id, scene_id, location_id) values
    (v_tale_id, v_s_opening, v_loc_spade_archer_s_office),
    (v_tale_id, v_s_theme, v_loc_spade_archer_s_office),
    (v_tale_id, v_s_setup, v_loc_spade_archer_s_office),
    (v_tale_id, v_s_setup, v_loc_st_mark_hotel),
    (v_tale_id, v_s_catalyst, v_loc_spade_archer_s_office),
    (v_tale_id, v_s_debate, v_loc_spade_archer_s_office),
    (v_tale_id, v_s_debate, v_loc_st_mark_hotel),
    (v_tale_id, v_s_break2, v_loc_st_mark_hotel),
    (v_tale_id, v_s_bstory, v_loc_spade_archer_s_office),
    (v_tale_id, v_s_fun, v_loc_spade_archer_s_office),
    (v_tale_id, v_s_mid, v_loc_spade_archer_s_office),
    (v_tale_id, v_s_badguys, v_loc_gutman_s_suite),
    (v_tale_id, v_s_alllost, v_loc_san_francisco_docks),
    (v_tale_id, v_s_darknight, v_loc_spade_archer_s_office),
    (v_tale_id, v_s_break3, v_loc_gutman_s_suite),
    (v_tale_id, v_s_finale, v_loc_gutman_s_suite),
    (v_tale_id, v_s_finalimg, v_loc_geary_street_flat),
    (v_tale_id, v_s_finalimg, v_loc_spade_archer_s_office);

  raise notice 'Seeded The Maltese Falcon (tale_id=%) for %', v_tale_id, owner_email;
end $$;

