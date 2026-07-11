import type { ExportFormat, ExportOptions } from './types.ts'

type TipTapDoc = {
  type?: string
  content?: TipTapNode[]
}

type TipTapNode = {
  type?: string
  attrs?: Record<string, unknown>
  content?: TipTapNode[]
  text?: string
  marks?: unknown[]
}

function plainTextDoc(text: string): TipTapDoc {
  return {
    type: 'doc',
    content: [{ type: 'paragraph', content: [{ type: 'text', text }] }],
  }
}

function stripSceneImages(doc: TipTapDoc): TipTapDoc {
  if (!Array.isArray(doc.content)) return doc

  return {
    ...doc,
    content: doc.content.filter((node) => node.type !== 'sceneImage'),
  }
}

export function prepareSceneContent(
  content: unknown,
  plainText: string | null | undefined,
  format: ExportFormat,
  options: ExportOptions,
): TipTapDoc {
  let doc: TipTapDoc | null = null

  if (content && typeof content === 'object' && (content as TipTapDoc).type === 'doc') {
    doc = structuredClone(content) as TipTapDoc
  } else if (plainText?.trim()) {
    doc = plainTextDoc(plainText.trim())
  } else {
    doc = { type: 'doc', content: [] }
  }

  if (
    (format === 'pdf' || format === 'docx' || format === 'html') &&
    !options.includeImages
  ) {
    doc = stripSceneImages(doc)
  }

  return doc
}
