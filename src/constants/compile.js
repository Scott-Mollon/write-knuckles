export const COMPILE_PAGE_SIZES = {
  letter: 'letter',
  a4: 'A4',
  legal: 'legal',
}

export const COMPILE_PAGE_SIZE_OPTIONS = [
  { id: 'letter', label: 'US Letter', detail: '8.5 × 11 in' },
  { id: 'a4', label: 'A4', detail: '210 × 297 mm' },
  { id: 'legal', label: 'US Legal', detail: '8.5 × 14 in' },
]

export const COMPILE_PAGE_MARGINS = {
  narrow: '0.5in',
  normal: '1in',
  wide: '1.25in',
  manuscript: '1.5in',
}

export const COMPILE_PAGE_MARGIN_OPTIONS = [
  { id: 'narrow', label: 'Narrow', detail: '0.5 in' },
  { id: 'normal', label: 'Normal', detail: '1 in' },
  { id: 'wide', label: 'Wide', detail: '1.25 in' },
  { id: 'manuscript', label: 'Manuscript', detail: '1.5 in' },
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
  orientation: 'portrait',
  showPageGuides: true,
}

/** @deprecated use DEFAULT_COMPILE_PAGE_LAYOUT.pageSize */
export const DEFAULT_COMPILE_PAGE_SIZE = DEFAULT_COMPILE_PAGE_LAYOUT.pageSize

export const DEFAULT_COMPILE_OPTIONS = {
  includeChapterWord: true,
  includeChapterNumber: true,
  includeChapterTitle: true,
  titlePage: true,
  includeSubtitle: true,
  chapterPageBreak: true,
  includeCover: false,
  includeImages: true,
}

export const COMPILE_OPTION_DEFS = [
  {
    key: 'includeCover',
    label: 'Include cover image',
    requiresCover: true,
  },
  {
    key: 'titlePage',
    label: 'Title page (title and author)',
  },
  {
    key: 'includeSubtitle',
    label: 'Include subtitle on title page',
    requiresTitlePage: true,
  },
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
    key: 'chapterPageBreak',
    label: 'Start each chapter on a new page',
  },
  {
    key: 'includeImages',
    label: 'Include images',
  },
]

export function isCompileOptionVisible(optionKey, options = {}, context = {}) {
  const def = COMPILE_OPTION_DEFS.find((item) => item.key === optionKey)
  if (!def) return false
  if (def.requiresTitlePage && !options.titlePage) return false
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
