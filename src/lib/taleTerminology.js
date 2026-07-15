import { DEFAULT_TALE_TYPE, TALE_TYPES } from '../constants/taleTypes.js'

/**
 * True only when tale_type is explicitly comic. Missing/null → prose.
 */
export const isComicTale = (taleOrType) => {
  if (taleOrType == null) return false
  const type =
    typeof taleOrType === 'string' ? taleOrType : taleOrType.tale_type
  return type === TALE_TYPES.COMIC
}

export const getTaleType = (taleOrType) => {
  if (taleOrType == null) return DEFAULT_TALE_TYPE
  const type =
    typeof taleOrType === 'string' ? taleOrType : taleOrType.tale_type
  return type === TALE_TYPES.COMIC ? TALE_TYPES.COMIC : TALE_TYPES.PROSE
}

const PROSE_TERMS = {
  chapter: 'Chapter',
  chapterPlural: 'Chapters',
  scene: 'Scene',
  scenePlural: 'Scenes',
  defaultSceneTitle: 'Scene 1',
  byChapterView: 'By Chapter',
  byBeatView: 'By Beat',
  chapterWord: 'Chapter',
  sceneWord: 'Scene',
  addChapter: '+ Chapter',
  addScene: '+ Scene',
  chapterTitlePlaceholder: 'Chapter title',
  unknownChapter: 'Unknown chapter',
}

const COMIC_TERMS = {
  chapter: 'Issue',
  chapterPlural: 'Issues',
  scene: 'Page',
  scenePlural: 'Pages',
  defaultSceneTitle: 'Page 1',
  byChapterView: 'By Issue',
  byBeatView: 'By Beat',
  chapterWord: 'Issue',
  sceneWord: 'Page',
  addChapter: '+ Issue',
  addScene: '+ Page',
  chapterTitlePlaceholder: 'Issue title',
  unknownChapter: 'Unknown issue',
}

export const getTaleTerminology = (taleOrType) =>
  isComicTale(taleOrType) ? COMIC_TERMS : PROSE_TERMS
