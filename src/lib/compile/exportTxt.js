import { spansToPlainText } from './tiptapToBlocks.js'
import { formatAuthorLine } from './formatAuthor.js'

function blockToText(block) {
  switch (block.type) {
    case 'paragraph':
      return spansToPlainText(block.spans)
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

  if (options.titlePage) {
    lines.push(model.title)
    if (options.includeSubtitle && model.subtitle?.trim()) {
      lines.push(model.subtitle.trim())
    }
    const authorLine = formatAuthorLine(model.author)
    if (options.includeAuthor && authorLine) lines.push(authorLine)
    lines.push('')
    lines.push('')
  }

  model.chapters.forEach((chapter) => {
    if (chapter.heading) {
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
        const text = blockToText(block)
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
