import pdfMake from 'npm:pdfmake/build/pdfmake.js'
import pdfFonts from 'npm:pdfmake/build/vfs_fonts.js'
import type { Content, TDocumentDefinitions } from 'npm:pdfmake/interfaces'
import type { ExportImageBundle } from './resolveExportImages.ts'
import { formatAuthorLine } from './formatAuthor.ts'
import type { ContentBlock, ExportOptions, InlineSpan, ManuscriptModel } from './types.ts'

// pdfmake ships Roboto in vfs_fonts
const vfs = (pdfFonts as { pdfMake?: { vfs: Record<string, string> }; vfs?: Record<string, string> })
  .pdfMake?.vfs ?? (pdfFonts as { vfs: Record<string, string> }).vfs
pdfMake.vfs = vfs

const PAGE_WIDTH = 612
const PAGE_MARGINS: [number, number, number, number] = [72, 72, 72, 72]
const CONTENT_WIDTH = PAGE_WIDTH - PAGE_MARGINS[0] - PAGE_MARGINS[2]

function spanToPdfText(span: InlineSpan): Record<string, unknown> {
  const item: Record<string, unknown> = { text: span.text }
  if (span.marks.includes('bold')) item.bold = true
  if (span.marks.includes('italic')) item.italics = true
  if (span.marks.includes('underline')) item.decoration = 'underline'
  if (span.marks.includes('link') && span.href) item.link = span.href
  return item
}

function spansToPdfText(spans: InlineSpan[]): string | Array<Record<string, unknown>> {
  const filtered = spans.filter((span) => span.text.length > 0)
  if (filtered.length === 0) return ''
  if (filtered.length === 1 && filtered[0].marks.length === 0 && !filtered[0].href) {
    return filtered[0].text
  }
  return filtered.map(spanToPdfText)
}

function alignmentFromTextAlign(textAlign?: string): 'left' | 'center' | 'right' | 'justify' | undefined {
  if (textAlign === 'center' || textAlign === 'right' || textAlign === 'left' || textAlign === 'justify') {
    return textAlign
  }
  return undefined
}

function imageAlignment(display?: string): 'left' | 'center' | 'right' {
  if (display === 'float-left') return 'left'
  if (display === 'float-right') return 'right'
  return 'center'
}

function imageWidth(blockWidth: number | null | undefined, display?: string): number {
  if (display === 'full') return CONTENT_WIDTH
  if (typeof blockWidth === 'number' && blockWidth > 0) {
    return Math.min((blockWidth / 100) * CONTENT_WIDTH, CONTENT_WIDTH)
  }
  return CONTENT_WIDTH
}

function blockToPdfContent(
  block: ContentBlock,
  images: ExportImageBundle,
): Content | Content[] | null {
  switch (block.type) {
    case 'paragraph': {
      const text = spansToPdfText(block.spans)
      if (!text || (typeof text === 'string' && !text.trim())) return null
      return {
        text,
        alignment: alignmentFromTextAlign(block.textAlign),
        margin: [0, 0, 0, 10] as [number, number, number, number],
      }
    }
    case 'heading': {
      const text = spansToPdfText(block.spans)
      if (!text || (typeof text === 'string' && !text.trim())) return null
      return {
        text,
        fontSize: block.level <= 2 ? 14 : 12,
        bold: true,
        margin: [0, 12, 0, 10] as [number, number, number, number],
      }
    }
    case 'divider':
      return {
        canvas: [
          {
            type: 'line',
            x1: 0,
            y1: 0,
            x2: CONTENT_WIDTH,
            y2: 0,
            lineWidth: 0.5,
          },
        ],
        margin: [0, 12, 0, 12] as [number, number, number, number],
      }
    case 'image': {
      if (!block.imageKey) return null
      const resolved = images.sceneImages.get(block.imageKey)
      if (!resolved) return null
      return {
        image: resolved.dataUrl,
        width: imageWidth(block.width, block.display),
        alignment: imageAlignment(block.display),
        margin: [0, 12, 0, 12] as [number, number, number, number],
      }
    }
    default:
      return null
  }
}

function buildTitlePage(model: ManuscriptModel, options: ExportOptions): Content[] {
  const items: Content[] = []

  if (options.titlePage) {
    items.push({
      text: model.title,
      fontSize: 24,
      bold: true,
      alignment: 'center',
      margin: [0, 120, 0, 12] as [number, number, number, number],
    })

    if (options.includeSubtitle && model.subtitle?.trim()) {
      items.push({
        text: model.subtitle.trim(),
        fontSize: 14,
        italics: true,
        alignment: 'center',
        margin: [0, 0, 0, 12] as [number, number, number, number],
      })
    }

    const authorLine = formatAuthorLine(model.author)
    if (authorLine) {
      items.push({
        text: authorLine,
        fontSize: 12,
        alignment: 'center',
        margin: [0, 0, 0, 0] as [number, number, number, number],
      })
    }

    items.push({ text: '', pageBreak: 'after' })
  }

  return items
}

function buildCoverPage(cover: ExportImageBundle['cover']): Content[] {
  if (!cover) return []

  return [
    {
      image: cover.dataUrl,
      width: CONTENT_WIDTH,
      alignment: 'center',
      margin: [0, 48, 0, 0] as [number, number, number, number],
    },
    { text: '', pageBreak: 'after' },
  ]
}

export function buildPdfDefinition(
  model: ManuscriptModel,
  options: ExportOptions,
  images: ExportImageBundle,
): TDocumentDefinitions {
  const content: Content[] = [
    ...buildCoverPage(images.cover),
    ...buildTitlePage(model, options),
  ]

  model.chapters.forEach((chapter, chapterIndex) => {
    if (chapterIndex > 0 && options.chapterPageBreak) {
      content.push({ text: '', pageBreak: 'before' })
    }

    if (chapter.heading) {
      content.push({
        text: chapter.heading,
        fontSize: 16,
        bold: true,
        margin: [0, chapterIndex === 0 ? 0 : 12, 0, 12] as [number, number, number, number],
      })
    }

    chapter.scenes.forEach((scene, sceneIndex) => {
      if (sceneIndex > 0) {
        content.push({ text: '', margin: [0, 0, 0, 8] as [number, number, number, number] })
      }

      for (const block of scene.blocks) {
        const pdfBlock = blockToPdfContent(block, images)
        if (!pdfBlock) continue
        if (Array.isArray(pdfBlock)) {
          content.push(...pdfBlock)
        } else {
          content.push(pdfBlock)
        }
      }
    })
  })

  return {
    pageSize: 'LETTER',
    pageMargins: PAGE_MARGINS,
    defaultStyle: {
      font: 'Roboto',
      fontSize: 11,
      lineHeight: 1.3,
    },
    content,
  }
}

export async function exportPdf(
  model: ManuscriptModel,
  options: ExportOptions,
  images: ExportImageBundle,
): Promise<Uint8Array> {
  const doc = buildPdfDefinition(model, options, images)
  const pdf = pdfMake.createPdf(doc)
  const buffer = await pdf.getBuffer()
  return new Uint8Array(buffer)
}
