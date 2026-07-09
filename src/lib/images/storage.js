import { supabase } from '../../clients/supabase'
import {
  ALLOWED_IMAGE_MIME_TYPES,
  extensionForMime,
  MAX_IMAGE_BYTES,
  SIGNED_URL_TTL_SECONDS,
  TALE_IMAGES_BUCKET,
} from './constants'

export function validateImageFile(file) {
  if (!file) {
    return { valid: false, error: 'No file selected.' }
  }
  if (!ALLOWED_IMAGE_MIME_TYPES.includes(file.type)) {
    return { valid: false, error: 'Use a JPEG, PNG, WebP, or GIF image.' }
  }
  if (file.size > MAX_IMAGE_BYTES) {
    return { valid: false, error: 'Image must be 10 MB or smaller.' }
  }
  return { valid: true }
}

export function buildStoragePath({ userId, taleId, scope, entityId, mimeType }) {
  const ext = extensionForMime(mimeType)
  const filename = `${crypto.randomUUID()}${ext}`
  return `${userId}/${taleId}/${scope}/${entityId}/${filename}`
}

export async function uploadTaleImage({ userId, taleId, scope, entityId, file }) {
  const validation = validateImageFile(file)
  if (!validation.valid) {
    throw new Error(validation.error)
  }

  const storagePath = buildStoragePath({
    userId,
    taleId,
    scope,
    entityId,
    mimeType: file.type,
  })

  const { error } = await supabase.storage
    .from(TALE_IMAGES_BUCKET)
    .upload(storagePath, file, {
      cacheControl: '3600',
      upsert: false,
      contentType: file.type,
    })

  if (error) throw error

  return { storagePath }
}

export async function deleteTaleImage(storagePath) {
  if (!storagePath) return

  const { error } = await supabase.storage.from(TALE_IMAGES_BUCKET).remove([storagePath])
  if (error) throw error
}

export async function createSignedStorageUrl(storagePath, ttlSeconds = SIGNED_URL_TTL_SECONDS) {
  if (!storagePath) return null

  const { data, error } = await supabase.storage
    .from(TALE_IMAGES_BUCKET)
    .createSignedUrl(storagePath, ttlSeconds)

  if (error) throw error
  return data.signedUrl
}
