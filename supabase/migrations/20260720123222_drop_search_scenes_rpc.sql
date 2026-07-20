-- Remove unused FTS RPC. Write Search is client-side (find/replace on scene bodies).
-- Keep idx_scenes_plain_text for a possible future server search.

drop function if exists write.search_scenes(uuid, text);
