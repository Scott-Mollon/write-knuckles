import { useEffect } from 'react'
import {
  SCENE_FONT_GROUPS,
  SCENE_FONT_OPTIONS,
  sceneFontPreviewFamily,
} from '../../constants/sceneFonts'
import { PROSE_FONT_SIZE_OPTIONS } from '../../hooks/useEditorProseDefaults'
import { TAB_SIZE_OPTIONS } from '../../hooks/useEditorTabSize'

const fieldClass =
  'w-full rounded border px-3 py-2 text-sm focus:outline-none'
const labelClass = 'mb-1.5 block font-ui text-xs uppercase tracking-wide'

const EditorDefaultsDialog = ({
  onClose,
  proseFont,
  onProseFontChange,
  proseFontSize,
  onProseFontSizeChange,
  tabSize,
  onTabSizeChange,
}) => {
  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4"
      role="presentation"
    >
      <div
        className="w-full max-w-md rounded border p-6 shadow-xl"
        style={{
          backgroundColor: 'var(--editor-bg)',
          borderColor: 'var(--editor-border)',
          color: 'var(--editor-text)',
        }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="editor-defaults-title"
      >
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h2
              id="editor-defaults-title"
              className="font-ui text-xl uppercase tracking-wide"
              style={{ color: 'var(--editor-accent)' }}
            >
              Writing defaults
            </h2>
            <p className="mt-1 text-sm" style={{ color: 'var(--editor-text-muted)' }}>
              Applies in this browser for all tales. Toolbar Font and Size still override selected text.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-2xl leading-none transition hover:opacity-80"
            style={{ color: 'var(--editor-text-muted)' }}
            aria-label="Close writing defaults"
          >
            ×
          </button>
        </div>

        <div className="space-y-4">
          <label className={labelClass} style={{ color: 'var(--editor-text-subtle)' }}>
            Font
            <select
              value={proseFont}
              onChange={(event) => onProseFontChange(event.target.value)}
              className={`${fieldClass} mt-1.5`}
              style={{
                backgroundColor: 'var(--editor-toolbar-bg)',
                borderColor: 'var(--editor-border)',
                color: 'var(--editor-text)',
              }}
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
          </label>

          <label className={labelClass} style={{ color: 'var(--editor-text-subtle)' }}>
            Size
            <select
              value={proseFontSize}
              onChange={(event) => onProseFontSizeChange(event.target.value)}
              className={`${fieldClass} mt-1.5`}
              style={{
                backgroundColor: 'var(--editor-toolbar-bg)',
                borderColor: 'var(--editor-border)',
                color: 'var(--editor-text)',
              }}
            >
              {PROSE_FONT_SIZE_OPTIONS.map((size) => (
                <option key={size.label} value={size.value}>
                  {size.label}
                </option>
              ))}
            </select>
          </label>

          <label className={labelClass} style={{ color: 'var(--editor-text-subtle)' }}>
            Tab indent
            <select
              value={tabSize}
              onChange={(event) => onTabSizeChange(event.target.value)}
              className={`${fieldClass} mt-1.5`}
              style={{
                backgroundColor: 'var(--editor-toolbar-bg)',
                borderColor: 'var(--editor-border)',
                color: 'var(--editor-text)',
              }}
            >
              {TAB_SIZE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded px-4 py-2 font-ui text-sm uppercase tracking-wide transition"
            style={{
              backgroundColor: 'var(--editor-btn-active-bg)',
              color: 'var(--editor-accent)',
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

export default EditorDefaultsDialog
