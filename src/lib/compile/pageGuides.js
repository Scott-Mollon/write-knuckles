import { compilePageChromeStyles } from './compileHtmlStyles.js'

export const WK_SET_PAGE_GUIDES = 'wk-set-page-guides'

const GUIDE_PAGE_OUTLINE = '2px solid rgba(147, 137, 56, 0.4)'
const GUIDE_PAGE_OUTLINE_OFFSET = '6px'
const GUIDE_SHEET_SHADOW = 'inset 0 0 0 1px rgba(147, 137, 56, 0.16)'
const GUIDE_AREA_SHADOW = 'inset 0 0 0 1px rgba(147, 137, 56, 0.3)'
const GUIDE_MARGIN_BG = 'rgba(147, 137, 56, 0.035)'

export function syncPageGuidesInDocument(doc, enabled) {
  if (!doc?.documentElement) return false

  const root = doc.documentElement
  root.classList.toggle('wk-page-guides', enabled)
  root.dataset.showPageGuides = enabled ? 'true' : 'false'

  const pages = doc.querySelectorAll('.pagedjs_page')
  if (pages.length === 0) return false

  for (const page of pages) {
    if (enabled) {
      page.style.setProperty('outline', GUIDE_PAGE_OUTLINE, 'important')
      page.style.setProperty('outline-offset', GUIDE_PAGE_OUTLINE_OFFSET, 'important')
    } else {
      page.style.removeProperty('outline')
      page.style.removeProperty('outline-offset')
    }
  }

  for (const sheet of doc.querySelectorAll('.pagedjs_sheet')) {
    if (enabled) {
      sheet.style.setProperty('box-shadow', GUIDE_SHEET_SHADOW, 'important')
    } else {
      sheet.style.removeProperty('box-shadow')
    }
  }

  for (const area of doc.querySelectorAll('.pagedjs_area')) {
    if (enabled) {
      area.style.setProperty('box-shadow', GUIDE_AREA_SHADOW, 'important')
    } else {
      area.style.removeProperty('box-shadow')
    }
  }

  for (const margin of doc.querySelectorAll('.pagedjs_margin')) {
    if (enabled) {
      margin.style.setProperty('background', GUIDE_MARGIN_BG, 'important')
    } else {
      margin.style.removeProperty('background')
    }
  }

  ensurePrintGuideSuppressionInDocument(doc)

  return true
}

export function ensurePrintGuideSuppressionInDocument(doc) {
  const win = doc?.defaultView
  if (!win || win.__wkPrintGuideListener) return

  win.__wkPrintGuideListener = true
  win.addEventListener('beforeprint', () => {
    win.__wkGuidesWereEnabled = doc.documentElement.dataset.showPageGuides === 'true'
    syncPageGuidesInDocument(doc, false)
  })
  win.addEventListener('afterprint', () => {
    if (win.__wkGuidesWereEnabled) {
      syncPageGuidesInDocument(doc, true)
    }
  })
}

export function ensureCompilePageChromeInDocument(doc) {
  if (!doc?.head) return

  let style = doc.querySelector('style[data-wk-compile-chrome]')
  if (!style) {
    style = doc.createElement('style')
    style.media = 'screen'
    style.dataset.wkCompileChrome = 'true'
    style.setAttribute('data-pagedjs-ignore', 'true')
    style.textContent = compilePageChromeStyles()
    doc.head.appendChild(style)
    return
  }

  doc.head.appendChild(style)
}

export function postPageGuidesToIframe(iframe, enabled) {
  iframe?.contentWindow?.postMessage({ type: WK_SET_PAGE_GUIDES, enabled: Boolean(enabled) }, '*')
}

export function applyPageGuidesInIframe(iframe, enabled) {
  const doc = iframe?.contentDocument
  const applied = syncPageGuidesInDocument(doc, enabled)
  if (!applied) {
    postPageGuidesToIframe(iframe, enabled)
  }
}

export function buildPageGuidesBootScript(chromeCss) {
  const chromeCssJson = JSON.stringify(chromeCss)

  return `
(function () {
  const GUIDE_PAGE_OUTLINE = ${JSON.stringify(GUIDE_PAGE_OUTLINE)};
  const GUIDE_PAGE_OUTLINE_OFFSET = ${JSON.stringify(GUIDE_PAGE_OUTLINE_OFFSET)};
  const GUIDE_SHEET_SHADOW = ${JSON.stringify(GUIDE_SHEET_SHADOW)};
  const GUIDE_AREA_SHADOW = ${JSON.stringify(GUIDE_AREA_SHADOW)};
  const GUIDE_MARGIN_BG = ${JSON.stringify(GUIDE_MARGIN_BG)};
  const chromeCss = ${chromeCssJson};

  function wkEnsureChrome() {
    let style = document.querySelector('style[data-wk-compile-chrome]');
    if (!style) {
      style = document.createElement('style');
      style.media = 'screen';
      style.dataset.wkCompileChrome = 'true';
      style.setAttribute('data-pagedjs-ignore', 'true');
      style.textContent = chromeCss;
      document.head.appendChild(style);
      return;
    }
    document.head.appendChild(style);
  }

  function wkApplyPageGuides(enabled) {
    document.documentElement.classList.toggle('wk-page-guides', enabled);
    document.documentElement.dataset.showPageGuides = enabled ? 'true' : 'false';

    document.querySelectorAll('.pagedjs_page').forEach((page) => {
      if (enabled) {
        page.style.setProperty('outline', GUIDE_PAGE_OUTLINE, 'important');
        page.style.setProperty('outline-offset', GUIDE_PAGE_OUTLINE_OFFSET, 'important');
      } else {
        page.style.removeProperty('outline');
        page.style.removeProperty('outline-offset');
      }
    });

    document.querySelectorAll('.pagedjs_sheet').forEach((sheet) => {
      if (enabled) {
        sheet.style.setProperty('box-shadow', GUIDE_SHEET_SHADOW, 'important');
      } else {
        sheet.style.removeProperty('box-shadow');
      }
    });

    document.querySelectorAll('.pagedjs_area').forEach((area) => {
      if (enabled) {
        area.style.setProperty('box-shadow', GUIDE_AREA_SHADOW, 'important');
      } else {
        area.style.removeProperty('box-shadow');
      }
    });

    document.querySelectorAll('.pagedjs_margin').forEach((margin) => {
      if (enabled) {
        margin.style.setProperty('background', GUIDE_MARGIN_BG, 'important');
      } else {
        margin.style.removeProperty('background');
      }
    });
  }

  if (!window.__wkGuidesListener) {
    window.__wkGuidesListener = true;
    window.addEventListener('message', (event) => {
      if (event.data && event.data.type === ${JSON.stringify(WK_SET_PAGE_GUIDES)}) {
        wkApplyPageGuides(Boolean(event.data.enabled));
      }
    });
  }

  if (!window.__wkPrintGuideListener) {
    window.__wkPrintGuideListener = true;
    window.addEventListener('beforeprint', () => {
      window.__wkGuidesWereEnabled = document.documentElement.dataset.showPageGuides === 'true';
      wkApplyPageGuides(false);
    });
    window.addEventListener('afterprint', () => {
      if (window.__wkGuidesWereEnabled) {
        wkApplyPageGuides(true);
      }
    });
  }

  window.__wkApplyPageGuides = wkApplyPageGuides;
  window.__wkEnsureChrome = wkEnsureChrome;
})();
`
}
