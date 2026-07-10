import { useEffect, useRef, useState } from 'react'
import { BubbleMenu } from '@tiptap/react/menus'
import { SCENE_IMAGE_DISPLAY_MODES } from '../../lib/editor/sceneImage'

const DISPLAY_LABELS = {
  block: 'Block',
  'float-left': 'Float L',
  'float-right': 'Float R',
  full: 'Full',
}

const ImageBubbleMenu = ({ editor }) => {
  const [alt, setAlt] = useState('')
  const [url, setUrl] = useState('')
  const altInputRef = useRef(null)
  const urlInputRef = useRef(null)

  const attrs = editor?.getAttributes('sceneImage') || {}
  const isUrlImage = attrs.sourceType === 'url'

  useEffect(() => {
    if (!editor) return
    const sync = () => {
      const next = editor.getAttributes('sceneImage')
      if (document.activeElement !== altInputRef.current) {
        setAlt(next.alt || '')
      }
      if (document.activeElement !== urlInputRef.current) {
        setUrl(next.src || '')
      }
    }
    sync()
    editor.on('selectionUpdate', sync)
    editor.on('transaction', sync)
    return () => {
      editor.off('selectionUpdate', sync)
      editor.off('transaction', sync)
    }
  }, [editor])

  if (!editor) return null

  const saveAlt = () => {
    editor.chain().focus().updateAttributes('sceneImage', { alt: alt.trim() }).run()
  }

  const saveUrl = () => {
    const trimmed = url.trim()
    if (!trimmed) return
    editor.chain().focus().updateAttributes('sceneImage', { src: trimmed }).run()
  }

  const keepEditorSelection = (event) => {
    if (event.target instanceof Element && event.target.closest('input, textarea, select')) {
      return
    }
    event.preventDefault()
  }

  const focusMenuInput = (event) => {
    event.preventDefault()
    event.currentTarget.focus()
  }

  return (
    <BubbleMenu
      editor={editor}
      shouldShow={({ editor: ed }) => ed.isActive('sceneImage')}
      className="image-bubble-menu flex flex-wrap items-center gap-2 rounded border border-bronze-dark/50 bg-ink px-2 py-1.5 shadow-lg"
      onMouseDown={keepEditorSelection}
    >
      {SCENE_IMAGE_DISPLAY_MODES.map((mode) => (
        <button
          key={mode}
          type="button"
          title={`Display: ${DISPLAY_LABELS[mode]}`}
          onClick={() => editor.chain().focus().updateAttributes('sceneImage', { display: mode }).run()}
          className={`rounded px-2 py-0.5 font-ui text-[10px] uppercase tracking-wide ${
            attrs.display === mode || (mode === 'block' && attrs.display === 'inline')
              ? 'bg-bronze/25 text-bronze'
              : 'text-cream/50 hover:text-cream'
          }`}
        >
          {DISPLAY_LABELS[mode]}
        </button>
      ))}

      <span className="text-cream/20">|</span>

      <input
        ref={altInputRef}
        type="text"
        value={alt}
        onMouseDown={focusMenuInput}
        onChange={(e) => setAlt(e.target.value)}
        onBlur={saveAlt}
        onKeyDown={(e) => {
          e.stopPropagation()
          if (e.key === 'Enter') {
            e.preventDefault()
            saveAlt()
            altInputRef.current?.blur()
          }
        }}
        placeholder="Alt text"
        aria-label="Image alt text"
        className="w-28 rounded border border-bronze-dark/40 bg-surface/80 px-2 py-0.5 text-xs text-cream"
      />

      {isUrlImage && (
        <input
          ref={urlInputRef}
          type="url"
          value={url}
          onMouseDown={focusMenuInput}
          onChange={(e) => setUrl(e.target.value)}
          onBlur={saveUrl}
          onKeyDown={(e) => {
            e.stopPropagation()
            if (e.key === 'Enter') {
              e.preventDefault()
              saveUrl()
              urlInputRef.current?.blur()
            }
          }}
          placeholder="Image URL"
          aria-label="Image URL"
          className="w-40 rounded border border-bronze-dark/40 bg-surface/80 px-2 py-0.5 text-xs text-cream"
        />
      )}

      <button
        type="button"
        title="Delete image"
        onClick={() => editor.chain().focus().deleteSelection().run()}
        className="rounded px-2 py-0.5 font-ui text-[10px] uppercase tracking-wide text-cream/50 hover:text-punch"
      >
        Delete
      </button>
    </BubbleMenu>
  )
}

export default ImageBubbleMenu
