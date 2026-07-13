import { DEFAULT_COMPILE_PAGE_NUMBER_STYLE } from '../../constants/compile.js'
import { normalizeCompileTextStyle } from './compileTextStyle.js'

export function normalizePageNumberStyle(raw) {
  return normalizeCompileTextStyle(raw, DEFAULT_COMPILE_PAGE_NUMBER_STYLE)
}

export function getPageNumberStyle(options) {
  return normalizePageNumberStyle(options?.pageNumberStyle)
}
