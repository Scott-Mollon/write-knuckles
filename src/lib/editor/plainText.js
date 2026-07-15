import { generateText } from '@tiptap/core'
import { createEditorExtensions } from './extensions'
import { TALE_TYPES } from '../../constants/taleTypes'

/** Include comic nodes so generateText can read either tale type. */
const extensions = createEditorExtensions('', { taleType: TALE_TYPES.COMIC })

const EMPTY_DOC = { type: 'doc', content: [] }

export function emptySceneContent() {
  return EMPTY_DOC
}

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

export function isSceneContentEmpty(content) {
  return contentToPlainText(normalizeContent(content)).trim().length === 0
}

export function normalizeContentForSave(content) {
  if (isSceneContentEmpty(content)) return EMPTY_DOC
  return normalizeContent(content)
}
