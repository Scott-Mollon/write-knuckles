export const PLAN_FREE = 'free'
export const PLAN_PAID = 'paid'
export const PLAN_COMPLIMENTARY = 'complimentary'

export function normalizePlan(plan) {
  if (plan === PLAN_PAID) return PLAN_PAID
  if (plan === PLAN_COMPLIMENTARY) return PLAN_COMPLIMENTARY
  return PLAN_FREE
}

/** Billable plan only — future Stripe should use this, not entitlements. */
export function isBillablePlan(plan) {
  return normalizePlan(plan) === PLAN_PAID
}

/** Paid-tier product features (Paid or Complimentary). */
export function hasPaidEntitlements(plan) {
  const normalized = normalizePlan(plan)
  return normalized === PLAN_PAID || normalized === PLAN_COMPLIMENTARY
}

/** @deprecated Prefer isBillablePlan or hasPaidEntitlements */
export function isPaidPlan(plan) {
  return isBillablePlan(plan)
}

/**
 * @param {{ plan: string, taleCount: number, maxActiveTales: number | null | undefined }} args
 * `maxActiveTales`: null = unlimited; undefined = unknown / not loaded (deny).
 */
export function canCreateTale({ plan, taleCount, maxActiveTales }) {
  if (hasPaidEntitlements(plan)) return true
  if (maxActiveTales === null) return true
  if (typeof maxActiveTales !== 'number') return false
  return (taleCount ?? 0) < maxActiveTales
}

/**
 * @param {number | null | undefined} maxActiveTales
 */
export function freeTaleLimitMessage(maxActiveTales) {
  if (typeof maxActiveTales === 'number') {
    return `Free accounts can have up to ${maxActiveTales} tales. Delete one to create another, or upgrade to a Paid subscription.`
  }
  return 'Free accounts have a tale limit. Delete one to create another, or upgrade to a Paid subscription.'
}

export function planLabel(plan) {
  const normalized = normalizePlan(plan)
  if (normalized === PLAN_PAID) return 'Paid'
  if (normalized === PLAN_COMPLIMENTARY) return 'Complimentary'
  return 'Free'
}

/**
 * @param {Array<{ plan: string, max_active_tales: number | null }> | undefined} rows
 * @param {string} plan
 * @returns {number | null | undefined}
 */
export function maxActiveTalesForPlan(rows, plan) {
  if (!rows) return undefined
  const row = rows.find((r) => r.plan === normalizePlan(plan))
  if (!row) return undefined
  return row.max_active_tales
}
