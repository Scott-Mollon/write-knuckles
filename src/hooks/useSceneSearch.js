import { useQuery } from '@tanstack/react-query'
import { writeDb } from '../clients/supabase'
import { useAuth } from '../contexts/AuthContext'

export const useSceneSearch = (taleId, query) => {
  const { user } = useAuth()
  const trimmed = query?.trim() || ''

  return useQuery({
    queryKey: ['scene-search', taleId, trimmed],
    queryFn: async () => {
      const { data, error } = await writeDb.rpc('search_scenes', {
        p_tale_id: taleId,
        p_query: trimmed,
      })
      if (error) throw error
      return data || []
    },
    enabled: !!user?.id && !!taleId && trimmed.length >= 2,
  })
}
