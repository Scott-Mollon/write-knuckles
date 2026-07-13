import {
  DEFAULT_COMPILE_OPTIONS,
  DEFAULT_COMPILE_PAGE_LAYOUT,
} from '../../constants/compile.js'
import { normalizePageLayout } from './pageLayout.js'

const storageKey = (taleId) => `write-knuckles-tale-compile-prefs:${taleId}`

function normalizeSavedOptions(raw) {
  if (!raw || typeof raw !== 'object') return { ...DEFAULT_COMPILE_OPTIONS }

  const options = { ...DEFAULT_COMPILE_OPTIONS }
  for (const key of Object.keys(DEFAULT_COMPILE_OPTIONS)) {
    if (key in raw) options[key] = Boolean(raw[key])
  }
  return options
}

export function readTaleCompilePreferences(taleId) {
  if (!taleId) {
    return {
      options: { ...DEFAULT_COMPILE_OPTIONS },
      pageLayout: { ...DEFAULT_COMPILE_PAGE_LAYOUT },
    }
  }

  try {
    const raw = localStorage.getItem(storageKey(taleId))
    if (!raw) {
      return {
        options: { ...DEFAULT_COMPILE_OPTIONS },
        pageLayout: { ...DEFAULT_COMPILE_PAGE_LAYOUT },
      }
    }

    const parsed = JSON.parse(raw)
    const pageLayout = normalizePageLayout(parsed?.pageLayout ?? {
      pageSize: parsed?.pageSize,
      marginPreset: parsed?.marginPreset,
      orientation: parsed?.orientation,
      showPageGuides: parsed?.showPageGuides,
    })

    return {
      options: normalizeSavedOptions(parsed?.options),
      pageLayout,
    }
  } catch {
    return {
      options: { ...DEFAULT_COMPILE_OPTIONS },
      pageLayout: { ...DEFAULT_COMPILE_PAGE_LAYOUT },
    }
  }
}

export function writeTaleCompilePreferences(taleId, { options, pageLayout }) {
  if (!taleId) return

  try {
    localStorage.setItem(
      storageKey(taleId),
      JSON.stringify({
        options: normalizeSavedOptions(options),
        pageLayout: normalizePageLayout(pageLayout),
        savedAt: Date.now(),
      }),
    )
  } catch {
    // ignore quota / private mode
  }
}
