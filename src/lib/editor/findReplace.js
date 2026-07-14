/** TipTap find/replace over scene JSON without flattening marks. */

const CONTEXT_RADIUS = 80
const WORD_CHAR = /\w/

const isWordChar = (ch) => ch != null && WORD_CHAR.test(ch)

export const isWholeWordMatch = (text, start, end) => {
  const before = start > 0 ? text[start - 1] : null
  const after = end < text.length ? text[end] : null
  return !isWordChar(before) && !isWordChar(after)
}

/**
 * Walk a block (or any node) and build plain text + text-node segment map.
 * hardBreak contributes `\n` but has no segment (cannot hold replacement text alone).
 */
export function collectBlockText(blockNode, pathPrefix = []) {
  let text = ''
  /** @type {{ path: (string|number)[], start: number, end: number }[]} */
  const segments = []

  const walk = (node, path) => {
    if (!node || typeof node !== 'object') return
    if (node.type === 'text') {
      const chunk = node.text || ''
      const start = text.length
      text += chunk
      segments.push({ path: [...path], start, end: text.length })
      return
    }
    if (node.type === 'hardBreak') {
      text += '\n'
      return
    }
    const children = node.content
    if (!Array.isArray(children)) return
    for (let i = 0; i < children.length; i += 1) {
      walk(children[i], [...path, 'content', i])
    }
  }

  walk(blockNode, pathPrefix)
  return { text, segments }
}

export function findInText(text, query, { matchCase = false, partialMatch = false } = {}) {
  if (!text || !query) return []
  const hay = matchCase ? text : text.toLowerCase()
  const needle = matchCase ? query : query.toLowerCase()
  if (!needle) return []

  /** @type {{ start: number, end: number, matchText: string }[]} */
  const hits = []
  let from = 0
  while (from <= hay.length - needle.length) {
    const idx = hay.indexOf(needle, from)
    if (idx < 0) break
    const end = idx + needle.length
    if (partialMatch || isWholeWordMatch(text, idx, end)) {
      hits.push({ start: idx, end, matchText: text.slice(idx, end) })
      from = end
    } else {
      from = idx + 1
    }
  }
  return hits
}

const contextAround = (text, start, end, radius = CONTEXT_RADIUS) => {
  const beforeStart = Math.max(0, start - radius)
  const afterEnd = Math.min(text.length, end + radius)
  return {
    before: `${beforeStart > 0 ? '…' : ''}${text.slice(beforeStart, start)}`,
    after: `${text.slice(end, afterEnd)}${afterEnd < text.length ? '…' : ''}`,
  }
}

/**
 * Find literal occurrences across scenes' TipTap content.
 * @returns {Array<{ id: string, sceneId: string, chapterId: string|null, blockIndex: number, start: number, end: number, matchText: string, before: string, after: string }>}
 */
export function findInScenes(scenes, query, { matchCase = false, partialMatch = false } = {}) {
  const trimmed = query?.trim() || ''
  if (!trimmed || !Array.isArray(scenes)) return []

  const hits = []
  for (const scene of scenes) {
    const doc = scene?.content
    if (!doc || doc.type !== 'doc' || !Array.isArray(doc.content)) continue

    for (let blockIndex = 0; blockIndex < doc.content.length; blockIndex += 1) {
      const block = doc.content[blockIndex]
      if (!block) continue
      const { text } = collectBlockText(block, ['content', blockIndex])
      if (!text) continue

      for (const match of findInText(text, trimmed, { matchCase, partialMatch })) {
        const { before, after } = contextAround(text, match.start, match.end)
        hits.push({
          id: `${scene.id}:${blockIndex}:${match.start}:${match.end}`,
          sceneId: scene.id,
          chapterId: scene.chapter_id ?? null,
          blockIndex,
          start: match.start,
          end: match.end,
          matchText: match.matchText,
          before,
          after,
        })
      }
    }
  }
  return hits
}

const getAtPath = (root, path) => {
  let cur = root
  for (const key of path) {
    if (cur == null) return null
    cur = cur[key]
  }
  return cur
}

const pruneEmptyTextNodes = (parent) => {
  if (!parent || !Array.isArray(parent.content)) return
  parent.content = parent.content.filter((child) => {
    if (child?.type === 'text' && !(child.text || '')) return false
    return true
  })
  for (const child of parent.content) {
    if (child?.content) pruneEmptyTextNodes(child)
  }
}

/**
 * Apply one replacement [start, end) within a block's text-node segments.
 * Mutates `doc` in place. Returns false if the range cannot be applied (e.g. only hardBreak).
 */
export function replaceRangeInBlock(doc, blockIndex, start, end, replacement) {
  const block = doc?.content?.[blockIndex]
  if (!block) return false

  const { segments } = collectBlockText(block, ['content', blockIndex])
  const overlapping = segments.filter((s) => s.start < end && s.end > start)
  if (overlapping.length === 0) return false

  for (let i = overlapping.length - 1; i >= 0; i -= 1) {
    const seg = overlapping[i]
    const node = getAtPath(doc, seg.path)
    if (!node || node.type !== 'text') return false
    const localStart = Math.max(0, start - seg.start)
    const localEnd = Math.min((node.text || '').length, end - seg.start)
    const text = node.text || ''
    if (i === 0) {
      node.text = text.slice(0, localStart) + replacement + text.slice(localEnd)
    } else {
      node.text = text.slice(0, localStart) + text.slice(localEnd)
    }
  }

  pruneEmptyTextNodes(block)
  return true
}

/**
 * Clone TipTap content and apply occurrence replacements (end → start).
 * Occurrences must include blockIndex, start, end for the same scene's content.
 */
export function replaceOccurrencesInContent(content, occurrences, replacement) {
  if (!content || content.type !== 'doc') return content
  const doc = structuredClone(content)
  const sorted = [...occurrences].sort((a, b) => {
    if (a.blockIndex !== b.blockIndex) return b.blockIndex - a.blockIndex
    return b.start - a.start
  })

  for (const occ of sorted) {
    replaceRangeInBlock(doc, occ.blockIndex, occ.start, occ.end, replacement ?? '')
  }
  return doc
}

/**
 * Group hits by scene and produce updated TipTap docs for each affected scene.
 * @returns {Array<{ sceneId: string, content: object }>}
 */
export function buildReplacedScenes(scenesById, hits, replacement) {
  const byScene = new Map()
  for (const hit of hits) {
    if (!byScene.has(hit.sceneId)) byScene.set(hit.sceneId, [])
    byScene.get(hit.sceneId).push(hit)
  }

  const updates = []
  for (const [sceneId, sceneHits] of byScene) {
    const scene = scenesById.get?.(sceneId) ?? scenesById[sceneId]
    if (!scene?.content) continue
    updates.push({
      sceneId,
      content: replaceOccurrencesInContent(scene.content, sceneHits, replacement ?? ''),
    })
  }
  return updates
}

export function countScenesInHits(hits) {
  return new Set(hits.map((h) => h.sceneId)).size
}
