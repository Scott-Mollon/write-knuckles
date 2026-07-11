export function sceneImageKey(attrs: Record<string, unknown> | undefined): string | null {
  if (!attrs) return null

  const storagePath = attrs.storagePath
  if (typeof storagePath === 'string' && storagePath.trim()) {
    return `storage:${storagePath}`
  }

  const src = attrs.src
  if (typeof src === 'string' && src.trim()) {
    return `url:${src}`
  }

  return null
}
