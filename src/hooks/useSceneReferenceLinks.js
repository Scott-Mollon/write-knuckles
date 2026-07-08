import { useMutation, useQueryClient } from '@tanstack/react-query'
import { writeDb } from '../clients/supabase'

const invalidateReference = (queryClient, taleId) => {
  queryClient.invalidateQueries({ queryKey: ['tale-reference', taleId] })
}

export const useCreateCharacterLink = (taleId) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ sceneId, characterId }) => {
      const { data, error } = await writeDb
        .from('scene_character_links')
        .insert({ tale_id: taleId, scene_id: sceneId, character_id: characterId })
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => invalidateReference(queryClient, taleId),
  })
}

export const useDeleteCharacterLink = (taleId) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (linkId) => {
      const { error } = await writeDb.from('scene_character_links').delete().eq('id', linkId)
      if (error) throw error
    },
    onSuccess: () => invalidateReference(queryClient, taleId),
  })
}

export const useCreateLocationLink = (taleId) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ sceneId, locationId }) => {
      const { data, error } = await writeDb
        .from('scene_location_links')
        .insert({ tale_id: taleId, scene_id: sceneId, location_id: locationId })
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => invalidateReference(queryClient, taleId),
  })
}

export const useDeleteLocationLink = (taleId) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (linkId) => {
      const { error } = await writeDb.from('scene_location_links').delete().eq('id', linkId)
      if (error) throw error
    },
    onSuccess: () => invalidateReference(queryClient, taleId),
  })
}
