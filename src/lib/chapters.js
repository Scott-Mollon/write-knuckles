const DEFAULT_CHAPTER_TITLE_RE = /^Chapter \d+$/

export const getChapterCustomTitle = (title) => {
  const trimmed = title?.trim() || ''
  if (!trimmed || DEFAULT_CHAPTER_TITLE_RE.test(trimmed)) return ''
  return trimmed
}

export const formatChapterLabel = (chapter, chapterIndex) => {
  const number = `Chapter ${chapterIndex + 1}`
  const custom = getChapterCustomTitle(chapter.title)
  return custom ? `${number} — ${custom}` : number
}

export const formatChapterNumber = (chapterIndex) => `Chapter ${chapterIndex + 1}`
