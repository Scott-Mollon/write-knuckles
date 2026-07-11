import type { SupabaseClient } from 'npm:@supabase/supabase-js@2'
import type { ExportFormat, ExportOptions, ManuscriptModel, ResolvedImage, TaleRow } from './types.ts'

const TALE_IMAGES_BUCKET = 'write-tale-images'

const MIME_BY_EXT: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
}

function mimeFromPath(path: string): string {
  const dot = path.lastIndexOf('.')
  const ext = dot >= 0 ? path.slice(dot).toLowerCase() : ''
  return MIME_BY_EXT[ext] || 'image/jpeg'
}

function bytesToBase64(bytes: Uint8Array): string {
  let binary = ''
  const chunk = 0x8000
  for (let i = 0; i < bytes.length; i += chunk) {
    const slice = bytes.subarray(i, i + chunk)
    binary += String.fromCharCode(...slice)
  }
  return btoa(binary)
}

function toDataUrl(bytes: Uint8Array, mime: string): string {
  return `data:${mime};base64,${bytesToBase64(bytes)}`
}

function collectSceneImageKeys(manuscript: ManuscriptModel): string[] {
  const keys = new Set<string>()
  for (const chapter of manuscript.chapters) {
    for (const scene of chapter.scenes) {
      for (const block of scene.blocks) {
        if (block.type === 'image' && block.imageKey) {
          keys.add(block.imageKey)
        }
      }
    }
  }
  return [...keys]
}

function taleHasCover(tale: TaleRow): boolean {
  if (tale.cover_source_type === 'upload') return !!tale.cover_storage_path
  if (tale.cover_source_type === 'url') return !!tale.cover_external_url
  return false
}

async function fetchUrlBytes(url: string): Promise<{ bytes: Uint8Array; mime: string }> {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Failed to fetch image (${response.status})`)
  }
  const mime = response.headers.get('content-type')?.split(';')[0]?.trim() || 'image/jpeg'
  return { bytes: new Uint8Array(await response.arrayBuffer()), mime }
}

async function fetchStorageBytes(
  supabase: SupabaseClient,
  storagePath: string,
): Promise<Uint8Array> {
  const { data, error } = await supabase.storage.from(TALE_IMAGES_BUCKET).download(storagePath)
  if (error || !data) {
    throw error || new Error('Failed to download image from storage.')
  }
  return new Uint8Array(await data.arrayBuffer())
}

async function resolveImageKey(
  key: string,
  supabase: SupabaseClient,
  cache: Map<string, ResolvedImage>,
): Promise<void> {
  if (cache.has(key)) return

  if (key.startsWith('storage:')) {
    const path = key.slice('storage:'.length)
    const bytes = await fetchStorageBytes(supabase, path)
    cache.set(key, { dataUrl: toDataUrl(bytes, mimeFromPath(path)) })
    return
  }

  if (key.startsWith('url:')) {
    const url = key.slice('url:'.length)
    const { bytes, mime } = await fetchUrlBytes(url)
    cache.set(key, { dataUrl: toDataUrl(bytes, mime) })
  }
}

export type ExportImageBundle = {
  cover: ResolvedImage | null
  sceneImages: Map<string, ResolvedImage>
}

export async function resolveExportImages({
  tale,
  manuscript,
  options,
  format,
  supabase,
}: {
  tale: TaleRow
  manuscript: ManuscriptModel
  options: ExportOptions
  format: ExportFormat
  supabase: SupabaseClient
}): Promise<ExportImageBundle> {
  const sceneImages = new Map<string, ResolvedImage>()

  if ((format === 'pdf' || format === 'docx') && options.includeImages) {
    const keys = collectSceneImageKeys(manuscript)
    for (const key of keys) {
      try {
        await resolveImageKey(key, supabase, sceneImages)
      } catch (err) {
        console.warn('tale-export: skipped scene image', key, err)
      }
    }
  }

  let cover: ResolvedImage | null = null
  if ((format === 'pdf' || format === 'docx') && options.includeCover && taleHasCover(tale)) {
    try {
      if (tale.cover_source_type === 'upload' && tale.cover_storage_path) {
        await resolveImageKey(`storage:${tale.cover_storage_path}`, supabase, sceneImages)
        cover = sceneImages.get(`storage:${tale.cover_storage_path}`) || null
      } else if (tale.cover_source_type === 'url' && tale.cover_external_url) {
        await resolveImageKey(`url:${tale.cover_external_url}`, supabase, sceneImages)
        cover = sceneImages.get(`url:${tale.cover_external_url}`) || null
      }
    } catch (err) {
      console.warn('tale-export: skipped cover image', err)
    }
  }

  return { cover, sceneImages }
}
