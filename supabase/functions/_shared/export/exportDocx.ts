import {
  AlignmentType,
  BorderStyle,
  Document,
  ExternalHyperlink,
  HeadingLevel,
  ImageRun,
  Packer,
  PageBreak,
  Paragraph,
  TextRun,
  UnderlineType,
} from 'npm:docx@9.5.1'
import { formatAuthorLine } from './formatAuthor.ts'
import type { ExportImageBundle } from './resolveExportImages.ts'
import type { ContentBlock, ExportOptions, InlineSpan, ManuscriptModel } from './types.ts'

const DOCX_CONTENT_WIDTH_PX = 468
const DEFAULT_BODY_FONT = 'Courier Prime'
const DEFAULT_BODY_SIZE_HALF_POINTS = 22 // 11pt

function docxFontName(fontFamily?: string): string {
  if (!fontFamily) return DEFAULT_BODY_FONT
  const primary = fontFamily.split(',')[0].trim().replace(/^["']|["']$/g, '')
  return primary || DEFAULT_BODY_FONT
}

function pxToDocxSize(px: number): number {
  return Math.round(px * 0.75 * 2)
}

function alignmentFromTextAlign(textAlign?: string): (typeof AlignmentType)[keyof typeof AlignmentType] | undefined {
  if (textAlign === 'center') return AlignmentType.CENTER
  if (textAlign === 'right') return AlignmentType.RIGHT
  if (textAlign === 'justify') return AlignmentType.JUSTIFIED
  return undefined
}

function imageAlignment(display?: string): (typeof AlignmentType)[keyof typeof AlignmentType] {
  if (display === 'float-left') return AlignmentType.LEFT
  if (display === 'float-right') return AlignmentType.RIGHT
  return AlignmentType.CENTER
}

function imageWidthPx(blockWidth: number | null | undefined, display?: string): number {
  if (display === 'full') return DOCX_CONTENT_WIDTH_PX
  if (typeof blockWidth === 'number' && blockWidth > 0) {
    return Math.min(Math.round((blockWidth / 100) * DOCX_CONTENT_WIDTH_PX), DOCX_CONTENT_WIDTH_PX)
  }
  return DOCX_CONTENT_WIDTH_PX
}

function parseDataUrl(dataUrl: string): { bytes: Uint8Array; type: 'png' | 'jpg' | 'gif' | 'bmp' } | null {
  const match = dataUrl.match(/^data:([^;]+);base64,(.+)$/i)
  if (!match) return null

  const mime = match[1].toLowerCase()
  const bytes = Uint8Array.from(atob(match[2]), (char) => char.charCodeAt(0))

  if (mime.includes('png')) return { bytes, type: 'png' }
  if (mime.includes('jpeg') || mime.includes('jpg')) return { bytes, type: 'jpg' }
  if (mime.includes('gif')) return { bytes, type: 'gif' }
  if (mime.includes('bmp')) return { bytes, type: 'bmp' }
  return { bytes, type: 'png' }
}

function spanRunProps(span: InlineSpan): Record<string, unknown> {
  const props: Record<string, unknown> = {
    font: docxFontName(span.fontFamily),
    size: span.fontSize ? pxToDocxSize(span.fontSize) : DEFAULT_BODY_SIZE_HALF_POINTS,
  }
  if (span.marks.includes('bold')) props.bold = true
  if (span.marks.includes('italic')) props.italics = true
  if (span.marks.includes('underline')) {
    props.underline = { type: UnderlineType.SINGLE }
  }
  return props
}

function spansToParagraphChildren(spans: InlineSpan[]): Array<TextRun | ExternalHyperlink> {
  const children: Array<TextRun | ExternalHyperlink> = []

  for (const span of spans) {
    if (!span.text) continue

    const parts = span.text.split('\n')
    for (let i = 0; i < parts.length; i += 1) {
      const part = parts[i]
      if (part) {
        const runProps = spanRunProps(span)
        if (span.marks.includes('link') && span.href) {
          children.push(
            new ExternalHyperlink({
              children: [
                new TextRun({
                  text: part,
                  style: 'Hyperlink',
                  ...runProps,
                }),
              ],
              link: span.href,
            }),
          )
        } else {
          children.push(new TextRun({ text: part, ...runProps }))
        }
      }
      if (i < parts.length - 1) {
        children.push(new TextRun({ break: 1 }))
      }
    }
  }

  return children
}

function buildImageParagraph(
  dataUrl: string,
  widthPx: number,
  alignment: (typeof AlignmentType)[keyof typeof AlignmentType],
): Paragraph | null {
  const parsed = parseDataUrl(dataUrl)
  if (!parsed) return null

  const heightPx = Math.round(widthPx * 0.66)

  return new Paragraph({
    alignment,
    spacing: { before: 200, after: 200 },
    children: [
      new ImageRun({
        type: parsed.type,
        data: parsed.bytes,
        transformation: {
          width: widthPx,
          height: heightPx,
        },
      }),
    ],
  })
}

function blockToParagraphs(block: ContentBlock, images: ExportImageBundle): Paragraph[] {
  switch (block.type) {
    case 'paragraph': {
      const children = spansToParagraphChildren(block.spans)
      if (!children.length) return []
      return [
        new Paragraph({
          alignment: alignmentFromTextAlign(block.textAlign),
          spacing: { after: 160 },
          children,
        }),
      ]
    }
    case 'heading': {
      const children = spansToParagraphChildren(block.spans)
      if (!children.length) return []
      return [
        new Paragraph({
          heading: block.level <= 2 ? HeadingLevel.HEADING_2 : HeadingLevel.HEADING_3,
          spacing: { before: 240, after: 160 },
          children,
        }),
      ]
    }
    case 'divider':
      return [
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 280, after: 280 },
          border: {
            bottom: {
              color: '938938',
              space: 1,
              style: BorderStyle.SINGLE,
              size: 6,
            },
          },
          children: [new TextRun({ text: '' })],
        }),
      ]
    case 'image': {
      if (!block.imageKey) return []
      const resolved = images.sceneImages.get(block.imageKey)
      if (!resolved) return []
      const paragraph = buildImageParagraph(
        resolved.dataUrl,
        imageWidthPx(block.width, block.display),
        imageAlignment(block.display),
      )
      return paragraph ? [paragraph] : []
    }
    default:
      return []
  }
}

function pageBreakParagraph(): Paragraph {
  return new Paragraph({ children: [new PageBreak()] })
}

function buildCoverParagraphs(cover: ExportImageBundle['cover']): Paragraph[] {
  if (!cover) return []
  const paragraph = buildImageParagraph(cover.dataUrl, DOCX_CONTENT_WIDTH_PX, AlignmentType.CENTER)
  if (!paragraph) return []
  return [paragraph, pageBreakParagraph()]
}

function buildTitlePageParagraphs(model: ManuscriptModel, options: ExportOptions): Paragraph[] {
  if (!options.titlePage) return []

  const paragraphs: Paragraph[] = [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 2400 },
      children: [
        new TextRun({
          text: model.title,
          font: 'Calibri',
          size: 48,
          bold: true,
        }),
      ],
    }),
  ]

  if (options.includeSubtitle && model.subtitle?.trim()) {
    paragraphs.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 200, after: 200 },
        children: [
          new TextRun({
            text: model.subtitle.trim(),
            font: 'Calibri',
            size: 28,
            italics: true,
          }),
        ],
      }),
    )
  }

  const authorLine = formatAuthorLine(model.author)
  if (authorLine) {
    paragraphs.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 200 },
        children: [
          new TextRun({
            text: authorLine,
            font: 'Calibri',
            size: 24,
          }),
        ],
      }),
    )
  }

  paragraphs.push(pageBreakParagraph())
  return paragraphs
}

export async function exportDocx(
  model: ManuscriptModel,
  options: ExportOptions,
  images: ExportImageBundle,
): Promise<Uint8Array> {
  const children: Paragraph[] = [
    ...buildCoverParagraphs(images.cover),
    ...buildTitlePageParagraphs(model, options),
  ]

  model.chapters.forEach((chapter, chapterIndex) => {
    if (chapterIndex > 0 && options.chapterPageBreak) {
      children.push(pageBreakParagraph())
    }

    if (chapter.heading) {
      children.push(
        new Paragraph({
          heading: HeadingLevel.HEADING_1,
          spacing: { before: chapterIndex === 0 ? 0 : 240, after: 240 },
          children: [
            new TextRun({
              text: chapter.heading,
              font: 'Calibri',
              size: 32,
              bold: true,
            }),
          ],
        }),
      )
    }

    chapter.scenes.forEach((scene, sceneIndex) => {
      if (sceneIndex > 0) {
        children.push(new Paragraph({ spacing: { after: 120 }, children: [new TextRun({ text: '' })] }))
      }

      for (const block of scene.blocks) {
        children.push(...blockToParagraphs(block, images))
      }
    })
  })

  const doc = new Document({
    sections: [{ children }],
  })

  const buffer = await Packer.toBuffer(doc)
  return buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer)
}
