import Paragraph from '@tiptap/extension-paragraph'
import { TextSelection } from '@tiptap/pm/state'
import {
  DEFAULT_SCRIPT_STYLE_PREFERENCES,
  SCRIPT_ROLES,
  SCRIPT_ROLE_PLACEHOLDERS,
} from './scriptStyles'

const SCRIPT_ROLE_VALUES = new Set(Object.values(SCRIPT_ROLES))

function selectCurrentParagraphText({ state, tr, dispatch }) {
  const { $from } = state.selection
  if ($from.parent.type.name !== 'paragraph') return false
  const start = $from.start()
  const end = $from.end()
  if (start >= end) return false
  if (dispatch) {
    dispatch(tr.setSelection(TextSelection.create(tr.doc, start, end)))
  }
  return true
}

function attrsForScriptRole(role) {
  const defaults = DEFAULT_SCRIPT_STYLE_PREFERENCES[role] || {}
  const attrs = { scriptRole: role, dropCap: false }
  if (defaults.textAlign) attrs.textAlign = defaults.textAlign
  return attrs
}

function paragraphWithRole(role, text) {
  return {
    type: 'paragraph',
    attrs: attrsForScriptRole(role),
    content: text ? [{ type: 'text', text }] : [],
  }
}

export const DropCapParagraph = Paragraph.extend({
  name: 'paragraph',

  addAttributes() {
    return {
      ...this.parent?.(),
      dropCap: {
        default: false,
        parseHTML: (element) => element.classList.contains('dropcap'),
        renderHTML: (attributes) => {
          if (!attributes.dropCap) return {}
          return { class: 'dropcap' }
        },
      },
      scriptRole: {
        default: null,
        parseHTML: (element) => {
          const role = element.getAttribute('data-script-role')
          return SCRIPT_ROLE_VALUES.has(role) ? role : null
        },
        renderHTML: (attributes) => {
          if (!attributes.scriptRole) return {}
          return {
            'data-script-role': attributes.scriptRole,
            class: `script-role script-role--${attributes.scriptRole}`,
          }
        },
      },
    }
  },

  addCommands() {
    return {
      ...this.parent?.(),
      toggleDropCap:
        () =>
        ({ editor, commands }) => {
          if (!editor.isActive('paragraph')) return false
          const { dropCap } = editor.getAttributes('paragraph')
          return commands.updateAttributes('paragraph', { dropCap: !dropCap })
        },
      /**
       * Insert (or fill an empty paragraph with) a script line + placeholder text,
       * then select the placeholder so the writer can type over it immediately.
       */
      setScriptRole:
        (role) =>
        ({ editor, chain, state }) => {
          const next = SCRIPT_ROLE_VALUES.has(role) ? role : null
          if (!next) {
            return chain()
              .focus()
              .updateAttributes('paragraph', { scriptRole: null })
              .run()
          }

          const placeholder = SCRIPT_ROLE_PLACEHOLDERS[next] || ''
          const $from = state.selection.$from
          const inEmptyParagraph =
            editor.isActive('paragraph') &&
            $from.parent.type.name === 'paragraph' &&
            $from.parent.content.size === 0

          if (inEmptyParagraph) {
            return chain()
              .focus()
              .updateAttributes('paragraph', attrsForScriptRole(next))
              .insertContent(placeholder)
              .command(selectCurrentParagraphText)
              .run()
          }

          return chain()
            .focus()
            .insertContent(paragraphWithRole(next, placeholder))
            .command(selectCurrentParagraphText)
            .run()
        },
      clearScriptRole:
        () =>
        ({ commands }) =>
          commands.updateAttributes('paragraph', { scriptRole: null }),
    }
  },
})
