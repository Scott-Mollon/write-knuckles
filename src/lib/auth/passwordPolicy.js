/** Matches Supabase Auth symbol allowlist. */
const SYMBOL_RE = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?`~]/

export const MIN_PASSWORD_LENGTH = 8

export const PASSWORD_REQUIREMENT_LABELS = {
  length: `At least ${MIN_PASSWORD_LENGTH} characters`,
  lower: 'A lowercase letter',
  upper: 'An uppercase letter',
  digit: 'A number',
  symbol: 'A symbol (!@#$%…)',
}

/**
 * @param {string} password
 * @returns {{ ok: boolean, checks: { length: boolean, lower: boolean, upper: boolean, digit: boolean, symbol: boolean } }}
 */
export function evaluatePassword(password) {
  const value = typeof password === 'string' ? password : ''
  const checks = {
    length: value.length >= MIN_PASSWORD_LENGTH,
    lower: /[a-z]/.test(value),
    upper: /[A-Z]/.test(value),
    digit: /\d/.test(value),
    symbol: SYMBOL_RE.test(value),
  }
  return {
    ok: Object.values(checks).every(Boolean),
    checks,
  }
}

function collectWeakPasswordReasons(error) {
  const reasons = new Set()
  const weak = error?.weak_password
  if (Array.isArray(weak?.reasons)) {
    weak.reasons.forEach((r) => reasons.add(r))
  }
  if (Array.isArray(error?.reasons)) {
    error.reasons.forEach((r) => reasons.add(r))
  }
  const message = (error?.message || '').toLowerCase()
  if (/pwned|breach|leaked|compromised|easy to guess/.test(message)) {
    reasons.add('pwned')
  }
  if (/at least \d+ character|too short|length/.test(message)) {
    reasons.add('length')
  }
  if (/uppercase|lowercase|number|symbol|character/.test(message)) {
    reasons.add('characters')
  }
  return reasons
}

/**
 * Map Supabase Auth weak-password errors to user-facing copy.
 * @param {import('@supabase/supabase-js').AuthError | { message?: string, code?: string, reasons?: string[], weak_password?: { reasons?: string[] } } | null | undefined} error
 */
export function formatAuthPasswordError(error) {
  if (!error) return 'An error occurred. Please try again.'

  const reasons = collectWeakPasswordReasons(error)
  const messages = []

  if (reasons.has('pwned')) {
    messages.push('That password appears in a known data breach. Please choose a different one.')
  }
  if (reasons.has('length')) {
    messages.push(`Password must be at least ${MIN_PASSWORD_LENGTH} characters.`)
  }
  if (reasons.has('characters')) {
    messages.push('Password must include uppercase, lowercase, a number, and a symbol.')
  }

  if (messages.length) return messages.join(' ')

  if (error.code === 'weak_password' || /weak password|does not meet/i.test(error.message || '')) {
    return 'Password does not meet security requirements. See the checklist below.'
  }

  return error.message || 'An error occurred. Please try again.'
}
