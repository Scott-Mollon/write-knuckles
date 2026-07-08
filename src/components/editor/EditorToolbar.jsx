import { useState } from 'react'

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

const FONT_OPTIONS = [
  { label: 'Arial', value: 'Arial, Helvetica, sans-serif' },
  { label: 'Courier New', value: '"Courier New", Courier, monospace' },
  { label: 'Courier Prime', value: '' },
  { label: 'EB Garamond', value: '"EB Garamond", Garamond, serif' },
  { label: 'Garamond', value: 'Garamond, "Palatino Linotype", Palatino, serif' },
  { label: 'Georgia', value: 'Georgia, serif' },
  { label: 'Libre Baskerville', value: '"Libre Baskerville", Baskerville, serif' },
  { label: 'Literata', value: 'Literata, Georgia, serif' },
  { label: 'Lora', value: 'Lora, Georgia, serif' },
  { label: 'Merriweather', value: 'Merriweather, Georgia, serif' },
  { label: 'Palatino', value: 'Palatino, "Palatino Linotype", "Book Antiqua", serif' },
  { label: 'Times New Roman', value: '"Times New Roman", Times, serif' },
]

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

const EditorToolbar = ({
  editor,
  isLight,
  onToggleTheme,
  tabSize,
  tabSizeOptions = [],
  onTabSizeChange,
}) => {
  const [highlightColor, setHighlightColor] = useState(DEFAULT_HIGHLIGHT_COLOR)

  if (!editor) return null

  const textStyle = editor.getAttributes('textStyle')
  const currentFont = textStyle.fontFamily || ''
  const currentColor = textStyle.color || ''
  const activeHighlightColor = editor.getAttributes('highlight').color || highlightColor
  const textColorFallback = isLight ? DEFAULT_TEXT_COLOR.light : DEFAULT_TEXT_COLOR.dark

  const handleFontChange = (event) => {
    const { value } = event.target
    if (!value) {
      editor.chain().focus().unsetFontFamily().run()
      return
    }
    editor.chain().focus().setFontFamily(value).run()
  }

  const applyColor = (color) => {
    editor.chain().focus().setColor(color).run()
  }

  const applyHighlightColor = (color) => {
    setHighlightColor(color)
    editor.chain().focus().setHighlight({ color }).run()
  }

  const handleTabSizeChange = (event) => {
    onTabSizeChange?.(event.target.value)
    editor.chain().focus().run()
  }

  return (
    <div className="editor-toolbar flex items-center border-b px-4 py-2">
      <div className="flex flex-wrap items-center gap-1">
      <select
        aria-label="Font"
        title="Font"
        value={currentFont}
        onChange={handleFontChange}
        className="editor-toolbar-select rounded px-2 py-1 text-sm"
      >
        {FONT_OPTIONS.map((font) => (
          <option key={font.label} value={font.value} style={{ fontFamily: font.value || '"Courier Prime", monospace' }}>
            {font.label}
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

      <select
        aria-label="Tab size"
        title="Tab size"
        value={tabSize}
        onChange={handleTabSizeChange}
        className="editor-toolbar-select editor-toolbar-tab-size rounded px-2 py-1 text-sm"
      >
        {tabSizeOptions.map((option) => (
          <option key={option.value} value={option.value}>
            Tab {option.label}
          </option>
        ))}
      </select>

      <span className="editor-toolbar-sep mx-1">|</span>

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

      <ToolbarButton
        onClick={onToggleTheme}
        title={isLight ? 'Switch to dark editor' : 'Switch to light editor'}
        className="ml-auto shrink-0"
      >
        {isLight ? <MoonIcon /> : <SunIcon />}
      </ToolbarButton>
    </div>
  )
}

export default EditorToolbar
