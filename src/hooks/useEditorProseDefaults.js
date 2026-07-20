import { useCallback, useEffect, useState } from 'react'
import {
  DEFAULT_SCENE_PROSE_FONT,
  isValidSceneFontFamily,
} from '../constants/sceneFonts'

const FONT_STORAGE_KEY = 'write-knuckles-editor-prose-font'
const SIZE_STORAGE_KEY = 'write-knuckles-editor-prose-size'
const SYNC_EVENT = 'write-knuckles-prose-defaults'

export const DEFAULT_PROSE_FONT_SIZE = '16px'

export const PROSE_FONT_SIZE_OPTIONS = [
  { label: '10', value: '10px' },
  { label: '11', value: '11px' },
  { label: '12', value: '12px' },
  { label: '14', value: '14px' },
  { label: '16', value: '16px' },
  { label: '18', value: '18px' },
  { label: '20', value: '20px' },
  { label: '24', value: '24px' },
  { label: '28', value: '28px' },
  { label: '32', value: '32px' },
]

const isValidProseFontSize = (value) =>
  PROSE_FONT_SIZE_OPTIONS.some((option) => option.value === value)

const readStoredProseFont = () => {
  try {
    const stored = localStorage.getItem(FONT_STORAGE_KEY)
    if (stored && isValidSceneFontFamily(stored)) return stored
  } catch {
    // ignore
  }
  return DEFAULT_SCENE_PROSE_FONT
}

const readStoredProseFontSize = () => {
  try {
    const stored = localStorage.getItem(SIZE_STORAGE_KEY)
    if (stored !== null && isValidProseFontSize(stored)) return stored
  } catch {
    // ignore
  }
  return DEFAULT_PROSE_FONT_SIZE
}

export const useEditorProseDefaults = () => {
  const [proseFont, setProseFontState] = useState(readStoredProseFont)
  const [proseFontSize, setProseFontSizeState] = useState(readStoredProseFontSize)

  useEffect(() => {
    const onSync = (event) => {
      const { proseFont: nextFont, proseFontSize: nextSize } = event.detail ?? {}
      if (nextFont !== undefined) setProseFontState(nextFont)
      if (nextSize !== undefined) setProseFontSizeState(nextSize)
    }
    window.addEventListener(SYNC_EVENT, onSync)
    return () => window.removeEventListener(SYNC_EVENT, onSync)
  }, [])

  const setProseFont = useCallback((next) => {
    if (!isValidSceneFontFamily(next)) return
    setProseFontState(next)
    try {
      localStorage.setItem(FONT_STORAGE_KEY, next)
    } catch {
      // ignore
    }
    window.dispatchEvent(new CustomEvent(SYNC_EVENT, { detail: { proseFont: next } }))
  }, [])

  const setProseFontSize = useCallback((next) => {
    if (!isValidProseFontSize(next)) return
    setProseFontSizeState(next)
    try {
      localStorage.setItem(SIZE_STORAGE_KEY, next)
    } catch {
      // ignore
    }
    window.dispatchEvent(new CustomEvent(SYNC_EVENT, { detail: { proseFontSize: next } }))
  }, [])

  return {
    proseFont,
    setProseFont,
    proseFontSize,
    setProseFontSize,
    fontSizeOptions: PROSE_FONT_SIZE_OPTIONS,
  }
}
