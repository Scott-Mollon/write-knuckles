import { useQuery } from '@tanstack/react-query'
import { writeDb } from '../clients/supabase'
import { useAuth } from '../contexts/AuthContext'
import { SCENE_STRUCTURE_COLUMNS } from '../lib/scenes/structureColumns'

export const useTaleStructure = (taleId) => {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['tale-structure', taleId],
    queryFn: async () => {
      const [chaptersRes, scenesRes, beatsRes, linksRes] = await Promise.all([
        writeDb
          .from('chapters')
          .select('*')
          .eq('tale_id', taleId)
          .is('deleted_at', null)
          .order('sort_order'),
        writeDb
          .from('scenes')
          .select(SCENE_STRUCTURE_COLUMNS)
          .eq('tale_id', taleId)
          .is('deleted_at', null)
          .order('sort_order'),
        writeDb.from('tale_beats').select('*').eq('tale_id', taleId).maybeSingle(),
        writeDb.from('beat_links').select('*').eq('tale_id', taleId),
      ])

      if (chaptersRes.error) throw chaptersRes.error
      if (scenesRes.error) throw scenesRes.error
      if (beatsRes.error) throw beatsRes.error
      if (linksRes.error) throw linksRes.error

      const chapters = chaptersRes.data.map((chapter) => ({
        ...chapter,
        scenes: scenesRes.data.filter((s) => s.chapter_id === chapter.id),
      }))

      return {
        chapters,
        scenes: scenesRes.data,
        taleBeats: beatsRes.data,
        beatLinks: linksRes.data,
      }
    },
    enabled: !!user?.id && !!taleId,
  })
}
