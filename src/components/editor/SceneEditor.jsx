import { useEffect, useMemo, useState } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import { createEditorExtensions } from '../../lib/editor/extensions'
import { normalizeContent, isSceneContentEmpty } from '../../lib/editor/plainText'
import { pickRandomScenePlaceholder } from '../../constants/scenePlaceholders'
import { SAVE_STATES } from '../../hooks/useAutosave'
import { useEditorTheme } from '../../hooks/useEditorTheme'
import { useUpdateSceneMeta } from '../../hooks/useSceneMutations'
import EditorToolbar from './EditorToolbar'

const SAVE_LABELS = {
  [SAVE_STATES.IDLE]: '',
  [SAVE_STATES.PENDING]: 'Unsaved changes…',
  [SAVE_STATES.SAVING]: 'Saving…',
  [SAVE_STATES.SAVED]: 'Locked in.',
  [SAVE_STATES.ERROR]: 'Save failed — retry by editing',
}

const SceneEditor = ({ scene, taleId, onWordCountChange, autosave }) => {
  const { theme, toggleTheme, isLight } = useEditorTheme()
  const updateMeta = useUpdateSceneMeta(taleId)
  const [title, setTitle] = useState(scene?.title || '')

  useEffect(() => {
    setTitle(scene?.title || '')
  }, [scene?.id, scene?.title])

  const placeholder = useMemo(() => {
    if (scene && isSceneContentEmpty(scene.content)) {
      return pickRandomScenePlaceholder()
    }
    return ''
  }, [scene?.id])

  const editor = useEditor({
    extensions: createEditorExtensions(placeholder),
    content: normalizeContent(scene?.content),
    editorProps: {
      attributes: {
        class: 'scene-editor-prose focus:outline-none min-h-[60vh] font-prose leading-relaxed',
      },
    },
    onUpdate: ({ editor: ed }) => {
      const json = ed.getJSON()
      const words = ed.storage.characterCount.words()
      onWordCountChange?.(words)
      autosave.queueSave(json)
    },
    onCreate: ({ editor: ed }) => {
      onWordCountChange?.(ed.storage.characterCount.words())
    },
  }, [scene?.id, placeholder])

  if (!scene) {
    return (
      <div className="flex flex-1 items-center justify-center text-cream/40">
        Select a scene to write.
      </div>
    )
  }

  const saveLabel = SAVE_LABELS[autosave.saveState]

  const saveTitle = () => {
    if (!scene) return
    const trimmed = title.trim()
    if (!trimmed) {
      setTitle(scene.title || '')
      return
    }
    if (trimmed !== scene.title) {
      updateMeta.mutate({ sceneId: scene.id, title: trimmed })
    }
  }

  return (
    <div className="editor-surface flex flex-1 flex-col overflow-hidden" data-editor-theme={theme}>
      <div className="flex items-center justify-between gap-4 border-b px-6 py-3" style={{ borderColor: 'var(--editor-border)' }}>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={saveTitle}
          onKeyDown={(e) => {
            if (e.key === 'Enter') e.currentTarget.blur()
          }}
          aria-label="Scene title"
          className="editor-scene-title min-w-0 flex-1 border-0 bg-transparent font-prose text-xl focus:outline-none"
        />
        <div className="editor-save-status flex shrink-0 items-center gap-4 text-sm">
          {saveLabel && (
            <span
              className={
                autosave.saveState === SAVE_STATES.ERROR
                  ? 'text-error'
                  : autosave.saveState === SAVE_STATES.SAVED
                    ? 'text-bronze'
                    : ''
              }
            >
              {saveLabel}
            </span>
          )}
        </div>
      </div>

      <EditorToolbar editor={editor} isLight={isLight} onToggleTheme={toggleTheme} />

      <div className="flex-1 overflow-y-auto px-6 py-4">
        <EditorContent editor={editor} />
      </div>
    </div>
  )
}

export default SceneEditor
