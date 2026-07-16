import { useCallback, useEffect, useRef, useState } from 'react'
import { getHarperLinter, prefetchHarperLinter, freeLint } from '../lib/harper/linter'
import { buildPlainTextMap, spanToPositions, splitInlineRanges } from '../lib/harper/textMap'
import { serializeHarperLint, applySerializedSuggestion } from '../lib/harper/serialize'
import { fetchHarperDictionary, saveHarperDictionary, isWordInHarperDictionary, normalizeHarperWord } from '../lib/harper/dictionary'
import {
  readProofreadEnabled,
  writeProofreadEnabled,
  readIgnoredLintsJson,
  writeIgnoredLintsJson,
} from '../lib/harper/prefs'
import { setHarperLints, clearHarperLints } from '../lib/editor/harperProofread'

const DEBOUNCE_MS = 500

export function useHarperProofread(editor, sceneId, taleId) {
  const [enabled, setEnabledState] = useState(readProofreadEnabled)
  const [loading, setLoading] = useState(false)
  const [issueCount, setIssueCount] = useState(0)
  const [activeLint, setActiveLint] = useState(null)
  const [actionError, setActionError] = useState(null)
  const [engineError, setEngineError] = useState(null)

  const dictionaryRef = useRef([])
  const loadedTaleIdRef = useRef(null)
  const ignoredLintsReadyRef = useRef(false)
  const requestIdRef = useRef(0)
  const debounceRef = useRef(null)
  const enabledRef = useRef(enabled)
  const taleIdRef = useRef(taleId)

  enabledRef.current = enabled
  taleIdRef.current = taleId

  const setEnabled = useCallback((next) => {
    const value = Boolean(next)
    setEnabledState(value)
    writeProofreadEnabled(value)
  }, [])

  const toggleEnabled = useCallback(() => {
    setEnabled(!enabledRef.current)
  }, [setEnabled])

  const closePopover = useCallback(() => {
    setActiveLint(null)
    setActionError(null)
  }, [])

  const prepareSession = useCallback(async () => {
    const linter = await getHarperLinter()
    const currentTaleId = taleIdRef.current

    if (!ignoredLintsReadyRef.current) {
      const ignoredJson = readIgnoredLintsJson()
      if (ignoredJson && ignoredJson !== '[]') {
        await linter.importIgnoredLints(ignoredJson)
      }
      ignoredLintsReadyRef.current = true
    }

    if (loadedTaleIdRef.current !== currentTaleId) {
      const words = currentTaleId
        ? await fetchHarperDictionary(currentTaleId).catch(() => [])
        : []
      dictionaryRef.current = words
      await linter.clearWords()
      if (words.length) await linter.importWords(words)
      loadedTaleIdRef.current = currentTaleId
    }

    return linter
  }, [])

  const runLint = useCallback(
    async (ed) => {
      if (!ed || ed.isDestroyed || !enabledRef.current) return

      const requestId = ++requestIdRef.current
      setLoading(true)

      try {
        const linter = await prepareSession()
        if (requestId !== requestIdRef.current || !enabledRef.current) return

        const { text, charToPos } = buildPlainTextMap(ed.state.doc)
        if (!text.trim()) {
          if (requestId === requestIdRef.current) {
            clearHarperLints(ed)
            setIssueCount(0)
            setEngineError(null)
          }
          return
        }

        const lints = await linter.lint(text, { language: 'plaintext' })
        if (requestId !== requestIdRef.current || !enabledRef.current || ed.isDestroyed) {
          for (const lint of lints) freeLint(lint)
          return
        }

        const items = []
        const counted = new Set()
        for (const lint of lints) {
          try {
            const serialized = serializeHarperLint(lint)
            // Harper may keep flagging dictionary words when apostrophes differ
            // (e.g. O’Shaughnessy vs O'Shaughnessy). Suppress those in the UI.
            if (
              serialized.isSpelling &&
              isWordInHarperDictionary(serialized.problemText, dictionaryRef.current)
            ) {
              continue
            }
            const ignoreHash = (await linter.contextHash(text, lint)).toString()
            const positions = spanToPositions(
              { start: serialized.spanStart, end: serialized.spanEnd },
              charToPos
            )
            if (!positions) continue
            const ranges = splitInlineRanges(ed.state.doc, positions.from, positions.to)
            if (!ranges.length) continue
            counted.add(serialized.id)
            ranges.forEach((range, rangeIndex) => {
              items.push({
                ...serialized,
                id: `${serialized.id}-${rangeIndex}`,
                from: range.from,
                to: range.to,
                sourceText: text,
                ignoreHash,
              })
            })
          } finally {
            freeLint(lint)
          }
        }

        setHarperLints(ed, items)
        setIssueCount(counted.size)
        setEngineError(null)
      } catch (err) {
        if (import.meta.env.DEV) {
          console.error('Harper lint failed:', err)
        }
        if (requestId === requestIdRef.current) {
          setEngineError(err?.message || 'Proofreader failed to load.')
          setIssueCount(0)
        }
      } finally {
        if (requestId === requestIdRef.current) {
          setLoading(false)
        }
      }
    },
    [prepareSession]
  )

  const scheduleLint = useCallback(
    (ed) => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
      debounceRef.current = setTimeout(() => {
        debounceRef.current = null
        runLint(ed)
      }, DEBOUNCE_MS)
    },
    [runLint]
  )

  // Prefetch worker while Write mode is open.
  useEffect(() => {
    prefetchHarperLinter()
  }, [])

  // Wire lint click → popover.
  useEffect(() => {
    if (!editor) return
    editor.storage.harperProofread.onLintClick = (item, coords) => {
      setActionError(null)
      setActiveLint({ item, coords })
    }
    return () => {
      if (editor.storage?.harperProofread) {
        editor.storage.harperProofread.onLintClick = null
      }
    }
  }, [editor])

  // Enable / disable / scene or tale switch.
  useEffect(() => {
    if (!editor) return undefined

    if (!enabled) {
      if (debounceRef.current) clearTimeout(debounceRef.current)
      requestIdRef.current += 1
      clearHarperLints(editor)
      setIssueCount(0)
      setLoading(false)
      setEngineError(null)
      closePopover()
      return undefined
    }

    runLint(editor)

    const onUpdate = ({ editor: ed, transaction }) => {
      if (!transaction.docChanged) return
      closePopover()
      scheduleLint(ed)
    }

    editor.on('update', onUpdate)
    return () => {
      editor.off('update', onUpdate)
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [editor, sceneId, taleId, enabled, runLint, scheduleLint, closePopover])

  // Pause new runs when tab is hidden.
  useEffect(() => {
    const onVisibility = () => {
      if (document.hidden && debounceRef.current) {
        clearTimeout(debounceRef.current)
        debounceRef.current = null
      } else if (!document.hidden && enabledRef.current && editor && !editor.isDestroyed) {
        scheduleLint(editor)
      }
    }
    document.addEventListener('visibilitychange', onVisibility)
    return () => document.removeEventListener('visibilitychange', onVisibility)
  }, [editor, scheduleLint])

  const applySuggestion = useCallback(
    async (suggestion) => {
      if (!editor || !activeLint?.item) return
      const { item } = activeLint
      const ok = applySerializedSuggestion(editor, item.from, item.to, suggestion)
      closePopover()
      if (ok) scheduleLint(editor)
    },
    [editor, activeLint, closePopover, scheduleLint]
  )

  const ignoreLint = useCallback(async () => {
    if (!editor || !activeLint?.item) return
    const { item } = activeLint
    if (!item.ignoreHash) {
      setActionError('Could not ignore issue.')
      return
    }
    try {
      const linter = await prepareSession()
      await linter.ignoreLintHash(BigInt(item.ignoreHash))
      const exported = await linter.exportIgnoredLints()
      writeIgnoredLintsJson(exported)
      closePopover()
      await runLint(editor)
    } catch (err) {
      setActionError(err.message || 'Could not ignore issue.')
    }
  }, [editor, activeLint, prepareSession, closePopover, runLint])

  const addToDictionary = useCallback(async () => {
    if (!editor || !activeLint?.item) return
    const currentTaleId = taleIdRef.current
    if (!currentTaleId) {
      setActionError('Could not save dictionary word.')
      return
    }

    const word = normalizeHarperWord(activeLint.item.problemText || '')
    if (!word) return

    const previous = [...dictionaryRef.current]
    const nextWords = [...new Set([...previous.map(normalizeHarperWord).filter(Boolean), word])]

    try {
      const linter = await prepareSession()
      dictionaryRef.current = nextWords
      const saved = await saveHarperDictionary(currentTaleId, nextWords)
      dictionaryRef.current = saved

      // importWords is a significant op — resync the full dictionary so the
      // in-memory engine matches what we just persisted (append-only single-word
      // import is unreliable for clearing existing underlines).
      await linter.clearWords()
      if (saved.length) await linter.importWords(saved)

      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
        debounceRef.current = null
      }
      // Drop any in-flight lint results that were computed with the old dictionary.
      requestIdRef.current += 1

      closePopover()
      clearHarperLints(editor)
      await runLint(editor)
    } catch (err) {
      dictionaryRef.current = previous
      try {
        const linter = await getHarperLinter()
        await linter.clearWords()
        if (previous.length) await linter.importWords(previous)
      } catch {
        // best-effort rollback
      }
      setActionError(err.message || 'Could not save dictionary word.')
    }
  }, [editor, activeLint, prepareSession, closePopover, runLint])

  return {
    enabled,
    loading,
    issueCount,
    activeLint,
    actionError,
    engineError,
    setEnabled,
    toggleEnabled,
    closePopover,
    applySuggestion,
    ignoreLint,
    addToDictionary,
  }
}
