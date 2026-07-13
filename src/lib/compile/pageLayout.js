import {
  COMPILE_MARGIN_UNITS,
  COMPILE_PAGE_MARGINS,
  COMPILE_PAGE_ORIENTATIONS,
  COMPILE_PAGE_SIZES,
  DEFAULT_COMPILE_CUSTOM_MARGIN_UNIT,
  DEFAULT_COMPILE_CUSTOM_MARGINS,
  DEFAULT_COMPILE_PAGE_LAYOUT,
} from '../../constants/compile.js'

const MARGIN_SIDES = ['top', 'right', 'bottom', 'left']
const INCHES_PER_MM = 1 / 25.4

export function parseMarginValue(cssValue, unit = 'in') {
  if (typeof cssValue !== 'string') return ''
  const match = cssValue.trim().match(/^(\d+(?:\.\d+)?)(in|mm)$/)
  if (!match) return ''

  const amount = Number(match[1])
  const valueUnit = match[2]
  if (!Number.isFinite(amount)) return ''

  if (valueUnit === unit) {
    return String(amount)
  }

  if (unit === 'mm' && valueUnit === 'in') {
    return String(roundMarginAmount(amount * 25.4, 'mm'))
  }

  if (unit === 'in' && valueUnit === 'mm') {
    return String(roundMarginAmount(amount * INCHES_PER_MM, 'in'))
  }

  return String(amount)
}

/** @deprecated use parseMarginValue */
export function parseMarginInches(cssValue) {
  return parseMarginValue(cssValue, 'in')
}

function roundMarginAmount(amount, unit) {
  if (unit === 'mm') {
    return Math.round(amount * 10) / 10
  }
  return Math.round(amount * 1000) / 1000
}

export function marginValueToCSSValue(amount, unit = 'in') {
  const value = Number(amount)
  if (!Number.isFinite(value) || value < 0) return `0${unit}`
  return `${roundMarginAmount(value, unit)}${unit}`
}

/** @deprecated use marginValueToCSSValue */
export function marginInchesToCSSValue(inches) {
  return marginValueToCSSValue(inches, 'in')
}

export function convertMarginCSSValue(cssValue, toUnit = 'in') {
  const amount = parseMarginValue(cssValue, toUnit)
  if (amount === '') return marginValueToCSSValue(0, toUnit)
  return marginValueToCSSValue(amount, toUnit)
}

function normalizeMarginUnit(raw) {
  if (raw && COMPILE_MARGIN_UNITS[raw]) return raw
  return DEFAULT_COMPILE_CUSTOM_MARGIN_UNIT
}

function normalizeMarginValue(value, fallback, unit = DEFAULT_COMPILE_CUSTOM_MARGIN_UNIT) {
  if (typeof value === 'number') {
    return marginValueToCSSValue(value, unit)
  }
  if (typeof value !== 'string') return fallback

  const trimmed = value.trim()
  if (/^\d+(\.\d+)?(in|mm)$/.test(trimmed)) {
    return trimmed
  }
  if (/^\d+(\.\d+)?$/.test(trimmed)) {
    return marginValueToCSSValue(trimmed, unit)
  }
  return fallback
}

function normalizeCustomMargins(raw, unit = DEFAULT_COMPILE_CUSTOM_MARGIN_UNIT) {
  const margins = { ...DEFAULT_COMPILE_CUSTOM_MARGINS }
  if (!raw || typeof raw !== 'object') return margins

  for (const side of MARGIN_SIDES) {
    if (side in raw) {
      margins[side] = normalizeMarginValue(raw[side], margins[side], unit)
    }
  }

  return margins
}

function customMarginsEqual(a, b) {
  return MARGIN_SIDES.every((side) => a[side] === b[side])
}

export function normalizePageLayout(raw) {
  const layout = {
    ...DEFAULT_COMPILE_PAGE_LAYOUT,
    customMargins: { ...DEFAULT_COMPILE_CUSTOM_MARGINS },
    customMarginUnit: DEFAULT_COMPILE_CUSTOM_MARGIN_UNIT,
  }

  if (raw && typeof raw === 'object') {
    if (raw.pageSize && COMPILE_PAGE_SIZES[raw.pageSize]) {
      layout.pageSize = raw.pageSize
    }
  }

  const customMarginUnit = normalizeMarginUnit(raw?.customMarginUnit)

  if (raw && typeof raw === 'object') {
    if (raw.marginPreset === 'custom') {
      layout.marginPreset = 'custom'
      layout.customMarginUnit = customMarginUnit
      layout.customMargins = normalizeCustomMargins(raw.customMargins, customMarginUnit)
    } else if (raw.marginPreset && COMPILE_PAGE_MARGINS[raw.marginPreset]) {
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
  if (layout.marginPreset === 'custom') {
    const margins = layout.customMargins || DEFAULT_COMPILE_CUSTOM_MARGINS
    return `${margins.top} ${margins.right} ${margins.bottom} ${margins.left}`
  }
  return COMPILE_PAGE_MARGINS[layout.marginPreset] || COMPILE_PAGE_MARGINS.normal
}

export function pageLayoutsEqual(a, b) {
  const left = normalizePageLayout(a)
  const right = normalizePageLayout(b)
  return (
    left.pageSize === right.pageSize &&
    left.marginPreset === right.marginPreset &&
    (left.marginPreset !== 'custom' ||
      (left.customMarginUnit === right.customMarginUnit &&
        customMarginsEqual(left.customMargins, right.customMargins))) &&
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
    (left.marginPreset === 'custom' &&
      right.marginPreset === 'custom' &&
      (left.customMarginUnit !== right.customMarginUnit ||
        !customMarginsEqual(left.customMargins, right.customMargins))) ||
    left.orientation !== right.orientation
  )
}
