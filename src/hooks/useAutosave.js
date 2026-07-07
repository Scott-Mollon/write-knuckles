import { useCallback, useEffect, useRef, useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { writeDb } from '../clients/supabase'
import { contentToPlainText, countWords, normalizeContentForSave } from '../lib/editor/plainText'

export const SAVE_STATES = {
  IDLE: 'idle',
  PENDING: 'pending',
  SAVING: 'saving',
  SAVED: 'saved',
  ERROR: 'error',
}

export const useAutosave = (sceneId, taleId, debounceMs = 1500) => {
  const queryClient = useQueryClient()
  const timerRef = useRef(null)
  const pendingContentRef = useRef(null)
  const [saveState, setSaveState] = useState(SAVE_STATES.IDLE)

  const patchStructureCache = useCallback(
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
    mutationFn: async (content) => {
      const normalizedContent = normalizeContentForSave(content)
      const plain_text = contentToPlainText(normalizedContent)
      const word_count = countWords(plain_text)
      const { error } = await writeDb
        .from('scenes')
        .update({
          content: normalizedContent,
          plain_text,
          word_count,
          updated_at: new Date().toISOString(),
        })
        .eq('id', sceneId)

      if (error) throw error
      return { content: normalizedContent, plain_text, word_count }
    },
    onSuccess: (data) => {
      setSaveState(SAVE_STATES.SAVED)
      patchStructureCache(sceneId, data)
      queryClient.invalidateQueries({ queryKey: ['tales'] })
    },
    onError: () => setSaveState(SAVE_STATES.ERROR),
  })

  const flush = useCallback(async () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
    const content = pendingContentRef.current
    if (content === null || content === undefined) return
    pendingContentRef.current = null
    setSaveState(SAVE_STATES.SAVING)
    await mutateAsync(content)
  }, [mutateAsync])

  const queueSave = useCallback(
    (content) => {
      pendingContentRef.current = content
      setSaveState(SAVE_STATES.PENDING)
      if (timerRef.current) clearTimeout(timerRef.current)
      timerRef.current = setTimeout(() => {
        timerRef.current = null
        const pending = pendingContentRef.current
        if (pending === null || pending === undefined) return
        pendingContentRef.current = null
        setSaveState(SAVE_STATES.SAVING)
        mutateAsync(pending)
      }, debounceMs)
    },
    [debounceMs, mutateAsync],
  )

  useEffect(
    () => () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    },
    [],
  )

  return { queueSave, flush, saveState }
}
