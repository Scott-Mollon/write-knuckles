import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { writeDb } from '../clients/supabase'
import { canCreateTale, freeTaleLimitMessage, maxActiveTalesForPlan } from '../constants/account'
import { useAuth } from '../contexts/AuthContext'
import { PLAN_LIMITS_QUERY_KEY } from './usePlanLimits'
import { deleteTaleImage } from '../lib/images/storage'
import { serializeCompilePreferencesForDb } from '../lib/compile/compilePreferences.js'
import { TALE_TYPES } from '../constants/taleTypes'
import { getTaleTerminology, isComicTale } from '../lib/taleTerminology'

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
    mutationFn: async ({
      title,
      author,
      genre,
      targetWordCount,
      beatTemplateId,
      beatStructure,
      taleType = TALE_TYPES.PROSE,
    }) => {
      const { count, error: countError } = await writeDb
        .from('tales')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .is('archived_at', null)

      if (countError) throw countError

      let limits = queryClient.getQueryData(PLAN_LIMITS_QUERY_KEY)
      if (!limits) {
        const { data, error: limitsError } = await writeDb
          .from('plan_limits')
          .select('plan, max_active_tales, updated_at')
          .order('plan')
        if (limitsError) throw limitsError
        limits = data ?? []
        queryClient.setQueryData(PLAN_LIMITS_QUERY_KEY, limits)
      }

      const maxActiveTales = maxActiveTalesForPlan(limits, plan)
      if (!canCreateTale({ plan, taleCount: count ?? 0, maxActiveTales })) {
        throw new Error(freeTaleLimitMessage(maxActiveTales))
      }

      const comic = isComicTale(taleType)
      const terms = getTaleTerminology(taleType)

      const taleInsert = {
        user_id: user.id,
        title,
        author: author?.trim() || null,
        genre,
        tale_type: comic ? TALE_TYPES.COMIC : TALE_TYPES.PROSE,
        beat_template_id: comic ? null : beatTemplateId,
      }

      if (!comic && targetWordCount != null) {
        taleInsert.target_word_count = targetWordCount
      }

      const { data: tale, error: taleError } = await writeDb
        .from('tales')
        .insert(taleInsert)
        .select()
        .single()

      if (taleError) throw taleError

      if (!comic) {
        const { error: beatsError } = await writeDb.from('tale_beats').insert({
          tale_id: tale.id,
          beat_template_id: beatTemplateId,
          beats: beatStructure,
        })

        if (beatsError) throw beatsError
      }

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
        title: terms.defaultSceneTitle,
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
      const patch = {
        title: title.trim(),
        author: author?.trim() || null,
        subtitle: subtitle?.trim() || null,
        genre: genre?.trim() || null,
        updated_at: new Date().toISOString(),
      }
      if (targetWordCount != null) {
        patch.target_word_count = Number(targetWordCount)
      }

      const { data, error } = await writeDb
        .from('tales')
        .update(patch)
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

export const useUpdateTaleScriptStylePreferences = (taleId) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (script_style_preferences) => {
      const { data, error } = await writeDb
        .from('tales')
        .update({
          script_style_preferences,
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
