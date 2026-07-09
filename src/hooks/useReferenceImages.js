import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { writeDb } from '../clients/supabase'
import { useAuth } from '../contexts/AuthContext'
import { deleteReferenceImageFiles } from '../lib/images/referenceImages'
import { deleteTaleImage } from '../lib/images/storage'

const invalidateReference = (queryClient, taleId) => {
  queryClient.invalidateQueries({ queryKey: ['tale-reference', taleId] })
  queryClient.invalidateQueries({ queryKey: ['reference-images', taleId] })
}

export const referenceImagesQueryKey = (taleId, entityType, entityId) => [
  'reference-images',
  taleId,
  entityType,
  entityId,
]

export const useReferenceImages = (taleId, entityType, entityId) =>
  useQuery({
    queryKey: referenceImagesQueryKey(taleId, entityType, entityId),
    queryFn: async () => {
      const { data, error } = await writeDb
        .from('reference_images')
        .select('*')
        .eq('tale_id', taleId)
        .eq('entity_type', entityType)
        .eq('entity_id', entityId)
        .order('sort_order', { ascending: true })

      if (error) throw error
      return data
    },
    enabled: !!taleId && !!entityType && !!entityId,
  })

export const useAddReferenceImage = (taleId) => {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: async ({ entityType, entityId, sourceType, storagePath, externalUrl }) => {
      const { data: existing, error: countError } = await writeDb
        .from('reference_images')
        .select('id')
        .eq('tale_id', taleId)
        .eq('entity_type', entityType)
        .eq('entity_id', entityId)

      if (countError) throw countError

      const isFirst = existing.length === 0

      const row =
        sourceType === 'upload'
          ? {
              tale_id: taleId,
              user_id: user.id,
              entity_type: entityType,
              entity_id: entityId,
              source_type: 'upload',
              storage_path: storagePath,
              external_url: null,
              is_hero: isFirst,
              sort_order: existing.length,
            }
          : {
              tale_id: taleId,
              user_id: user.id,
              entity_type: entityType,
              entity_id: entityId,
              source_type: 'url',
              storage_path: null,
              external_url: externalUrl,
              is_hero: isFirst,
              sort_order: existing.length,
            }

      const { data, error } = await writeDb
        .from('reference_images')
        .insert(row)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: (_data, variables) => {
      invalidateReference(queryClient, taleId)
      queryClient.invalidateQueries({
        queryKey: referenceImagesQueryKey(taleId, variables.entityType, variables.entityId),
      })
    },
  })
}

export const useDeleteReferenceImage = (taleId) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ image }) => {
      if (image.source_type === 'upload' && image.storage_path) {
        try {
          await deleteTaleImage(image.storage_path)
        } catch {
          // DB row delete proceeds
        }
      }

      const { error } = await writeDb.from('reference_images').delete().eq('id', image.id)
      if (error) throw error

      if (image.is_hero) {
        const { data: nextHero, error: nextError } = await writeDb
          .from('reference_images')
          .select('id')
          .eq('tale_id', taleId)
          .eq('entity_type', image.entity_type)
          .eq('entity_id', image.entity_id)
          .order('sort_order', { ascending: true })
          .limit(1)
          .maybeSingle()

        if (nextError) throw nextError

        if (nextHero) {
          const { error: heroError } = await writeDb
            .from('reference_images')
            .update({ is_hero: true })
            .eq('id', nextHero.id)
          if (heroError) throw heroError
        }
      }
    },
    onSuccess: (_data, variables) => {
      invalidateReference(queryClient, taleId)
      queryClient.invalidateQueries({
        queryKey: referenceImagesQueryKey(
          taleId,
          variables.image.entity_type,
          variables.image.entity_id
        ),
      })
    },
  })
}

export const useSetReferenceHero = (taleId) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ image }) => {
      const { error: clearError } = await writeDb
        .from('reference_images')
        .update({ is_hero: false })
        .eq('entity_type', image.entity_type)
        .eq('entity_id', image.entity_id)

      if (clearError) throw clearError

      const { error: setError } = await writeDb
        .from('reference_images')
        .update({ is_hero: true })
        .eq('id', image.id)

      if (setError) throw setError
    },
    onSuccess: (_data, variables) => {
      invalidateReference(queryClient, taleId)
      queryClient.invalidateQueries({
        queryKey: referenceImagesQueryKey(
          taleId,
          variables.image.entity_type,
          variables.image.entity_id
        ),
      })
    },
  })
}

export const useReorderReferenceImage = (taleId) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ image, direction, images }) => {
      const index = images.findIndex((row) => row.id === image.id)
      if (index < 0) return

      const swapIndex = direction === 'up' ? index - 1 : index + 1
      if (swapIndex < 0 || swapIndex >= images.length) return

      const other = images[swapIndex]
      const { error: firstError } = await writeDb
        .from('reference_images')
        .update({ sort_order: other.sort_order })
        .eq('id', image.id)
      if (firstError) throw firstError

      const { error: secondError } = await writeDb
        .from('reference_images')
        .update({ sort_order: image.sort_order })
        .eq('id', other.id)
      if (secondError) throw secondError
    },
    onSuccess: (_data, variables) => {
      invalidateReference(queryClient, taleId)
      queryClient.invalidateQueries({
        queryKey: referenceImagesQueryKey(
          taleId,
          variables.image.entity_type,
          variables.image.entity_id
        ),
      })
    },
  })
}

export async function deleteEntityReferenceImages(taleId, entityType, entityId) {
  const { data, error } = await writeDb
    .from('reference_images')
    .select('*')
    .eq('tale_id', taleId)
    .eq('entity_type', entityType)
    .eq('entity_id', entityId)

  if (error) throw error
  await deleteReferenceImageFiles(data)

  const { error: deleteError } = await writeDb
    .from('reference_images')
    .delete()
    .eq('tale_id', taleId)
    .eq('entity_type', entityType)
    .eq('entity_id', entityId)

  if (deleteError) throw deleteError
}
