import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { writeDb } from '../clients/supabase'
import { useAuth } from '../contexts/AuthContext'

export const ABUSE_GUARDS_QUERY_KEY = ['abuse-guards']

const ABUSE_GUARD_COLUMNS = [
  'id',
  'max_scenes_per_tale',
  'max_scene_bytes',
  'max_user_content_bytes',
  'scene_inserts_per_minute',
  'scene_updates_per_minute',
  'chapter_inserts_per_minute',
  'updated_at',
].join(', ')

export const useAbuseGuards = () => {
  const { user } = useAuth()

  return useQuery({
    queryKey: ABUSE_GUARDS_QUERY_KEY,
    queryFn: async () => {
      const { data, error } = await writeDb
        .from('abuse_guards')
        .select(ABUSE_GUARD_COLUMNS)
        .eq('id', 1)
        .single()

      if (error) throw error
      return data
    },
    enabled: !!user,
    staleTime: 60_000,
  })
}

/**
 * @typedef {{
 *   max_scenes_per_tale: number,
 *   max_scene_bytes: number,
 *   max_user_content_bytes: number,
 *   scene_inserts_per_minute: number,
 *   scene_updates_per_minute: number,
 *   chapter_inserts_per_minute: number,
 * }} AbuseGuardsPatch
 */

export const useUpdateAbuseGuards = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (patch) => {
      const { data, error } = await writeDb
        .from('abuse_guards')
        .update(patch)
        .eq('id', 1)
        .select(ABUSE_GUARD_COLUMNS)
        .single()

      if (error) throw error
      return data
    },
    onSuccess: (data) => {
      queryClient.setQueryData(ABUSE_GUARDS_QUERY_KEY, data)
    },
  })
}
