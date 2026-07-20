import { useCallback, useEffect, useState } from 'react'

const STORAGE_KEY = 'write-knuckles-editor-tab-size'
const SYNC_EVENT = 'write-knuckles-tab-size'

export const TAB_SIZE_OPTIONS = [
  { label: '0.5em', value: '0.5em' },
  { label: '1em', value: '1em' },
  { label: '2em', value: '2em' },
  { label: '4ch', value: '4ch' },
  { label: '8ch', value: '8ch' },
  { label: '0.5in', value: '0.5in' },
  { label: '1in', value: '1in' },
]

const DEFAULT_TAB_SIZE = '2em'

const isValidTabSize = (value) => TAB_SIZE_OPTIONS.some((option) => option.value === value)

const readStoredTabSize = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored && isValidTabSize(stored)) return stored
  } catch {
    // ignore
  }
  return DEFAULT_TAB_SIZE
}

export const useEditorTabSize = () => {
  const [tabSize, setTabSizeState] = useState(readStoredTabSize)

  useEffect(() => {
    const onSync = (event) => {
      if (event.detail?.tabSize !== undefined) setTabSizeState(event.detail.tabSize)
    }
    window.addEventListener(SYNC_EVENT, onSync)
    return () => window.removeEventListener(SYNC_EVENT, onSync)
  }, [])

  const setTabSize = useCallback((next) => {
    if (!isValidTabSize(next)) return
    setTabSizeState(next)
    try {
      localStorage.setItem(STORAGE_KEY, next)
    } catch {
      // ignore
    }
    window.dispatchEvent(new CustomEvent(SYNC_EVENT, { detail: { tabSize: next } }))
  }, [])

  return {
    tabSize,
    setTabSize,
    options: TAB_SIZE_OPTIONS,
  }
}
