import {
  CHAPTER_HEADING_STYLE_KEYS,
  DEFAULT_COMPILE_CHAPTER_HEADING_STYLES,
} from '../../constants/compile.js'
import { getChapterHeadingPrefix } from './chapterHeading.js'
import {
  buildCompileTextStyleAttr,
  normalizeCompileTextStyles,
} from './compileTextStyle.js'

function migrateChapterHeadingStyles(raw) {
  if (!raw || typeof raw !== 'object') return null

  return {
    label: raw.label ?? raw.word ?? raw.number,
    title: raw.title,
  }
}

export function normalizeChapterHeadingStyles(raw) {
  return normalizeCompileTextStyles(
    migrateChapterHeadingStyles(raw),
    DEFAULT_COMPILE_CHAPTER_HEADING_STYLES,
    CHAPTER_HEADING_STYLE_KEYS,
  )
}

export function getChapterHeadingStyles(options) {
  return normalizeChapterHeadingStyles(options?.chapterHeadingStyles)
}

export function buildChapterHeadingHtml(headingParts, options, escapeHtml) {
  if (!headingParts?.length) return ''

  const styles = getChapterHeadingStyles(options)
  const prefix = getChapterHeadingPrefix(headingParts)
  const titlePart = headingParts.find((part) => part.type === 'title')
  const titleOnOwnLine = Boolean(options.chapterTitleOnOwnLine)

  if (titleOnOwnLine && titlePart) {
    const htmlParts = []

    if (prefix) {
      htmlParts.push(
        `<span style='${buildCompileTextStyleAttr(styles.label, { block: true })}'>${escapeHtml(prefix)}</span>`,
      )
    }

    htmlParts.push(
      `<span style='${buildCompileTextStyleAttr(styles.title, { block: true })}'>${escapeHtml(titlePart.text)}</span>`,
    )

    return `<h2 class="export-chapter-heading">${htmlParts.join('')}</h2>`
  }

  let text = prefix || ''
  if (titlePart) {
    text = text ? `${text} — ${titlePart.text}` : titlePart.text
  }

  return `<h2 class="export-chapter-heading"><span style='${buildCompileTextStyleAttr(styles.label, { block: true })}'>${escapeHtml(text)}</span></h2>`
}
