import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import CharacterCount from '@tiptap/extension-character-count'
import Typography from '@tiptap/extension-typography'
import Highlight from '@tiptap/extension-highlight'
import Link from '@tiptap/extension-link'
import Underline from '@tiptap/extension-underline'
import TextAlign from '@tiptap/extension-text-align'
import { TextStyleKit } from '@tiptap/extension-text-style'
import FileHandler from '@tiptap/extension-file-handler'
import { DropCapParagraph } from './dropCapParagraph'
import { SceneDivider } from './sceneDivider'
import { Indent } from './indent'
import { SceneImage } from './sceneImage'
import { HarperProofread } from './harperProofread'
import { ComicScriptPanels } from './comicScriptNodes'
import { getSceneImageUploadHandlers } from './sceneImageUploadBridge'
import { ALLOWED_IMAGE_MIME_TYPES } from '../images/constants'
import { TALE_TYPES } from '../../constants/taleTypes'

export const createEditorExtensions = (placeholder = '', options = {}) => {
  const taleType = options.taleType || TALE_TYPES.PROSE
  const comic = taleType === TALE_TYPES.COMIC

  const extensions = [
    StarterKit.configure({
      heading: { levels: [2, 3] },
      paragraph: false,
      horizontalRule: false,
    }),
    DropCapParagraph,
    SceneDivider,
    SceneImage,
    FileHandler.configure({
      allowedMimeTypes: ALLOWED_IMAGE_MIME_TYPES,
      consumePasteEvent: true,
      onPaste: (editor, files) => {
        getSceneImageUploadHandlers().onPaste?.(editor, files)
      },
      onDrop: (editor, files, pos) => {
        getSceneImageUploadHandlers().onDrop?.(editor, files, pos)
      },
    }),
    Placeholder.configure({
      placeholder,
    }),
    CharacterCount,
    Typography,
    Highlight.configure({ multicolor: true }),
    Link.configure({ openOnClick: false }),
    Underline,
    TextAlign.configure({
      types: ['heading', 'paragraph'],
      alignments: ['left', 'center', 'right'],
    }),
    Indent,
    TextStyleKit.configure({
      backgroundColor: false,
      lineHeight: false,
    }),
    HarperProofread,
  ]

  if (comic) {
    extensions.push(ComicScriptPanels)
  }

  return extensions
}
