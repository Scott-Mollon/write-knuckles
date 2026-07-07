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

const EditorToolbar = ({ editor, isLight, onToggleTheme }) => {
  if (!editor) return null

  return (
    <div className="editor-toolbar flex items-center border-b px-4 py-2">
      <div className="flex flex-wrap items-center gap-1">
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
        onClick={() => editor.chain().focus().toggleHighlight().run()}
        active={editor.isActive('highlight')}
        title="Highlight"
      >
        H
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        active={editor.isActive('blockquote')}
        title="Blockquote"
      >
        &ldquo;
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleDropCap().run()}
        active={editor.isActive('paragraph', { dropCap: true })}
        disabled={!editor.isActive('paragraph')}
        title="Drop cap"
      >
        <span className="font-ui text-base leading-none">D</span>
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
        Undo
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().redo()}
        title="Redo"
      >
        Redo
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
