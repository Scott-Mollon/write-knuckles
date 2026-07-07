import { useMemo } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import { createEditorExtensions } from '../../lib/editor/extensions'
import { normalizeContent, isSceneContentEmpty } from '../../lib/editor/plainText'
import { pickRandomScenePlaceholder } from '../../constants/scenePlaceholders'
import { SAVE_STATES } from '../../hooks/useAutosave'
import { useEditorTheme } from '../../hooks/useEditorTheme'
import EditorToolbar from './EditorToolbar'

const SAVE_LABELS = {
  [SAVE_STATES.IDLE]: '',
  [SAVE_STATES.PENDING]: 'Unsaved changes…',
  [SAVE_STATES.SAVING]: 'Saving…',
  [SAVE_STATES.SAVED]: 'Locked in.',
  [SAVE_STATES.ERROR]: 'Save failed — retry by editing',
}

const SceneEditor = ({ scene, onWordCountChange, autosave }) => {
  const { theme, toggleTheme, isLight } = useEditorTheme()
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

  return (
    <div className="editor-surface flex flex-1 flex-col overflow-hidden" data-editor-theme={theme}>
      <div className="flex items-center justify-between border-b px-6 py-3" style={{ borderColor: 'var(--editor-border)' }}>
        <h2 className="editor-scene-title font-prose text-xl">{scene.title}</h2>
        <div className="editor-save-status flex items-center gap-4 text-sm">
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
