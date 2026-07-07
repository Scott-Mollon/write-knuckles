import { useMutation, useQueryClient } from '@tanstack/react-query'
import { writeDb } from '../clients/supabase'

export const useApplyBeatTemplate = (taleId) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ beatTemplateId, beatStructure, clearLinks = true }) => {
      if (clearLinks) {
        const { error: linksError } = await writeDb
          .from('beat_links')
          .delete()
          .eq('tale_id', taleId)
        if (linksError) throw linksError
      }

      const { error: taleError } = await writeDb
        .from('tales')
        .update({ beat_template_id: beatTemplateId })
        .eq('id', taleId)
      if (taleError) throw taleError

      const { data, error: beatsError } = await writeDb
        .from('tale_beats')
        .upsert(
          {
            tale_id: taleId,
            beat_template_id: beatTemplateId,
            beats: beatStructure,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'tale_id' },
        )
        .select()
        .single()

      if (beatsError) throw beatsError
      return data
    },
    onSuccess: (taleBeats) => {
      queryClient.setQueryData(['tale-structure', taleId], (old) => {
        if (!old) return old
        return { ...old, taleBeats, beatLinks: [] }
      })
      queryClient.invalidateQueries({ queryKey: ['tale-structure', taleId] })
      queryClient.invalidateQueries({ queryKey: ['tale', taleId] })
      queryClient.invalidateQueries({ queryKey: ['tales'] })
    },
  })
}
