import { EXPORT_FORMATS } from '../../constants/export'

export function summarizeExportOptions(options, format) {
  if (!options) return ''

  const parts = []
  const headingParts = []
  if (options.includeChapterWord) headingParts.push('Ch')
  if (options.includeChapterNumber) headingParts.push('#')
  if (options.includeChapterTitle) headingParts.push('title')
  if (headingParts.length) parts.push(headingParts.join('+'))

  if (options.titlePage) parts.push('title page')
  if (options.titlePage && options.includeSubtitle !== false) parts.push('subtitle')
  if (options.chapterPageBreak && format !== 'txt') parts.push('ch. breaks')
  if (options.includeCover && format !== 'txt') parts.push('cover')
  if (format === 'txt') {
    parts.push(options.includeImagePlaceholders !== false ? 'img placeholders' : 'no img placeholders')
  }

  return parts.join(' · ') || 'default'
}

export function summarizeExportScope(scope, chapters) {
  if (!scope?.chapterIds?.length) return 'nothing selected'

  const chapterSet = new Set(scope.chapterIds)
  const totalChapters = chapters.length
  const selectedChapters = scope.chapterIds.length
  const selectedScenes = chapters.reduce((count, chapter) => {
    if (!chapterSet.has(chapter.id)) return count
    return count + (chapter.scenes || []).filter((s) => scope.sceneIds?.includes(s.id)).length
  }, 0)

  if (selectedChapters === totalChapters) {
    const totalScenes = chapters.reduce((n, ch) => n + (ch.scenes?.length || 0), 0)
    if (selectedScenes === totalScenes) return 'full tale'
  }

  return `${selectedScenes} scene${selectedScenes === 1 ? '' : 's'}`
}

export function formatExportFormatLabel(format) {
  return EXPORT_FORMATS[format]?.label || format?.toUpperCase() || 'Export'
}
