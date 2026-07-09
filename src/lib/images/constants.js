export const TALE_IMAGES_BUCKET = 'write-tale-images'

export const MAX_IMAGE_BYTES = 10 * 1024 * 1024

export const ALLOWED_IMAGE_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
]

export const ALLOWED_IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.gif']

/** Signed URL TTL in seconds (~1 hour). */
export const SIGNED_URL_TTL_SECONDS = 3600

/** React Query stale time — refresh before signed URL expires. */
export const SIGNED_URL_STALE_MS = 50 * 60 * 1000

export const IMAGE_PROBE_TIMEOUT_MS = 8000

export const MAX_IMAGE_URL_LENGTH = 2048

export const IMAGE_SCOPES = ['scenes', 'characters', 'locations', 'research', 'tales']

export const REFERENCE_SCOPES = ['characters', 'locations', 'research']

const MIME_TO_EXT = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/gif': '.gif',
}

export function extensionForMime(mimeType) {
  return MIME_TO_EXT[mimeType] || '.jpg'
}
