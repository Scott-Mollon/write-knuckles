import { formatAuthorLine } from './formatAuthor.js'
import { buildChapterHeadingHtml } from './chapterHeadingStyle.js'
import { COMPILE_HTML_FONT_LINK, compileHtmlStyles, compilePageChromeStyles } from './compileHtmlStyles.js'
import { buildIssueTitlePageLines } from './issueTitlePage.js'
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

function buildIssueTitlePageHtml(model, chapter, chapterIndex, options) {
  const styles = getTitlePageStyles(options)
  const lines = buildIssueTitlePageLines(model, chapter, options)
  if (lines.length === 0) return ''

  const parts = lines.map((line) => {
    if (line.type === 'title') {
      return `<h1 style='${buildCompileTextStyleAttr(styles.title)}'>${escapeHtml(line.text)}</h1>`
    }
    if (line.type === 'subtitle') {
      return `<p class="export-subtitle" style='${buildCompileTextStyleAttr(styles.subtitle)}'>${escapeHtml(line.text)}</p>`
    }
    if (line.type === 'issueLabel') {
      const primaryStyle =
        line.parts[0]?.type === 'issueWord' ? styles.issueWord : styles.issueNumber
      const spans = line.parts
        .map((part) => {
          const styleKey = part.type === 'issueWord' ? 'issueWord' : 'issueNumber'
          const partStyle = styles[styleKey]
          // Alignment belongs on the block; spans only carry type styles.
          const spanStyle = {
            ...partStyle,
            align: primaryStyle.align,
          }
          return `<span style='${buildCompileTextStyleAttr(spanStyle)}'>${escapeHtml(part.text)}</span>`
        })
        .join(' ')
      return `<p class="export-issue-label" style='text-align: ${primaryStyle.align}'>${spans}</p>`
    }
    if (line.type === 'issueTitle') {
      return `<p class="export-issue-title" style='${buildCompileTextStyleAttr(styles.issueTitle)}'>${escapeHtml(line.text)}</p>`
    }
    return `<p class="export-author" style='${buildCompileTextStyleAttr(styles.author)}'>${escapeHtml(line.text)}</p>`
  })

  const breakClass = chapterIndex > 0 ? ' export-chapter-break' : ''
  return `<section class="export-title-page${breakClass}">\n${parts.join('\n')}\n</section>`
}

function buildChapterHtml(chapterIndex, chapter, options, images, { isComic = false } = {}) {
  const breakClass =
    !isComic && chapterIndex > 0 && options.chapterPageBreak ? ' export-chapter-break' : ''
  const numberedClass = options.includePageNumbers ? ' export-numbered' : ''

  const parts = [`<section class="export-chapter${breakClass}${numberedClass}">`]

  if (!isComic) {
    const headingHtml = buildChapterHeadingHtml(chapter.headingParts, options, escapeHtml)
    if (headingHtml) {
      parts.push(headingHtml)
    }
  }

  let emittedComicPage = false
  for (const scene of chapter.scenes) {
    if (!scene.content) continue
    const sceneHtml = sceneContentToHtml(scene.content, images)
    if (!sceneHtml.trim()) continue

    const pageBreakClass =
      isComic && emittedComicPage ? ' export-comic-page-break' : ''
    const comicAttr = isComic ? ' data-tale-type="comic"' : ''
    parts.push(`<div class="scene-editor-prose${pageBreakClass}"${comicAttr}>${sceneHtml}</div>`)
    if (isComic) emittedComicPage = true
  }

  parts.push('</section>')
  return parts.join('\n')
}

export function exportCompileHtml(model, options, images, { pageLayout } = {}) {
  const layout = normalizePageLayout(pageLayout)
  const comic = Boolean(model.isComic)
  const compileOptions = comic
    ? { ...options, chapterPageBreak: true, includePageNumbers: false }
    : options

  const bodyParts = [buildCoverSection(images.cover, compileOptions)]

  if (comic) {
    for (let index = 0; index < model.chapters.length; index += 1) {
      const chapter = model.chapters[index]
      bodyParts.push(buildIssueTitlePageHtml(model, chapter, index, compileOptions))
      bodyParts.push(
        buildChapterHtml(index, chapter, compileOptions, images, { isComic: true }),
      )
    }
  } else {
    bodyParts.push(buildTitlePage(model, compileOptions))
    bodyParts.push(
      ...model.chapters.map((chapter, index) =>
        buildChapterHtml(index, chapter, compileOptions, images),
      ),
    )
  }

  const title = escapeHtml(model.title)
  const styles = compileHtmlStyles(layout, {
    pageNumberStyle: compileOptions.includePageNumbers
      ? getPageNumberStyle(compileOptions)
      : null,
    scriptStyles: model.scriptStyles,
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
