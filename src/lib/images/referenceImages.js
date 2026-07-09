import { deleteTaleImage } from './storage'

export function buildReferenceImageMeta(referenceImages = []) {
  const heroes = {}
  const counts = {}

  for (const image of referenceImages) {
    const { entity_type: entityType, entity_id: entityId } = image
    if (!counts[entityType]) counts[entityType] = {}
    if (!heroes[entityType]) heroes[entityType] = {}
    counts[entityType][entityId] = (counts[entityType][entityId] || 0) + 1
    if (image.is_hero) {
      heroes[entityType][entityId] = image
    }
  }

  return { heroes, counts }
}

export function getEntityHero(heroes, entityType, entityId) {
  return heroes?.[entityType]?.[entityId] ?? null
}

export function getEntityImageCount(counts, entityType, entityId) {
  return counts?.[entityType]?.[entityId] ?? 0
}

export async function deleteReferenceImageFiles(images = []) {
  await Promise.all(
    images
      .filter((image) => image.source_type === 'upload' && image.storage_path)
      .map((image) => deleteTaleImage(image.storage_path).catch(() => {}))
  )
}
