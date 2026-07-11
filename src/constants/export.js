export const EXPORT_FORMATS = {
  txt: {
    id: 'txt',
    label: 'Plain Text',
    extension: '.txt',
    enabled: true,
  },
  pdf: {
    id: 'pdf',
    label: 'PDF',
    extension: '.pdf',
    enabled: true,
  },
  docx: {
    id: 'docx',
    label: 'Word Document',
    extension: '.docx',
    enabled: false,
    comingSoon: true,
  },
}

export const DEFAULT_EXPORT_OPTIONS = {
  includeChapterWord: true,
  includeChapterNumber: true,
  includeChapterTitle: true,
  titlePage: true,
  includeSubtitle: true,
  chapterPageBreak: true,
  includeCover: false,
  includeImages: true,
  includeImagePlaceholders: true,
}

export const EXPORT_OPTION_DEFS = [
  {
    key: 'includeCover',
    label: 'Include cover image',
    formats: ['pdf', 'docx'],
    requiresCover: true,
  },
  {
    key: 'titlePage',
    label: 'Title page (title and author)',
    formats: ['txt', 'pdf', 'docx'],
  },
  {
    key: 'includeSubtitle',
    label: 'Include subtitle on title page',
    formats: ['txt', 'pdf', 'docx'],
    requiresTitlePage: true,
  },
  {
    key: 'includeChapterWord',
    label: 'Include word "Chapter"',
    formats: ['txt', 'pdf', 'docx'],
  },
  {
    key: 'includeChapterNumber',
    label: 'Include chapter number',
    formats: ['txt', 'pdf', 'docx'],
  },
  {
    key: 'includeChapterTitle',
    label: 'Include chapter title',
    formats: ['txt', 'pdf', 'docx'],
  },
  {
    key: 'chapterPageBreak',
    label: 'Start each chapter on a new page',
    formats: ['pdf', 'docx'],
  },
  {
    key: 'includeImages',
    label: 'Include images',
    formats: ['pdf', 'docx'],
  },
  {
    key: 'includeImagePlaceholders',
    label: 'Include image placeholders ([Image: …])',
    formats: ['txt'],
  },
]

export function isExportOptionVisible(optionKey, format, options = {}, context = {}) {
  const def = EXPORT_OPTION_DEFS.find((item) => item.key === optionKey)
  if (!def?.formats.includes(format)) return false
  if (def.requiresTitlePage && !options.titlePage) return false
  if (def.requiresCover && !context.taleHasCover) return false
  return true
}

export function validateExportOptions() {
  return null
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
