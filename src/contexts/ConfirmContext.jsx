import { useEffect, useState } from 'react'
import { registerConfirmHandler } from '../lib/confirmAction'

const ConfirmDialog = ({ message, confirmLabel, cancelLabel, destructive, onConfirm, onCancel }) => {
  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === 'Escape') onCancel()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [onCancel])

  return (
  <div
    className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4"
    role="presentation"
  >
    <div
      className="w-full max-w-md rounded border border-bronze-dark/50 bg-ink p-6 shadow-xl"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-message"
    >
      <p id="confirm-dialog-message" className="text-sm leading-relaxed text-cream">
        {message}
      </p>
      <div className="mt-6 flex justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 font-ui text-sm uppercase text-cream/50 hover:text-cream"
        >
          {cancelLabel}
        </button>
        <button
          type="button"
          onClick={onConfirm}
          className={`border px-4 py-2 font-ui text-sm uppercase ${
            destructive
              ? 'border-error/50 text-error hover:border-error hover:bg-error/10'
              : 'border-bronze-dark text-bronze hover:border-bronze hover:bg-bronze/10'
          }`}
        >
          {confirmLabel}
        </button>
      </div>
    </div>
  </div>
  )
}

export const ConfirmProvider = ({ children }) => {
  const [pending, setPending] = useState(null)

  useEffect(() => {
    registerConfirmHandler((options) =>
      new Promise((resolve) => {
        setPending({ ...options, resolve })
      }),
    )

    return () => registerConfirmHandler(null)
  }, [])

  const close = (result) => {
    pending?.resolve(result)
    setPending(null)
  }

  return (
    <>
      {children}
      {pending && (
        <ConfirmDialog
          message={pending.message}
          confirmLabel={pending.confirmLabel || 'Confirm'}
          cancelLabel={pending.cancelLabel || 'Cancel'}
          destructive={pending.destructive ?? false}
          onConfirm={() => close(true)}
          onCancel={() => close(false)}
        />
      )}
    </>
  )
}
