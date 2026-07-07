import { useEditor, EditorContent } from '@tiptap/react'
import { createEditorExtensions } from '../../lib/editor/extensions'
import { normalizeContent } from '../../lib/editor/plainText'
import { SAVE_STATES } from '../../hooks/useAutosave'
import EditorToolbar from './EditorToolbar'

const SAVE_LABELS = {
  [SAVE_STATES.IDLE]: '',
  [SAVE_STATES.PENDING]: 'Unsaved changes…',
  [SAVE_STATES.SAVING]: 'Saving…',
  [SAVE_STATES.SAVED]: 'Locked in.',
  [SAVE_STATES.ERROR]: 'Save failed — retry by editing',
}

const SceneEditor = ({ scene, onWordCountChange, autosave }) => {
  const editor = useEditor({
    extensions: createEditorExtensions(),
    content: normalizeContent(scene?.content),
    editorProps: {
      attributes: {
        class: 'scene-editor-prose focus:outline-none min-h-[60vh] font-prose text-cream leading-relaxed',
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
  }, [scene?.id])

  if (!scene) {
    return (
      <div className="flex flex-1 items-center justify-center text-cream/40">
        Select a scene to write.
      </div>
    )
  }

  const saveLabel = SAVE_LABELS[autosave.saveState]

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div className="flex items-center justify-between border-b border-bronze-dark/30 px-6 py-3">
        <h2 className="font-prose text-xl text-cream">{scene.title}</h2>
        <div className="flex items-center gap-4 text-sm text-cream/40">
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

      <EditorToolbar editor={editor} />

      <div className="flex-1 overflow-y-auto px-6 py-4">
        <EditorContent editor={editor} />
      </div>
    </div>
  )
}

export default SceneEditor
