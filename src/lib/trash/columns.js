/**
 * Columns needed for Trash list labels + restore/delete by id.
 * Excludes TipTap bodies and other large payloads.
 */
export const TRASH_CHAPTER_COLUMNS = ['id', 'title', 'deleted_at'].join(', ')

export const TRASH_SCENE_COLUMNS = [
  'id',
  'chapter_id',
  'title',
  'word_count',
  'deleted_at',
].join(', ')

export const TRASH_CHARACTER_COLUMNS = ['id', 'name', 'deleted_at'].join(', ')

export const TRASH_LOCATION_COLUMNS = ['id', 'name', 'deleted_at'].join(', ')

export const TRASH_RESEARCH_COLUMNS = ['id', 'title', 'deleted_at'].join(', ')
