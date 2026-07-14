/**
 * Build plain text + char-offset → ProseMirror position mapping for Harper lint spans.
 * Block nodes are separated by `\n`. Each plain-text character (including separators)
 * maps to a ProseMirror position used for decoration anchors.
 */
export function buildPlainTextMap(doc) {
  let text = ''
  /** @type {number[]} */
  const charToPos = []
  let needsBlockSep = false
  let lastContentEnd = 0

  doc.descendants((node, pos) => {
    if (node.isText) {
      if (needsBlockSep && text.length > 0) {
        text += '\n'
        // Newline has no PM character; anchor at end of previous text.
        charToPos.push(lastContentEnd)
        needsBlockSep = false
      }
      const content = node.text || ''
      for (let i = 0; i < content.length; i += 1) {
        charToPos.push(pos + i)
        text += content[i]
      }
      lastContentEnd = pos + content.length
      return false
    }

    if (node.isBlock) {
      needsBlockSep = text.length > 0
    }

    return true
  })

  return { text, charToPos }
}

/**
 * Map Harper span [start, end) to ProseMirror { from, to }.
 * Returns null if the span is empty or out of range.
 */
export function spanToPositions(span, charToPos) {
  if (!span || span.start == null || span.end == null) return null
  const start = span.start
  const end = span.end
  if (end <= start) return null
  if (start < 0 || start >= charToPos.length) return null

  const from = charToPos[start]
  const lastChar = Math.min(end - 1, charToPos.length - 1)
  const to = charToPos[lastChar] + 1
  if (from == null || to == null || to <= from) return null
  return { from, to }
}

/**
 * Split a PM range into per-text-node ranges (inline decorations cannot cross blocks).
 */
export function splitInlineRanges(doc, from, to) {
  if (from == null || to == null || to <= from) return []
  const ranges = []
  doc.nodesBetween(from, to, (node, pos) => {
    if (!node.isText) return
    const start = Math.max(pos, from)
    const end = Math.min(pos + node.nodeSize, to)
    if (start < end) ranges.push({ from: start, to: end })
  })
  return ranges
}
