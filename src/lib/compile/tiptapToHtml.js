import { sceneImageKey } from './sceneImageKey.js'

function escapeHtml(value) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function clampIndent(value) {
  const n = typeof value === 'number' ? value : parseInt(String(value ?? 0), 10)
  if (!Number.isFinite(n)) return 0
  return Math.max(0, Math.min(8, n))
}

function blockAttrs(attrs) {
  if (!attrs) return ''

  const attrParts = []
  const classes = []
  const styles = []

  if (attrs.dropCap) classes.push('dropcap')
  if (attrs.scriptRole) {
    classes.push('script-role', `script-role--${attrs.scriptRole}`)
    attrParts.push(`data-script-role="${attrs.scriptRole}"`)
  }

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

function sanitizeCssValue(value) {
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  if (!trimmed || /[<>"']|javascript:/i.test(trimmed)) return null
  return trimmed
}

function textStyleAttr(mark) {
  const styles = []
  const fontFamily = sanitizeCssValue(mark.attrs?.fontFamily)
  const fontSize = sanitizeCssValue(mark.attrs?.fontSize)
  const color = sanitizeCssValue(mark.attrs?.color)

  if (fontFamily) styles.push(`font-family: ${fontFamily}`)
  if (fontSize) styles.push(`font-size: ${fontSize}`)
  if (color) styles.push(`color: ${color}`)

  return styles.length ? styles.join('; ') : null
}

function wrapMark(html, mark) {
  switch (mark.type) {
    case 'textStyle': {
      const style = textStyleAttr(mark)
      if (!style) return html
      return `<span style="${escapeHtml(style)}">${html}</span>`
    }
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

function renderInline(nodes) {
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

function renderList(node, ordered, comicNumbers = null) {
  const tag = ordered ? 'ol' : 'ul'
  const items = (node.content || [])
    .filter((child) => child.type === 'listItem')
    .map((item) => `<li>${renderBlocks(item.content, comicNumbers)}</li>`)
    .join('')

  return `<${tag}>${items}</${tag}>`
}

function normalizeImageWidth(width) {
  const n = typeof width === 'number' ? width : parseFloat(String(width ?? ''))
  if (!Number.isFinite(n) || n <= 0) return null
  return Math.round(n)
}

function renderSceneImage(node) {
  const attrs = node.attrs || {}
  const display = typeof attrs.display === 'string' ? attrs.display : 'block'
  const widthPct = normalizeImageWidth(attrs.width)
  const imageKey = sceneImageKey(attrs)
  const alt = typeof attrs.alt === 'string' ? escapeHtml(attrs.alt) : ''
  const sizedClass = widthPct ? ' scene-image--sized' : ''
  const isFloat = display === 'float-left' || display === 'float-right'
  const widthStyle = widthPct ? `width: ${widthPct}%; max-width: ${widthPct}%` : ''
  const wrapperStyle = isFloat && widthStyle ? ` style="${widthStyle}"` : ''
  const frameStyle = !isFloat && widthPct ? ` style="width: ${widthPct}%"` : ''

  return (
    `<div class="scene-image scene-image--${display}${sizedClass}"${wrapperStyle}>` +
    `<div class="scene-image__frame"${frameStyle}>` +
    `<img class="scene-image__img" alt="${alt}" data-image-key="${escapeHtml(imageKey || '')}" src="">` +
    `</div></div>`
  )
}

function renderBlock(node, comicNumbers = null) {
  switch (node.type) {
    case 'paragraph':
      return `<p${blockAttrs(node.attrs)}>${renderInline(node.content)}</p>`
    case 'heading': {
      const level = Number(node.attrs?.level) || 2
      const tag = level === 3 ? 'h3' : 'h2'
      return `<${tag}${blockAttrs(node.attrs)}>${renderInline(node.content)}</${tag}>`
    }
    case 'comicPanel': {
      // Legacy atom panels — render as Panel N text
      const n = comicNumbers?.nextPanel?.() ?? 1
      return `<p class="script-role script-role--panel" data-script-role="panel">Panel ${n}</p>`
    }
    case 'comicPage':
      // Legacy in-doc page markers (Pages are structural now); skip safely.
      return ''
    case 'sceneDivider':
    case 'horizontalRule':
      return '<hr class="scene-divider" data-scene-divider>'
    case 'sceneImage':
      return renderSceneImage(node)
    case 'blockquote':
      return `<blockquote>${renderBlocks(node.content, comicNumbers)}</blockquote>`
    case 'bulletList':
      return renderList(node, false, comicNumbers)
    case 'orderedList':
      return renderList(node, true, comicNumbers)
    case 'codeBlock': {
      const text = (node.content || [])
        .map((child) => child.text || '')
        .join('')
      return `<pre><code>${escapeHtml(text)}</code></pre>`
    }
    default:
      if (node.content?.length) {
        const inner = renderBlocks(node.content, comicNumbers)
        if (inner.trim()) return `<p>${inner}</p>`
      }
      return ''
  }
}

function renderBlocks(nodes, comicNumbers = null) {
  if (!nodes?.length) return ''
  return nodes.map((node) => renderBlock(node, comicNumbers)).join('')
}

function createComicNumberTracker() {
  let panelCount = 0
  return {
    nextPanel: () => {
      panelCount += 1
      return panelCount
    },
  }
}

export function tiptapToHtml(content) {
  if (!content || typeof content !== 'object') return ''

  const doc = content
  if (doc.type !== 'doc' || !Array.isArray(doc.content)) return ''

  return renderBlocks(doc.content, createComicNumberTracker())
}
