const ENABLED_KEY = 'write-knuckles-harper-proofread'
const IGNORED_KEY = 'write-knuckles-harper-ignored-lints'

export function readProofreadEnabled() {
  try {
    return localStorage.getItem(ENABLED_KEY) === '1'
  } catch {
    return false
  }
}

export function writeProofreadEnabled(enabled) {
  try {
    localStorage.setItem(ENABLED_KEY, enabled ? '1' : '0')
  } catch {
    // ignore
  }
}

export function readIgnoredLintsJson() {
  try {
    return localStorage.getItem(IGNORED_KEY) || '[]'
  } catch {
    return '[]'
  }
}

export function countIgnoredLintsJson(json) {
  const source = typeof json === 'string' ? json.trim() : ''
  if (!source) return 0

  let contents = null
  if (source.startsWith('[') && source.endsWith(']')) {
    contents = source.slice(1, -1)
  } else {
    const match = source.match(/"context_hashes"\s*:\s*\[([\s\S]*?)\]/)
    contents = match?.[1] ?? null
  }

  if (contents == null || !contents.trim()) return 0
  return contents
    .split(',')
    .map((entry) => entry.trim())
    .filter((entry) => /^"?\d+"?$/.test(entry))
    .length
}

export function countIgnoredLints() {
  return countIgnoredLintsJson(readIgnoredLintsJson())
}

export function writeIgnoredLintsJson(json) {
  try {
    localStorage.setItem(IGNORED_KEY, json || '[]')
  } catch {
    // ignore
  }
}
