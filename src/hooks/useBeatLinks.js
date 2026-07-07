import { useMutation, useQueryClient } from '@tanstack/react-query'
import { writeDb } from '../clients/supabase'

const invalidateStructure = (queryClient, taleId) => {
  queryClient.invalidateQueries({ queryKey: ['tale-structure', taleId] })
}

/** Assign a scene to exactly one beat — removes any prior beat link for that scene. */
export const useCreateBeatLink = (taleId) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ beatKey, sceneId }) => {
      const { error: deleteError } = await writeDb
        .from('beat_links')
        .delete()
        .eq('tale_id', taleId)
        .eq('scene_id', sceneId)

      if (deleteError) throw deleteError

      const { data, error } = await writeDb
        .from('beat_links')
        .insert({ tale_id: taleId, beat_key: beatKey, scene_id: sceneId })
        .select()
        .single()

      if (error) throw error
      return data
    },
    onMutate: async ({ beatKey, sceneId }) => {
      await queryClient.cancelQueries({ queryKey: ['tale-structure', taleId] })
      const previous = queryClient.getQueryData(['tale-structure', taleId])

      queryClient.setQueryData(['tale-structure', taleId], (old) => {
        if (!old) return old
        const withoutScene = old.beatLinks.filter((l) => l.scene_id !== sceneId)
        const optimistic = {
          id: `temp-${beatKey}-${sceneId}`,
          tale_id: taleId,
          beat_key: beatKey,
          scene_id: sceneId,
          notes: null,
        }
        return { ...old, beatLinks: [...withoutScene, optimistic] }
      })

      return { previous }
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['tale-structure', taleId], context.previous)
      }
    },
    onSettled: () => invalidateStructure(queryClient, taleId),
  })
}

export const useDeleteBeatLink = (taleId) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (linkId) => {
      const { error } = await writeDb.from('beat_links').delete().eq('id', linkId)
      if (error) throw error
    },
    onMutate: async (linkId) => {
      await queryClient.cancelQueries({ queryKey: ['tale-structure', taleId] })
      const previous = queryClient.getQueryData(['tale-structure', taleId])

      queryClient.setQueryData(['tale-structure', taleId], (old) => {
        if (!old) return old
        return { ...old, beatLinks: old.beatLinks.filter((l) => l.id !== linkId) }
      })

      return { previous }
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['tale-structure', taleId], context.previous)
      }
    },
    onSettled: () => invalidateStructure(queryClient, taleId),
  })
}
