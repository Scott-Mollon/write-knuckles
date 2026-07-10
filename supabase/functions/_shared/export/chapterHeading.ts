import type { ExportOptions } from './types.ts'

const DEFAULT_CHAPTER_TITLE_RE = /^Chapter \d+$/

export function getChapterCustomTitle(title: string | null | undefined): string {
  const trimmed = title?.trim() || ''
  if (!trimmed || DEFAULT_CHAPTER_TITLE_RE.test(trimmed)) return ''
  return trimmed
}

export function buildChapterHeading(
  chapterTitle: string | null | undefined,
  chapterIndex: number,
  options: ExportOptions,
): string | null {
  const parts: string[] = []
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

export function validateExportOptions(_options: ExportOptions): string | null {
  return null
}
