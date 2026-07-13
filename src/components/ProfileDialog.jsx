import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { planLabel } from '../constants/account'
import { confirmAction } from '../lib/confirmAction'
import { getProfileNames } from '../lib/userProfile'

const editableFieldClass =
  'w-full rounded border border-bronze-dark/50 bg-ink px-3 py-2 text-cream placeholder:text-cream/30 focus:border-bronze focus:outline-none'

const ProfileDialog = ({ onClose }) => {
  const navigate = useNavigate()
  const { user, plan, updateProfile, deleteAccount } = useAuth()
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!user) return
    const names = getProfileNames(user)
    setFirstName(names.firstName)
    setLastName(names.lastName)
  }, [user])

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === 'Escape' && !deleting && !saving) {
        onClose()
      }
    }

    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [onClose, deleting, saving])

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

  const handleDeleteAccount = async () => {
    setError(null)

    const confirmed = await confirmAction({
      message:
        'Permanently delete your account? This will permanently delete all of your Tales, writing, uploaded images, Bronze Knuckles Magazine submissions and files, and other account data. Your user account will also be removed. This cannot be undone.',
      confirmLabel: 'Delete my account',
      destructive: true,
    })

    if (!confirmed) return

    setDeleting(true)

    const result = await deleteAccount()

    if (result.success) {
      onClose()
      navigate('/')
      return
    }

    setError(result.message)
    setDeleting(false)
  }

  return (
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
            onClick={handleDeleteAccount}
            disabled={deleting || saving}
            className="border border-error/50 px-3 py-2 font-ui text-sm uppercase tracking-wide text-error hover:border-error hover:bg-error/10 disabled:opacity-50"
          >
            {deleting ? 'Deleting account…' : 'Delete my account'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ProfileDialog
