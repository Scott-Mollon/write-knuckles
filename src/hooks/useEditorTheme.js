import { useCallback, useState } from 'react'

const STORAGE_KEY = 'write-knuckles-editor-theme'

export const EDITOR_THEMES = {
  DARK: 'dark',
  LIGHT: 'light',
}

const readStoredTheme = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored === EDITOR_THEMES.LIGHT || stored === EDITOR_THEMES.DARK) return stored
  } catch {
    // ignore
  }
  return EDITOR_THEMES.DARK
}

export const useEditorTheme = () => {
  const [theme, setThemeState] = useState(readStoredTheme)

  const setTheme = useCallback((next) => {
    setThemeState(next)
    try {
      localStorage.setItem(STORAGE_KEY, next)
    } catch {
      // ignore
    }
  }, [])

  const toggleTheme = useCallback(() => {
    setTheme(theme === EDITOR_THEMES.DARK ? EDITOR_THEMES.LIGHT : EDITOR_THEMES.DARK)
  }, [setTheme, theme])

  return {
    theme,
    setTheme,
    toggleTheme,
    isLight: theme === EDITOR_THEMES.LIGHT,
  }
}
