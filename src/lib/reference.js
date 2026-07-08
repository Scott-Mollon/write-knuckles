export const getJsonSummary = (json) => {
  if (!json || typeof json !== 'object') return ''
  return json.summary || ''
}

export const getSceneCharacterLinks = (sceneId, links) =>
  links.filter((l) => l.scene_id === sceneId)

export const getSceneLocationLinks = (sceneId, links) =>
  links.filter((l) => l.scene_id === sceneId)

export const getLinkedCharacters = (sceneId, links, characters) => {
  const ids = new Set(getSceneCharacterLinks(sceneId, links).map((l) => l.character_id))
  return characters.filter((c) => ids.has(c.id))
}

export const getLinkedLocations = (sceneId, links, locations) => {
  const ids = new Set(getSceneLocationLinks(sceneId, links).map((l) => l.location_id))
  return locations.filter((l) => ids.has(l.id))
}

export const snippetAroundMatch = (text, query, radius = 80) => {
  if (!text || !query) return ''
  const lower = text.toLowerCase()
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean)
  let index = -1
  for (const term of terms) {
    index = lower.indexOf(term)
    if (index >= 0) break
  }
  if (index < 0) return text.slice(0, radius * 2).trim()
  const start = Math.max(0, index - radius)
  const end = Math.min(text.length, index + radius)
  const prefix = start > 0 ? '…' : ''
  const suffix = end < text.length ? '…' : ''
  return `${prefix}${text.slice(start, end).trim()}${suffix}`
}
