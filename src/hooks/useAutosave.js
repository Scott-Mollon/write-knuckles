import { useCallback, useEffect, useRef, useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { writeDb } from '../clients/supabase'
import { formatAbuseError, mapAbuseError } from '../lib/abuseErrors'
import { contentToPlainText, countWords, normalizeContentForSave } from '../lib/editor/plainText'
import { sceneContentQueryKey } from './useSceneContent'
import { taleSceneBodiesQueryKey } from '../lib/scenes/fetchTaleSceneBodies'

export const SAVE_STATES = {
  IDLE: 'idle',
  PENDING: 'pending',
  SAVING: 'saving',
  SAVED: 'saved',
  ERROR: 'error',
}

/**
 * @param {string | null | undefined} sceneId
 * @param {string | null | undefined} taleId
 * @param {{ enabled?: boolean, debounceMs?: number }} [options]
 * `enabled` should be true only after scene body content has loaded for `sceneId`.
 */
export const useAutosave = (sceneId, taleId, options = {}) => {
  const { enabled = true, debounceMs = 1500 } = options
  const queryClient = useQueryClient()
  const timerRef = useRef(null)
  /** @type {React.MutableRefObject<{ sceneId: string, content: unknown } | null>} */
  const pendingRef = useRef(null)
  const enabledRef = useRef(enabled)
  enabledRef.current = enabled
  const [saveState, setSaveState] = useState(SAVE_STATES.IDLE)
  const [saveError, setSaveError] = useState(null)

  const clearPending = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
    pendingRef.current = null
  }, [])

  const patchStructureMeta = useCallback(
    (sceneIdToPatch, patch) => {
      queryClient.setQueryData(['tale-structure', taleId], (old) => {
        if (!old) return old
        const patchScene = (s) => (s.id === sceneIdToPatch ? { ...s, ...patch } : s)
        return {
          ...old,
          scenes: old.scenes.map(patchScene),
          chapters: old.chapters.map((ch) => ({
            ...ch,
            scenes: ch.scenes.map(patchScene),
          })),
        }
      })
    },
    [queryClient, taleId],
  )

  const { mutateAsync } = useMutation({
    mutationFn: async ({ sceneId: targetSceneId, content }) => {
      const normalizedContent = normalizeContentForSave(content)
      const plain_text = contentToPlainText(normalizedContent)
      const word_count = countWords(plain_text)
      const updated_at = new Date().toISOString()
      const { error } = await writeDb
        .from('scenes')
        .update({
          content: normalizedContent,
          plain_text,
          word_count,
          updated_at,
        })
        .eq('id', targetSceneId)

      if (error) throw mapAbuseError(error)
      return {
        sceneId: targetSceneId,
        content: normalizedContent,
        plain_text,
        word_count,
        updated_at,
      }
    },
    onSuccess: (data) => {
      setSaveError(null)
      setSaveState(SAVE_STATES.SAVED)
      queryClient.setQueryData(sceneContentQueryKey(data.sceneId), {
        id: data.sceneId,
        content: data.content,
        plain_text: data.plain_text,
        updated_at: data.updated_at,
      })
      queryClient.setQueryData(taleSceneBodiesQueryKey(taleId), (old) => {
        if (!Array.isArray(old)) return old
        return old.map((body) =>
          body.id === data.sceneId
            ? {
                ...body,
                content: data.content,
                plain_text: data.plain_text,
                updated_at: data.updated_at,
              }
            : body,
        )
      })
      patchStructureMeta(data.sceneId, {
        word_count: data.word_count,
        updated_at: data.updated_at,
      })
      queryClient.invalidateQueries({ queryKey: ['tales'] })
    },
    onError: (error) => {
      setSaveError(
        formatAbuseError(error) ||
          (error instanceof Error ? error.message : null) ||
          'Save failed — retry by editing',
      )
      setSaveState(SAVE_STATES.ERROR)
    },
  })

  // Drop debounce when scene changes or content is not ready yet.
  useEffect(() => {
    clearPending()
    setSaveError(null)
    setSaveState(SAVE_STATES.IDLE)
  }, [sceneId, enabled, clearPending])

  const flush = useCallback(async () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
    const pending = pendingRef.current
    if (!pending?.sceneId) return
    // Flush may run while switching away; allow the queued scene id through.
    pendingRef.current = null
    setSaveState(SAVE_STATES.SAVING)
    await mutateAsync(pending)
  }, [mutateAsync])

  const queueSave = useCallback(
    (content) => {
      if (!enabledRef.current || !sceneId) return
      pendingRef.current = { sceneId, content }
      setSaveState(SAVE_STATES.PENDING)
      if (timerRef.current) clearTimeout(timerRef.current)
      timerRef.current = setTimeout(() => {
        timerRef.current = null
        if (!enabledRef.current) {
          pendingRef.current = null
          return
        }
        const pending = pendingRef.current
        if (!pending?.sceneId) return
        pendingRef.current = null
        setSaveState(SAVE_STATES.SAVING)
        mutateAsync(pending)
      }, debounceMs)
    },
    [debounceMs, mutateAsync, sceneId],
  )

  useEffect(
    () => () => {
      clearPending()
    },
    [clearPending],
  )

  return { queueSave, flush, saveState, saveError, enabled }
}
