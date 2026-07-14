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

export function writeIgnoredLintsJson(json) {
  try {
    localStorage.setItem(IGNORED_KEY, json || '[]')
  } catch {
    // ignore
  }
}
