import type { ExportImageBundle } from './resolveExportImages.ts'
import { tiptapToHtml } from './tiptapToHtml.ts'
import type { ResolvedImage } from './types.ts'

function injectImageSources(html: string, sceneImages: Map<string, ResolvedImage>): string {
  return html.replace(/<img\b([^>]*)>/gi, (match, attrs: string) => {
    const keyMatch = attrs.match(/\bdata-image-key="([^"]*)"/)
    const key = keyMatch?.[1]
    if (!key) return match

    const resolved = sceneImages.get(key)
    if (!resolved) return ''

    const withoutSrc = attrs.replace(/\bsrc="[^"]*"/gi, '').trim()
    return `<img ${withoutSrc} src="${resolved.dataUrl}">`
  })
}

export function sceneContentToHtml(content: unknown, images: ExportImageBundle): string {
  const html = tiptapToHtml(content)
  return injectImageSources(html, images.sceneImages)
}
