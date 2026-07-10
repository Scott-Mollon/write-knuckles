const UUID_FILENAME =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}(\.[a-z0-9]+)?$/i

export function basenameFromPath(path) {
  const parts = path.split('/').filter(Boolean)
  return parts[parts.length - 1] || ''
}

export function labelFromImageUrl(url) {
  try {
    const base = basenameFromPath(new URL(url).pathname)
    return base ? decodeURIComponent(base) : ''
  } catch {
    return ''
  }
}

function displayNameFromStorageFilename(name) {
  if (!name) return ''
  if (UUID_FILENAME.test(name)) {
    const dot = name.lastIndexOf('.')
    const ext = dot >= 0 ? name.slice(dot) : ''
    return `uploaded-image${ext}`
  }
  return name
}

/** Human-readable label for export and plain-text rendering. */
export function getSceneImageDisplayLabel(attrs = {}) {
  const alt = typeof attrs.alt === 'string' ? attrs.alt.trim() : ''
  if (alt) return alt

  if (attrs.storagePath) {
    const fromStorage = displayNameFromStorageFilename(basenameFromPath(attrs.storagePath))
    if (fromStorage) return fromStorage
  }

  if (attrs.src) {
    const fromUrl = labelFromImageUrl(attrs.src)
    if (fromUrl) return fromUrl
  }

  return 'Image'
}

export function defaultAltFromFile(file) {
  return file?.name?.trim() || ''
}

export function defaultAltFromUrl(url) {
  return labelFromImageUrl(url) || ''
}

export function defaultAltFromUploadResult(result) {
  if (result?.originalFileName?.trim()) return result.originalFileName.trim()
  if (result?.externalUrl) return defaultAltFromUrl(result.externalUrl)
  if (result?.sourceType === 'url' && result?.signedUrl) return defaultAltFromUrl(result.signedUrl)
  return ''
}
