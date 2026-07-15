import { useState } from 'react'
import { useEditorState } from '@tiptap/react'
import ImageUpload from '../images/ImageUpload'
import {
  SCENE_FONT_GROUPS,
  SCENE_FONT_OPTIONS,
  sceneFontPreviewFamily,
} from '../../constants/sceneFonts'
import { DEFAULT_PROSE_FONT_SIZE, PROSE_FONT_SIZE_OPTIONS } from '../../hooks/useEditorProseDefaults'
import { SCRIPT_ROLES } from '../../lib/editor/scriptStyles'
import { isComicTale } from '../../lib/taleTerminology'

const ToolbarButton = ({ onClick, active, disabled, title, children, className = '' }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    title={title}
    className={`editor-toolbar-btn rounded px-2 py-1 text-sm transition disabled:opacity-30 ${
      active ? 'is-active' : ''
    } ${className}`}
  >
    {children}
  </button>
)

const SunIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
  </svg>
)

const MoonIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
  </svg>
)

const UndoIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M3 7v6h6" />
    <path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6.7 2.9L3 13" />
  </svg>
)

const RedoIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M21 7v6h-6" />
    <path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6.7 2.9L21 13" />
  </svg>
)

const ProofreadIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    <path d="m9 10 2 2 4-4" />
  </svg>
)

const AlignLeftIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M21 6H3M15 12H3M21 18H3" />
  </svg>
)

const AlignCenterIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M21 6H3M17 12H7M21 18H3" />
  </svg>
)

const AlignRightIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M21 6H3M21 12H9M21 18H3" />
  </svg>
)

const DefaultsIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.375 2.625a1 1 0 0 1 3 3l-9.013 9.014a2 2 0 0 1-.853.505l-2.873.84a.5.5 0 0 1-.62-.62l.84-2.873a2 2 0 0 1 .506-.852z" />
  </svg>
)

const DEFAULT_TEXT_COLOR = {
  dark: '#e8dcc8',
  light: '#1a1410',
}

const DEFAULT_HIGHLIGHT_COLOR = '#ffe066'

const toHexColor = (color, fallback) => {
  if (!color) return fallback
  const hex = color.trim()
  if (/^#[0-9a-fA-F]{6}$/.test(hex)) return hex.toLowerCase()
  if (/^#[0-9a-fA-F]{3}$/.test(hex)) {
    const [, r, g, b] = hex
    return `#${r}${r}${g}${g}${b}${b}`.toLowerCase()
  }
  return fallback
}

const normalizeFontSize = (size) => {
  if (!size) return ''
  const match = size.trim().match(/^([\d.]+)px$/i)
  if (match) return `${parseFloat(match[1])}px`
  return size
}

const EditorToolbar = ({
  editor,
  isLight,
  onToggleTheme,
  proseFont,
  onOpenDefaults,
  taleId,
  sceneId,
  taleType,
  onInsertSceneImage,
  onImageError,
  proofreadEnabled = false,
  proofreadLoading = false,
  proofreadIssueCount = 0,
  onToggleProofread,
}) => {
  const [highlightColor, setHighlightColor] = useState(DEFAULT_HIGHLIGHT_COLOR)
  const comic = isComicTale(taleType)

  const toolbarState = useEditorState({
    editor,
    selector: (snapshot) => {
      const activeEditor = snapshot.editor
      if (!activeEditor) return null

      const textStyle = activeEditor.getAttributes('textStyle')
      return {
        transactionNumber: snapshot.transactionNumber,
        currentFont: textStyle.fontFamily || '',
        currentFontSize: normalizeFontSize(textStyle.fontSize || ''),
        currentColor: textStyle.color || '',
        activeHighlightColor: activeEditor.getAttributes('highlight').color,
      }
    },
  })

  if (!editor || !toolbarState) return null

  const {
    currentFont,
    currentFontSize,
    currentColor,
    activeHighlightColor: editorHighlightColor,
  } = toolbarState
  const activeHighlightColor = editorHighlightColor || highlightColor
  const textColorFallback = isLight ? DEFAULT_TEXT_COLOR.light : DEFAULT_TEXT_COLOR.dark

  const handleFontChange = (event) => {
    const { value } = event.target
    if (!value || value === proseFont) {
      editor.chain().focus().unsetFontFamily().run()
      return
    }
    editor.chain().focus().setFontFamily(value).run()
  }

  const handleFontSizeChange = (event) => {
    const { value } = event.target
    editor.chain().focus().setFontSize(value).run()
  }

  const applyColor = (color) => {
    editor.chain().focus().setColor(color).run()
  }

  const applyHighlightColor = (color) => {
    setHighlightColor(color)
    editor.chain().focus().setHighlight({ color }).run()
  }

  const displayedFont = currentFont || proseFont

  return (
    <div className="editor-toolbar flex items-center border-b px-4 py-2">
      <div className="flex flex-wrap items-center gap-1">
      <select
        aria-label="Font"
        title="Font"
        value={displayedFont}
        onChange={handleFontChange}
        className="editor-toolbar-select rounded px-2 py-1 text-sm"
      >
        {SCENE_FONT_GROUPS.map((group) => (
          <optgroup key={group.id} label={group.label}>
            {SCENE_FONT_OPTIONS.filter((font) => font.group === group.id).map((font) => (
              <option
                key={font.label}
                value={font.value}
                style={{ fontFamily: sceneFontPreviewFamily(font.value) }}
              >
                {font.label}
              </option>
            ))}
          </optgroup>
        ))}
      </select>

      <select
        aria-label="Font size"
        title="Font size"
        value={currentFontSize || DEFAULT_PROSE_FONT_SIZE}
        onChange={handleFontSizeChange}
        className="editor-toolbar-select editor-toolbar-font-size rounded px-2 py-1 text-sm"
      >
        {PROSE_FONT_SIZE_OPTIONS.map((size) => (
          <option key={size.label} value={size.value}>
            {size.label}
          </option>
        ))}
      </select>

      <label
        className="editor-toolbar-color"
        title={currentColor ? `Text color (${currentColor}) — right-click to clear` : 'Text color — right-click to clear'}
        onMouseDown={(event) => event.preventDefault()}
      >
        <span className="sr-only">Text color</span>
        <input
          type="color"
          aria-label="Text color"
          value={toHexColor(currentColor, textColorFallback)}
          onMouseDown={(event) => event.preventDefault()}
          onInput={(event) => applyColor(event.target.value)}
          onChange={(event) => applyColor(event.target.value)}
          onContextMenu={(event) => {
            event.preventDefault()
            editor.chain().focus().unsetColor().run()
          }}
        />
      </label>

      <span className="editor-toolbar-sep mx-1">|</span>

      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBold().run()}
        active={editor.isActive('bold')}
        title="Bold"
      >
        <strong>B</strong>
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleItalic().run()}
        active={editor.isActive('italic')}
        title="Italic"
      >
        <em>I</em>
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        active={editor.isActive('underline')}
        title="Underline"
      >
        <span className="underline">U</span>
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleHighlight({ color: highlightColor }).run()}
        active={editor.isActive('highlight')}
        title="Highlight"
      >
        H
      </ToolbarButton>
      <label
        className="editor-toolbar-color editor-toolbar-highlight-color"
        title={`Highlight color (${activeHighlightColor}) — right-click to clear`}
        onMouseDown={(event) => event.preventDefault()}
      >
        <span className="sr-only">Highlight color</span>
        <input
          type="color"
          aria-label="Highlight color"
          value={toHexColor(activeHighlightColor, DEFAULT_HIGHLIGHT_COLOR)}
          onMouseDown={(event) => event.preventDefault()}
          onInput={(event) => applyHighlightColor(event.target.value)}
          onChange={(event) => applyHighlightColor(event.target.value)}
          onContextMenu={(event) => {
            event.preventDefault()
            editor.chain().focus().unsetHighlight().run()
          }}
        />
      </label>

      <span className="editor-toolbar-sep mx-1">|</span>

      <ToolbarButton
        onClick={() => editor.chain().focus().setTextAlign('left').run()}
        active={editor.isActive({ textAlign: 'left' })}
        title="Align left"
      >
        <AlignLeftIcon />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().setTextAlign('center').run()}
        active={editor.isActive({ textAlign: 'center' })}
        title="Align center"
      >
        <AlignCenterIcon />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().setTextAlign('right').run()}
        active={editor.isActive({ textAlign: 'right' })}
        title="Align right"
      >
        <AlignRightIcon />
      </ToolbarButton>

      <span className="editor-toolbar-sep mx-1">|</span>

      {comic ? (
        <>
          <ToolbarButton
            onClick={() => editor.chain().focus().insertComicPanel().run()}
            active={editor.isActive('paragraph', { scriptRole: SCRIPT_ROLES.PANEL })}
            title="Insert Panel N"
          >
            Panel
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().setScriptRole(SCRIPT_ROLES.PANEL_DESCRIPTION).run()}
            active={editor.isActive('paragraph', { scriptRole: SCRIPT_ROLES.PANEL_DESCRIPTION })}
            title="Panel description"
          >
            Desc
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().setScriptRole(SCRIPT_ROLES.CHARACTER).run()}
            active={editor.isActive('paragraph', { scriptRole: SCRIPT_ROLES.CHARACTER })}
            title="Character name"
          >
            Char
          </ToolbarButton>
          <ToolbarButton
            onClick={() =>
              editor.chain().focus().setScriptRole(SCRIPT_ROLES.CHARACTER_DESCRIPTOR).run()
            }
            active={editor.isActive('paragraph', {
              scriptRole: SCRIPT_ROLES.CHARACTER_DESCRIPTOR,
            })}
            title="Character descriptor"
          >
            (desc)
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().setScriptRole(SCRIPT_ROLES.DIALOGUE).run()}
            active={editor.isActive('paragraph', { scriptRole: SCRIPT_ROLES.DIALOGUE })}
            title="Dialogue"
          >
            Dial
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().insertComicSfx().run()}
            active={
              editor.isActive('paragraph', { scriptRole: SCRIPT_ROLES.SFX }) ||
              editor.isActive('paragraph', { scriptRole: SCRIPT_ROLES.SFX_CONTENT })
            }
            title="Insert SFX"
          >
            SFX
          </ToolbarButton>
        </>
      ) : (
        <>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleDropCap().run()}
            active={editor.isActive('paragraph', { dropCap: true })}
            disabled={!editor.isActive('paragraph')}
            title="Drop cap"
          >
            <span className="font-ui text-base leading-none">D</span>
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            active={editor.isActive('blockquote')}
            title="Blockquote"
          >
            &ldquo;
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().setSceneDivider().run()}
            title="Divider"
          >
            <span className="inline-block w-4 border-t border-current" />
          </ToolbarButton>
        </>
      )}

      {taleId && sceneId && onInsertSceneImage && (
        <ImageUpload
          taleId={taleId}
          scope="scenes"
          entityId={sceneId}
          compact
          allowUrl={false}
          onAdded={onInsertSceneImage}
          onError={onImageError}
        />
      )}

      <span className="editor-toolbar-sep mx-1">|</span>

      <ToolbarButton
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().undo()}
        title="Undo"
      >
        <UndoIcon />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().redo()}
        title="Redo"
      >
        <RedoIcon />
      </ToolbarButton>
      </div>

      <div className="ml-auto flex shrink-0 items-center gap-1">
        <ToolbarButton
          onClick={onOpenDefaults}
          title="Writing defaults"
        >
          <DefaultsIcon />
        </ToolbarButton>

        <ToolbarButton
          onClick={onToggleProofread}
          active={proofreadEnabled}
          disabled={proofreadLoading && !proofreadEnabled}
          title={
            proofreadLoading
              ? 'Loading proofreader…'
              : proofreadEnabled
                ? 'Turn off proofreading'
                : 'Proofread spelling and grammar'
          }
          className="relative"
        >
          <ProofreadIcon />
          {proofreadEnabled && proofreadIssueCount > 0 ? (
            <span className="harper-proofread-badge" aria-label={`${proofreadIssueCount} issues`}>
              {proofreadIssueCount > 99 ? '99+' : proofreadIssueCount}
            </span>
          ) : null}
          {proofreadLoading ? <span className="sr-only">Loading</span> : null}
        </ToolbarButton>

        <ToolbarButton
          onClick={onToggleTheme}
          title={isLight ? 'Switch to dark editor' : 'Switch to light editor'}
        >
          {isLight ? <MoonIcon /> : <SunIcon />}
        </ToolbarButton>
      </div>
    </div>
  )
}

export default EditorToolbar
