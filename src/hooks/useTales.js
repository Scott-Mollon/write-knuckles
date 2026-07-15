import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { writeDb } from '../clients/supabase'
import { canCreateTale, FREE_TALE_LIMIT_MESSAGE } from '../constants/account'
import { useAuth } from '../contexts/AuthContext'
import { deleteTaleImage } from '../lib/images/storage'
import { serializeCompilePreferencesForDb } from '../lib/compile/compilePreferences.js'

export const useTales = () => {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['tales', user?.id],
    queryFn: async () => {
      const { data, error } = await writeDb
        .from('tales')
        .select('*, scenes(word_count, deleted_at)')
        .eq('user_id', user.id)
        .is('archived_at', null)
        .order('updated_at', { ascending: false })

      if (error) throw error

      return data.map((tale) => ({
        ...tale,
        word_count:
          tale.scenes?.reduce(
            (sum, s) => (s.deleted_at ? sum : sum + (s.word_count || 0)),
            0,
          ) || 0,
      }))
    },
    enabled: !!user?.id,
  })
}

export const useTale = (taleId) => {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['tale', taleId],
    queryFn: async () => {
      const { data, error } = await writeDb
        .from('tales')
        .select('*')
        .eq('id', taleId)
        .eq('user_id', user.id)
        .single()

      if (error) throw error
      return data
    },
    enabled: !!user?.id && !!taleId,
  })
}

export const useBeatTemplates = () => {
  return useQuery({
    queryKey: ['beat-templates'],
    queryFn: async () => {
      const { data, error } = await writeDb
        .from('beat_templates')
        .select('*')
        .is('user_id', null)
        .order('name')

      if (error) throw error
      return data
    },
  })
}

export const useCreateTale = () => {
  const queryClient = useQueryClient()
  const { user, plan } = useAuth()

  return useMutation({
    mutationFn: async ({ title, author, genre, targetWordCount, beatTemplateId, beatStructure }) => {
      const { count, error: countError } = await writeDb
        .from('tales')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .is('archived_at', null)

      if (countError) throw countError

      if (!canCreateTale({ plan, taleCount: count ?? 0 })) {
        throw new Error(FREE_TALE_LIMIT_MESSAGE)
      }

      const { data: tale, error: taleError } = await writeDb
        .from('tales')
        .insert({
          user_id: user.id,
          title,
          author: author?.trim() || null,
          genre,
          target_word_count: targetWordCount,
          beat_template_id: beatTemplateId,
        })
        .select()
        .single()

      if (taleError) throw taleError

      const { error: beatsError } = await writeDb.from('tale_beats').insert({
        tale_id: tale.id,
        beat_template_id: beatTemplateId,
        beats: beatStructure,
      })

      if (beatsError) throw beatsError

      const { data: chapter, error: chapterError } = await writeDb
        .from('chapters')
        .insert({
          tale_id: tale.id,
          user_id: user.id,
          title: '',
          sort_order: 0,
        })
        .select()
        .single()

      if (chapterError) throw chapterError

      const { error: sceneError } = await writeDb.from('scenes').insert({
        chapter_id: chapter.id,
        tale_id: tale.id,
        user_id: user.id,
        title: 'Scene 1',
        sort_order: 0,
        scene_status: 'Raw',
      })

      if (sceneError) throw sceneError

      return tale
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tales'] })
    },
  })
}

export const useDeleteTale = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (taleId) => {
      const { data: tale } = await writeDb
        .from('tales')
        .select('cover_source_type, cover_storage_path')
        .eq('id', taleId)
        .maybeSingle()

      if (tale?.cover_source_type === 'upload' && tale.cover_storage_path) {
        try {
          await deleteTaleImage(tale.cover_storage_path)
        } catch {
          // Tale row delete proceeds even if storage cleanup fails
        }
      }

      const { error } = await writeDb.from('tales').delete().eq('id', taleId)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tales'] })
    },
  })
}

export const useUpdateTale = (taleId) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ title, author, subtitle, genre, targetWordCount }) => {
      const { data, error } = await writeDb
        .from('tales')
        .update({
          title: title.trim(),
          author: author?.trim() || null,
          subtitle: subtitle?.trim() || null,
          genre: genre?.trim() || null,
          target_word_count: Number(targetWordCount),
          updated_at: new Date().toISOString(),
        })
        .eq('id', taleId)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['tale', taleId], data)
      queryClient.invalidateQueries({ queryKey: ['tales'] })
    },
  })
}

async function removePreviousCoverUpload(previousTale, nextStoragePath = null) {
  if (previousTale?.cover_source_type !== 'upload' || !previousTale.cover_storage_path) {
    return
  }
  if (nextStoragePath && previousTale.cover_storage_path === nextStoragePath) {
    return
  }
  try {
    await deleteTaleImage(previousTale.cover_storage_path)
  } catch {
    // Continue — DB update is source of truth
  }
}

export const useUpdateTaleCompilePreferences = (taleId) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ options, pageLayout }) => {
      const compile_preferences = serializeCompilePreferencesForDb({ options, pageLayout })

      const { data, error } = await writeDb
        .from('tales')
        .update({
          compile_preferences,
          updated_at: new Date().toISOString(),
        })
        .eq('id', taleId)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['tale', taleId], data)
      queryClient.invalidateQueries({ queryKey: ['tales'] })
    },
  })
}

export const useUpdateTaleCover = (taleId) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload) => {
      const { action, previousTale } = payload

      if (action === 'clear') {
        await removePreviousCoverUpload(previousTale)
        const { data, error } = await writeDb
          .from('tales')
          .update({
            cover_source_type: null,
            cover_storage_path: null,
            cover_external_url: null,
            updated_at: new Date().toISOString(),
          })
          .eq('id', taleId)
          .select()
          .single()
        if (error) throw error
        return data
      }

      const { sourceType, storagePath } = payload
      if (sourceType === 'url') {
        throw new Error('Cover images must be uploaded. URL covers are not supported.')
      }
      if (sourceType !== 'upload' || !storagePath) {
        throw new Error('Cover image upload is required.')
      }

      await removePreviousCoverUpload(previousTale, storagePath)

      const coverFields = {
        cover_source_type: 'upload',
        cover_storage_path: storagePath,
        cover_external_url: null,
      }

      const { data, error } = await writeDb
        .from('tales')
        .update({
          ...coverFields,
          updated_at: new Date().toISOString(),
        })
        .eq('id', taleId)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['tale', taleId], data)
      queryClient.invalidateQueries({ queryKey: ['tales'] })
    },
  })
}
