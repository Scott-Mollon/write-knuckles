/** Cover/image fields stored on tales, reference rows, or TipTap attrs. */
export function getImageSourceFields(record) {
  if (!record) {
    return { sourceType: null, storagePath: null, externalUrl: null }
  }

  return {
    sourceType: record.cover_source_type ?? record.source_type ?? record.sourceType ?? null,
    storagePath: record.cover_storage_path ?? record.storage_path ?? record.storagePath ?? null,
    externalUrl: record.cover_external_url ?? record.external_url ?? record.externalUrl ?? null,
  }
}

export function hasImageSource({ sourceType, storagePath, externalUrl }) {
  if (sourceType === 'upload') return !!storagePath
  if (sourceType === 'url') return !!externalUrl
  return false
}

export function taleHasCover(tale) {
  return hasImageSource(getImageSourceFields(tale))
}
