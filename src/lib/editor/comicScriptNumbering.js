/**
 * Panel lines in the document use scriptRole "panel" and text like "Panel 1".
 * Pages are structural (Rack); panel numbers are sequential within this scene.
 */

export function panelLineLabel(n) {
  return `Panel ${n}`
}

const PANEL_LINE_RE = /^Panel \d+$/i

export function isAutoPanelLineText(text) {
  return PANEL_LINE_RE.test((text || '').trim())
}

export function countScriptPanelsInPmDoc(doc) {
  let count = 0
  doc.descendants((node) => {
    if (node.type.name === 'paragraph' && node.attrs?.scriptRole === 'panel') {
      count += 1
    }
  })
  return count
}

/**
 * Renumber auto panel lines (exact "Panel N" text only) to Panel 1..N in doc order.
 * Returns true if the transaction was modified.
 */
export function renumberAutoPanelLines(tr, doc) {
  let index = 0
  let modified = false
  const steps = []

  doc.descendants((node, pos) => {
    if (node.type.name !== 'paragraph' || node.attrs?.scriptRole !== 'panel') return
    index += 1
    const text = node.textContent
    if (!isAutoPanelLineText(text)) return
    const expected = panelLineLabel(index)
    if (text === expected) return
    const from = pos + 1
    const to = pos + node.nodeSize - 1
    steps.push({ from, to, expected })
  })

  // Apply from end so positions stay valid
  for (let i = steps.length - 1; i >= 0; i -= 1) {
    const { from, to, expected } = steps[i]
    tr.insertText(expected, from, to)
    modified = true
  }

  return modified
}
