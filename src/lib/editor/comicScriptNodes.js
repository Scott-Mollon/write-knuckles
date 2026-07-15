import { Extension } from '@tiptap/core'
import { Plugin, PluginKey, TextSelection } from '@tiptap/pm/state'
import {
  countScriptPanelsInPmDoc,
  panelLineLabel,
  renumberAutoPanelLines,
} from './comicScriptNumbering'
import { SCRIPT_ROLE_PLACEHOLDERS, SCRIPT_ROLES } from './scriptStyles'

const comicPanelRenumberKey = new PluginKey('comicPanelRenumber')

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

/**
 * Comic script helpers: Panel N insert + renumber, SFX + content insert.
 */
export const ComicScriptPanels = Extension.create({
  name: 'comicScriptPanels',

  addCommands() {
    return {
      insertComicPanel:
        () =>
        ({ editor, chain, state }) => {
          // Selection → restyle only (same rule as setScriptRole).
          if (!state.selection.empty) {
            return editor.commands.setScriptRole(SCRIPT_ROLES.PANEL)
          }

          const next = countScriptPanelsInPmDoc(state.doc) + 1
          const label = panelLineLabel(next)
          const desc = SCRIPT_ROLE_PLACEHOLDERS[SCRIPT_ROLES.PANEL_DESCRIPTION]

          const content = [
            {
              type: 'paragraph',
              attrs: { scriptRole: SCRIPT_ROLES.PANEL, dropCap: false },
              content: [{ type: 'text', text: label }],
            },
            {
              type: 'paragraph',
              attrs: { scriptRole: SCRIPT_ROLES.PANEL_DESCRIPTION, dropCap: false },
              content: [{ type: 'text', text: desc }],
            },
          ]

          return chain().focus().insertContent(content).command(selectCurrentParagraphText).run()
        },
      insertComicSfx:
        () =>
        ({ editor, chain, state }) => {
          if (!state.selection.empty) {
            return editor.commands.setScriptRole(SCRIPT_ROLES.SFX_CONTENT)
          }

          const indicator = SCRIPT_ROLE_PLACEHOLDERS[SCRIPT_ROLES.SFX]
          const boom = SCRIPT_ROLE_PLACEHOLDERS[SCRIPT_ROLES.SFX_CONTENT]

          const content = [
            {
              type: 'paragraph',
              attrs: {
                scriptRole: SCRIPT_ROLES.SFX,
                dropCap: false,
                textAlign: 'center',
              },
              content: [{ type: 'text', text: indicator }],
            },
            {
              type: 'paragraph',
              attrs: {
                scriptRole: SCRIPT_ROLES.SFX_CONTENT,
                dropCap: false,
                textAlign: 'center',
              },
              content: [{ type: 'text', text: boom }],
            },
          ]

          return chain().focus().insertContent(content).command(selectCurrentParagraphText).run()
        },
    }
  },

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: comicPanelRenumberKey,
        appendTransaction(transactions, _oldState, newState) {
          if (!transactions.some((tr) => tr.docChanged)) return null
          // Avoid reacting to our own renumber pass
          if (transactions.some((tr) => tr.getMeta(comicPanelRenumberKey))) return null

          const tr = newState.tr
          const modified = renumberAutoPanelLines(tr, newState.doc)
          if (!modified) return null
          tr.setMeta(comicPanelRenumberKey, true)
          return tr
        },
      }),
    ]
  },
})
