import { getTaleTerminology } from './taleTerminology'

const DEFAULT_CHAPTER_TITLE_RE = /^(Chapter|Issue) \d+$/

export const getChapterCustomTitle = (title) => {
  const trimmed = title?.trim() || ''
  if (!trimmed || DEFAULT_CHAPTER_TITLE_RE.test(trimmed)) return ''
  return trimmed
}

export const formatChapterLabel = (chapter, chapterIndex, taleOrType = null) => {
  const terms = getTaleTerminology(taleOrType)
  const number = `${terms.chapter} ${chapterIndex + 1}`
  const custom = getChapterCustomTitle(chapter.title)
  return custom ? `${number} — ${custom}` : number
}

export const formatChapterNumber = (chapterIndex, taleOrType = null) => {
  const terms = getTaleTerminology(taleOrType)
  return `${terms.chapter} ${chapterIndex + 1}`
}
