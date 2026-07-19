import { useQuery } from '@tanstack/react-query'
import { writeDb } from '../clients/supabase'
import { useAuth } from '../contexts/AuthContext'

export const SCENE_CONTENT_COLUMNS = 'id, content, plain_text, updated_at'

export const sceneContentQueryKey = (sceneId) => ['scene-content', sceneId]

/**
 * Lazy-load TipTap body fields for one scene.
 * Outline metadata comes from useTaleStructure (no content/plain_text).
 */
export const useSceneContent = (sceneId) => {
  const { user } = useAuth()

  return useQuery({
    queryKey: sceneContentQueryKey(sceneId),
    queryFn: async () => {
      const { data, error } = await writeDb
        .from('scenes')
        .select(SCENE_CONTENT_COLUMNS)
        .eq('id', sceneId)
        .single()

      if (error) throw error
      return data
    },
    enabled: !!user?.id && !!sceneId,
  })
}
