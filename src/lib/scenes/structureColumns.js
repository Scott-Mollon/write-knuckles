/**
 * Scene columns safe to load with the tale outline.
 * Excludes `content` and `plain_text` so editor open stays O(metadata).
 * Body fields are fetched per-scene via useSceneContent (Phase 1B).
 */
export const SCENE_STRUCTURE_COLUMNS = [
  'id',
  'chapter_id',
  'tale_id',
  'user_id',
  'title',
  'sort_order',
  'scene_color',
  'scene_status',
  'synopsis',
  'word_count',
  'created_at',
  'updated_at',
  'deleted_at',
].join(', ')
