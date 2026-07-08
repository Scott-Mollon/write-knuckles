import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import CharacterCount from '@tiptap/extension-character-count'
import Typography from '@tiptap/extension-typography'
import Highlight from '@tiptap/extension-highlight'
import Link from '@tiptap/extension-link'
import Underline from '@tiptap/extension-underline'
import TextAlign from '@tiptap/extension-text-align'
import { TextStyleKit } from '@tiptap/extension-text-style'
import { DropCapParagraph } from './dropCapParagraph'
import { SceneDivider } from './sceneDivider'
import { Indent } from './indent'

export const createEditorExtensions = (placeholder = '') => [
  StarterKit.configure({
    heading: { levels: [2, 3] },
    paragraph: false,
    horizontalRule: false,
  }),
  DropCapParagraph,
  SceneDivider,
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
]
