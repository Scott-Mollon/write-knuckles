import { spansToPlainText } from './tiptapToBlocks.ts'
import type { ContentBlock, ExportOptions, ManuscriptModel } from './types.ts'

function blockToText(block: ContentBlock, options: ExportOptions): string {
  switch (block.type) {
    case 'paragraph':
      return spansToPlainText(block.spans)
    case 'heading':
      return spansToPlainText(block.spans)
    case 'divider':
      return '---'
    case 'image':
      if (!options.includeImagePlaceholders) return ''
      return block.alt ? `[Image: ${block.alt}]` : '[Image]'
    default:
      return ''
  }
}

export function exportTxt(model: ManuscriptModel, options: ExportOptions): string {
  const lines: string[] = []

  if (options.titlePage) {
    lines.push(model.title)
    if (model.author?.trim()) lines.push(model.author.trim())
    if (model.subtitle?.trim()) lines.push(model.subtitle.trim())
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
        const text = blockToText(block, options)
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

export function encodeTxtBuffer(text: string): Uint8Array {
  return new TextEncoder().encode(text)
}
