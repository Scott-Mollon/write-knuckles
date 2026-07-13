const DEFAULT_CHAPTER_TITLE_RE = /^Chapter \d+$/

export function getChapterCustomTitle(title) {
  const trimmed = title?.trim() || ''
  if (!trimmed || DEFAULT_CHAPTER_TITLE_RE.test(trimmed)) return ''
  return trimmed
}

export function buildChapterHeadingParts(chapterTitle, chapterIndex, options) {
  const customTitle = getChapterCustomTitle(chapterTitle)
  const parts = []

  if (options.includeChapterWord && options.includeChapterNumber) {
    parts.push({ type: 'prefix', text: `Chapter ${chapterIndex + 1}` })
  } else if (options.includeChapterWord) {
    parts.push({ type: 'word', text: 'Chapter' })
  } else if (options.includeChapterNumber) {
    parts.push({ type: 'number', text: String(chapterIndex + 1) })
  }

  if (options.includeChapterTitle && customTitle) {
    parts.push({ type: 'title', text: customTitle })
  }

  return parts
}

export function getChapterHeadingPrefix(parts) {
  const prefixPart = parts.find((part) => part.type === 'prefix')
  if (prefixPart) return prefixPart.text

  return parts
    .filter((part) => part.type === 'word' || part.type === 'number')
    .map((part) => part.text)
    .join(' ')
}

export function buildChapterHeading(chapterTitle, chapterIndex, options) {
  const parts = buildChapterHeadingParts(chapterTitle, chapterIndex, options)
  if (parts.length === 0) return null

  const prefix = getChapterHeadingPrefix(parts)
  const titlePart = parts.find((part) => part.type === 'title')

  if (titlePart && options.chapterTitleOnOwnLine) {
    return prefix ? `${prefix}\n${titlePart.text}` : titlePart.text
  }

  if (titlePart) {
    return prefix ? `${prefix} — ${titlePart.text}` : titlePart.text
  }

  return prefix || null
}

export function validateCompileOptions(_options) {
  return null
}
