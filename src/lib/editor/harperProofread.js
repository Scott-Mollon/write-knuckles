import { Extension } from '@tiptap/core'
import { Plugin, PluginKey } from '@tiptap/pm/state'
import { Decoration, DecorationSet } from '@tiptap/pm/view'

export const harperProofreadKey = new PluginKey('harperProofread')

export const HARPER_SET_LINTS = 'harperSetLints'
export const HARPER_CLEAR_LINTS = 'harperClearLints'

function lintClass(isSpelling) {
  return isSpelling ? 'harper-lint harper-lint--spelling' : 'harper-lint harper-lint--grammar'
}

function buildDecorationSet(doc, items) {
  if (!items?.length) return DecorationSet.empty

  const decorations = []
  for (const item of items) {
    if (item.from == null || item.to == null || item.to <= item.from) continue
    if (item.to > doc.content.size) continue
    decorations.push(
      Decoration.inline(
        item.from,
        item.to,
        {
          class: lintClass(item.isSpelling),
          'data-harper-id': item.id,
        },
        { harperLint: item }
      )
    )
  }
  return DecorationSet.create(doc, decorations)
}

function findLintAtPos(decorations, pos) {
  if (!decorations) return null
  let found = null
  decorations.find(pos, pos).forEach((deco) => {
    if (deco.spec?.harperLint) found = deco.spec.harperLint
  })
  return found
}

export const HarperProofread = Extension.create({
  name: 'harperProofread',

  addStorage() {
    return {
      onLintClick: null,
    }
  },

  addProseMirrorPlugins() {
    const extension = this

    return [
      new Plugin({
        key: harperProofreadKey,
        state: {
          init() {
            return DecorationSet.empty
          },
          apply(tr, oldSet) {
            const clear = tr.getMeta(HARPER_CLEAR_LINTS)
            if (clear) return DecorationSet.empty

            const next = tr.getMeta(HARPER_SET_LINTS)
            if (next !== undefined) {
              return buildDecorationSet(tr.doc, next)
            }

            if (tr.docChanged) {
              return oldSet.map(tr.mapping, tr.doc)
            }
            return oldSet
          },
        },
        props: {
          decorations(state) {
            return harperProofreadKey.getState(state)
          },
          handleClick(view, pos, event) {
            const target = event.target
            if (!(target instanceof Element) || !target.closest('.harper-lint')) {
              return false
            }
            const set = harperProofreadKey.getState(view.state)
            const item = findLintAtPos(set, pos)
            if (!item) return false

            const onOpen = extension.storage.onLintClick
            if (typeof onOpen === 'function') {
              onOpen(item, view.coordsAtPos(item.from))
              return true
            }
            return false
          },
        },
      }),
    ]
  },
})

export function setHarperLints(editor, items) {
  if (!editor) return
  const { tr } = editor.state
  tr.setMeta(HARPER_SET_LINTS, items || [])
  editor.view.dispatch(tr)
}

export function clearHarperLints(editor) {
  if (!editor) return
  const { tr } = editor.state
  tr.setMeta(HARPER_CLEAR_LINTS, true)
  editor.view.dispatch(tr)
}
