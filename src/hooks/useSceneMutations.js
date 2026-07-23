import { useMutation, useQueryClient } from '@tanstack/react-query'
import { writeDb } from '../clients/supabase'
import { useAuth } from '../contexts/AuthContext'
import { mapAbuseError } from '../lib/abuseErrors'

const invalidateStructure = (queryClient, taleId) => {
  queryClient.invalidateQueries({ queryKey: ['tale-structure', taleId] })
  queryClient.invalidateQueries({ queryKey: ['tale-trash', taleId] })
  queryClient.invalidateQueries({ queryKey: ['tales'] })
}

export const useUpdateSceneMeta = (taleId) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ sceneId, ...fields }) => {
      const { error } = await writeDb
        .from('scenes')
        .update({ ...fields, updated_at: new Date().toISOString() })
        .eq('id', sceneId)

      if (error) throw error
      return { sceneId, ...fields }
    },
    onSuccess: ({ sceneId, ...fields }) => {
      queryClient.setQueryData(['tale-structure', taleId], (old) => {
        if (!old) return old
        const patch = (s) => (s.id === sceneId ? { ...s, ...fields } : s)
        return {
          ...old,
          scenes: old.scenes.map(patch),
          chapters: old.chapters.map((ch) => ({
            ...ch,
            scenes: ch.scenes.map(patch),
          })),
        }
      })
      queryClient.invalidateQueries({ queryKey: ['tales'] })
    },
  })
}

export const useUpdateChapterMeta = (taleId) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ chapterId, ...fields }) => {
      const { error } = await writeDb
        .from('chapters')
        .update({ ...fields, updated_at: new Date().toISOString() })
        .eq('id', chapterId)

      if (error) throw error
      return { chapterId, ...fields }
    },
    onSuccess: ({ chapterId, ...fields }) => {
      queryClient.setQueryData(['tale-structure', taleId], (old) => {
        if (!old) return old
        const patch = (ch) => (ch.id === chapterId ? { ...ch, ...fields } : ch)
        return { ...old, chapters: old.chapters.map(patch) }
      })
      queryClient.invalidateQueries({ queryKey: ['tales'] })
    },
  })
}

export const useCreateChapter = (taleId) => {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: async ({ title, sortOrder }) => {
      const { data, error } = await writeDb
        .from('chapters')
        .insert({
          tale_id: taleId,
          user_id: user.id,
          title,
          sort_order: sortOrder,
        })
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => invalidateStructure(queryClient, taleId),
  })
}

export const useCreateScene = (taleId) => {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: async ({ chapterId, title, sortOrder }) => {
      const { data, error } = await writeDb
        .from('scenes')
        .insert({
          chapter_id: chapterId,
          tale_id: taleId,
          user_id: user.id,
          title,
          sort_order: sortOrder,
        })
        .select()
        .single()

      if (error) throw mapAbuseError(error)
      return data
    },
    onSuccess: () => invalidateStructure(queryClient, taleId),
  })
}

export const useDeleteChapter = (taleId) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (chapterId) => {
      const deletedAt = new Date().toISOString()
      const { error: chapterError } = await writeDb
        .from('chapters')
        .update({ deleted_at: deletedAt, updated_at: deletedAt })
        .eq('id', chapterId)
        .is('deleted_at', null)
      if (chapterError) throw chapterError

      const { error: scenesError } = await writeDb
        .from('scenes')
        .update({ deleted_at: deletedAt, updated_at: deletedAt })
        .eq('chapter_id', chapterId)
        .is('deleted_at', null)
      if (scenesError) throw scenesError
    },
    onSuccess: () => invalidateStructure(queryClient, taleId),
  })
}

export const useDeleteScene = (taleId) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (sceneId) => {
      const deletedAt = new Date().toISOString()
      const { error } = await writeDb
        .from('scenes')
        .update({ deleted_at: deletedAt, updated_at: deletedAt })
        .eq('id', sceneId)
        .is('deleted_at', null)
      if (error) throw error
    },
    onSuccess: () => invalidateStructure(queryClient, taleId),
  })
}

export const useRestoreChapter = (taleId) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (chapterId) => {
      const updatedAt = new Date().toISOString()
      const { error: chapterError } = await writeDb
        .from('chapters')
        .update({ deleted_at: null, updated_at: updatedAt })
        .eq('id', chapterId)
      if (chapterError) throw chapterError

      const { error: scenesError } = await writeDb
        .from('scenes')
        .update({ deleted_at: null, updated_at: updatedAt })
        .eq('chapter_id', chapterId)
        .not('deleted_at', 'is', null)
      if (scenesError) throw scenesError
    },
    onSuccess: () => invalidateStructure(queryClient, taleId),
  })
}

export const useRestoreScene = (taleId) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (sceneId) => {
      const updatedAt = new Date().toISOString()
      const { data: scene, error: sceneFetchError } = await writeDb
        .from('scenes')
        .select('id, chapter_id')
        .eq('id', sceneId)
        .single()
      if (sceneFetchError) throw sceneFetchError

      const { error: sceneError } = await writeDb
        .from('scenes')
        .update({ deleted_at: null, updated_at: updatedAt })
        .eq('id', sceneId)
      if (sceneError) throw sceneError

      const { error: chapterError } = await writeDb
        .from('chapters')
        .update({ deleted_at: null, updated_at: updatedAt })
        .eq('id', scene.chapter_id)
        .not('deleted_at', 'is', null)
      if (chapterError) throw chapterError
    },
    onSuccess: () => invalidateStructure(queryClient, taleId),
  })
}

export const usePermanentlyDeleteChapter = (taleId) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (chapterId) => {
      const { error } = await writeDb.from('chapters').delete().eq('id', chapterId)
      if (error) throw error
    },
    onSuccess: () => invalidateStructure(queryClient, taleId),
  })
}

export const usePermanentlyDeleteScene = (taleId) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (sceneId) => {
      const { error } = await writeDb.from('scenes').delete().eq('id', sceneId)
      if (error) throw error
    },
    onSuccess: () => invalidateStructure(queryClient, taleId),
  })
}

export const useReorderStructure = (taleId) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ chapters }) => {
      const chapterUpdates = chapters.map((ch, index) =>
        writeDb.from('chapters').update({ sort_order: index }).eq('id', ch.id),
      )

      const sceneUpdates = chapters.flatMap((ch) =>
        ch.scenes.map((scene, index) =>
          writeDb
            .from('scenes')
            .update({ chapter_id: ch.id, sort_order: index })
            .eq('id', scene.id),
        ),
      )

      const results = await Promise.all([...chapterUpdates, ...sceneUpdates])
      const failed = results.find((r) => r.error)
      if (failed?.error) throw failed.error
    },
    onMutate: async ({ chapters }) => {
      await queryClient.cancelQueries({ queryKey: ['tale-structure', taleId] })
      const previous = queryClient.getQueryData(['tale-structure', taleId])

      const scenes = chapters.flatMap((ch) =>
        ch.scenes.map((s) => ({ ...s, chapter_id: ch.id })),
      )

      queryClient.setQueryData(['tale-structure', taleId], (old) =>
        old ? { ...old, chapters, scenes } : old,
      )

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
