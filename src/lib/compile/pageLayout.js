import {
  COMPILE_PAGE_MARGINS,
  COMPILE_PAGE_ORIENTATIONS,
  COMPILE_PAGE_SIZES,
  DEFAULT_COMPILE_PAGE_LAYOUT,
} from '../../constants/compile.js'

export function normalizePageLayout(raw) {
  const layout = { ...DEFAULT_COMPILE_PAGE_LAYOUT }

  if (raw && typeof raw === 'object') {
    if (raw.pageSize && COMPILE_PAGE_SIZES[raw.pageSize]) {
      layout.pageSize = raw.pageSize
    }
    if (raw.marginPreset && COMPILE_PAGE_MARGINS[raw.marginPreset]) {
      layout.marginPreset = raw.marginPreset
    }
    if (raw.orientation && COMPILE_PAGE_ORIENTATIONS[raw.orientation]) {
      layout.orientation = raw.orientation
    }
    if ('showPageGuides' in raw && raw.showPageGuides !== undefined) {
      layout.showPageGuides = Boolean(raw.showPageGuides)
    }
  }

  return layout
}

export function buildPageSizeRule(layout) {
  const size = COMPILE_PAGE_SIZES[layout.pageSize] || COMPILE_PAGE_SIZES.letter
  if (layout.orientation === 'landscape') {
    return `${size} landscape`
  }
  return size
}

export function buildPageMarginRule(layout) {
  return COMPILE_PAGE_MARGINS[layout.marginPreset] || COMPILE_PAGE_MARGINS.normal
}

export function pageLayoutsEqual(a, b) {
  const left = normalizePageLayout(a)
  const right = normalizePageLayout(b)
  return (
    left.pageSize === right.pageSize &&
    left.marginPreset === right.marginPreset &&
    left.orientation === right.orientation &&
    left.showPageGuides === right.showPageGuides
  )
}

export function pageLayoutAffectsPagination(a, b) {
  const left = normalizePageLayout(a)
  const right = normalizePageLayout(b)
  return (
    left.pageSize !== right.pageSize ||
    left.marginPreset !== right.marginPreset ||
    left.orientation !== right.orientation
  )
}
