import { COMPILE_TEXT_ALIGNS, COMPILE_TEXT_FONT_OPTIONS } from '../../constants/compile.js'

const FONT_VALUES = new Set(COMPILE_TEXT_FONT_OPTIONS.map((font) => font.value))
const HEX_COLOR_RE = /^#[0-9a-fA-F]{3,8}$/

export function toHexColorForInput(color, fallback = '#000000') {
  if (!color) return fallback
  const hex = color.trim()
  if (/^#[0-9a-fA-F]{6}$/.test(hex)) return hex.toLowerCase()
  if (/^#[0-9a-fA-F]{3}$/.test(hex)) {
    const [, r, g, b] = hex
    return `#${r}${r}${g}${g}${b}${b}`.toLowerCase()
  }
  return fallback
}

export function normalizeCompileTextColor(value, fallback) {
  if (typeof value !== 'string') return fallback
  const trimmed = value.trim()
  if (HEX_COLOR_RE.test(trimmed)) return trimmed.toLowerCase()
  if (/^rgba?\([^)]+\)$/.test(trimmed)) return trimmed
  return fallback
}

export function normalizeFontSizePt(value, fallback) {
  const size = Number(value)
  if (!Number.isFinite(size) || size < 6 || size > 96) return fallback
  return Math.round(size * 10) / 10
}

export function normalizeCompileTextStyle(raw, fallback) {
  const style = { ...fallback }

  if (raw && typeof raw === 'object') {
    if (typeof raw.font === 'string' && FONT_VALUES.has(raw.font)) {
      style.font = raw.font
    }
    if ('fontSizePt' in raw) {
      style.fontSizePt = normalizeFontSizePt(raw.fontSizePt, fallback.fontSizePt)
    }
    if ('bold' in raw) style.bold = Boolean(raw.bold)
    if ('italic' in raw) style.italic = Boolean(raw.italic)
    if ('underline' in raw) style.underline = Boolean(raw.underline)
    if (typeof raw.align === 'string' && COMPILE_TEXT_ALIGNS[raw.align]) {
      style.align = raw.align
    }
    if ('color' in raw) {
      style.color = normalizeCompileTextColor(raw.color, fallback.color)
    }
  }

  return style
}

export function normalizeCompileTextStyles(raw, defaults, keys) {
  const styles = {}
  for (const key of keys) {
    styles[key] = normalizeCompileTextStyle(raw?.[key], defaults[key])
  }
  return styles
}

export function buildCompileTextStyleAttr(style, { flexItem = false, block = false } = {}) {
  const weight = style.bold ? '700' : '400'
  const fontStyle = style.italic ? 'italic' : 'normal'
  const textDecoration = style.underline ? 'underline' : 'none'

  const parts = [
    `font-family: ${style.font}`,
    `font-size: ${style.fontSizePt}pt`,
    `font-weight: ${weight}`,
    `font-style: ${fontStyle}`,
    `text-decoration: ${textDecoration}`,
    `text-align: ${style.align}`,
    `color: ${style.color}`,
  ]

  if (flexItem) {
    parts.push('flex: 1', 'min-width: 0')
  }
  if (block) {
    parts.push('display: block', 'width: 100%')
  }

  return parts.join('; ')
}

const PAGE_NUMBER_MARGIN_BOX = {
  left: 'bottom-left',
  center: 'bottom-center',
  right: 'bottom-right',
}

export function getPageNumberMarginBox(align) {
  return PAGE_NUMBER_MARGIN_BOX[align] || PAGE_NUMBER_MARGIN_BOX.center
}

export function buildCompileMarginBoxStyleDecls(style) {
  const weight = style.bold ? '700' : '400'
  const fontStyle = style.italic ? 'italic' : 'normal'
  const textDecoration = style.underline ? 'underline' : 'none'

  return [
    `font-family: ${style.font}`,
    `font-size: ${style.fontSizePt}pt`,
    `font-weight: ${weight}`,
    `font-style: ${fontStyle}`,
    `text-decoration: ${textDecoration}`,
    `color: ${style.color}`,
  ].join(';\n    ')
}
