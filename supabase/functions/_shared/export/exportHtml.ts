import { formatAuthorLine } from './formatAuthor.ts'
import { EXPORT_HTML_FONT_LINK, EXPORT_HTML_STYLES } from './exportHtmlStyles.ts'
import type { ExportImageBundle } from './resolveExportImages.ts'
import { sceneContentToHtml } from './tiptapSceneToHtml.ts'
import type { ExportOptions, ManuscriptModel } from './types.ts'

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function buildCoverSection(cover: ExportImageBundle['cover']): string {
  if (!cover) return ''
  return `<section class="export-cover"><img src="${cover.dataUrl}" alt="Cover"></section>`
}

function buildTitlePage(model: ManuscriptModel, options: ExportOptions): string {
  if (!options.titlePage) return ''

  const parts = [
    `<section class="export-title-page">`,
    `<h1>${escapeHtml(model.title)}</h1>`,
  ]

  if (options.includeSubtitle && model.subtitle?.trim()) {
    parts.push(`<p class="export-subtitle">${escapeHtml(model.subtitle.trim())}</p>`)
  }

  const authorLine = formatAuthorLine(model.author)
  if (authorLine) {
    parts.push(`<p class="export-author">${escapeHtml(authorLine)}</p>`)
  }

  parts.push('</section>')
  return parts.join('\n')
}

function buildChapterHtml(
  chapterIndex: number,
  chapter: ManuscriptModel['chapters'][number],
  options: ExportOptions,
  images: ExportImageBundle,
): string {
  const breakClass =
    chapterIndex > 0 && options.chapterPageBreak ? ' export-chapter-break' : ''

  const parts = [`<section class="export-chapter${breakClass}">`]

  if (chapter.heading) {
    parts.push(`<h2 class="export-chapter-heading">${escapeHtml(chapter.heading)}</h2>`)
  }

  for (const scene of chapter.scenes) {
    if (!scene.content) continue
    const sceneHtml = sceneContentToHtml(scene.content, images)
    if (sceneHtml.trim()) {
      parts.push(`<div class="scene-editor-prose">${sceneHtml}</div>`)
    }
  }

  parts.push('</section>')
  return parts.join('\n')
}

export function exportHtml(
  model: ManuscriptModel,
  options: ExportOptions,
  images: ExportImageBundle,
): string {
  const bodyParts = [
    buildCoverSection(images.cover),
    buildTitlePage(model, options),
    ...model.chapters.map((chapter, index) => buildChapterHtml(index, chapter, options, images)),
  ]

  const title = escapeHtml(model.title)

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${title}</title>
  <link rel="stylesheet" href="${EXPORT_HTML_FONT_LINK}">
  <style>${EXPORT_HTML_STYLES}</style>
</head>
<body>
  <article class="manuscript-export">
${bodyParts.filter(Boolean).join('\n')}
  </article>
</body>
</html>
`
}

export function encodeHtmlBuffer(html: string): Uint8Array {
  return new TextEncoder().encode(html)
}
