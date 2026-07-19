import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '../contexts/AuthContext'
import { sceneContentQueryKey } from './useSceneContent'
import {
  fetchTaleSceneBodies,
  taleSceneBodiesQueryKey,
} from '../lib/scenes/fetchTaleSceneBodies'

/**
 * On-demand fetch of all active scene bodies for search / bulk ops.
 * Also seeds per-scene content cache entries for Write mode.
 */
export const useTaleSceneBodies = (taleId, { enabled = true } = {}) => {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  return useQuery({
    queryKey: taleSceneBodiesQueryKey(taleId),
    queryFn: async () => {
      const bodies = await fetchTaleSceneBodies(taleId)
      for (const body of bodies) {
        queryClient.setQueryData(sceneContentQueryKey(body.id), body)
      }
      return bodies
    },
    enabled: !!user?.id && !!taleId && enabled,
  })
}
