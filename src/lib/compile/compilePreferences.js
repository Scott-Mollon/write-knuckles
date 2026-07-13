import {
  DEFAULT_COMPILE_OPTIONS,
  DEFAULT_COMPILE_PAGE_LAYOUT,
} from '../../constants/compile.js'
import { normalizePageLayout } from './pageLayout.js'

const legacyStorageKey = (taleId) => `write-knuckles-tale-compile-prefs:${taleId}`
const viewerStorageKey = (taleId) => `write-knuckles-tale-compile-viewer:${taleId}`

function normalizeSavedOptions(raw) {
  if (!raw || typeof raw !== 'object') return { ...DEFAULT_COMPILE_OPTIONS }

  const options = { ...DEFAULT_COMPILE_OPTIONS }
  for (const key of Object.keys(DEFAULT_COMPILE_OPTIONS)) {
    if (key in raw) options[key] = Boolean(raw[key])
  }
  return options
}

function isEmptyDbPreferences(raw) {
  if (!raw || typeof raw !== 'object') return true
  if (Object.keys(raw).length === 0) return true
  const hasOptions = raw.options && Object.keys(raw.options).length > 0
  const hasLayout = raw.pageLayout && Object.keys(raw.pageLayout).length > 0
  return !hasOptions && !hasLayout
}

function parseDbCompilePreferences(raw) {
  if (!raw || typeof raw !== 'object') {
    return {
      options: { ...DEFAULT_COMPILE_OPTIONS },
      pageLayout: { ...DEFAULT_COMPILE_PAGE_LAYOUT },
    }
  }

  const pageLayout = normalizePageLayout(raw.pageLayout ?? {
    pageSize: raw.pageSize,
    marginPreset: raw.marginPreset,
    orientation: raw.orientation,
  })

  return {
    options: normalizeSavedOptions(raw.options),
    pageLayout: {
      ...pageLayout,
      showPageGuides: DEFAULT_COMPILE_PAGE_LAYOUT.showPageGuides,
    },
  }
}

function readLegacyLocalPreferences(taleId) {
  if (!taleId) return null

  try {
    const raw = localStorage.getItem(legacyStorageKey(taleId))
    if (!raw) return null
    const parsed = JSON.parse(raw)
    return {
      options: normalizeSavedOptions(parsed?.options),
      pageLayout: normalizePageLayout(parsed?.pageLayout ?? parsed),
    }
  } catch {
    return null
  }
}

export function readViewerCompilePreferences(taleId) {
  if (!taleId) {
    return { showPageGuides: DEFAULT_COMPILE_PAGE_LAYOUT.showPageGuides }
  }

  try {
    const raw = localStorage.getItem(viewerStorageKey(taleId))
    if (!raw) {
      const legacy = readLegacyLocalPreferences(taleId)
      if (legacy?.pageLayout && 'showPageGuides' in legacy.pageLayout) {
        return { showPageGuides: Boolean(legacy.pageLayout.showPageGuides) }
      }
      return { showPageGuides: DEFAULT_COMPILE_PAGE_LAYOUT.showPageGuides }
    }

    const parsed = JSON.parse(raw)
    return {
      showPageGuides:
        'showPageGuides' in parsed
          ? Boolean(parsed.showPageGuides)
          : DEFAULT_COMPILE_PAGE_LAYOUT.showPageGuides,
    }
  } catch {
    return { showPageGuides: DEFAULT_COMPILE_PAGE_LAYOUT.showPageGuides }
  }
}

export function writeViewerCompilePreferences(taleId, { showPageGuides }) {
  if (!taleId) return

  try {
    localStorage.setItem(
      viewerStorageKey(taleId),
      JSON.stringify({ showPageGuides: Boolean(showPageGuides) }),
    )
  } catch {
    // ignore quota / private mode
  }
}

export function getTaleCompilePreferences(tale, taleId) {
  const viewerPrefs = readViewerCompilePreferences(taleId)
  const dbRaw = tale?.compile_preferences

  if (!isEmptyDbPreferences(dbRaw)) {
    const fromDb = parseDbCompilePreferences(dbRaw)
    return {
      options: fromDb.options,
      pageLayout: {
        ...fromDb.pageLayout,
        showPageGuides: viewerPrefs.showPageGuides,
      },
    }
  }

  const legacy = readLegacyLocalPreferences(taleId)
  if (legacy) {
    return {
      options: legacy.options,
      pageLayout: {
        ...legacy.pageLayout,
        showPageGuides: viewerPrefs.showPageGuides,
      },
    }
  }

  return {
    options: { ...DEFAULT_COMPILE_OPTIONS },
    pageLayout: {
      ...DEFAULT_COMPILE_PAGE_LAYOUT,
      showPageGuides: viewerPrefs.showPageGuides,
    },
  }
}

export function serializeCompilePreferencesForDb({ options, pageLayout }) {
  const layout = normalizePageLayout(pageLayout)
  return {
    options: normalizeSavedOptions(options),
    pageLayout: {
      pageSize: layout.pageSize,
      marginPreset: layout.marginPreset,
      orientation: layout.orientation,
    },
  }
}

/** @deprecated use getTaleCompilePreferences(tale, taleId) */
export function readTaleCompilePreferences(taleId) {
  return getTaleCompilePreferences(null, taleId)
}

/** @deprecated use DB persistence via useUpdateTaleCompilePreferences */
export function writeTaleCompilePreferences(taleId, { options, pageLayout }) {
  if (!taleId) return
  writeViewerCompilePreferences(taleId, {
    showPageGuides: normalizePageLayout(pageLayout).showPageGuides,
  })

  try {
    localStorage.setItem(
      legacyStorageKey(taleId),
      JSON.stringify(serializeCompilePreferencesForDb({ options, pageLayout })),
    )
  } catch {
    // ignore
  }
}
