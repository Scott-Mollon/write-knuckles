import { DEFAULT_EXPORT_OPTIONS, EXPORT_FORMATS } from '../../constants/export'

const storageKey = (taleId) => `write-knuckles-tale-export-prefs:${taleId}`

function normalizeSavedFormat(format) {
  if (typeof format !== 'string') return 'txt'
  const def = EXPORT_FORMATS[format]
  if (!def?.enabled) return 'txt'
  return format
}

function normalizeSavedOptions(raw) {
  if (!raw || typeof raw !== 'object') return { ...DEFAULT_EXPORT_OPTIONS }

  const options = { ...DEFAULT_EXPORT_OPTIONS }
  for (const key of Object.keys(DEFAULT_EXPORT_OPTIONS)) {
    if (key in raw) options[key] = Boolean(raw[key])
  }
  return options
}

export function readTaleExportPreferences(taleId) {
  if (!taleId) {
    return { format: 'txt', options: { ...DEFAULT_EXPORT_OPTIONS } }
  }

  try {
    const raw = localStorage.getItem(storageKey(taleId))
    if (!raw) {
      return { format: 'txt', options: { ...DEFAULT_EXPORT_OPTIONS } }
    }

    const parsed = JSON.parse(raw)
    return {
      format: normalizeSavedFormat(parsed?.format),
      options: normalizeSavedOptions(parsed?.options),
    }
  } catch {
    return { format: 'txt', options: { ...DEFAULT_EXPORT_OPTIONS } }
  }
}

export function writeTaleExportPreferences(taleId, { format, options }) {
  if (!taleId) return

  try {
    localStorage.setItem(
      storageKey(taleId),
      JSON.stringify({
        format: normalizeSavedFormat(format),
        options: normalizeSavedOptions(options),
        savedAt: Date.now(),
      }),
    )
  } catch {
    // ignore quota / private mode
  }
}
