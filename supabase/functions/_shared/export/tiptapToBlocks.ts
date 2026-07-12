import type { ContentBlock, InlineMark, InlineSpan } from './types.ts'
import { imageDisplayLabel } from './imageLabel.ts'
import { sceneImageKey } from './sceneImageKey.ts'

type TipTapNode = {
  type?: string
  text?: string
  marks?: Array<{ type?: string; attrs?: Record<string, unknown> }>
  attrs?: Record<string, unknown>
  content?: TipTapNode[]
}

function markFromType(type: string | undefined): InlineMark | null {
  if (type === 'bold') return 'bold'
  if (type === 'italic') return 'italic'
  if (type === 'underline') return 'underline'
  if (type === 'link') return 'link'
  return null
}

function spansFromNode(node: TipTapNode): InlineSpan[] {
  if (node.type === 'text') {
    const marks: InlineMark[] = []
    let href: string | undefined
    let fontFamily: string | undefined
    let fontSize: number | undefined

    for (const mark of node.marks || []) {
      const mapped = markFromType(mark.type)
      if (mapped) marks.push(mapped)
      if (mark.type === 'link' && typeof mark.attrs?.href === 'string') {
        href = mark.attrs.href
      }
      if (mark.type === 'textStyle') {
        if (typeof mark.attrs?.fontFamily === 'string' && mark.attrs.fontFamily.trim()) {
          fontFamily = mark.attrs.fontFamily
        }
        if (typeof mark.attrs?.fontSize === 'string') {
          const match = mark.attrs.fontSize.trim().match(/^([\d.]+)px$/i)
          if (match) fontSize = parseFloat(match[1])
        }
      }
    }

    return [{ text: node.text || '', marks, href, fontFamily, fontSize }]
  }

  const spans: InlineSpan[] = []
  for (const child of node.content || []) {
    if (child.type === 'hardBreak') {
      spans.push({ text: '\n', marks: [] })
      continue
    }
    spans.push(...spansFromNode(child))
  }
  return spans
}

function blockFromNode(node: TipTapNode): ContentBlock | null {
  switch (node.type) {
    case 'paragraph':
      return {
        type: 'paragraph',
        spans: spansFromNode(node),
        textAlign: typeof node.attrs?.textAlign === 'string' ? node.attrs.textAlign : undefined,
      }
    case 'heading': {
      const level = Number(node.attrs?.level) || 2
      return { type: 'heading', level, spans: spansFromNode(node) }
    }
    case 'sceneDivider':
      return { type: 'divider' }
    case 'sceneImage': {
      const attrs = node.attrs || {}
      const width = attrs.width
      return {
        type: 'image',
        alt: imageDisplayLabel(attrs),
        imageKey: sceneImageKey(attrs),
        display: typeof attrs.display === 'string' ? attrs.display : 'block',
        width: typeof width === 'number' ? width : null,
      }
    }
    case 'horizontalRule':
      return { type: 'divider' }
    default:
      if (node.content?.length) {
        const spans = spansFromNode(node)
        if (spans.some((s) => s.text.trim())) {
          return { type: 'paragraph', spans }
        }
      }
      return null
  }
}

export function tiptapToBlocks(content: unknown): ContentBlock[] {
  if (!content || typeof content !== 'object') return []

  const doc = content as TipTapNode
  if (doc.type !== 'doc' || !Array.isArray(doc.content)) return []

  const blocks: ContentBlock[] = []
  for (const node of doc.content) {
    const block = blockFromNode(node)
    if (block) blocks.push(block)
  }
  return blocks
}

export function blocksHaveText(blocks: ContentBlock[]): boolean {
  for (const block of blocks) {
    if (block.type === 'divider' || block.type === 'image') return true
    const spans = block.type === 'heading' ? block.spans : block.spans
    if (spans.some((s) => s.text.trim())) return true
  }
  return false
}

export function spansToPlainText(spans: InlineSpan[]): string {
  return spans.map((s) => s.text).join('')
}
