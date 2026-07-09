import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useTaleImageFromUrl } from '../../hooks/useTaleImageFromUrl'
import { useTaleImageUpload } from '../../hooks/useTaleImageUpload'
import { validateImageFile } from '../../lib/images/storage'
import { fieldClass, labelClass } from '../research/referenceStyles'

const ACCEPT = 'image/jpeg,image/png,image/webp,image/gif'
const COMPACT_POPOVER_WIDTH = 288

const getCompactPopoverPosition = (anchor) => {
  const rect = anchor.getBoundingClientRect()
  const margin = 8
  const left = Math.min(
    Math.max(margin, rect.right - COMPACT_POPOVER_WIDTH),
    window.innerWidth - COMPACT_POPOVER_WIDTH - margin,
  )

  return {
    top: rect.bottom + 4,
    left,
  }
}

const ImageIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <circle cx="8.5" cy="8.5" r="1.5" />
    <path d="m21 15-5-5L5 21" />
  </svg>
)

const DropZone = ({
  dropZoneId,
  inputId,
  compact,
  dragActive,
  busy,
  multiple,
  onDragEnter,
  onDragLeave,
  onDragOver,
  onDrop,
  onBrowse,
  onBrowseKeyDown,
}) => (
  <div
    id={dropZoneId}
    role="button"
    tabIndex={busy ? -1 : 0}
    aria-controls={inputId}
    aria-disabled={busy}
    onDragEnter={onDragEnter}
    onDragLeave={onDragLeave}
    onDragOver={onDragOver}
    onDrop={onDrop}
    onClick={() => !busy && onBrowse()}
    onKeyDown={onBrowseKeyDown}
    className={`rounded border border-dashed text-center transition ${
      compact ? 'px-3 py-4' : 'px-4 py-8'
    } ${
      dragActive
        ? 'border-bronze bg-bronze/10'
        : 'border-bronze-dark/50 bg-ink/40 hover:border-bronze/60 hover:bg-ink/60'
    } ${busy ? 'pointer-events-none opacity-60' : 'cursor-pointer'}`}
  >
    <div className="mx-auto mb-2 flex justify-center text-bronze/70">
      <ImageIcon />
    </div>
    <p className={`text-cream/70 ${compact ? 'text-xs' : 'text-sm'}`}>
      {dragActive ? 'Drop image here' : 'Drag and drop an image'}
    </p>
    <p className={`mt-1 text-cream/40 ${compact ? 'text-[10px]' : 'text-xs'}`}>
      or{' '}
      <span className="text-bronze underline decoration-bronze/40 underline-offset-2">
        browse files
      </span>
      {multiple ? ' (multiple)' : ''}
    </p>
    <p className="mt-2 text-[10px] text-cream/30">JPEG, PNG, WebP, GIF · max 10 MB</p>
  </div>
)

const UrlField = ({ url, onUrlChange, onSubmit, busy, compact, inputId }) => (
  <div className={compact ? 'space-y-2' : 'space-y-2'}>
    {!compact && (
      <label htmlFor={inputId} className={labelClass}>
        Image URL
      </label>
    )}
    <div className="flex gap-2">
      <input
        id={inputId}
        type="url"
        inputMode="url"
        value={url}
        onChange={(e) => onUrlChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault()
            onSubmit()
          }
        }}
        placeholder="https://…"
        disabled={busy}
        className={`${fieldClass} min-w-0 flex-1 ${compact ? 'text-xs' : ''}`}
      />
      <button
        type="button"
        onClick={onSubmit}
        disabled={busy || !url.trim()}
        className={`shrink-0 border border-bronze-dark px-3 font-ui uppercase tracking-wide text-bronze hover:border-bronze disabled:opacity-40 ${
          compact ? 'py-1.5 text-[10px]' : 'py-2 text-xs'
        }`}
      >
        Add
      </button>
    </div>
  </div>
)

const ImageUploadPanel = ({
  taleId,
  scope,
  entityId,
  multiple,
  allowUrl,
  compact,
  onAdded,
  onError,
}) => {
  const urlInputId = useId()
  const fileInputId = useId()
  const dropZoneId = useId()

  const fileInputRef = useRef(null)
  const dragDepthRef = useRef(0)

  const [url, setUrl] = useState('')
  const [dragActive, setDragActive] = useState(false)
  const [error, setError] = useState(null)

  const upload = useTaleImageUpload()
  const addFromUrl = useTaleImageFromUrl()

  const busy = upload.isPending || addFromUrl.isPending

  const clearError = () => setError(null)

  const handleError = (err) => {
    const message = err?.message || 'Something went wrong.'
    setError(message)
    onError?.(message)
  }

  const emitAdded = (result) => {
    clearError()
    onAdded?.(result)
  }

  const uploadFiles = async (files) => {
    if (!files?.length || busy) return

    const list = multiple ? [...files] : [files[0]]

    for (const file of list) {
      const validation = validateImageFile(file)
      if (!validation.valid) {
        handleError(new Error(validation.error))
        return
      }
    }

    try {
      for (const file of list) {
        const result = await upload.mutateAsync({ taleId, scope, entityId, file })
        emitAdded(result)
      }
      if (!multiple) {
        setUrl('')
      }
    } catch (err) {
      handleError(err)
    }
  }

  const handleUrlSubmit = async () => {
    if (busy || !url.trim()) return
    try {
      const result = await addFromUrl.mutateAsync({ url, taleId, scope, entityId })
      emitAdded(result)
      setUrl('')
    } catch (err) {
      handleError(err)
    }
  }

  const onDragEnter = (e) => {
    e.preventDefault()
    e.stopPropagation()
    dragDepthRef.current += 1
    setDragActive(true)
  }

  const onDragLeave = (e) => {
    e.preventDefault()
    e.stopPropagation()
    dragDepthRef.current -= 1
    if (dragDepthRef.current <= 0) {
      dragDepthRef.current = 0
      setDragActive(false)
    }
  }

  const onDragOver = (e) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const onDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    dragDepthRef.current = 0
    setDragActive(false)
    const files = [...e.dataTransfer.files].filter((f) => f.type.startsWith('image/'))
    if (!files.length) {
      handleError(new Error('Drop an image file (JPEG, PNG, WebP, or GIF).'))
      return
    }
    uploadFiles(files)
  }

  const onBrowse = () => fileInputRef.current?.click()

  const onBrowseKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      onBrowse()
    }
  }

  const onFileInputChange = (e) => {
    const files = [...e.target.files]
    e.target.value = ''
    if (files.length) uploadFiles(files)
  }

  return (
    <div className={compact ? 'space-y-3' : 'space-y-4'}>
      {allowUrl && (
        <UrlField
          url={url}
          onUrlChange={(value) => {
            clearError()
            setUrl(value)
          }}
          onSubmit={handleUrlSubmit}
          busy={busy}
          compact={compact}
          inputId={urlInputId}
        />
      )}

      {allowUrl && (
        <p className={`text-center uppercase tracking-widest text-cream/30 ${compact ? 'text-[9px]' : 'text-[10px]'}`}>
          or upload
        </p>
      )}

      <DropZone
        dropZoneId={dropZoneId}
        inputId={fileInputId}
        compact={compact}
        dragActive={dragActive}
        busy={busy}
        multiple={multiple}
        onDragEnter={onDragEnter}
        onDragLeave={onDragLeave}
        onDragOver={onDragOver}
        onDrop={onDrop}
        onBrowse={onBrowse}
        onBrowseKeyDown={onBrowseKeyDown}
      />

      <input
        ref={fileInputRef}
        id={fileInputId}
        type="file"
        accept={ACCEPT}
        multiple={multiple}
        className="sr-only"
        onChange={onFileInputChange}
        tabIndex={-1}
        aria-hidden
      />

      {busy && (
        <p className={`text-bronze/80 ${compact ? 'text-xs' : 'text-sm'}`} role="status">
          {addFromUrl.isPending ? 'Checking image URL…' : 'Uploading…'}
        </p>
      )}

      {error && (
        <p className={`text-error ${compact ? 'text-xs' : 'text-sm'}`} role="alert">
          {error}
        </p>
      )}
    </div>
  )
}

/**
 * Reusable image input: URL field, drag-and-drop, and file picker.
 * Storage only in step 2 — metadata persistence wired in later steps.
 */
const ImageUpload = ({
  taleId,
  scope,
  entityId,
  onAdded,
  onError,
  multiple = false,
  compact = false,
  allowUrl = true,
  className = '',
}) => {
  const [popoverOpen, setPopoverOpen] = useState(false)
  const [popoverPosition, setPopoverPosition] = useState(null)
  const triggerRef = useRef(null)
  const popoverId = useId()

  useLayoutEffect(() => {
    if (!popoverOpen || !triggerRef.current) return undefined

    const updatePosition = () => {
      if (!triggerRef.current) return
      setPopoverPosition(getCompactPopoverPosition(triggerRef.current))
    }

    updatePosition()
    window.addEventListener('resize', updatePosition)
    window.addEventListener('scroll', updatePosition, true)

    return () => {
      window.removeEventListener('resize', updatePosition)
      window.removeEventListener('scroll', updatePosition, true)
    }
  }, [popoverOpen])

  useEffect(() => {
    if (!popoverOpen) {
      setPopoverPosition(null)
    }
  }, [popoverOpen])

  if (compact) {
    return (
      <div className={className}>
        <button
          ref={triggerRef}
          type="button"
          title="Add image"
          aria-expanded={popoverOpen}
          aria-controls={popoverOpen ? popoverId : undefined}
          onClick={() => setPopoverOpen((open) => !open)}
          className="editor-toolbar-btn rounded px-2 py-1 text-sm transition hover:text-bronze"
        >
          <ImageIcon />
        </button>

        {popoverOpen && popoverPosition && createPortal(
          <>
            <button
              type="button"
              className="fixed inset-0 z-[90] cursor-default"
              aria-label="Close image menu"
              onClick={() => setPopoverOpen(false)}
            />
            <div
              id={popoverId}
              className="fixed z-[100] w-72 rounded border border-bronze-dark/50 bg-ink p-3 shadow-xl"
              style={{ top: popoverPosition.top, left: popoverPosition.left }}
              role="dialog"
              aria-label="Add image"
            >
              <ImageUploadPanel
                taleId={taleId}
                scope={scope}
                entityId={entityId}
                multiple={multiple}
                allowUrl={allowUrl}
                compact
                onAdded={(result) => {
                  onAdded?.(result)
                  if (!multiple) setPopoverOpen(false)
                }}
                onError={onError}
              />
            </div>
          </>,
          document.body,
        )}
      </div>
    )
  }

  return (
    <div className={className}>
      <ImageUploadPanel
        taleId={taleId}
        scope={scope}
        entityId={entityId}
        multiple={multiple}
        allowUrl={allowUrl}
        compact={false}
        onAdded={onAdded}
        onError={onError}
      />
    </div>
  )
}

export default ImageUpload
