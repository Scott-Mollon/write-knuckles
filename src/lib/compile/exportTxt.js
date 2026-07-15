import { spansToPlainText } from './tiptapToBlocks.js'
import { applyScriptTextTransform } from './compileScriptStyles.js'
import { formatAuthorLine } from './formatAuthor.js'
import { buildIssueTitlePageLines, issueTitlePageLinesToText } from './issueTitlePage.js'

function blockToText(block, scriptStyles) {
  switch (block.type) {
    case 'paragraph': {
      const text = spansToPlainText(block.spans)
      return applyScriptTextTransform(text, block.scriptRole, scriptStyles)
    }
    case 'heading':
      return spansToPlainText(block.spans)
    case 'divider':
      return '---'
    case 'image':
      return block.alt ? `[Image: ${block.alt}]` : '[Image]'
    default:
      return ''
  }
}

export function exportTxt(model, options) {
  const lines = []
  const comic = Boolean(model.isComic)

  if (!comic) {
    const titlePageLines = []

    if (options.titlePage) {
      titlePageLines.push(model.title)
    }
    if (options.includeSubtitle && model.subtitle?.trim()) {
      titlePageLines.push(model.subtitle.trim())
    }
    const authorLine = formatAuthorLine(model.author)
    if (options.includeAuthor && authorLine) {
      titlePageLines.push(authorLine)
    }

    if (titlePageLines.length > 0) {
      lines.push(...titlePageLines)
      lines.push('')
      lines.push('')
    }
  }

  model.chapters.forEach((chapter) => {
    if (comic) {
      const issueLines = issueTitlePageLinesToText(
        buildIssueTitlePageLines(model, chapter, options),
      )
      if (issueLines.length > 0) {
        if (lines.length > 0 && lines[lines.length - 1] !== '') {
          lines.push('')
        }
        lines.push(...issueLines)
        lines.push('')
        lines.push('')
      }
    } else if (chapter.heading) {
      if (lines.length > 0 && lines[lines.length - 1] !== '') {
        lines.push('')
      }
      lines.push(chapter.heading)
      lines.push('')
    }

    chapter.scenes.forEach((scene, sceneIndex) => {
      if (sceneIndex > 0) {
        lines.push('')
      }

      scene.blocks.forEach((block, blockIndex) => {
        const text = blockToText(block, model.scriptStyles)
        if (!text && block.type !== 'divider') return

        if (block.type === 'image') {
          if (lines.length > 0 && lines[lines.length - 1] !== '') {
            lines.push('')
          }
          lines.push(text)
          return
        }

        if (block.type === 'divider') {
          if (lines.length > 0 && lines[lines.length - 1] !== '') {
            lines.push('')
          }
          lines.push('---')
          return
        }

        if (blockIndex > 0 && block.type === 'paragraph') {
          lines.push('')
        }

        lines.push(text)
      })
    })
  })

  return `${lines.join('\n').trim()}\n`
}
