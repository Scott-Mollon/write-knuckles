import { useCallback, useEffect, useRef, useState } from 'react'
import { downloadBlob, slugifyTitle } from '../../lib/compile/download.js'
import { exportCompileHtml } from '../../lib/compile/exportCompileHtml.js'
import { writeViewerCompilePreferences } from '../../lib/compile/compilePreferences.js'
import { normalizePageLayout, pageLayoutsEqual } from '../../lib/compile/pageLayout.js'
import {
  applyPageGuidesInIframe,
  resetPagedPreviewSession,
  runPagedPreview,
} from '../../lib/compile/pagedPreview.js'

function waitForIframeLoad(iframe) {
  return new Promise((resolve) => {
    iframe.addEventListener('load', () => resolve(), { once: true })
  })
}

/** Survives React Strict Mode remounts — component refs do not. */
let paginateSession = null
let lastCompiledHtml = null

const CompileViewer = ({
  taleId,
  title,
  html: initialHtml,
  txt,
  pageLayout: initialPageLayout,
  model,
  options,
  images,
  contentRevision = 0,
  isRecompiling = false,
  onClose,
  onOpenCompileSettings,
}) => {
  const iframeRef = useRef(null)
  const downloadMenuRef = useRef(null)
  const [html, setHtml] = useState(initialHtml)
  const [pageLayout, setPageLayout] = useState(() => normalizePageLayout(initialPageLayout))
  const [progress, setProgress] = useState('Loading…')
  const [error, setError] = useState(null)
  const [isPaginating, setIsPaginating] = useState(true)
  const [downloadMenuOpen, setDownloadMenuOpen] = useState(false)

  const pageLayoutRef = useRef(pageLayout)
  pageLayoutRef.current = pageLayout

  const bindPaginationPromise = useCallback((promise) => {
    setIsPaginating(true)
    setError(null)
    setProgress('Loading…')

    promise
      .then(() => {
        setIsPaginating(false)
        setProgress(null)
      })
      .catch((err) => {
        setIsPaginating(false)
        setProgress(null)
        setError(err.message || 'Pagination failed.')
      })
  }, [])

  useEffect(() => {
    setHtml(initialHtml)
    setPageLayout(normalizePageLayout(initialPageLayout))
    if (lastCompiledHtml !== initialHtml) {
      lastCompiledHtml = initialHtml
      paginateSession = null
      resetPagedPreviewSession()
    }
  }, [initialHtml, initialPageLayout])

  useEffect(() => {
    const iframe = iframeRef.current
    if (!iframe) return undefined

    const sessionKey = String(contentRevision)

    if (paginateSession?.key === sessionKey) {
      bindPaginationPromise(paginateSession.promise)
      return undefined
    }

    const promise = (async () => {
      iframe.srcdoc = html
      await waitForIframeLoad(iframe)

      return runPagedPreview(iframe, {
        onProgress: (message) => setProgress(message || 'Paginating…'),
        showPageGuides: pageLayoutRef.current.showPageGuides,
      })
    })()

    paginateSession = { key: sessionKey, promise }
    bindPaginationPromise(promise)

    return undefined
  }, [html, contentRevision, bindPaginationPromise])

  useEffect(() => {
    if (!downloadMenuOpen) return undefined

    const handlePointerDown = (event) => {
      if (!downloadMenuRef.current?.contains(event.target)) {
        setDownloadMenuOpen(false)
      }
    }

    document.addEventListener('pointerdown', handlePointerDown)
    return () => document.removeEventListener('pointerdown', handlePointerDown)
  }, [downloadMenuOpen])

  const togglePageGuides = (enabled) => {
    const normalized = normalizePageLayout({ ...pageLayout, showPageGuides: enabled })
    if (pageLayoutsEqual(normalized, pageLayout)) return

    setPageLayout(normalized)
    writeViewerCompilePreferences(taleId, { showPageGuides: enabled })
    applyPageGuidesInIframe(iframeRef.current, enabled)
  }

  const handlePrint = async () => {
    const iframe = iframeRef.current
    const doc = iframe?.contentDocument
    if (!doc) return

    try {
      if (paginateSession?.promise) {
        await paginateSession.promise
      }
      await doc.fonts.ready
      iframe.contentWindow?.print()
    } catch (err) {
      setError(err.message || 'Print failed.')
    }
  }

  const handleDownloadHtml = () => {
    setDownloadMenuOpen(false)
    const fileName = `${slugifyTitle(title)}.html`
    const currentHtml = exportCompileHtml(model, options, images, { pageLayout })
    downloadBlob(new Blob([currentHtml], { type: 'text/html;charset=utf-8' }), fileName)
  }

  const handleDownloadTxt = () => {
    setDownloadMenuOpen(false)
    const fileName = `${slugifyTitle(title)}.txt`
    downloadBlob(new Blob([txt], { type: 'text/plain;charset=utf-8' }), fileName)
  }

  const busy = isPaginating || isRecompiling

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
              onClick={onOpenCompileSettings}
              className="font-ui text-xs uppercase text-bronze hover:underline"
            >
              Compile settings
            </button>
            <div className="relative" ref={downloadMenuRef}>
              <button
                type="button"
                onClick={() => setDownloadMenuOpen((open) => !open)}
                className="inline-flex items-center gap-1 font-ui text-xs uppercase text-bronze hover:underline"
                aria-expanded={downloadMenuOpen}
                aria-haspopup="menu"
              >
                Download
                <span aria-hidden className="text-[10px]">
                  ▾
                </span>
              </button>
              {downloadMenuOpen && (
                <div
                  role="menu"
                  className="absolute right-0 top-full z-50 mt-1 min-w-[8rem] border border-bronze-dark bg-ink py-1 shadow-lg"
                >
                  <button
                    type="button"
                    role="menuitem"
                    onClick={handleDownloadHtml}
                    className="block w-full px-3 py-2 text-left font-ui text-xs uppercase text-cream/80 hover:bg-surface/40 hover:text-bronze"
                  >
                    HTML
                  </button>
                  <button
                    type="button"
                    role="menuitem"
                    onClick={handleDownloadTxt}
                    className="block w-full px-3 py-2 text-left font-ui text-xs uppercase text-cream/80 hover:bg-surface/40 hover:text-bronze"
                  >
                    TXT
                  </button>
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={handlePrint}
              disabled={busy}
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

        <div className="mt-3 flex flex-wrap items-center gap-4 border-t border-bronze-dark/25 pt-3">
          <label className="flex cursor-pointer items-center gap-2 font-ui text-xs uppercase text-cream/70">
            <input
              type="checkbox"
              checked={pageLayout.showPageGuides}
              onChange={(e) => togglePageGuides(e.target.checked)}
              disabled={busy}
              className="size-4 shrink-0 accent-bronze"
            />
            Page guides
          </label>
        </div>
      </div>

      {(progress || error || isRecompiling) && (
        <div className="border-b border-bronze-dark/30 px-4 py-2 text-sm">
          {isRecompiling && <p className="text-cream/60">Recompiling…</p>}
          {progress && <p className="text-cream/60">{progress}</p>}
          {error && <p className="text-error">{error}</p>}
        </div>
      )}

      <iframe
        ref={iframeRef}
        title={title}
        srcDoc={html}
        sandbox="allow-scripts allow-same-origin allow-modals"
        className="h-full w-full flex-1 border-0 bg-[#e5dfd3]"
      />
    </div>
  )
}

export default CompileViewer
