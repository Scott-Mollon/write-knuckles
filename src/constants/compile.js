/** CSS @page size keywords supported by Paged.js */
import { SCENE_FONT_GROUPS, SCENE_FONT_OPTIONS } from './sceneFonts.js'

export const COMPILE_TITLE_PAGE_EXTRA_FONTS = [
  { label: 'Oswald', value: 'Oswald, sans-serif', group: 'web' },
]

export const COMPILE_TITLE_PAGE_FONT_OPTIONS = [
  ...COMPILE_TITLE_PAGE_EXTRA_FONTS,
  ...SCENE_FONT_OPTIONS,
]

export const COMPILE_TITLE_PAGE_FONT_GROUPS = SCENE_FONT_GROUPS

export const COMPILE_TITLE_PAGE_FONT_SIZE_OPTIONS = [
  8, 9, 10, 11, 12, 13, 14, 16, 18, 20, 24, 28, 32, 36, 48,
]

export const COMPILE_TEXT_FONT_OPTIONS = COMPILE_TITLE_PAGE_FONT_OPTIONS
export const COMPILE_TEXT_FONT_GROUPS = COMPILE_TITLE_PAGE_FONT_GROUPS
export const COMPILE_TEXT_FONT_SIZE_OPTIONS = COMPILE_TITLE_PAGE_FONT_SIZE_OPTIONS

export const COMPILE_TEXT_ALIGN_OPTIONS = [
  { id: 'left', label: 'Left' },
  { id: 'center', label: 'Center' },
  { id: 'right', label: 'Right' },
]

export const COMPILE_TEXT_ALIGNS = {
  left: 'left',
  center: 'center',
  right: 'right',
}

export const COMPILE_TEXT_COLORS = {
  accent: '#726a2b',
  text: '#1a1410',
  textSubtle: 'rgba(26, 20, 16, 0.7)',
}

export const TITLE_PAGE_STYLE_KEYS = [
  'title',
  'subtitle',
  'author',
  'issueWord',
  'issueNumber',
  'issueTitle',
]

export const DEFAULT_COMPILE_TITLE_PAGE_STYLES = {
  title: {
    font: 'Oswald, sans-serif',
    fontSizePt: 24,
    bold: true,
    italic: false,
    underline: false,
    align: 'center',
    color: COMPILE_TEXT_COLORS.accent,
  },
  subtitle: {
    font: 'Georgia, serif',
    fontSizePt: 13,
    bold: false,
    italic: true,
    underline: false,
    align: 'center',
    color: COMPILE_TEXT_COLORS.textSubtle,
  },
  author: {
    font: 'Georgia, serif',
    fontSizePt: 11,
    bold: false,
    italic: false,
    underline: false,
    align: 'center',
    color: COMPILE_TEXT_COLORS.text,
  },
  issueWord: {
    font: 'Oswald, sans-serif',
    fontSizePt: 16,
    bold: true,
    italic: false,
    underline: false,
    align: 'center',
    color: COMPILE_TEXT_COLORS.accent,
  },
  issueNumber: {
    font: 'Oswald, sans-serif',
    fontSizePt: 16,
    bold: true,
    italic: false,
    underline: false,
    align: 'center',
    color: COMPILE_TEXT_COLORS.accent,
  },
  issueTitle: {
    font: 'Georgia, serif',
    fontSizePt: 14,
    bold: false,
    italic: true,
    underline: false,
    align: 'center',
    color: COMPILE_TEXT_COLORS.text,
  },
}

export const COMPILE_TITLE_PAGE_STYLE_OPTIONS = [
  { optionKey: 'titlePage', styleKey: 'title', label: 'Title', stylesKey: 'titlePageStyles' },
  { optionKey: 'includeSubtitle', styleKey: 'subtitle', label: 'Subtitle', stylesKey: 'titlePageStyles' },
  { optionKey: 'includeAuthor', styleKey: 'author', label: 'Author', stylesKey: 'titlePageStyles' },
  {
    optionKey: 'includeChapterWord',
    styleKey: 'issueWord',
    label: 'Issue word',
    stylesKey: 'titlePageStyles',
    comicOnly: true,
  },
  {
    optionKey: 'includeChapterNumber',
    styleKey: 'issueNumber',
    label: 'Issue number',
    stylesKey: 'titlePageStyles',
    comicOnly: true,
  },
  {
    optionKey: 'includeChapterTitle',
    styleKey: 'issueTitle',
    label: 'Issue title',
    stylesKey: 'titlePageStyles',
    comicOnly: true,
  },
]

export const CHAPTER_HEADING_STYLE_KEYS = ['label', 'title']

export const DEFAULT_COMPILE_CHAPTER_HEADING_STYLES = {
  label: {
    font: 'Oswald, sans-serif',
    fontSizePt: 16,
    bold: true,
    italic: false,
    underline: false,
    align: 'left',
    color: COMPILE_TEXT_COLORS.accent,
  },
  title: {
    font: 'Oswald, sans-serif',
    fontSizePt: 16,
    bold: true,
    italic: false,
    underline: false,
    align: 'left',
    color: COMPILE_TEXT_COLORS.accent,
  },
}

export const COMPILE_STYLED_OPTION_CONFIGS = [
  ...COMPILE_TITLE_PAGE_STYLE_OPTIONS,
  {
    optionKey: 'includePageNumbers',
    label: 'Page numbers',
    stylesKey: 'pageNumberStyle',
    flatStyle: true,
  },
]

export const DEFAULT_COMPILE_PAGE_NUMBER_STYLE = {
  font: 'Georgia, serif',
  fontSizePt: 10,
  bold: false,
  italic: false,
  underline: false,
  align: 'center',
  color: COMPILE_TEXT_COLORS.textSubtle,
}

export const COMPILE_PAGE_SIZES = {
  letter: 'letter',
  legal: 'legal',
  ledger: 'ledger',
  a0: 'A0',
  a1: 'A1',
  a2: 'A2',
  a3: 'A3',
  a4: 'A4',
  a5: 'A5',
  a6: 'A6',
  a7: 'A7',
  a10: 'A10',
  b4: 'B4',
  b5: 'B5',
}

export const COMPILE_PAGE_SIZE_OPTIONS = [
  { id: 'letter', label: 'US Letter', detail: '8.5 × 11 in' },
  { id: 'legal', label: 'US Legal', detail: '8.5 × 14 in' },
  { id: 'ledger', label: 'Ledger', detail: '11 × 17 in' },
  { id: 'a0', label: 'A0', detail: '841 × 1189 mm' },
  { id: 'a1', label: 'A1', detail: '594 × 841 mm' },
  { id: 'a2', label: 'A2', detail: '420 × 594 mm' },
  { id: 'a3', label: 'A3', detail: '297 × 420 mm' },
  { id: 'a4', label: 'A4', detail: '210 × 297 mm' },
  { id: 'a5', label: 'A5', detail: '148 × 210 mm' },
  { id: 'a6', label: 'A6', detail: '105 × 148 mm' },
  { id: 'a7', label: 'A7', detail: '74 × 105 mm' },
  { id: 'a10', label: 'A10', detail: '26 × 37 mm' },
  { id: 'b4', label: 'B4', detail: '250 × 353 mm' },
  { id: 'b5', label: 'B5', detail: '176 × 250 mm' },
]

export const COMPILE_PAGE_MARGINS = {
  narrow: '0.5in',
  normal: '1in',
  wide: '1.25in',
  manuscript: '1.5in',
}

export const DEFAULT_COMPILE_CUSTOM_MARGINS = {
  top: '1in',
  right: '1in',
  bottom: '1in',
  left: '1in',
}

export const COMPILE_MARGIN_UNITS = {
  in: 'in',
  mm: 'mm',
}

export const DEFAULT_COMPILE_CUSTOM_MARGIN_UNIT = 'in'

export const COMPILE_PAGE_MARGIN_OPTIONS = [
  { id: 'narrow', label: 'Narrow', detail: '0.5 in' },
  { id: 'normal', label: 'Normal', detail: '1 in' },
  { id: 'wide', label: 'Wide', detail: '1.25 in' },
  { id: 'manuscript', label: 'Manuscript', detail: '1.5 in' },
  { id: 'custom', label: 'Custom', detail: 'per side' },
]

export const COMPILE_PAGE_ORIENTATIONS = {
  portrait: 'portrait',
  landscape: 'landscape',
}

export const COMPILE_PAGE_ORIENTATION_OPTIONS = [
  { id: 'portrait', label: 'Portrait' },
  { id: 'landscape', label: 'Landscape' },
]

export const DEFAULT_COMPILE_PAGE_LAYOUT = {
  pageSize: 'letter',
  marginPreset: 'normal',
  customMargins: { ...DEFAULT_COMPILE_CUSTOM_MARGINS },
  customMarginUnit: DEFAULT_COMPILE_CUSTOM_MARGIN_UNIT,
  orientation: 'portrait',
  showPageGuides: true,
}

/** @deprecated use DEFAULT_COMPILE_PAGE_LAYOUT.pageSize */
export const DEFAULT_COMPILE_PAGE_SIZE = DEFAULT_COMPILE_PAGE_LAYOUT.pageSize

export const DEFAULT_COMPILE_OPTIONS = {
  includeChapterWord: true,
  includeChapterNumber: true,
  includeChapterTitle: true,
  chapterTitleOnOwnLine: false,
  titlePage: true,
  includeSubtitle: true,
  includeAuthor: true,
  chapterPageBreak: true,
  includePageNumbers: false,
  includeCover: false,
  includeImages: true,
  titlePageStyles: {
    title: { ...DEFAULT_COMPILE_TITLE_PAGE_STYLES.title },
    subtitle: { ...DEFAULT_COMPILE_TITLE_PAGE_STYLES.subtitle },
    author: { ...DEFAULT_COMPILE_TITLE_PAGE_STYLES.author },
    issueWord: { ...DEFAULT_COMPILE_TITLE_PAGE_STYLES.issueWord },
    issueNumber: { ...DEFAULT_COMPILE_TITLE_PAGE_STYLES.issueNumber },
    issueTitle: { ...DEFAULT_COMPILE_TITLE_PAGE_STYLES.issueTitle },
  },
  chapterHeadingStyles: {
    label: { ...DEFAULT_COMPILE_CHAPTER_HEADING_STYLES.label },
    title: { ...DEFAULT_COMPILE_CHAPTER_HEADING_STYLES.title },
  },
  pageNumberStyle: { ...DEFAULT_COMPILE_PAGE_NUMBER_STYLE },
}

export const COMPILE_OPTION_SECTIONS = [
  {
    id: 'cover',
    label: 'Cover',
    options: [
      {
        key: 'includeCover',
        label: 'Cover image',
        requiresCover: true,
      },
    ],
  },
  {
    id: 'titlePage',
    label: 'Title Page',
    options: [
      {
        key: 'titlePage',
        label: 'Include title',
      },
      {
        key: 'includeSubtitle',
        label: 'Include subtitle',
      },
      {
        key: 'includeAuthor',
        label: 'Include author',
      },
    ],
  },
  {
    id: 'document',
    label: 'Document',
    options: [
      {
        key: 'includePageNumbers',
        label: 'Include page numbers',
      },
      {
        key: 'chapterPageBreak',
        label: 'Start each chapter on a new page',
      },
      {
        key: 'includeImages',
        label: 'Include images',
      },
    ],
  },
  {
    id: 'chapters',
    label: 'Chapters',
    options: [
      {
        key: 'includeChapterWord',
        label: 'Include word "Chapter"',
      },
      {
        key: 'includeChapterNumber',
        label: 'Include chapter number',
      },
      {
        key: 'includeChapterTitle',
        label: 'Include chapter title',
      },
      {
        key: 'chapterTitleOnOwnLine',
        label: 'Chapter title on own line',
        requiresChapterTitle: true,
      },
    ],
  },
]

export const COMPILE_OPTION_DEFS = COMPILE_OPTION_SECTIONS.flatMap((section) => section.options)

export function isCompileOptionEnabled(optionKey, options = {}, context = {}) {
  const def = COMPILE_OPTION_DEFS.find((item) => item.key === optionKey)
  if (!def) return false
  if (def.requiresTitlePage && !options.titlePage) return false
  if (def.requiresChapterTitle && !options.includeChapterTitle) return false
  if (def.requiresCover && !context.taleHasCover) return false
  return true
}

export function buildDefaultScope(chapters) {
  const chapterIds = chapters.map((ch) => ch.id)
  const sceneIds = chapters.flatMap((ch) => (ch.scenes || []).map((s) => s.id))
  return { chapterIds, sceneIds }
}

export function countScopedScenes(scope, chapters) {
  const chapterSet = new Set(scope.chapterIds)
  let count = 0
  for (const chapter of chapters) {
    if (!chapterSet.has(chapter.id)) continue
    for (const scene of chapter.scenes || []) {
      if (scope.sceneIds.includes(scene.id)) count += 1
    }
  }
  return count
}
