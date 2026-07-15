import { formatAuthorLine } from './formatAuthor.js'
import { getChapterCustomTitle } from './chapterHeading.js'

/**
 * Build structured lines for a comic-script per-issue title page.
 * Order: Title, Subtitle, Issue word/number, Issue title, Author.
 * Word/number/title follow includeChapterWord / includeChapterNumber / includeChapterTitle.
 */
export function buildIssueTitlePageLines(model, chapter, options) {
  const lines = []
  const chapterWord = model.chapterWord || 'Issue'
  const issueNumber = chapter.issueNumber
  const issueTitle = getChapterCustomTitle(chapter.title)

  if (options.titlePage && model.title?.trim()) {
    lines.push({ type: 'title', text: model.title.trim() })
  }

  if (options.includeSubtitle && model.subtitle?.trim()) {
    lines.push({ type: 'subtitle', text: model.subtitle.trim() })
  }

  const labelParts = []
  if (options.includeChapterWord) {
    labelParts.push({ type: 'issueWord', text: chapterWord })
  }
  if (options.includeChapterNumber && issueNumber != null) {
    labelParts.push({ type: 'issueNumber', text: String(issueNumber) })
  }
  if (labelParts.length > 0) {
    lines.push({ type: 'issueLabel', parts: labelParts })
  }

  if (options.includeChapterTitle && issueTitle) {
    lines.push({ type: 'issueTitle', text: issueTitle })
  }

  const authorLine = formatAuthorLine(model.author)
  if (options.includeAuthor && authorLine) {
    lines.push({ type: 'author', text: authorLine })
  }

  return lines
}

/** Flat plain-text lines (for TXT export). */
export function issueTitlePageLinesToText(lines) {
  return lines.map((line) => {
    if (line.type === 'issueLabel') {
      return line.parts.map((part) => part.text).join(' ')
    }
    return line.text
  })
}
