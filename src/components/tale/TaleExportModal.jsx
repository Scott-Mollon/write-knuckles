import { useEffect, useMemo, useState } from 'react'
import {
  buildDefaultScope,
  countScopedScenes,
  EXPORT_FORMATS,
  EXPORT_OPTION_DEFS,
  isExportOptionVisible,
  validateExportOptions,
} from '../../constants/export'
import { useCreateTaleExport, useDeleteTaleExports, useTaleExports } from '../../hooks/useTaleExports'
import { confirmDelete } from '../../lib/confirmAction'
import {
  formatExportFormatLabel,
  summarizeExportOptions,
  summarizeExportScope,
} from '../../lib/export/formatOptionsSummary'
import {
  downloadExportFile,
  fetchExportHtmlContent,
  formatExportDate,
  formatFileSize,
  openExportHtmlInBrowser,
} from '../../lib/export/storage'
import { formatChapterLabel } from '../../lib/chapters'
import {
  readTaleExportPreferences,
  writeTaleExportPreferences,
} from '../../lib/export/exportPreferences'
import { taleHasCover } from '../../lib/images/resolveImageUrl'

const ExportScopePicker = ({ chapters, scope, onChange }) => {
  const sortedChapters = useMemo(
    () => [...chapters].sort((a, b) => a.sort_order - b.sort_order),
    [chapters],
  )

  const sceneIdsSet = useMemo(() => new Set(scope.sceneIds), [scope.sceneIds])
  const chapterIdsSet = useMemo(() => new Set(scope.chapterIds), [scope.chapterIds])

  const isChapterFullySelected = (chapter) =>
    (chapter.scenes || []).length > 0 &&
    (chapter.scenes || []).every((scene) => sceneIdsSet.has(scene.id))

  const isChapterPartiallySelected = (chapter) => {
    const scenes = chapter.scenes || []
    if (!scenes.length) return false
    const selected = scenes.filter((scene) => sceneIdsSet.has(scene.id)).length
    return selected > 0 && selected < scenes.length
  }

  const toggleChapter = (chapter) => {
    const sceneIds = (chapter.scenes || []).map((s) => s.id)
    const fullySelected = isChapterFullySelected(chapter)

    if (fullySelected) {
      onChange({
        chapterIds: scope.chapterIds.filter((id) => id !== chapter.id),
        sceneIds: scope.sceneIds.filter((id) => !sceneIds.includes(id)),
      })
      return
    }

    onChange({
      chapterIds: [...new Set([...scope.chapterIds, chapter.id])],
      sceneIds: [...new Set([...scope.sceneIds, ...sceneIds])],
    })
  }

  const toggleScene = (chapter, sceneId) => {
    const hasScene = sceneIdsSet.has(sceneId)
    const nextSceneIds = hasScene
      ? scope.sceneIds.filter((id) => id !== sceneId)
      : [...scope.sceneIds, sceneId]

    const chapterSceneIds = (chapter.scenes || []).map((s) => s.id)
    const anySceneSelected = chapterSceneIds.some((id) => nextSceneIds.includes(id))
    const nextChapterIds = anySceneSelected
      ? [...new Set([...scope.chapterIds, chapter.id])]
      : scope.chapterIds.filter((id) => id !== chapter.id)

    onChange({ chapterIds: nextChapterIds, sceneIds: nextSceneIds })
  }

  const selectAll = () => onChange(buildDefaultScope(chapters))
  const clearAll = () => onChange({ chapterIds: [], sceneIds: [] })

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <p className="font-ui text-xs uppercase text-cream/80">Chapters &amp; scenes</p>
        <div className="flex gap-2 text-xs">
          <button type="button" onClick={selectAll} className="text-bronze hover:underline">
            Select all
          </button>
          <button type="button" onClick={clearAll} className="text-cream/50 hover:text-cream">
            Clear
          </button>
        </div>
      </div>

      <div className="max-h-48 space-y-2 overflow-y-auto rounded border border-bronze-dark/30 p-3">
        {sortedChapters.map((chapter, chapterIndex) => (
          <div key={chapter.id} className="space-y-1">
            <label className="flex cursor-pointer items-center gap-2 text-sm text-cream">
              <input
                type="checkbox"
                checked={chapterIdsSet.has(chapter.id) && isChapterFullySelected(chapter)}
                ref={(el) => {
                  if (el) el.indeterminate = isChapterPartiallySelected(chapter)
                }}
                onChange={() => toggleChapter(chapter)}
                className="accent-bronze"
              />
              <span>{formatChapterLabel(chapter, chapterIndex)}</span>
            </label>
            <div className="ml-6 space-y-1">
              {(chapter.scenes || [])
                .sort((a, b) => a.sort_order - b.sort_order)
                .map((scene) => (
                  <label key={scene.id} className="flex cursor-pointer items-center gap-2 text-xs text-cream/70">
                    <input
                      type="checkbox"
                      checked={sceneIdsSet.has(scene.id)}
                      onChange={() => toggleScene(chapter, scene.id)}
                      className="accent-bronze"
                    />
                    <span>{scene.title}</span>
                  </label>
                ))}
            </div>
          </div>
        ))}
      </div>
      <p className="text-xs text-cream/50">
        {countScopedScenes(scope, chapters)} scene{countScopedScenes(scope, chapters) === 1 ? '' : 's'} selected
      </p>
    </div>
  )
}

const TaleExportModal = ({ tale, taleId, chapters, onClose, onBeforeExport }) => {
  const { data: exports = [], isLoading: exportsLoading } = useTaleExports(taleId)
  const createExport = useCreateTaleExport(taleId)
  const deleteExports = useDeleteTaleExports(taleId)

  const [format, setFormat] = useState(() => readTaleExportPreferences(taleId).format)
  const [options, setOptions] = useState(() => readTaleExportPreferences(taleId).options)
  const [scope, setScope] = useState(() => buildDefaultScope(chapters))
  const [selectedExportIds, setSelectedExportIds] = useState(new Set())
  const [error, setError] = useState(null)
  const [htmlPreview, setHtmlPreview] = useState(null)
  const [htmlPreviewLoadingId, setHtmlPreviewLoadingId] = useState(null)

  useEffect(() => {
    const prefs = readTaleExportPreferences(taleId)
    setFormat(prefs.format)
    setOptions(prefs.options)
  }, [taleId])

  useEffect(() => {
    writeTaleExportPreferences(taleId, { format, options })
  }, [taleId, format, options])

  useEffect(() => {
    setScope(buildDefaultScope(chapters))
  }, [chapters])

  const exportOptionContext = useMemo(
    () => ({ taleHasCover: taleHasCover(tale) }),
    [tale],
  )

  const visibleOptions = EXPORT_OPTION_DEFS.filter((def) =>
    isExportOptionVisible(def.key, format, options, exportOptionContext),
  )

  const toggleOption = (key) => {
    setOptions((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const handleExport = async () => {
    setError(null)

    const optionsError = validateExportOptions(options)
    if (optionsError) {
      setError(optionsError)
      return
    }

    if (scope.chapterIds.length === 0 || scope.sceneIds.length === 0) {
      setError('Select at least one chapter and one scene to export.')
      return
    }

    try {
      if (onBeforeExport) await onBeforeExport()

      const row = await createExport.mutateAsync({ format, options, scope })
      await downloadExportFile(row)
    } catch (err) {
      setError(err.message || 'Export failed.')
    }
  }

  const handleView = async (row) => {
    setError(null)
    setHtmlPreviewLoadingId(row.id)

    try {
      const html = await fetchExportHtmlContent(row)
      setHtmlPreview({ title: row.file_name || 'Export', html, row })
    } catch (err) {
      setError(err.message || 'Could not open export.')
    } finally {
      setHtmlPreviewLoadingId(null)
    }
  }

  const handleOpenPreviewInBrowser = async () => {
    if (!htmlPreview?.row) return

    try {
      await openExportHtmlInBrowser(htmlPreview.row)
    } catch (err) {
      setError(err.message || 'Could not open export in a new tab.')
    }
  }

  const handlePrintPreview = () => {
    const frame = document.getElementById('tale-export-html-preview-frame')
    frame?.contentWindow?.print()
  }

  const handleDownload = async (row) => {
    try {
      await downloadExportFile(row)
    } catch (err) {
      setError(err.message || 'Download failed.')
    }
  }

  const toggleExportSelection = (exportId) => {
    setSelectedExportIds((prev) => {
      const next = new Set(prev)
      if (next.has(exportId)) next.delete(exportId)
      else next.add(exportId)
      return next
    })
  }

  const handleDeleteSelected = async () => {
    const rows = exports.filter((row) => selectedExportIds.has(row.id))
    if (!rows.length) return

    const ok = await confirmDelete(
      `${rows.length} export${rows.length === 1 ? '' : 's'}`,
      { irreversible: true },
    )
    if (!ok) return

    try {
      await deleteExports.mutateAsync(rows)
      setSelectedExportIds(new Set())
    } catch (err) {
      setError(err.message || 'Delete failed.')
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      role="presentation"
    >
      <div
        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded border border-bronze-dark/50 bg-ink p-6 shadow-xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="tale-export-title"
      >
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h2 id="tale-export-title" className="font-ui text-xl uppercase tracking-wide text-bronze">
              Export Tale
            </h2>
            <p className="mt-1 text-sm text-cream/60">
              {tale?.title} — versioned exports saved to your tale folder.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-cream/50 hover:text-bronze"
            aria-label="Close export"
          >
            ×
          </button>
        </div>

        <div className="space-y-6">
          <section className="space-y-4 rounded border border-bronze-dark/30 p-4">
            <h3 className="font-ui text-sm uppercase text-bronze">New export</h3>

            <div>
              <p className="mb-2 font-ui text-xs uppercase text-cream/80">Format</p>
              <div className="flex flex-wrap gap-2">
                {Object.values(EXPORT_FORMATS).map((fmt) => (
                  <button
                    key={fmt.id}
                    type="button"
                    disabled={!fmt.enabled}
                    onClick={() => fmt.enabled && setFormat(fmt.id)}
                    className={`border px-4 py-2 font-ui text-xs uppercase ${
                      format === fmt.id
                        ? 'border-bronze bg-bronze/20 text-bronze'
                        : fmt.enabled
                          ? 'border-bronze-dark/50 text-cream/70 hover:border-bronze'
                          : 'cursor-not-allowed border-bronze-dark/30 text-cream/30'
                    }`}
                  >
                    {fmt.label}
                    {fmt.comingSoon ? ' (soon)' : ''}
                  </button>
                ))}
              </div>
            </div>

            <ExportScopePicker chapters={chapters} scope={scope} onChange={setScope} />

            <div>
              <p className="mb-2 font-ui text-xs uppercase text-cream/80">Options</p>
              <div className="space-y-2">
                {visibleOptions.map((def) => (
                  <label key={def.key} className="flex cursor-pointer items-center gap-2 text-sm text-cream/80">
                    <input
                      type="checkbox"
                      checked={Boolean(options[def.key])}
                      onChange={() => toggleOption(def.key)}
                      className="accent-bronze"
                    />
                    {def.label}
                  </label>
                ))}
              </div>
            </div>

            {format === 'html' && (
              <p className="text-xs text-cream/45">
                HTML exports open in an in-app preview.
              </p>
            )}
            {format === 'pdf' && (
              <p className="text-xs text-cream/45">
                Scene font and size choices are included. Drop-cap styling is not included yet.
              </p>
            )}
            {format === 'docx' && (
              <p className="text-xs text-cream/45">
                Word export includes scene fonts, images, cover, and chapter page breaks. Drop-cap styling is not included yet.
              </p>
            )}

            {error && <p className="text-sm text-error">{error}</p>}

            <button
              type="button"
              onClick={handleExport}
              disabled={createExport.isPending}
              className="border-2 border-bronze-dark px-6 py-2 font-ui text-sm uppercase text-bronze hover:border-bronze disabled:opacity-50"
            >
              {createExport.isPending ? 'Exporting…' : 'Export'}
            </button>
          </section>

          <section className="space-y-3 rounded border border-bronze-dark/30 p-4">
            <div className="flex items-center justify-between gap-2">
              <h3 className="font-ui text-sm uppercase text-bronze">Export history</h3>
              {selectedExportIds.size > 0 && (
                <button
                  type="button"
                  onClick={handleDeleteSelected}
                  disabled={deleteExports.isPending}
                  className="font-ui text-xs uppercase text-error hover:underline disabled:opacity-50"
                >
                  Delete selected ({selectedExportIds.size})
                </button>
              )}
            </div>

            {exportsLoading && <p className="text-sm text-cream/50">Loading exports…</p>}

            {!exportsLoading && exports.length === 0 && (
              <p className="text-sm text-cream/50">No exports yet. Create your first export above.</p>
            )}

            {!exportsLoading && exports.length > 0 && (
              <ul className="divide-y divide-bronze-dark/20">
                {exports.map((row) => (
                  <li key={row.id} className="flex items-start gap-3 py-3">
                    <input
                      type="checkbox"
                      checked={selectedExportIds.has(row.id)}
                      onChange={() => toggleExportSelection(row.id)}
                      className="mt-1 accent-bronze"
                      aria-label={`Select export v${row.version}`}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-cream">
                        v{row.version} · {formatExportFormatLabel(row.format)} · {row.file_name}
                      </p>
                      <p className="text-xs text-cream/50">
                        {formatExportDate(row.created_at)} · {formatFileSize(row.file_size_bytes)} ·{' '}
                        {summarizeExportOptions(row.options, row.format)} ·{' '}
                        {summarizeExportScope(row.scope, chapters)}
                      </p>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-1">
                      {row.format === 'html' && (
                        <button
                          type="button"
                          onClick={() => handleView(row)}
                          disabled={htmlPreviewLoadingId === row.id}
                          className="font-ui text-xs uppercase text-bronze hover:underline disabled:opacity-50"
                        >
                          {htmlPreviewLoadingId === row.id ? 'Loading…' : 'View'}
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleDownload(row)}
                        className="font-ui text-xs uppercase text-bronze hover:underline"
                      >
                        Download
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>

      {htmlPreview && (
        <div
          className="fixed inset-0 z-[60] flex flex-col bg-ink"
          role="dialog"
          aria-modal="true"
          aria-labelledby="tale-export-preview-title"
        >
          <div className="flex items-center justify-between gap-3 border-b border-bronze-dark/40 px-4 py-3">
            <h3 id="tale-export-preview-title" className="truncate font-ui text-sm uppercase text-bronze">
              {htmlPreview.title}
            </h3>
            <div className="flex shrink-0 items-center gap-3">
              <button
                type="button"
                onClick={handlePrintPreview}
                className="font-ui text-xs uppercase text-bronze hover:underline"
              >
                Print
              </button>
              <button
                type="button"
                onClick={handleOpenPreviewInBrowser}
                className="font-ui text-xs uppercase text-bronze hover:underline"
              >
                Open in browser
              </button>
              <button
                type="button"
                onClick={() => setHtmlPreview(null)}
                className="font-ui text-xs uppercase text-cream/60 hover:text-bronze"
              >
                Close
              </button>
            </div>
          </div>
          <iframe
            id="tale-export-html-preview-frame"
            title={htmlPreview.title}
            srcDoc={htmlPreview.html}
            className="h-full w-full flex-1 border-0 bg-[#f4efe4]"
          />
        </div>
      )}
    </div>
  )
}

export default TaleExportModal
