import { tiptapToHtml } from './tiptapToHtml.js'

function injectImageSources(html, sceneImages) {
  return html.replace(/<img\b([^>]*)>/gi, (match, attrs) => {
    const keyMatch = attrs.match(/\bdata-image-key="([^"]*)"/)
    const key = keyMatch?.[1]
    if (!key) return match

    const resolved = sceneImages.get(key)
    if (!resolved) return ''

    const withoutSrc = attrs.replace(/\bsrc="[^"]*"/gi, '').trim()
    return `<img ${withoutSrc} src="${resolved.dataUrl}">`
  })
}

export function sceneContentToHtml(content, images) {
  const html = tiptapToHtml(content)
  return injectImageSources(html, images.sceneImages)
}
