const UUID_FILENAME =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}(\.[a-z0-9]+)?$/i

function basenameFromPath(path: string): string {
  const parts = path.split('/').filter(Boolean)
  return parts[parts.length - 1] || ''
}

function labelFromImageUrl(url: string): string {
  try {
    const base = basenameFromPath(new URL(url).pathname)
    return base ? decodeURIComponent(base) : ''
  } catch {
    return ''
  }
}

function displayNameFromStorageFilename(name: string): string {
  if (!name) return ''
  if (UUID_FILENAME.test(name)) {
    const dot = name.lastIndexOf('.')
    const ext = dot >= 0 ? name.slice(dot) : ''
    return `uploaded-image${ext}`
  }
  return name
}

/** Resolve a human-readable label for a scene image node. */
export function imageDisplayLabel(attrs: Record<string, unknown> | undefined): string {
  if (!attrs) return 'Image'

  const alt = typeof attrs.alt === 'string' ? attrs.alt.trim() : ''
  if (alt) return alt

  const storagePath = typeof attrs.storagePath === 'string' ? attrs.storagePath : ''
  if (storagePath) {
    const fromStorage = displayNameFromStorageFilename(basenameFromPath(storagePath))
    if (fromStorage) return fromStorage
  }

  const src = typeof attrs.src === 'string' ? attrs.src : ''
  if (src) {
    const fromUrl = labelFromImageUrl(src)
    if (fromUrl) return fromUrl
  }

  return 'Image'
}
