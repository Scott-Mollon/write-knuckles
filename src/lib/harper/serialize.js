import { SuggestionKind } from 'harper.js'

let lintIdCounter = 0

export function serializeHarperLint(lint) {
  const span = lint.span()
  let spanStart
  let spanEnd
  try {
    spanStart = span.start
    spanEnd = span.end
  } finally {
    try {
      span.free?.()
    } catch {
      // already freed
    }
  }

  const lintKind = lint.lint_kind() || 'Miscellaneous'
  const rawSuggestions = lint.suggestions() || []
  const suggestions = rawSuggestions.map((suggestion) => {
    try {
      return {
        kind: suggestion.kind(),
        replacementText: suggestion.get_replacement_text() || '',
        json: suggestion.to_json(),
      }
    } finally {
      try {
        suggestion.free?.()
      } catch {
        // already freed
      }
    }
  })

  lintIdCounter += 1

  return {
    id: `harper-${lintIdCounter}`,
    lintJson: lint.to_json(),
    message: lint.message() || '',
    lintKind,
    isSpelling: lintKind === 'Spelling' || lintKind === 'Typo',
    problemText: lint.get_problem_text() || '',
    spanStart,
    spanEnd,
    suggestions,
  }
}

export function isSpellingKind(lintKind) {
  return lintKind === 'Spelling' || lintKind === 'Typo'
}

/**
 * Apply a serialized suggestion at PM positions { from, to }.
 */
export function applySerializedSuggestion(editor, from, to, suggestion) {
  if (!editor || from == null || to == null) return false

  const kind = suggestion?.kind
  const text = suggestion?.replacementText ?? ''

  if (kind === SuggestionKind.Remove || kind === 1) {
    return editor.chain().focus().deleteRange({ from, to }).run()
  }

  if (kind === SuggestionKind.InsertAfter || kind === 2) {
    return editor.chain().focus().insertContentAt(to, text).run()
  }

  // Replace (default)
  return editor
    .chain()
    .focus()
    .insertContentAt({ from, to }, text || '')
    .run()
}
