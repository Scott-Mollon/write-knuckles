import { useMutation, useQueryClient } from '@tanstack/react-query'
import { writeDb } from '../clients/supabase'
import { contentToPlainText, countWords, normalizeContentForSave } from '../lib/editor/plainText'
import { sceneContentQueryKey } from './useSceneContent'
import { taleSceneBodiesQueryKey } from '../lib/scenes/fetchTaleSceneBodies'

/**
 * Persist TipTap content replacements for one or more scenes in a tale.
 * Input: [{ sceneId, content }, ...]
 */
export const useReplaceInScenes = (taleId) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (updates) => {
      if (!Array.isArray(updates) || updates.length === 0) return []

      const results = await Promise.all(
        updates.map(async ({ sceneId, content }) => {
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
            .eq('id', sceneId)

          if (error) throw error
          return { sceneId, content: normalizedContent, plain_text, word_count, updated_at }
        }),
      )

      return results
    },
    onSuccess: (results) => {
      const byId = new Map(results.map((r) => [r.sceneId, r]))

      queryClient.setQueryData(['tale-structure', taleId], (old) => {
        if (!old) return old
        const patchMeta = (s) => {
          const next = byId.get(s.id)
          if (!next) return s
          return {
            ...s,
            word_count: next.word_count,
            updated_at: next.updated_at,
          }
        }
        return {
          ...old,
          scenes: old.scenes.map(patchMeta),
          chapters: old.chapters.map((ch) => ({
            ...ch,
            scenes: ch.scenes.map(patchMeta),
          })),
        }
      })

      queryClient.setQueryData(taleSceneBodiesQueryKey(taleId), (old) => {
        if (!Array.isArray(old)) return old
        return old.map((body) => {
          const next = byId.get(body.id)
          if (!next) return body
          return {
            ...body,
            content: next.content,
            plain_text: next.plain_text,
            updated_at: next.updated_at,
          }
        })
      })

      for (const result of results) {
        queryClient.setQueryData(sceneContentQueryKey(result.sceneId), {
          id: result.sceneId,
          content: result.content,
          plain_text: result.plain_text,
          updated_at: result.updated_at,
        })
      }

      queryClient.invalidateQueries({ queryKey: ['tales'] })
      queryClient.removeQueries({ queryKey: ['scene-search', taleId] })
    },
  })
}
