import Paragraph from '@tiptap/extension-paragraph'

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
    }
  },

  addCommands() {
    return {
      ...this.parent?.(),
      toggleDropCap: () => ({ editor, commands }) => {
        if (!editor.isActive('paragraph')) return false
        const { dropCap } = editor.getAttributes('paragraph')
        return commands.updateAttributes('paragraph', { dropCap: !dropCap })
      },
    }
  },
})
