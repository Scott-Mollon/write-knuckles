import {
  DEFAULT_COMPILE_TITLE_PAGE_STYLES,
  TITLE_PAGE_STYLE_KEYS,
} from '../../constants/compile.js'
import {
  buildCompileTextStyleAttr,
  normalizeCompileTextStyles,
} from './compileTextStyle.js'

export { buildCompileTextStyleAttr }

export function normalizeTitlePageStyles(raw) {
  return normalizeCompileTextStyles(raw, DEFAULT_COMPILE_TITLE_PAGE_STYLES, TITLE_PAGE_STYLE_KEYS)
}

export function getTitlePageStyles(options) {
  return normalizeTitlePageStyles(options?.titlePageStyles)
}

/** @deprecated use buildCompileTextStyleAttr */
export function buildTitlePageElementStyleAttr(style) {
  return buildCompileTextStyleAttr(style)
}
