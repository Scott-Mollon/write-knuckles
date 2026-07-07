const ToolbarButton = ({ onClick, active, disabled, title, children }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    title={title}
    className={`rounded px-2 py-1 text-sm transition ${
      active
        ? 'bg-bronze/30 text-bronze'
        : 'text-cream/60 hover:bg-ink hover:text-cream disabled:opacity-30'
    }`}
  >
    {children}
  </button>
)

const EditorToolbar = ({ editor }) => {
  if (!editor) return null

  return (
    <div className="flex flex-wrap items-center gap-1 border-b border-bronze-dark/30 px-4 py-2">
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

      <span className="mx-1 text-cream/20">|</span>

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
  )
}

export default EditorToolbar
