import { writeDb } from '../../clients/supabase'

export const TALE_SCENE_BODY_COLUMNS = 'id, content, plain_text, updated_at'

export const taleSceneBodiesQueryKey = (taleId) => ['tale-scene-bodies', taleId]

/**
 * Load TipTap bodies for a tale (active scenes only).
 * Optional `sceneIds` limits the fetch (compile scope).
 */
export async function fetchTaleSceneBodies(taleId, { sceneIds } = {}) {
  if (!taleId) return []

  let query = writeDb
    .from('scenes')
    .select(TALE_SCENE_BODY_COLUMNS)
    .eq('tale_id', taleId)
    .is('deleted_at', null)

  if (sceneIds?.length) {
    query = query.in('id', sceneIds)
  }

  const { data, error } = await query
  if (error) throw error
  return data || []
}

export function mergeSceneBodies(scenes, bodies) {
  if (!scenes?.length) return scenes || []
  if (!bodies?.length) return scenes.map((s) => ({ ...s }))

  const byId = new Map(bodies.map((body) => [body.id, body]))
  return scenes.map((scene) => {
    const body = byId.get(scene.id)
    if (!body) return scene
    return {
      ...scene,
      content: body.content,
      plain_text: body.plain_text,
      updated_at: body.updated_at ?? scene.updated_at,
    }
  })
}

export function mergeSceneBodiesIntoChapters(chapters, bodies) {
  if (!chapters?.length) return chapters || []
  const byId = new Map((bodies || []).map((body) => [body.id, body]))

  return chapters.map((chapter) => ({
    ...chapter,
    scenes: (chapter.scenes || []).map((scene) => {
      const body = byId.get(scene.id)
      if (!body) return scene
      return {
        ...scene,
        content: body.content,
        plain_text: body.plain_text,
        updated_at: body.updated_at ?? scene.updated_at,
      }
    }),
  }))
}
