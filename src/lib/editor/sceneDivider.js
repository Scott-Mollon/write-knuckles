import { Node, mergeAttributes } from '@tiptap/core'

export const SceneDivider = Node.create({
  name: 'sceneDivider',
  group: 'block',
  atom: true,
  selectable: true,
  draggable: true,

  parseHTML() {
    return [{ tag: 'hr[data-scene-divider]' }]
  },

  renderHTML() {
    return ['hr', mergeAttributes({ 'data-scene-divider': '', class: 'scene-divider' })]
  },

  renderText() {
    return '---'
  },

  addCommands() {
    return {
      setSceneDivider: () => ({ chain }) =>
        chain().insertContent({ type: this.name }).run(),
    }
  },
})
