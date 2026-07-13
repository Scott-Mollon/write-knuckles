const DEFAULT_CHAPTER_TITLE_RE = /^Chapter \d+$/

export function getChapterCustomTitle(title) {
  const trimmed = title?.trim() || ''
  if (!trimmed || DEFAULT_CHAPTER_TITLE_RE.test(trimmed)) return ''
  return trimmed
}

export function buildChapterHeading(chapterTitle, chapterIndex, options) {
  const parts = []
  const customTitle = getChapterCustomTitle(chapterTitle)

  if (options.includeChapterWord) {
    parts.push('Chapter')
  }

  if (options.includeChapterNumber) {
    parts.push(String(chapterIndex + 1))
  }

  let heading = ''
  if (parts.length > 0) {
    heading = parts.join(' ')
  }

  if (options.includeChapterTitle && customTitle) {
    heading = heading ? `${heading} — ${customTitle}` : customTitle
  }

  return heading || null
}

export function validateCompileOptions(_options) {
  return null
}
