export const PLAN_FREE = 'free'
export const PLAN_PAID = 'paid'
export const PLAN_COMPLIMENTARY = 'complimentary'

export const FREE_MAX_TALES = 3

export const FREE_TALE_LIMIT_MESSAGE =
  `Free accounts can have up to ${FREE_MAX_TALES} tales. Delete one to create another, or upgrade to a Paid subscription.`

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

export function canCreateTale({ plan, taleCount }) {
  if (hasPaidEntitlements(plan)) return true
  return (taleCount ?? 0) < FREE_MAX_TALES
}

export function planLabel(plan) {
  const normalized = normalizePlan(plan)
  if (normalized === PLAN_PAID) return 'Paid'
  if (normalized === PLAN_COMPLIMENTARY) return 'Complimentary'
  return 'Free'
}
