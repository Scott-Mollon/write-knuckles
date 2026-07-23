/**
 * Map Postgres / PostgREST abuse-guard exceptions to user-facing copy.
 * Server messages use codes like WK_ABUSE:scene_limit.
 */

const ABUSE_MESSAGES = {
  'WK_ABUSE:scene_limit':
    'This tale has reached the maximum number of scenes. Delete some scenes permanently, or contact support.',
  'WK_ABUSE:scene_bytes':
    'This scene is too large to save. Shorten the scene or split it into multiple scenes.',
  'WK_ABUSE:user_bytes':
    'Your account has reached the maximum writing storage. Delete tales or permanently remove scenes from Trash.',
  'WK_ABUSE:rate_limit':
    'Too many changes too quickly. Wait a moment and try again.',
}

/**
 * @param {unknown} error
 * @returns {string | null} Friendly message, or null if not an abuse error
 */
export function formatAbuseError(error) {
  const parts = []
  if (typeof error === 'string') {
    parts.push(error)
  } else if (error && typeof error === 'object') {
    for (const key of ['message', 'details', 'hint', 'code']) {
      if (key in error && error[key] != null) parts.push(String(error[key]))
    }
  }
  const raw = parts.join(' ')

  for (const code of Object.keys(ABUSE_MESSAGES)) {
    if (raw.includes(code)) return ABUSE_MESSAGES[code]
  }
  return null
}

/**
 * Prefer a mapped abuse Error; otherwise return the original value.
 * @param {unknown} error
 */
export function mapAbuseError(error) {
  const mapped = formatAbuseError(error)
  if (!mapped) return error
  const next = new Error(mapped)
  if (error && typeof error === 'object' && 'code' in error) {
    next.code = error.code
  }
  return next
}

/**
 * User-facing message for any thrown mutation error (abuse-mapped when possible).
 * @param {unknown} error
 * @param {string} [fallback]
 */
export function actionErrorMessage(error, fallback = 'Something went wrong. Please try again.') {
  return (
    formatAbuseError(error) ||
    (error instanceof Error && error.message) ||
    (error && typeof error === 'object' && 'message' in error && String(error.message)) ||
    fallback
  )
}
