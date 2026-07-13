import { SCENE_GOOGLE_FONTS_CSS_URL } from '../../constants/sceneFonts.js'
import { buildPageMarginRule, buildPageSizeRule, normalizePageLayout } from './pageLayout.js'

export function compileHtmlStyles(pageLayoutInput) {
  const pageLayout = normalizePageLayout(pageLayoutInput)
  const pageSizeRule = buildPageSizeRule(pageLayout)
  const pageMargin = buildPageMarginRule(pageLayout)

  return `
:root {
  --export-bg: #f4efe4;
  --export-text: #1a1410;
  --export-text-subtle: rgba(26, 20, 16, 0.7);
  --export-accent: #726a2b;
  --export-divider: #938938;
  --export-mark-bg: rgba(147, 137, 56, 0.25);
  --compile-page-size: ${pageSizeRule};
  --compile-page-margin: ${pageMargin};
}

@page {
  size: ${pageSizeRule};
  margin: ${pageMargin};
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  background: var(--export-bg);
  color: var(--export-text);
  font-family: Georgia, 'Times New Roman', serif;
  font-size: 11pt;
  line-height: 1.55;
}

.manuscript-export {
  max-width: 42rem;
  margin: 0 auto;
  padding: 2.5rem 1.5rem 4rem;
}

.export-cover {
  text-align: center;
  margin-bottom: 2.5rem;
  page-break-after: always;
  break-after: page;
}

.export-cover img {
  max-width: 100%;
  height: auto;
  border-radius: 2px;
}

.export-title-page {
  text-align: center;
  padding: 4rem 1rem 5rem;
  page-break-after: always;
  break-after: page;
  min-height: 0;
}

.export-title-page h1 {
  font-family: Oswald, sans-serif;
  font-size: 2rem;
  font-weight: 600;
  margin: 0 0 0.75rem;
  color: var(--export-accent);
}

.export-title-page .export-subtitle {
  font-size: 1.1rem;
  font-style: italic;
  color: var(--export-text-subtle);
  margin: 0 0 0.75rem;
}

.export-title-page .export-author {
  font-size: 1rem;
  margin: 0;
}

.export-chapter {
  margin-top: 2rem;
}

.export-chapter.export-chapter-break {
  break-before: page;
  page-break-before: always;
}

.export-chapter-heading {
  font-family: Oswald, sans-serif;
  font-size: 1.35rem;
  font-weight: 600;
  color: var(--export-accent);
  margin: 0 0 1.25rem;
}

.scene-editor-prose {
  color: var(--export-text);
}

.scene-editor-prose p {
  margin: 0 0 1em;
}

.scene-editor-prose p:last-child {
  margin-bottom: 0;
}

.scene-editor-prose p.dropcap::first-letter {
  float: left;
  font-family: Oswald, sans-serif;
  font-size: 3.5em;
  font-weight: 600;
  line-height: 0.75;
  margin: 0.04em 0.12em 0 0;
  color: var(--export-accent);
}

.scene-editor-prose .scene-divider {
  border: none;
  border-top: 1px solid var(--export-divider);
  width: 50%;
  margin: 1.75em auto;
  opacity: 0.6;
}

.scene-editor-prose h2 {
  font-family: Oswald, sans-serif;
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--export-accent);
  margin: 1.5em 0 0.5em;
}

.scene-editor-prose h3 {
  font-family: Oswald, sans-serif;
  font-size: 1.1rem;
  font-weight: 500;
  color: var(--export-text);
  margin: 1.25em 0 0.5em;
}

.scene-editor-prose blockquote {
  border-left: 3px solid var(--export-divider);
  margin: 1em 0;
  padding-left: 1em;
  color: var(--export-text-subtle);
  font-style: italic;
}

.scene-editor-prose mark {
  background-color: var(--export-mark-bg);
  color: inherit;
  border-radius: 2px;
  padding: 0 2px;
}

.scene-editor-prose a {
  color: var(--export-accent);
  text-decoration: underline;
}

.scene-editor-prose .scene-image {
  margin: 1em 0;
  line-height: 0;
  break-inside: avoid;
  page-break-inside: avoid;
}

.scene-editor-prose .scene-image--block {
  display: block;
  text-align: center;
}

.scene-editor-prose .scene-image--block .scene-image__frame {
  display: inline-block;
  max-width: 100%;
}

.scene-editor-prose .scene-image--float-left {
  float: left;
  margin: 0.25em 1em 0.5em 0;
  max-width: 45%;
}

.scene-editor-prose .scene-image--float-right {
  float: right;
  margin: 0.25em 0 0.5em 1em;
  max-width: 45%;
}

.scene-editor-prose .scene-image--full {
  margin-left: -1.5rem;
  margin-right: -1.5rem;
  width: calc(100% + 3rem);
  max-width: none;
}

.scene-editor-prose .scene-image--full .scene-image__img {
  width: 100%;
  height: auto;
}

.scene-editor-prose .scene-image__img {
  border-radius: 2px;
  width: 100%;
  height: auto;
}

.scene-editor-prose .scene-image__frame {
  position: relative;
  line-height: 0;
}

.scene-editor-prose::after {
  content: '';
  display: table;
  clear: both;
}

@media print {
  body {
    background: #fff;
  }

  .manuscript-export {
    max-width: none;
    padding: 0;
  }

  .pagedjs_page,
  .pagedjs_sheet,
  .pagedjs_area,
  .pagedjs_pagebox {
    outline: none !important;
    box-shadow: none !important;
    border: none !important;
    background: transparent !important;
  }

  .export-title-page {
    page-break-after: always;
    break-after: page;
  }

  .export-cover {
    page-break-after: always;
    break-after: page;
  }

  .export-chapter.export-chapter-break {
    break-before: page;
    page-break-before: always;
  }
}
`
}

/** Screen-only Paged.js chrome; separate tag with media="screen" so Paged.js does not remove it. */
export function compilePageChromeStyles() {
  return `
html,
body {
  background: #e5dfd3;
}

.manuscript-export {
  max-width: none;
  padding: 0;
  margin: 0;
}

.pagedjs_pages {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  align-items: center;
  padding: 2rem 0 3rem;
}

.pagedjs_page {
  background: #faf8f4;
  box-shadow:
    0 0 0 1px rgba(26, 20, 16, 0.08),
    0 14px 32px rgba(0, 0, 0, 0.38);
}

.pagedjs_sheet {
  background: #faf8f4;
}

html.wk-page-guides .pagedjs_page {
  box-shadow:
    0 0 0 2px rgba(147, 137, 56, 0.35),
    0 0 0 5px rgba(147, 137, 56, 0.08),
    0 14px 32px rgba(0, 0, 0, 0.38);
}

html.wk-page-guides .pagedjs_sheet {
  border: 1px solid rgba(147, 137, 56, 0.14);
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.65);
}

html.wk-page-guides .pagedjs_pagebox {
  background:
    linear-gradient(rgba(147, 137, 56, 0.03), rgba(147, 137, 56, 0.03)),
    #faf8f4;
}

html.wk-page-guides .pagedjs_area {
  box-shadow: inset 0 0 0 1px rgba(147, 137, 56, 0.28);
}

html.wk-page-guides .pagedjs_margin {
  color: rgba(147, 137, 56, 0.12);
}
`
}

export const COMPILE_HTML_FONT_LINK = SCENE_GOOGLE_FONTS_CSS_URL
