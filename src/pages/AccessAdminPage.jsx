import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  useApprovedUsers,
  useRegisteredUsers,
  useApproveUser,
  useSetUserAccess,
  useSetUserPlan,
} from '../hooks/useApprovedUsers'
import { PLAN_FREE, PLAN_PAID, isPaidPlan, normalizePlan, planLabel } from '../constants/account'
import { confirmAction } from '../lib/confirmAction'
import Loading from './Loading'

const getApprovalForEmail = (approvals, email) => {
  const key = email?.toLowerCase()
  if (!key) return null

  const matches = approvals.filter((a) => a.email?.toLowerCase() === key)
  if (matches.length === 0) return null

  return matches.find((a) => !a.revoked_at) || matches[0]
}

const AccessAdminPage = () => {
  const { data: approvals, isLoading: approvalsLoading, error: approvalsError } = useApprovedUsers()
  const { data: registered, isLoading: registeredLoading, error: registeredError } = useRegisteredUsers()
  const approveUser = useApproveUser()
  const setUserAccess = useSetUserAccess()
  const setUserPlan = useSetUserPlan()

  const [email, setEmail] = useState('')
  const [notes, setNotes] = useState('')
  const [filter, setFilter] = useState('')
  const [formError, setFormError] = useState(null)

  const approvalList = approvals || []
  const registeredList = registered || []

  const registeredEmails = useMemo(
    () => new Set(registeredList.map((u) => u.email?.toLowerCase()).filter(Boolean)),
    [registeredList],
  )

  const preApprovedOnly = useMemo(
    () => approvalList.filter(
      (a) => !a.revoked_at && !registeredEmails.has(a.email?.toLowerCase()),
    ),
    [approvalList, registeredEmails],
  )

  const filteredRegistered = useMemo(() => {
    const q = filter.trim().toLowerCase()
    if (!q) return registeredList
    return registeredList.filter((u) => u.email?.toLowerCase().includes(q))
  }, [registeredList, filter])

  if (approvalsLoading || registeredLoading) return <Loading />

  const handleApproveByEmail = async (e) => {
    e.preventDefault()
    setFormError(null)

    if (!email.trim()) {
      setFormError('Enter an email address.')
      return
    }

    try {
      await approveUser.mutateAsync({ email, notes })
      setEmail('')
      setNotes('')
    } catch (err) {
      setFormError(err.message || 'Failed to add approval.')
    }
  }

  const handleToggleAccess = async (account) => {
    const approval = getApprovalForEmail(approvalList, account.email)
    const isActive = approval && !approval.revoked_at

    if (isActive && !(await confirmAction(`Revoke access for ${account.email}?`))) {
      return
    }

    try {
      await setUserAccess.mutateAsync({
        email: account.email,
        userId: account.user_id,
        approval,
        action: isActive ? 'revoke' : 'approve',
      })
    } catch (err) {
      setFormError(err.message || 'Failed to update access.')
    }
  }

  const handleTogglePlan = async (account) => {
    const currentPlan = normalizePlan(account.plan)
    const nextPlan = isPaidPlan(currentPlan) ? PLAN_FREE : PLAN_PAID
    const actionLabel = nextPlan === PLAN_PAID ? 'Mark paid' : 'Mark free'

    if (!(await confirmAction(`${actionLabel} for ${account.email}?`))) {
      return
    }

    try {
      await setUserPlan.mutateAsync({
        userId: account.user_id,
        plan: nextPlan,
      })
    } catch (err) {
      setFormError(err.message || 'Failed to update plan.')
    }
  }

  const error = approvalsError || registeredError
  const actionsPending = setUserAccess.isPending || setUserPlan.isPending

  return (
    <div className="mx-auto max-w-3xl p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-ui text-2xl uppercase tracking-wide text-bronze">Write Access</h1>
          <p className="mt-1 text-sm text-cream/60">
            Manage who can use Write Knuckles and Free / Paid account plans.
          </p>
        </div>
        <Link to="/" className="text-sm text-cream/50 hover:text-bronze">
          &larr; Tales
        </Link>
      </div>

      <form onSubmit={handleApproveByEmail} className="mb-10 rounded border border-bronze-dark/50 bg-surface/30 p-4">
        <h2 className="mb-4 font-ui text-sm uppercase text-bronze">Approve by email</h2>
        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="author@example.com"
            className="flex-1 rounded border border-bronze-dark/50 bg-ink px-3 py-2 text-cream focus:border-bronze focus:outline-none"
          />
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Notes (optional)"
            className="flex-1 rounded border border-bronze-dark/50 bg-ink px-3 py-2 text-cream focus:border-bronze focus:outline-none"
          />
          <button
            type="submit"
            disabled={approveUser.isPending}
            className="shrink-0 border border-bronze bg-bronze/20 px-4 py-2 font-ui text-sm uppercase text-bronze hover:bg-bronze/30 disabled:opacity-50"
          >
            Approve
          </button>
        </div>
        {formError && <p className="mt-2 text-sm text-error">{formError}</p>}
        <p className="mt-2 text-xs text-cream/40">
          Approve someone before they sign up, or pick from registered accounts below.
          Approval controls beta access; plan is separate (Free by default).
        </p>
      </form>

      {error && (
        <p className="mb-6 text-error">
          Could not load access data. Ensure migrations are applied and you are a magazine admin.
        </p>
      )}

      <section className="mb-10">
        <div className="mb-3 flex items-center justify-between gap-4">
          <h2 className="font-ui text-sm uppercase text-bronze">
            Registered accounts ({registeredList.length})
          </h2>
          <input
            type="search"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Filter by email…"
            className="w-48 rounded border border-bronze-dark/50 bg-ink px-2 py-1 text-sm text-cream focus:border-bronze focus:outline-none"
          />
        </div>

        {filteredRegistered.length === 0 ? (
          <p className="text-sm text-cream/40">No registered accounts found.</p>
        ) : (
          <ul className="divide-y divide-bronze-dark/30 rounded border border-bronze-dark/30">
            {filteredRegistered.map((account) => {
              const approval = getApprovalForEmail(approvalList, account.email)
              const isActive = approval && !approval.revoked_at
              const isRevoked = approval?.revoked_at
              const accountPlan = normalizePlan(account.plan)
              const paid = isPaidPlan(accountPlan)

              return (
                <li key={account.user_id} className="flex items-start justify-between gap-4 px-4 py-3">
                  <div className="min-w-0">
                    <div className="truncate text-cream">{account.email}</div>
                    <div className="mt-1 text-xs text-cream/40">
                      Joined {new Date(account.created_at).toLocaleDateString()}
                      {account.last_sign_in_at && (
                        <> · Last sign-in {new Date(account.last_sign_in_at).toLocaleDateString()}</>
                      )}
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1">
                      <span className={`text-xs uppercase ${paid ? 'text-bronze' : 'text-cream/40'}`}>
                        {planLabel(accountPlan)}
                      </span>
                      <span className="text-cream/20">·</span>
                      {isActive && (
                        <span className="text-xs uppercase text-bronze">Approved</span>
                      )}
                      {!approval && (
                        <span className="text-xs uppercase text-cream/30">Not approved</span>
                      )}
                      {isRevoked && (
                        <span className="text-xs uppercase text-cream/50">Revoked</span>
                      )}
                      {isActive && approval?.notes && (
                        <span className="text-xs text-cream/40">· {approval.notes}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-2">
                    <button
                      type="button"
                      onClick={() => handleToggleAccess(account)}
                      disabled={actionsPending}
                      className={`text-xs uppercase ${
                        isActive
                          ? 'text-cream/40 hover:text-error'
                          : 'text-bronze hover:text-cream'
                      }`}
                    >
                      {isActive ? 'Revoke' : isRevoked ? 'Re-approve' : 'Approve'}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleTogglePlan(account)}
                      disabled={actionsPending}
                      className="text-xs uppercase text-cream/40 hover:text-bronze"
                    >
                      {paid ? 'Mark free' : 'Mark paid'}
                    </button>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </section>

      {preApprovedOnly.length > 0 && (
        <section>
          <h2 className="mb-3 font-ui text-sm uppercase text-bronze">
            Pre-approved, not signed up ({preApprovedOnly.length})
          </h2>
          <ul className="divide-y divide-bronze-dark/30 rounded border border-bronze-dark/30">
            {preApprovedOnly.map((u) => (
              <li key={u.id} className="flex items-start justify-between gap-4 px-4 py-3">
                <div className="min-w-0">
                  <div className="truncate text-cream">{u.email}</div>
                  <div className="mt-1 text-xs text-cream/40">
                    Waiting for sign-up
                    {u.notes ? ` · ${u.notes}` : ''}
                  </div>
                  <div className="text-xs text-cream/30">
                    Approved {new Date(u.approved_at).toLocaleDateString()}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={async () => {
                    if (!(await confirmAction(`Revoke pre-approval for ${u.email}?`))) return
                    setUserAccess.mutate({
                      email: u.email,
                      approval: u,
                      action: 'revoke',
                    })
                  }}
                  disabled={setUserAccess.isPending}
                  className="shrink-0 text-xs text-cream/40 hover:text-error"
                >
                  Revoke
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}

export default AccessAdminPage
