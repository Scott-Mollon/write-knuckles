import { useQuery } from '@tanstack/react-query'
import { writeDb } from '../clients/supabase'
import { useAuth } from '../contexts/AuthContext'

const byDeletedAtDesc = (a, b) => {
  const aTime = a.deleted_at ? new Date(a.deleted_at).getTime() : 0
  const bTime = b.deleted_at ? new Date(b.deleted_at).getTime() : 0
  return bTime - aTime
}

export const useTaleTrash = (taleId) => {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['tale-trash', taleId],
    queryFn: async () => {
      const [chaptersRes, scenesRes, charactersRes, locationsRes, researchRes] =
        await Promise.all([
          writeDb
            .from('chapters')
            .select('*')
            .eq('tale_id', taleId)
            .not('deleted_at', 'is', null)
            .order('deleted_at', { ascending: false }),
          writeDb
            .from('scenes')
            .select('*')
            .eq('tale_id', taleId)
            .not('deleted_at', 'is', null)
            .order('deleted_at', { ascending: false }),
          writeDb
            .from('characters')
            .select('*')
            .eq('tale_id', taleId)
            .not('deleted_at', 'is', null)
            .order('deleted_at', { ascending: false }),
          writeDb
            .from('locations')
            .select('*')
            .eq('tale_id', taleId)
            .not('deleted_at', 'is', null)
            .order('deleted_at', { ascending: false }),
          writeDb
            .from('research_items')
            .select('*')
            .eq('tale_id', taleId)
            .not('deleted_at', 'is', null)
            .order('deleted_at', { ascending: false }),
        ])

      if (chaptersRes.error) throw chaptersRes.error
      if (scenesRes.error) throw scenesRes.error
      if (charactersRes.error) throw charactersRes.error
      if (locationsRes.error) throw locationsRes.error
      if (researchRes.error) throw researchRes.error

      return {
        chapters: [...chaptersRes.data].sort(byDeletedAtDesc),
        scenes: [...scenesRes.data].sort(byDeletedAtDesc),
        characters: [...charactersRes.data].sort(byDeletedAtDesc),
        locations: [...locationsRes.data].sort(byDeletedAtDesc),
        researchItems: [...researchRes.data].sort(byDeletedAtDesc),
      }
    },
    enabled: !!user?.id && !!taleId,
  })
}
