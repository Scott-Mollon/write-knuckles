import { useQuery } from '@tanstack/react-query'
import { writeDb } from '../clients/supabase'
import { useAuth } from '../contexts/AuthContext'

export const useTaleReference = (taleId) => {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['tale-reference', taleId],
    queryFn: async () => {
      const [charactersRes, locationsRes, researchRes, charLinksRes, locLinksRes, imagesRes] =
        await Promise.all([
        writeDb
          .from('characters')
          .select('*')
          .eq('tale_id', taleId)
          .is('deleted_at', null)
          .order('sort_order'),
        writeDb
          .from('locations')
          .select('*')
          .eq('tale_id', taleId)
          .is('deleted_at', null)
          .order('sort_order'),
        writeDb
          .from('research_items')
          .select('*')
          .eq('tale_id', taleId)
          .is('deleted_at', null)
          .order('sort_order'),
        writeDb.from('scene_character_links').select('*').eq('tale_id', taleId),
        writeDb.from('scene_location_links').select('*').eq('tale_id', taleId),
        writeDb.from('reference_images').select('*').eq('tale_id', taleId).order('sort_order'),
      ])

      if (charactersRes.error) throw charactersRes.error
      if (locationsRes.error) throw locationsRes.error
      if (researchRes.error) throw researchRes.error
      if (charLinksRes.error) throw charLinksRes.error
      if (locLinksRes.error) throw locLinksRes.error
      if (imagesRes.error) throw imagesRes.error

      return {
        characters: charactersRes.data,
        locations: locationsRes.data,
        researchItems: researchRes.data,
        characterLinks: charLinksRes.data,
        locationLinks: locLinksRes.data,
        referenceImages: imagesRes.data,
      }
    },
    enabled: !!user?.id && !!taleId,
  })
}
