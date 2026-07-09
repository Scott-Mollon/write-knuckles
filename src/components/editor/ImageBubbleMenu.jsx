import { useEffect, useState } from 'react'
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

  const attrs = editor?.getAttributes('sceneImage') || {}
  const isUrlImage = attrs.sourceType === 'url'

  useEffect(() => {
    if (!editor) return
    const sync = () => {
      const next = editor.getAttributes('sceneImage')
      setAlt(next.alt || '')
      setUrl(next.src || '')
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

  return (
    <BubbleMenu
      editor={editor}
      shouldShow={({ editor: ed }) => ed.isActive('sceneImage')}
      className="image-bubble-menu flex flex-wrap items-center gap-2 rounded border border-bronze-dark/50 bg-ink px-2 py-1.5 shadow-lg"
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
        type="text"
        value={alt}
        onChange={(e) => setAlt(e.target.value)}
        onBlur={saveAlt}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault()
            saveAlt()
          }
        }}
        placeholder="Alt text"
        aria-label="Image alt text"
        className="w-28 rounded border border-bronze-dark/40 bg-surface/80 px-2 py-0.5 text-xs text-cream"
      />

      {isUrlImage && (
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onBlur={saveUrl}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              saveUrl()
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
