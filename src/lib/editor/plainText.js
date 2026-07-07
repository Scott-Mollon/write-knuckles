import { generateText } from '@tiptap/core'
import { createEditorExtensions } from './extensions'

const extensions = createEditorExtensions()

const EMPTY_DOC = { type: 'doc', content: [] }

export function contentToPlainText(content) {
  if (!content) return ''
  try {
    return generateText(content, extensions)
  } catch {
    return ''
  }
}

export function countWords(text) {
  if (!text?.trim()) return 0
  return text.trim().split(/\s+/).length
}

export function normalizeContent(content) {
  if (!content || content.type !== 'doc') return EMPTY_DOC
  return content
}
