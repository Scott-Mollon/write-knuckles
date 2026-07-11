import { sceneImageKey } from './sceneImageKey.ts'

type TipTapNode = {
  type?: string
  text?: string
  marks?: Array<{ type?: string; attrs?: Record<string, unknown> }>
  attrs?: Record<string, unknown>
  content?: TipTapNode[]
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function clampIndent(value: unknown): number {
  const n = typeof value === 'number' ? value : parseInt(String(value ?? 0), 10)
  if (!Number.isFinite(n)) return 0
  return Math.max(0, Math.min(8, n))
}

function blockAttrs(attrs: Record<string, unknown> | undefined): string {
  if (!attrs) return ''

  const attrParts: string[] = []
  const classes: string[] = []
  const styles: string[] = []

  if (attrs.dropCap) classes.push('dropcap')

  const textAlign = attrs.textAlign
  if (typeof textAlign === 'string' && textAlign !== 'left') {
    styles.push(`text-align: ${textAlign}`)
  }

  const indent = clampIndent(attrs.indent)
  if (indent > 0) {
    styles.push(`margin-left: calc(2em * ${indent})`)
    attrParts.push(`data-indent="${indent}"`)
  }

  if (classes.length) attrParts.push(`class="${classes.join(' ')}"`)
  if (styles.length) attrParts.push(`style="${styles.join('; ')}"`)

  return attrParts.length ? ` ${attrParts.join(' ')}` : ''
}

function wrapMark(html: string, mark: { type?: string; attrs?: Record<string, unknown> }): string {
  switch (mark.type) {
    case 'bold':
    case 'strong':
      return `<strong>${html}</strong>`
    case 'italic':
    case 'em':
      return `<em>${html}</em>`
    case 'underline':
      return `<u>${html}</u>`
    case 'strike':
      return `<s>${html}</s>`
    case 'code':
      return `<code>${html}</code>`
    case 'link': {
      const href = mark.attrs?.href
      if (typeof href !== 'string' || !href) return html
      return `<a href="${escapeHtml(href)}">${html}</a>`
    }
    case 'highlight': {
      const color = mark.attrs?.color
      if (typeof color === 'string' && color) {
        return `<mark style="background-color: ${escapeHtml(color)}">${html}</mark>`
      }
      return `<mark>${html}</mark>`
    }
    default:
      return html
  }
}

function renderInline(nodes: TipTapNode[] | undefined): string {
  if (!nodes?.length) return ''

  return nodes
    .map((node) => {
      if (node.type === 'text') {
        let html = escapeHtml(node.text || '')
        for (const mark of node.marks || []) {
          html = wrapMark(html, mark)
        }
        return html
      }
      if (node.type === 'hardBreak') return '<br>'
      return renderInline(node.content)
    })
    .join('')
}

function renderList(
  node: TipTapNode,
  ordered: boolean,
): string {
  const tag = ordered ? 'ol' : 'ul'
  const items = (node.content || [])
    .filter((child) => child.type === 'listItem')
    .map((item) => `<li>${renderBlocks(item.content)}</li>`)
    .join('')

  return `<${tag}>${items}</${tag}>`
}

function renderSceneImage(node: TipTapNode): string {
  const attrs = node.attrs || {}
  const display = typeof attrs.display === 'string' ? attrs.display : 'block'
  const width = attrs.width
  const imageKey = sceneImageKey(attrs)
  const alt = typeof attrs.alt === 'string' ? escapeHtml(attrs.alt) : ''
  const sizedClass = typeof width === 'number' && width > 0 ? ' scene-image--sized' : ''
  const frameStyle =
    typeof width === 'number' && width > 0 ? ` style="width: ${width}%"` : ''

  return (
    `<div class="scene-image scene-image--${display}${sizedClass}">` +
    `<div class="scene-image__frame"${frameStyle}>` +
    `<img class="scene-image__img" alt="${alt}" data-image-key="${escapeHtml(imageKey || '')}" src="">` +
    `</div></div>`
  )
}

function renderBlock(node: TipTapNode): string {
  switch (node.type) {
    case 'paragraph':
      return `<p${blockAttrs(node.attrs)}>${renderInline(node.content)}</p>`
    case 'heading': {
      const level = Number(node.attrs?.level) || 2
      const tag = level === 3 ? 'h3' : 'h2'
      return `<${tag}${blockAttrs(node.attrs)}>${renderInline(node.content)}</${tag}>`
    }
    case 'sceneDivider':
    case 'horizontalRule':
      return '<hr class="scene-divider" data-scene-divider>'
    case 'sceneImage':
      return renderSceneImage(node)
    case 'blockquote':
      return `<blockquote>${renderBlocks(node.content)}</blockquote>`
    case 'bulletList':
      return renderList(node, false)
    case 'orderedList':
      return renderList(node, true)
    case 'codeBlock': {
      const text = (node.content || [])
        .map((child) => child.text || '')
        .join('')
      return `<pre><code>${escapeHtml(text)}</code></pre>`
    }
    default:
      if (node.content?.length) {
        const inner = renderBlocks(node.content)
        if (inner.trim()) return `<p>${inner}</p>`
      }
      return ''
  }
}

function renderBlocks(nodes: TipTapNode[] | undefined): string {
  if (!nodes?.length) return ''
  return nodes.map(renderBlock).join('')
}

export function tiptapToHtml(content: unknown): string {
  if (!content || typeof content !== 'object') return ''

  const doc = content as TipTapNode
  if (doc.type !== 'doc' || !Array.isArray(doc.content)) return ''

  return renderBlocks(doc.content)
}
