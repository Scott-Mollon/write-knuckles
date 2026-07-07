import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { writeDb } from '../clients/supabase'
import { useAuth } from '../contexts/AuthContext'

export const useTales = () => {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['tales', user?.id],
    queryFn: async () => {
      const { data, error } = await writeDb
        .from('tales')
        .select('*, scenes(word_count)')
        .eq('user_id', user.id)
        .is('archived_at', null)
        .order('updated_at', { ascending: false })

      if (error) throw error

      return data.map((tale) => ({
        ...tale,
        word_count: tale.scenes?.reduce((sum, s) => sum + (s.word_count || 0), 0) || 0,
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
  const { user } = useAuth()

  return useMutation({
    mutationFn: async ({ title, genre, targetWordCount, beatTemplateId, beatStructure }) => {
      const { data: tale, error: taleError } = await writeDb
        .from('tales')
        .insert({
          user_id: user.id,
          title,
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
    mutationFn: async ({ title, subtitle, genre, targetWordCount }) => {
      const { data, error } = await writeDb
        .from('tales')
        .update({
          title: title.trim(),
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
