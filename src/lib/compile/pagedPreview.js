import pagedUmdUrl from '../../../node_modules/pagedjs/dist/paged.js?url'
import { compilePageChromeStyles } from './compileHtmlStyles.js'
import {
  applyPageGuidesInIframe,
  buildPageGuidesBootScript,
  ensureCompilePageChromeInDocument,
  syncPageGuidesInDocument,
} from './pageGuides.js'

let messageHandler = null
let activeTimeout = null
let inFlightPreview = null

export function resetPagedPreviewSession() {
  if (activeTimeout !== null) {
    clearTimeout(activeTimeout)
    activeTimeout = null
  }

  if (messageHandler) {
    window.removeEventListener('message', messageHandler)
    messageHandler = null
  }

  inFlightPreview = null
}

/** @deprecated use resetPagedPreviewSession */
export function destroyPagedPreview() {
  resetPagedPreviewSession()
}

function loadScript(doc, src) {
  return new Promise((resolve, reject) => {
    const script = doc.createElement('script')
    script.src = src
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('Failed to load Paged.js.'))
    doc.head.appendChild(script)
  })
}

function injectBootScript(doc) {
  const helpers = doc.createElement('script')
  helpers.dataset.wkPagedHelpers = 'true'
  helpers.textContent = buildPageGuidesBootScript(compilePageChromeStyles())
  doc.head.appendChild(helpers)

  const boot = doc.createElement('script')
  boot.dataset.wkPagedBoot = 'true'
  boot.textContent = `
(async function () {
  try {
    await document.fonts.ready;
    const Previewer = window.Paged && window.Paged.Previewer;
    if (!Previewer) {
      throw new Error('Paged.js did not load.');
    }

    const article = document.querySelector('.manuscript-export');
    if (!article) {
      throw new Error('Compiled manuscript content is missing.');
    }

    const contentHtml = article.innerHTML;
    article.innerHTML = '';

    document.querySelectorAll('.pagedjs_pages').forEach((el) => el.remove());

    const previewer = new Previewer();
    await previewer.preview(contentHtml, null, article);

    if (typeof window.__wkEnsureChrome === 'function') {
      window.__wkEnsureChrome();
    }

    const showGuides = document.documentElement.dataset.showPageGuides === 'true';
    if (typeof window.__wkApplyPageGuides === 'function') {
      window.__wkApplyPageGuides(showGuides);
    }

    window.parent.postMessage({ type: 'wk-paged-done' }, '*');
  } catch (err) {
    window.parent.postMessage(
      { type: 'wk-paged-error', message: err && err.message ? err.message : 'Pagination failed.' },
      '*',
    );
  }
})();
`
  doc.body.appendChild(boot)
}

async function runPagedPreviewOnce(iframe, { onProgress, showPageGuides } = {}) {
  const doc = iframe?.contentDocument
  if (!doc) {
    throw new Error('Compile viewer is not ready.')
  }

  onProgress?.('Loading fonts…')
  await doc.fonts.ready

  doc.querySelectorAll('script[data-wk-paged-boot]').forEach((el) => el.remove())
  doc.querySelectorAll('script[data-wk-paged-lib]').forEach((el) => el.remove())
  doc.querySelectorAll('script[data-wk-paged-helpers]').forEach((el) => el.remove())
  doc.querySelectorAll('.pagedjs_pages').forEach((el) => el.remove())

  onProgress?.('Paginating…')

  return new Promise((resolve, reject) => {
    resetPagedPreviewSession()

    activeTimeout = setTimeout(() => {
      activeTimeout = null
      resetPagedPreviewSession()
      reject(new Error('Pagination timed out. Try a smaller scope.'))
    }, 300_000)

    messageHandler = (event) => {
      if (event.source !== iframe.contentWindow) return

      if (event.data?.type === 'wk-paged-done') {
        if (activeTimeout !== null) {
          clearTimeout(activeTimeout)
          activeTimeout = null
        }
        resetPagedPreviewSession()

        const iframeDoc = iframe.contentDocument
        ensureCompilePageChromeInDocument(iframeDoc)
        const guidesEnabled =
          typeof showPageGuides === 'boolean'
            ? showPageGuides
            : iframeDoc?.documentElement?.dataset.showPageGuides === 'true'
        syncPageGuidesInDocument(iframeDoc, guidesEnabled)

        onProgress?.(null)
        resolve()
        return
      }

      if (event.data?.type === 'wk-paged-error') {
        if (activeTimeout !== null) {
          clearTimeout(activeTimeout)
          activeTimeout = null
        }
        resetPagedPreviewSession()
        reject(new Error(event.data.message || 'Pagination failed.'))
      }
    }

    window.addEventListener('message', messageHandler)

    const absolutePagedUrl = new URL(pagedUmdUrl, window.location.href).href

    loadScript(doc, absolutePagedUrl)
      .then(() => {
        const libMarker = doc.createElement('script')
        libMarker.dataset.wkPagedLib = 'true'
        libMarker.textContent = ''
        doc.head.appendChild(libMarker)
        injectBootScript(doc)
      })
      .catch((err) => {
        if (activeTimeout !== null) {
          clearTimeout(activeTimeout)
          activeTimeout = null
        }
        resetPagedPreviewSession()
        reject(err)
      })
  })
}

export function runPagedPreview(iframe, options = {}) {
  if (inFlightPreview) {
    return inFlightPreview
  }

  inFlightPreview = runPagedPreviewOnce(iframe, options).finally(() => {
    inFlightPreview = null
  })

  return inFlightPreview
}

export { applyPageGuidesInIframe }
