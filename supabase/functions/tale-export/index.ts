import { createClient } from 'npm:@supabase/supabase-js@2'
import { buildManuscriptModel, manuscriptHasContent } from '../_shared/export/buildManuscriptModel.ts'
import { validateExportOptions } from '../_shared/export/chapterHeading.ts'
import { encodeTxtBuffer, exportTxt } from '../_shared/export/exportTxt.ts'
import type {
  ChapterRow,
  ExportOptions,
  ExportRequest,
  ExportScope,
  SceneRow,
  TaleRow,
} from '../_shared/export/types.ts'

const TALE_EXPORTS_BUCKET = 'write-tale-exports'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

function slugifyTitle(title: string): string {
  return (
    title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 60) || 'tale'
  )
}

function normalizeOptions(raw: unknown): ExportOptions | null {
  if (!raw || typeof raw !== 'object') return null
  const o = raw as Record<string, unknown>
  return {
    includeChapterWord: Boolean(o.includeChapterWord),
    includeChapterNumber: Boolean(o.includeChapterNumber),
    includeChapterTitle: Boolean(o.includeChapterTitle),
    titlePage: Boolean(o.titlePage),
    chapterPageBreak: Boolean(o.chapterPageBreak),
    includeCover: Boolean(o.includeCover),
    includeImagePlaceholders: o.includeImagePlaceholders !== false,
  }
}

function normalizeScope(raw: unknown): ExportScope | null {
  if (!raw || typeof raw !== 'object') return null
  const s = raw as Record<string, unknown>
  const chapterIds = Array.isArray(s.chapterIds)
    ? s.chapterIds.filter((id): id is string => typeof id === 'string')
    : []
  const sceneIds = Array.isArray(s.sceneIds)
    ? s.sceneIds.filter((id): id is string => typeof id === 'string')
    : []
  return { chapterIds, sceneIds }
}

function parseRequest(body: unknown): ExportRequest | { error: string } {
  if (!body || typeof body !== 'object') return { error: 'Invalid request body.' }
  const b = body as Record<string, unknown>

  if (typeof b.taleId !== 'string' || !b.taleId) return { error: 'taleId is required.' }
  if (b.format !== 'txt') {
    return { error: 'Only plain text (.txt) export is available in this release.' }
  }

  const options = normalizeOptions(b.options)
  if (!options) return { error: 'options are required.' }

  const scope = normalizeScope(b.scope)
  if (!scope) return { error: 'scope is required.' }
  if (scope.chapterIds.length === 0 || scope.sceneIds.length === 0) {
    return { error: 'Select at least one chapter and one scene to export.' }
  }

  const optionsError = validateExportOptions(options)
  if (optionsError) return { error: optionsError }

  return { taleId: b.taleId, format: 'txt', options, scope }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed.' }, 405)
  }

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return jsonResponse({ error: 'Missing authorization.' }, 401)
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')
    if (!supabaseUrl || !supabaseAnonKey) {
      return jsonResponse({ error: 'Server configuration error.' }, 500)
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    })
    const writeDb = supabase.schema('write')

    const { data: userData, error: userError } = await supabase.auth.getUser()
    if (userError || !userData.user) {
      return jsonResponse({ error: 'Unauthorized.' }, 401)
    }
    const userId = userData.user.id

    const body = await req.json()
    const parsed = parseRequest(body)
    if ('error' in parsed) {
      return jsonResponse({ error: parsed.error }, 400)
    }

    const { taleId, format, options, scope } = parsed

    const { data: tale, error: taleError } = await writeDb
      .from('tales')
      .select('id, user_id, title, author, subtitle')
      .eq('id', taleId)
      .maybeSingle()

    if (taleError) throw taleError
    if (!tale || tale.user_id !== userId) {
      return jsonResponse({ error: 'Tale not found.' }, 404)
    }

    const [chaptersRes, scenesRes, versionRes] = await Promise.all([
      writeDb.from('chapters').select('id, tale_id, title, sort_order').eq('tale_id', taleId).order('sort_order'),
      writeDb.from('scenes').select('id, chapter_id, tale_id, title, sort_order, content, plain_text').eq('tale_id', taleId).order('sort_order'),
      writeDb.from('tale_exports').select('version').eq('tale_id', taleId).order('version', { ascending: false }).limit(1).maybeSingle(),
    ])

    if (chaptersRes.error) throw chaptersRes.error
    if (scenesRes.error) throw scenesRes.error
    if (versionRes.error) throw versionRes.error

    const manuscript = buildManuscriptModel({
      tale: tale as TaleRow,
      chapters: (chaptersRes.data || []) as ChapterRow[],
      scenes: (scenesRes.data || []) as SceneRow[],
      options,
      scope,
    })

    if (!manuscriptHasContent(manuscript)) {
      return jsonResponse({ error: 'Nothing to export in the selected scope.' }, 400)
    }

    const text = exportTxt(manuscript, options)
    const fileBuffer = encodeTxtBuffer(text)
    const version = (versionRes.data?.version ?? 0) + 1
    const exportId = crypto.randomUUID()
    const fileName = `${slugifyTitle(tale.title)}-v${version}.txt`
    const storagePath = `${userId}/${taleId}/exports/${exportId}.txt`

    const { error: uploadError } = await supabase.storage
      .from(TALE_EXPORTS_BUCKET)
      .upload(storagePath, fileBuffer, {
        contentType: 'text/plain',
        upsert: false,
        cacheControl: '3600',
      })

    if (uploadError) throw uploadError

    const { data: exportRow, error: insertError } = await writeDb
      .from('tale_exports')
      .insert({
        id: exportId,
        tale_id: taleId,
        user_id: userId,
        format,
        version,
        status: 'complete',
        file_name: fileName,
        storage_path: storagePath,
        file_size_bytes: fileBuffer.byteLength,
        options,
        scope,
      })
      .select('id, tale_id, format, version, status, file_name, storage_path, file_size_bytes, options, scope, created_at')
      .single()

    if (insertError) {
      await supabase.storage.from(TALE_EXPORTS_BUCKET).remove([storagePath])
      throw insertError
    }

    return jsonResponse({ export: exportRow })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Export failed.'
    console.error('tale-export error:', err)
    return jsonResponse({ error: message }, 500)
  }
})
