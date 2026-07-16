import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { planLabel } from '../constants/account'
import { getProfileNames } from '../lib/userProfile'
import Password from './Password'

const DELETE_PHRASE = 'DELETE MY ACCOUNT'

const editableFieldClass =
  'w-full rounded border border-bronze-dark/50 bg-ink px-3 py-2 text-cream placeholder:text-cream/30 focus:border-bronze focus:outline-none'

const DeleteAccountDialog = ({ onCancel, onConfirm, busy, error }) => {
  const [phrase, setPhrase] = useState('')
  const [password, setPassword] = useState('')
  const phraseOk = phrase === DELETE_PHRASE
  const canSubmit = phraseOk && password.length > 0 && !busy

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!canSubmit) return
    await onConfirm(password)
  }

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 p-4"
      role="presentation"
    >
      <div
        className="w-full max-w-md rounded border border-error/40 bg-ink p-6 shadow-xl"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="delete-account-title"
        aria-describedby="delete-account-desc"
      >
        <h2 id="delete-account-title" className="font-ui text-xl uppercase tracking-wide text-error">
          Delete account
        </h2>
        <p id="delete-account-desc" className="mt-3 text-sm leading-relaxed text-cream/70">
          This permanently deletes all of your Tales, writing, uploaded images, Bronze Knuckles
          Magazine submissions and files, and your user account. This cannot be undone.
        </p>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label htmlFor="delete-account-phrase" className="mb-2 block font-ui text-xs uppercase text-cream/80">
              Type {DELETE_PHRASE} to confirm
            </label>
            <input
              id="delete-account-phrase"
              type="text"
              value={phrase}
              onChange={(e) => setPhrase(e.target.value)}
              autoComplete="off"
              disabled={busy}
              className={editableFieldClass}
              placeholder={DELETE_PHRASE}
            />
          </div>

          <div>
            <label htmlFor="delete-account-password" className="mb-2 block font-ui text-xs uppercase text-cream/80">
              Password
            </label>
            <Password
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={busy}
            />
          </div>

          {error && <p className="text-sm text-error">{error}</p>}

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onCancel}
              disabled={busy}
              className="border border-bronze-dark px-3 py-2 font-ui text-sm uppercase tracking-wide text-cream/60 hover:border-bronze hover:text-cream disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!canSubmit}
              className="border border-error/50 px-3 py-2 font-ui text-sm uppercase tracking-wide text-error hover:border-error hover:bg-error/10 disabled:opacity-50"
            >
              {busy ? 'Deleting…' : 'Delete my account'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

const ProfileDialog = ({ onClose }) => {
  const navigate = useNavigate()
  const { user, plan, updateProfile, deleteAccount } = useAuth()
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleteError, setDeleteError] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!user) return
    const names = getProfileNames(user)
    setFirstName(names.firstName)
    setLastName(names.lastName)
  }, [user])

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === 'Escape' && !deleting && !saving && !deleteOpen) {
        onClose()
      }
    }

    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [onClose, deleting, saving, deleteOpen])

  const handleSave = async (e) => {
    e.preventDefault()
    setError(null)
    setSaving(true)

    const result = await updateProfile({ firstName, lastName })

    if (!result.success) {
      setError(result.message)
    }

    setSaving(false)
  }

  const handleConfirmDelete = async (password) => {
    setDeleteError(null)
    setDeleting(true)

    const result = await deleteAccount(password)

    if (result.success) {
      onClose()
      navigate('/')
      return
    }

    setDeleteError(result.message)
    setDeleting(false)
  }

  return (
    <>
      <div
        className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4"
        role="presentation"
      >
        <div
          className="w-full max-w-md rounded border border-bronze-dark/50 bg-ink p-6 shadow-xl"
          role="dialog"
          aria-modal="true"
          aria-labelledby="profile-dialog-title"
        >
          <div className="mb-6 flex items-start justify-between gap-4">
            <div>
              <h2 id="profile-dialog-title" className="font-ui text-xl uppercase tracking-wide text-bronze">
                Profile
              </h2>
              <p className="mt-1 text-sm text-cream/60">Your account details.</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="text-cream/50 hover:text-bronze disabled:opacity-40"
              aria-label="Close profile"
              disabled={deleting || saving}
            >
              ×
            </button>
          </div>

          <form onSubmit={handleSave} className="space-y-5">
            <div>
              <div className="mb-1 font-ui text-xs uppercase text-cream/80">Email</div>
              <p className="select-text text-cream">{user?.email || '—'}</p>
            </div>

            <div>
              <div className="mb-1 font-ui text-xs uppercase text-cream/80">Account</div>
              <p className="text-cream">{planLabel(plan)}</p>
            </div>

            <div>
              <label htmlFor="profile-first-name" className="mb-2 block font-ui text-xs uppercase text-cream/80">
                First name
              </label>
              <input
                id="profile-first-name"
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                autoComplete="given-name"
                disabled={saving || deleting}
                className={editableFieldClass}
              />
            </div>

            <div>
              <label htmlFor="profile-last-name" className="mb-2 block font-ui text-xs uppercase text-cream/80">
                Last name
              </label>
              <input
                id="profile-last-name"
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                autoComplete="family-name"
                disabled={saving || deleting}
                className={editableFieldClass}
              />
            </div>

            <div className="flex items-center justify-between gap-3">
              <Link
                to="/reset"
                className="font-ui text-sm uppercase tracking-wide text-bronze hover:text-cream"
                onClick={onClose}
              >
                Reset password
              </Link>
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={saving || deleting}
                  className="border border-bronze-dark px-3 py-2 font-ui text-sm uppercase tracking-wide text-bronze hover:border-bronze hover:bg-bronze/10 disabled:opacity-50"
                >
                  {saving ? 'Saving…' : 'Save'}
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  disabled={saving || deleting}
                  className="border border-bronze-dark px-3 py-2 font-ui text-sm uppercase tracking-wide text-cream/60 hover:border-bronze hover:text-cream disabled:opacity-50"
                >
                  Close
                </button>
              </div>
            </div>

            {error && <p className="text-sm text-error">{error}</p>}
          </form>

          <div className="border-t border-bronze-dark/30 pt-5 mt-5">
            <p className="mb-3 text-sm leading-relaxed text-cream/60">
              Deleting your account permanently removes all of your Tales, writing, uploaded files,
              Bronze Knuckles Magazine submissions, and account data.
            </p>
            <button
              type="button"
              onClick={() => {
                setDeleteError(null)
                setDeleteOpen(true)
              }}
              disabled={deleting || saving}
              className="border border-error/50 px-3 py-2 font-ui text-sm uppercase tracking-wide text-error hover:border-error hover:bg-error/10 disabled:opacity-50"
            >
              Delete my account
            </button>
          </div>
        </div>
      </div>

      {deleteOpen && (
        <DeleteAccountDialog
          busy={deleting}
          error={deleteError}
          onCancel={() => {
            if (deleting) return
            setDeleteOpen(false)
            setDeleteError(null)
          }}
          onConfirm={handleConfirmDelete}
        />
      )}
    </>
  )
}

export default ProfileDialog
