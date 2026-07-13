import { formatAuthorLine } from './formatAuthor.js'
import { buildChapterHeadingHtml } from './chapterHeadingStyle.js'
import { COMPILE_HTML_FONT_LINK, compileHtmlStyles, compilePageChromeStyles } from './compileHtmlStyles.js'
import { normalizePageLayout } from './pageLayout.js'
import { getPageNumberStyle } from './pageNumberStyle.js'
import { buildCompileTextStyleAttr, getTitlePageStyles } from './titlePageStyle.js'
import { sceneContentToHtml } from './tiptapSceneToHtml.js'

function escapeHtml(value) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function buildCoverSection(cover, options) {
  if (!cover) return ''
  const frontMatterClass = options.includePageNumbers ? ' export-front-matter' : ''
  return `<section class="export-cover${frontMatterClass}"><img src="${cover.dataUrl}" alt="Cover"></section>`
}

function buildTitlePage(model, options) {
  const styles = getTitlePageStyles(options)
  const parts = []

  if (options.titlePage) {
    parts.push(
      `<h1 style='${buildCompileTextStyleAttr(styles.title)}'>${escapeHtml(model.title)}</h1>`,
    )
  }

  if (options.includeSubtitle && model.subtitle?.trim()) {
    parts.push(
      `<p class="export-subtitle" style='${buildCompileTextStyleAttr(styles.subtitle)}'>${escapeHtml(model.subtitle.trim())}</p>`,
    )
  }

  const authorLine = formatAuthorLine(model.author)
  if (options.includeAuthor && authorLine) {
    parts.push(
      `<p class="export-author" style='${buildCompileTextStyleAttr(styles.author)}'>${escapeHtml(authorLine)}</p>`,
    )
  }

  if (parts.length === 0) return ''

  const frontMatterClass = options.includePageNumbers ? ' export-front-matter' : ''
  return `<section class="export-title-page${frontMatterClass}">\n${parts.join('\n')}\n</section>`
}

function buildChapterHtml(chapterIndex, chapter, options, images) {
  const breakClass =
    chapterIndex > 0 && options.chapterPageBreak ? ' export-chapter-break' : ''
  const numberedClass = options.includePageNumbers ? ' export-numbered' : ''

  const parts = [`<section class="export-chapter${breakClass}${numberedClass}">`]

  const headingHtml = buildChapterHeadingHtml(chapter.headingParts, options, escapeHtml)
  if (headingHtml) {
    parts.push(headingHtml)
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

export function exportCompileHtml(model, options, images, { pageLayout } = {}) {
  const layout = normalizePageLayout(pageLayout)
  const bodyParts = [
    buildCoverSection(images.cover, options),
    buildTitlePage(model, options),
    ...model.chapters.map((chapter, index) => buildChapterHtml(index, chapter, options, images)),
  ]

  const title = escapeHtml(model.title)
  const styles = compileHtmlStyles(layout, {
    pageNumberStyle: options.includePageNumbers ? getPageNumberStyle(options) : null,
  })
  const chromeStyles = compilePageChromeStyles()
  const guidesAttr = layout.showPageGuides ? 'true' : 'false'
  const guidesClass = layout.showPageGuides ? ' wk-page-guides' : ''

  return `<!DOCTYPE html>
<html lang="en" class="${guidesClass.trim()}" data-compile-page-size="${escapeHtml(layout.pageSize)}" data-show-page-guides="${guidesAttr}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${title}</title>
  <link rel="stylesheet" href="${COMPILE_HTML_FONT_LINK}">
  <style>${styles}</style>
  <style media="screen" data-wk-compile-chrome data-pagedjs-ignore>${chromeStyles}</style>
</head>
<body>
  <article class="manuscript-export">
${bodyParts.filter(Boolean).join('\n')}
  </article>
</body>
</html>
`
}
