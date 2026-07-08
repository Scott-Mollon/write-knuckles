import { Extension } from '@tiptap/core'

const MAX_INDENT = 8

const clampIndent = (value) => Math.max(0, Math.min(MAX_INDENT, value || 0))

export const Indent = Extension.create({
  name: 'indent',

  addOptions() {
    return {
      types: ['paragraph', 'heading'],
      maxLevel: MAX_INDENT,
    }
  },

  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          indent: {
            default: 0,
            parseHTML: (element) => {
              const raw = element.getAttribute('data-indent')
              if (raw != null) return clampIndent(parseInt(raw, 10))
              const margin = element.style?.marginLeft
              if (!margin) return 0
              const match = margin.match(/calc\(\s*var\(--editor-tab-size\)\s*\*\s*(\d+)/)
              if (match) return clampIndent(parseInt(match[1], 10))
              return 0
            },
            renderHTML: (attributes) => {
              const level = clampIndent(attributes.indent)
              if (!level) return {}
              return {
                'data-indent': String(level),
                style: `margin-left: calc(var(--editor-tab-size) * ${level})`,
              }
            },
          },
        },
      },
    ]
  },

  addCommands() {
    return {
      indent:
        () =>
        ({ editor, commands }) => {
          if (editor.can().sinkListItem('listItem')) {
            return commands.sinkListItem('listItem')
          }

          const type = this.options.types.find((name) => editor.isActive(name))
          if (!type) return false

          const current = clampIndent(editor.getAttributes(type).indent)
          if (current >= this.options.maxLevel) return false
          return commands.updateAttributes(type, { indent: current + 1 })
        },
      outdent:
        () =>
        ({ editor, commands }) => {
          if (editor.can().liftListItem('listItem')) {
            return commands.liftListItem('listItem')
          }

          const type = this.options.types.find((name) => editor.isActive(name))
          if (!type) return false

          const current = clampIndent(editor.getAttributes(type).indent)
          if (current <= 0) return false
          return commands.updateAttributes(type, { indent: current - 1 })
        },
    }
  },

  addKeyboardShortcuts() {
    return {
      Tab: () => this.editor.commands.indent(),
      'Shift-Tab': () => this.editor.commands.outdent(),
      Backspace: () => {
        const { selection } = this.editor.state
        if (!selection.empty || selection.$from.parentOffset > 0) {
          return false
        }

        const type = this.options.types.find((name) => this.editor.isActive(name))
        if (!type) return false

        const current = clampIndent(this.editor.getAttributes(type).indent)
        if (current <= 0) return false

        return this.editor.commands.outdent()
      },
    }
  },
})