import { supabase } from '../../clients/supabase.js'
import { taleHasCover } from '../images/resolveImageUrl.js'
import { sceneImageKey } from './sceneImageKey.js'

const TALE_IMAGES_BUCKET = 'write-tale-images'

const MIME_BY_EXT = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
}

function mimeFromPath(path) {
  const dot = path.lastIndexOf('.')
  const ext = dot >= 0 ? path.slice(dot).toLowerCase() : ''
  return MIME_BY_EXT[ext] || 'image/jpeg'
}

function bytesToBase64(bytes) {
  let binary = ''
  const chunk = 0x8000
  for (let i = 0; i < bytes.length; i += chunk) {
    const slice = bytes.subarray(i, i + chunk)
    binary += String.fromCharCode(...slice)
  }
  return btoa(binary)
}

function toDataUrl(bytes, mime) {
  return `data:${mime};base64,${bytesToBase64(bytes)}`
}

function collectSceneImageKeysFromContent(content) {
  const keys = new Set()

  function walk(node) {
    if (!node || typeof node !== 'object') return
    if (node.type === 'sceneImage') {
      const key = sceneImageKey(node.attrs)
      if (key) keys.add(key)
    }
    for (const child of node.content || []) {
      walk(child)
    }
  }

  walk(content)
  return [...keys]
}

function collectSceneImageKeys(manuscript) {
  const keys = new Set()
  for (const chapter of manuscript.chapters) {
    for (const scene of chapter.scenes) {
      for (const key of collectSceneImageKeysFromContent(scene.content)) {
        keys.add(key)
      }
    }
  }
  return [...keys]
}

async function fetchUrlBytes(url) {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Failed to fetch image (${response.status})`)
  }
  const mime = response.headers.get('content-type')?.split(';')[0]?.trim() || 'image/jpeg'
  return { bytes: new Uint8Array(await response.arrayBuffer()), mime }
}

async function fetchStorageBytes(storagePath) {
  const { data, error } = await supabase.storage.from(TALE_IMAGES_BUCKET).download(storagePath)
  if (error || !data) {
    throw error || new Error('Failed to download image from storage.')
  }
  return new Uint8Array(await data.arrayBuffer())
}

async function resolveImageKey(key, cache) {
  if (cache.has(key)) return

  if (key.startsWith('storage:')) {
    const path = key.slice('storage:'.length)
    const bytes = await fetchStorageBytes(path)
    cache.set(key, { dataUrl: toDataUrl(bytes, mimeFromPath(path)) })
    return
  }

  if (key.startsWith('url:')) {
    const url = key.slice('url:'.length)
    const { bytes, mime } = await fetchUrlBytes(url)
    cache.set(key, { dataUrl: toDataUrl(bytes, mime) })
  }
}

export async function resolveCompileImages({ tale, manuscript, options }) {
  const sceneImages = new Map()

  if (options.includeImages) {
    const keys = collectSceneImageKeys(manuscript)
    for (const key of keys) {
      try {
        await resolveImageKey(key, sceneImages)
      } catch (err) {
        console.warn('compile: skipped scene image', key, err)
      }
    }
  }

  let cover = null
  if (options.includeCover && taleHasCover(tale)) {
    try {
      if (tale.cover_source_type === 'upload' && tale.cover_storage_path) {
        await resolveImageKey(`storage:${tale.cover_storage_path}`, sceneImages)
        cover = sceneImages.get(`storage:${tale.cover_storage_path}`) || null
      } else if (tale.cover_source_type === 'url' && tale.cover_external_url) {
        await resolveImageKey(`url:${tale.cover_external_url}`, sceneImages)
        cover = sceneImages.get(`url:${tale.cover_external_url}`) || null
      }
    } catch (err) {
      console.warn('compile: skipped cover image', err)
    }
  }

  return { cover, sceneImages }
}
