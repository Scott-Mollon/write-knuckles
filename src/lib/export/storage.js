import { supabase } from '../../clients/supabase'
import { SIGNED_URL_TTL_SECONDS } from '../images/constants'

export const TALE_EXPORTS_BUCKET = 'write-tale-exports'

export async function createExportSignedUrl(storagePath, ttlSeconds = SIGNED_URL_TTL_SECONDS) {
  if (!storagePath) return null

  const { data, error } = await supabase.storage
    .from(TALE_EXPORTS_BUCKET)
    .createSignedUrl(storagePath, ttlSeconds)

  if (error) throw error
  return data.signedUrl
}

export async function deleteExportFile(storagePath) {
  if (!storagePath) return

  const { error } = await supabase.storage.from(TALE_EXPORTS_BUCKET).remove([storagePath])
  if (error) throw error
}

export async function fetchExportHtmlContent(exportRow) {
  if (!exportRow.storage_path) throw new Error('Export file is unavailable.')

  const { data, error } = await supabase.storage
    .from(TALE_EXPORTS_BUCKET)
    .download(exportRow.storage_path)

  if (error) throw error
  if (!data) throw new Error('Export file is unavailable.')

  return data.text()
}

export async function openExportHtmlInBrowser(exportRow) {
  const signedUrl = await createExportSignedUrl(exportRow.storage_path)
  if (!signedUrl) throw new Error('Export file is unavailable.')

  const opened = window.open(signedUrl, '_blank')
  if (!opened) {
    throw new Error('Pop-up blocked. Allow pop-ups for this site, or use the in-app preview.')
  }
}

export async function downloadExportFile(exportRow) {
  if (!exportRow.storage_path) throw new Error('Export file is unavailable.')

  const { data, error } = await supabase.storage
    .from(TALE_EXPORTS_BUCKET)
    .download(exportRow.storage_path)

  if (error) throw error
  if (!data) throw new Error('Export file is unavailable.')

  const blobUrl = URL.createObjectURL(data)
  const anchor = document.createElement('a')
  anchor.href = blobUrl
  anchor.download = exportRow.file_name || 'export.txt'
  anchor.rel = 'noopener'
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  URL.revokeObjectURL(blobUrl)
}

export function formatFileSize(bytes) {
  if (!bytes || bytes <= 0) return '0 B'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function formatExportDate(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}
