import { useCallback, useEffect, useMemo, useState } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import { createEditorExtensions } from '../../lib/editor/extensions'
import { normalizeContent, isSceneContentEmpty } from '../../lib/editor/plainText'
import { buildSceneImageAttrs } from '../../lib/editor/sceneImage'
import { defaultAltFromFile, defaultAltFromUploadResult } from '../../lib/editor/sceneImageLabel'
import { setSceneImageUploadHandlers } from '../../lib/editor/sceneImageUploadBridge'
import { pickRandomScenePlaceholder } from '../../constants/scenePlaceholders'
import { SAVE_STATES } from '../../hooks/useAutosave'
import { useEditorTheme } from '../../hooks/useEditorTheme'
import { useEditorTabSize } from '../../hooks/useEditorTabSize'
import { useUpdateSceneMeta } from '../../hooks/useSceneMutations'
import { useTaleImageUpload } from '../../hooks/useTaleImageUpload'
import { validateImageFile } from '../../lib/images/storage'
import EditorToolbar from './EditorToolbar'
import ImageBubbleMenu from './ImageBubbleMenu'

const SAVE_LABELS = {
  [SAVE_STATES.IDLE]: '',
  [SAVE_STATES.PENDING]: 'Unsaved changes…',
  [SAVE_STATES.SAVING]: 'Saving…',
  [SAVE_STATES.SAVED]: 'Locked in.',
  [SAVE_STATES.ERROR]: 'Save failed — retry by editing',
}

const SceneEditor = ({ scene, taleId, onWordCountChange, autosave }) => {
  const { theme, toggleTheme, isLight } = useEditorTheme()
  const { tabSize, setTabSize, options: tabSizeOptions } = useEditorTabSize()
  const updateMeta = useUpdateSceneMeta(taleId)
  const uploadImage = useTaleImageUpload()
  const [imageError, setImageError] = useState(null)
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

  const uploadSceneFile = useCallback(
    async (file) => {
      const validation = validateImageFile(file)
      if (!validation.valid) {
        throw new Error(validation.error)
      }
      return uploadImage.mutateAsync({
        taleId,
        scope: 'scenes',
        entityId: scene.id,
        file,
      })
    },
    [scene?.id, taleId, uploadImage]
  )

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

  useEffect(() => {
    if (!editor || !scene?.id) return

    setSceneImageUploadHandlers({
      onPaste: async (ed, files) => {
        setImageError(null)
        for (const file of files) {
          try {
            const result = await uploadSceneFile(file)
            ed
              .chain()
              .focus()
              .setSceneImage(
                buildSceneImageAttrs({
                  sourceType: result.sourceType,
                  storagePath: result.storagePath,
                  externalUrl: result.externalUrl,
                  alt: defaultAltFromFile(file),
                })
              )
              .run()
          } catch (err) {
            setImageError(err.message || 'Could not insert image.')
          }
        }
      },
      onDrop: async (ed, files, pos) => {
        setImageError(null)
        let insertPos = pos
        for (const file of files) {
          try {
            const result = await uploadSceneFile(file)
            const attrs = buildSceneImageAttrs({
              sourceType: result.sourceType,
              storagePath: result.storagePath,
              externalUrl: result.externalUrl,
              alt: defaultAltFromFile(file),
            })
            ed.chain().focus().insertContentAt(insertPos, { type: 'sceneImage', attrs }).run()
            insertPos += 1
          } catch (err) {
            setImageError(err.message || 'Could not insert image.')
          }
        }
      },
    })

    return () => {
      setSceneImageUploadHandlers({ onPaste: null, onDrop: null })
    }
  }, [editor, scene?.id, uploadSceneFile])

  const handleInsertSceneImage = useCallback(
    (result) => {
      if (!editor) return
      setImageError(null)
      editor
        .chain()
        .focus()
        .setSceneImage(
          buildSceneImageAttrs({
            sourceType: result.sourceType,
            storagePath: result.storagePath,
            externalUrl: result.externalUrl,
            alt: defaultAltFromUploadResult(result),
          })
        )
        .run()
    },
    [editor]
  )

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
    <div
      className="editor-surface flex flex-1 flex-col overflow-hidden"
      data-editor-theme={theme}
      style={{ '--editor-tab-size': tabSize }}
    >
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

      <EditorToolbar
        editor={editor}
        isLight={isLight}
        onToggleTheme={toggleTheme}
        tabSize={tabSize}
        tabSizeOptions={tabSizeOptions}
        onTabSizeChange={setTabSize}
        taleId={taleId}
        sceneId={scene.id}
        onInsertSceneImage={handleInsertSceneImage}
        onImageError={setImageError}
      />

      {imageError && (
        <p className="border-b border-bronze-dark/30 bg-error/10 px-6 py-2 text-sm text-error" role="alert">
          {imageError}
        </p>
      )}

      <div className="relative flex-1 overflow-y-auto px-6 py-4">
        <ImageBubbleMenu editor={editor} />
        <EditorContent editor={editor} />
      </div>
    </div>
  )
}

export default SceneEditor
