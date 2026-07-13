import { useCallback, useEffect, useRef, useState } from 'react'
import {
  COMPILE_PAGE_MARGIN_OPTIONS,
  COMPILE_PAGE_ORIENTATION_OPTIONS,
  COMPILE_PAGE_SIZE_OPTIONS,
} from '../../constants/compile.js'
import { downloadBlob, slugifyTitle } from '../../lib/compile/download.js'
import { exportCompileHtml } from '../../lib/compile/exportCompileHtml.js'
import {
  normalizePageLayout,
  pageLayoutAffectsPagination,
  pageLayoutsEqual,
} from '../../lib/compile/pageLayout.js'
import { applyPageGuidesInIframe, destroyPagedPreview, runPagedPreview } from '../../lib/compile/pagedPreview.js'

const selectClass = 'border border-bronze-dark/50 bg-ink px-2 py-1 text-cream'

const CompileViewer = ({
  title,
  html: initialHtml,
  txt,
  pageLayout: initialPageLayout,
  model,
  options,
  images,
  onClose,
  onPageLayoutChange,
}) => {
  const iframeRef = useRef(null)
  const [html, setHtml] = useState(initialHtml)
  const [pageLayout, setPageLayout] = useState(() => normalizePageLayout(initialPageLayout))
  const [progress, setProgress] = useState('Loading…')
  const [error, setError] = useState(null)
  const [isPaginating, setIsPaginating] = useState(true)

  const pageLayoutRef = useRef(pageLayout)
  pageLayoutRef.current = pageLayout

  const paginate = useCallback(async () => {
    const iframe = iframeRef.current
    if (!iframe) return

    setIsPaginating(true)
    setError(null)

    try {
      await runPagedPreview(iframe, {
        onProgress: (message) => setProgress(message || null),
        showPageGuides: pageLayoutRef.current.showPageGuides,
      })
    } catch (err) {
      setError(err.message || 'Pagination failed.')
    } finally {
      setIsPaginating(false)
      setProgress(null)
    }
  }, [])

  useEffect(() => {
    setHtml(initialHtml)
    setPageLayout(normalizePageLayout(initialPageLayout))
  }, [initialHtml, initialPageLayout])

  useEffect(() => {
    const iframe = iframeRef.current
    if (!iframe) return undefined

    const handleLoad = () => {
      paginate()
    }

    iframe.addEventListener('load', handleLoad)
    if (iframe.contentDocument?.readyState === 'complete') {
      handleLoad()
    }

    return () => iframe.removeEventListener('load', handleLoad)
  }, [html, paginate])

  useEffect(() => () => destroyPagedPreview(), [])

  const applyPageLayout = (nextLayout) => {
    const normalized = normalizePageLayout(nextLayout)
    if (pageLayoutsEqual(normalized, pageLayout)) return

    const guidesOnly = !pageLayoutAffectsPagination(normalized, pageLayout)
    setPageLayout(normalized)
    onPageLayoutChange?.(normalized)

    if (guidesOnly) {
      applyPageGuidesInIframe(iframeRef.current, normalized.showPageGuides)
      return
    }

    setHtml(exportCompileHtml(model, options, images, { pageLayout: normalized }))
  }

  const handlePrint = async () => {
    const iframe = iframeRef.current
    const doc = iframe?.contentDocument
    if (!doc) return

    try {
      if (isPaginating) {
        await paginate()
      }
      await doc.fonts.ready
      iframe.contentWindow?.print()
    } catch (err) {
      setError(err.message || 'Print failed.')
    }
  }

  const handleDownloadHtml = () => {
    const fileName = `${slugifyTitle(title)}.html`
    const currentHtml = exportCompileHtml(model, options, images, { pageLayout })
    downloadBlob(new Blob([currentHtml], { type: 'text/html;charset=utf-8' }), fileName)
  }

  const handleDownloadTxt = () => {
    const fileName = `${slugifyTitle(title)}.txt`
    downloadBlob(new Blob([txt], { type: 'text/plain;charset=utf-8' }), fileName)
  }

  return (
    <div
      className="fixed inset-0 z-[60] flex flex-col bg-ink"
      role="dialog"
      aria-modal="true"
      aria-labelledby="tale-compile-viewer-title"
    >
      <div className="border-b border-bronze-dark/40 px-4 py-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 id="tale-compile-viewer-title" className="truncate font-ui text-sm uppercase text-bronze">
              {title}
            </h3>
            <p className="text-xs text-cream/50">
              Use Print → Save as PDF for a paginated file. Page guides are for on-screen preview only.
            </p>
          </div>
          <div className="flex shrink-0 flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleDownloadTxt}
              className="font-ui text-xs uppercase text-bronze hover:underline"
            >
              Download TXT
            </button>
            <button
              type="button"
              onClick={handleDownloadHtml}
              className="font-ui text-xs uppercase text-bronze hover:underline"
            >
              Download HTML
            </button>
            <button
              type="button"
              onClick={handlePrint}
              disabled={isPaginating}
              className="font-ui text-xs uppercase text-bronze hover:underline disabled:opacity-50"
            >
              Print
            </button>
            <button
              type="button"
              onClick={onClose}
              className="font-ui text-xs uppercase text-cream/60 hover:text-bronze"
            >
              Close
            </button>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-end gap-4 border-t border-bronze-dark/25 pt-3">
          <label className="flex flex-col gap-1 font-ui text-xs uppercase text-cream/70">
            Page size
            <select
              value={pageLayout.pageSize}
              onChange={(e) => applyPageLayout({ ...pageLayout, pageSize: e.target.value })}
              disabled={isPaginating}
              className={selectClass}
            >
              {COMPILE_PAGE_SIZE_OPTIONS.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.label} ({opt.detail})
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1 font-ui text-xs uppercase text-cream/70">
            Margins
            <select
              value={pageLayout.marginPreset}
              onChange={(e) => applyPageLayout({ ...pageLayout, marginPreset: e.target.value })}
              disabled={isPaginating}
              className={selectClass}
            >
              {COMPILE_PAGE_MARGIN_OPTIONS.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.label} ({opt.detail})
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1 font-ui text-xs uppercase text-cream/70">
            Orientation
            <select
              value={pageLayout.orientation}
              onChange={(e) => applyPageLayout({ ...pageLayout, orientation: e.target.value })}
              disabled={isPaginating}
              className={selectClass}
            >
              {COMPILE_PAGE_ORIENTATION_OPTIONS.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.label}
                </option>
              ))}
            </select>
          </label>

          <label className="flex cursor-pointer items-center gap-2 pb-1 font-ui text-xs uppercase text-cream/70">
            <input
              type="checkbox"
              checked={pageLayout.showPageGuides}
              onChange={(e) => applyPageLayout({ ...pageLayout, showPageGuides: e.target.checked })}
              disabled={isPaginating}
              className="size-4 shrink-0 accent-bronze"
            />
            Page guides
          </label>
        </div>
      </div>

      {(progress || error) && (
        <div className="border-b border-bronze-dark/30 px-4 py-2 text-sm">
          {progress && <p className="text-cream/60">{progress}</p>}
          {error && <p className="text-error">{error}</p>}
        </div>
      )}

      <iframe
        ref={iframeRef}
        title={title}
        srcDoc={html}
        className="h-full w-full flex-1 border-0 bg-[#e5dfd3]"
      />
    </div>
  )
}

export default CompileViewer
