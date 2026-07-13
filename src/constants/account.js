export const PLAN_FREE = 'free'
export const PLAN_PAID = 'paid'

export function normalizePlan(plan) {
  return plan === PLAN_PAID ? PLAN_PAID : PLAN_FREE
}

export function isPaidPlan(plan) {
  return normalizePlan(plan) === PLAN_PAID
}

export function planLabel(plan) {
  return isPaidPlan(plan) ? 'Paid' : 'Free'
}
