import { Node, mergeAttributes } from '@tiptap/core'
import { ReactNodeViewRenderer } from '@tiptap/react'
import SceneImageNodeView from '../../components/editor/SceneImageNodeView'
import { getSceneImageDisplayLabel } from './sceneImageLabel'

export const SCENE_IMAGE_DISPLAY_MODES = ['block', 'float-left', 'float-right', 'full']

export function buildSceneImageAttrs({ sourceType, storagePath, externalUrl, alt = '', display = 'block', width = null }) {
  if (sourceType === 'upload') {
    return {
      sourceType: 'upload',
      storagePath,
      src: null,
      alt,
      display,
      width,
    }
  }

  return {
    sourceType: 'url',
    storagePath: null,
    src: externalUrl,
    alt,
    display,
    width,
  }
}

export const SceneImage = Node.create({
  name: 'sceneImage',
  group: 'block',
  atom: true,
  draggable: true,
  selectable: true,

  addAttributes() {
    return {
      sourceType: { default: 'upload' },
      storagePath: { default: null },
      src: { default: null },
      alt: { default: '' },
      display: { default: 'block' },
      width: { default: null },
    }
  },

  parseHTML() {
    return [{ tag: 'img[data-scene-image]' }]
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'img',
      mergeAttributes(HTMLAttributes, {
        'data-scene-image': '',
        class: `scene-image__img scene-image--${HTMLAttributes.display || 'block'}`,
      }),
    ]
  },

  renderText({ node }) {
    return `[${getSceneImageDisplayLabel(node.attrs)}]`
  },

  addCommands() {
    return {
      setSceneImage:
        (attrs) =>
        ({ commands }) =>
          commands.insertContent({
            type: this.name,
            attrs,
          }),
    }
  },

  addNodeView() {
    return ReactNodeViewRenderer(SceneImageNodeView)
  },
})
