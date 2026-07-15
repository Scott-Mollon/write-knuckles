import { Extension } from '@tiptap/core'
import { Fragment, Slice } from '@tiptap/pm/model'
import { Plugin, PluginKey } from '@tiptap/pm/state'

function plainTextPasteSlice(schema, text) {
  const lines = String(text).replace(/\r\n?/g, '\n').split('\n')
  const nodes = lines.map((line) =>
    schema.nodes.paragraph.create(null, line.length > 0 ? schema.text(line) : undefined),
  )
  return Slice.maxOpen(Fragment.fromArray(nodes))
}

/** Paste clipboard text only — ignore HTML/marks so they never override editor formatting. */
export const PlainTextPaste = Extension.create({
  name: 'plainTextPaste',

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey('plainTextPaste'),
        props: {
          handlePaste(view, event) {
            // Let FileHandler handle image file pastes.
            if (event.clipboardData?.files?.length) return false

            const text = event.clipboardData?.getData('text/plain')
            if (text == null) return false

            view.dispatch(
              view.state.tr
                .replaceSelection(plainTextPasteSlice(view.state.schema, text))
                .scrollIntoView()
                .setMeta('paste', true)
                .setMeta('uiEvent', 'paste'),
            )
            return true
          },
        },
      }),
    ]
  },
})
