import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import CharacterCount from '@tiptap/extension-character-count'
import Typography from '@tiptap/extension-typography'
import Highlight from '@tiptap/extension-highlight'
import Link from '@tiptap/extension-link'
import Underline from '@tiptap/extension-underline'
import { DropCapParagraph } from './dropCapParagraph'
import { SceneDivider } from './sceneDivider'

export const createEditorExtensions = () => [
  StarterKit.configure({
    heading: { levels: [2, 3] },
    paragraph: false,
    horizontalRule: false,
  }),
  DropCapParagraph,
  SceneDivider,
  Placeholder.configure({
    placeholder: 'The story begins here…',
  }),
  CharacterCount,
  Typography,
  Highlight.configure({ multicolor: false }),
  Link.configure({ openOnClick: false }),
  Underline,
]
