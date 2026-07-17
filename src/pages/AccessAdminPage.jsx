import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  useApprovedUsers,
  useRegisteredUsers,
  useApproveUser,
  useSetUserAccess,
  useSetUserPlan,
} from '../hooks/useApprovedUsers'
import { useAdminUsageStats } from '../hooks/useAdminUsageStats'
import { usePlanLimits, useSetFreeTaleLimit } from '../hooks/usePlanLimits'
import {
  PLAN_COMPLIMENTARY,
  PLAN_FREE,
  PLAN_PAID,
  hasPaidEntitlements,
  maxActiveTalesForPlan,
  normalizePlan,
  planLabel,
} from '../constants/account'
import { confirmAction } from '../lib/confirmAction'
import Loading from './Loading'

const formatCount = (value) => Number(value || 0).toLocaleString()

const formatAverage = (value) => {
  const n = Number(value || 0)
  return Number.isInteger(n) ? n.toLocaleString() : n.toLocaleString(undefined, { maximumFractionDigits: 1 })
}

const StatBlock = ({ label, value }) => (
  <div>
    <div className="text-xs uppercase tracking-wide text-cream/40">{label}</div>
    <div className="mt-1 font-prose text-lg text-cream">{value}</div>
  </div>
)

const UsageSummary = ({ stats, isLoading, error }) => {
  if (isLoading) {
    return (
      <section className="mb-10 rounded border border-bronze-dark/50 bg-surface/30 p-4">
        <h2 className="mb-2 font-ui text-sm uppercase text-bronze">Usage</h2>
        <p className="text-sm text-cream/40">Loading usage stats…</p>
      </section>
    )
  }

  if (error || !stats) {
    return (
      <section className="mb-10 rounded border border-bronze-dark/50 bg-surface/30 p-4">
        <h2 className="mb-2 font-ui text-sm uppercase text-bronze">Usage</h2>
        <p className="text-sm text-error">
          Could not load usage stats. Ensure the admin_usage_stats migration is applied.
        </p>
      </section>
    )
  }

  return (
    <section className="mb-10 rounded border border-bronze-dark/50 bg-surface/30 p-4">
      <h2 className="mb-4 font-ui text-sm uppercase text-bronze">Usage</h2>

      <div className="mb-6">
        <h3 className="mb-3 text-xs uppercase tracking-wide text-cream/50">
          Accounts with tales
        </h3>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <StatBlock label="Total" value={formatCount(stats.accounts)} />
          <StatBlock label="Free" value={formatCount(stats.accounts_free)} />
          <StatBlock label="Paid" value={formatCount(stats.accounts_paid)} />
          <StatBlock label="Complimentary" value={formatCount(stats.accounts_complimentary)} />
        </div>
      </div>

      <div className="mb-6">
        <h3 className="mb-3 text-xs uppercase tracking-wide text-cream/50">Content</h3>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <StatBlock label="Tales" value={formatCount(stats.tales)} />
          <StatBlock label="Scenes" value={formatCount(stats.scenes)} />
          <StatBlock label="Total words" value={formatCount(stats.total_words)} />
          <StatBlock
            label="Words / tale"
            value={`${formatAverage(stats.avg_words_per_tale)} avg · ${formatCount(stats.max_words_per_tale)} max`}
          />
          <StatBlock
            label="Scenes / tale"
            value={`${formatAverage(stats.avg_scenes_per_tale)} avg · ${formatCount(stats.max_scenes_per_tale)} max`}
          />
          <StatBlock
            label="Words / scene"
            value={`${formatAverage(stats.avg_words_per_scene)} avg · ${formatCount(stats.max_words_per_scene)} max`}
          />
        </div>
      </div>

      <div>
        <h3 className="mb-3 text-xs uppercase tracking-wide text-cream/50">Storage</h3>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <StatBlock
            label="Images / tale"
            value={`${formatAverage(stats.avg_images_per_tale)} avg · ${formatCount(stats.max_images_per_tale)} max`}
          />
        </div>
      </div>
    </section>
  )
}

const PlanLimitsCard = ({ limits, isLoading, error }) => {
  const setFreeTaleLimit = useSetFreeTaleLimit()
  const freeLimit = maxActiveTalesForPlan(limits, PLAN_FREE)
  const [value, setValue] = useState('')
  const [formError, setFormError] = useState(null)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (typeof freeLimit === 'number') {
      setValue(String(freeLimit))
    }
  }, [freeLimit])

  const handleSave = async (e) => {
    e.preventDefault()
    setFormError(null)
    setSaved(false)

    const parsed = Number(value)
    if (!Number.isInteger(parsed) || parsed < 0) {
      setFormError('Enter a whole number of 0 or greater.')
      return
    }

    if (
      !(await confirmAction(
        `Set the Free plan active-tale limit to ${parsed}? Archived tales do not count.`,
      ))
    ) {
      return
    }

    try {
      await setFreeTaleLimit.mutateAsync(parsed)
      setSaved(true)
    } catch (err) {
      setFormError(err.message || 'Failed to update plan limits.')
    }
  }

  if (isLoading) {
    return (
      <section className="mb-10 rounded border border-bronze-dark/50 bg-surface/30 p-4">
        <h2 className="mb-2 font-ui text-sm uppercase text-bronze">Plan limits</h2>
        <p className="text-sm text-cream/40">Loading plan limits…</p>
      </section>
    )
  }

  if (error || !limits) {
    return (
      <section className="mb-10 rounded border border-bronze-dark/50 bg-surface/30 p-4">
        <h2 className="mb-2 font-ui text-sm uppercase text-bronze">Plan limits</h2>
        <p className="text-sm text-error">
          Could not load plan limits. Ensure the plan_limits migration is applied.
        </p>
      </section>
    )
  }

  return (
    <section className="mb-10 rounded border border-bronze-dark/50 bg-surface/30 p-4">
      <h2 className="mb-4 font-ui text-sm uppercase text-bronze">Plan limits</h2>
      <form onSubmit={handleSave} className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <label className="flex flex-1 flex-col gap-1">
          <span className="text-xs uppercase tracking-wide text-cream/50">
            Free · max active tales
          </span>
          <input
            type="number"
            min={0}
            step={1}
            value={value}
            onChange={(e) => {
              setSaved(false)
              setValue(e.target.value)
            }}
            className="rounded border border-bronze-dark/50 bg-ink px-3 py-2 text-cream focus:border-bronze focus:outline-none"
          />
        </label>
        <button
          type="submit"
          disabled={setFreeTaleLimit.isPending}
          className="shrink-0 border border-bronze bg-bronze/20 px-4 py-2 font-ui text-sm uppercase text-bronze hover:bg-bronze/30 disabled:opacity-50"
        >
          {setFreeTaleLimit.isPending ? 'Saving…' : 'Save'}
        </button>
      </form>
      {formError && <p className="mt-2 text-sm text-error">{formError}</p>}
      {saved && !formError && (
        <p className="mt-2 text-sm text-bronze">Free plan limit updated.</p>
      )}
      <p className="mt-2 text-xs text-cream/40">
        Paid and Complimentary remain unlimited. Only non-archived tales count toward the Free
        cap.
      </p>
    </section>
  )
}

const getApprovalForEmail = (approvals, email) => {
  const key = email?.toLowerCase()
  if (!key) return null

  const matches = approvals.filter((a) => a.email?.toLowerCase() === key)
  if (matches.length === 0) return null

  return matches.find((a) => !a.revoked_at) || matches[0]
}

const PLAN_ACTIONS = [
  { plan: PLAN_FREE, label: 'Mark free' },
  { plan: PLAN_PAID, label: 'Mark paid' },
  { plan: PLAN_COMPLIMENTARY, label: 'Mark complimentary' },
]

const AccessAdminPage = () => {
  const { data: approvals, isLoading: approvalsLoading, error: approvalsError } = useApprovedUsers()
  const { data: registered, isLoading: registeredLoading, error: registeredError } = useRegisteredUsers()
  const {
    data: usageStats,
    isLoading: usageLoading,
    error: usageError,
  } = useAdminUsageStats()
  const {
    data: planLimits,
    isLoading: planLimitsLoading,
    error: planLimitsError,
  } = usePlanLimits()
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

  const handleSetPlan = async (account, nextPlan) => {
    const action = PLAN_ACTIONS.find((a) => a.plan === nextPlan)
    if (!action) return

    if (!(await confirmAction(`${action.label} for ${account.email}?`))) {
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
          <h1 className="font-ui text-2xl uppercase tracking-wide text-bronze">Admin</h1>
          <p className="mt-1 text-sm text-cream/60">
            Usage overview, beta access, and Free / Paid / Complimentary plans.
          </p>
        </div>
        <Link to="/" className="text-sm text-cream/50 hover:text-bronze">
          &larr; Tales
        </Link>
      </div>

      <UsageSummary stats={usageStats} isLoading={usageLoading} error={usageError} />

      <PlanLimitsCard
        limits={planLimits}
        isLoading={planLimitsLoading}
        error={planLimitsError}
      />

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
          Approval controls beta access. Plan is separate: Free by default, Paid for billable
          accounts, Complimentary for gifts that must never be charged.
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
              const entitled = hasPaidEntitlements(accountPlan)

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
                      <span className={`text-xs uppercase ${entitled ? 'text-bronze' : 'text-cream/40'}`}>
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
                    {PLAN_ACTIONS.filter((action) => action.plan !== accountPlan).map((action) => (
                      <button
                        key={action.plan}
                        type="button"
                        onClick={() => handleSetPlan(account, action.plan)}
                        disabled={actionsPending}
                        className="text-xs uppercase text-cream/40 hover:text-bronze"
                      >
                        {action.label}
                      </button>
                    ))}
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
