import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { actionErrorMessage, formatAbuseError, mapAbuseError } from './abuseErrors.js'

describe('formatAbuseError', () => {
  it('maps known WK_ABUSE codes', () => {
    assert.match(
      formatAbuseError({ message: 'WK_ABUSE:scene_limit' }),
      /maximum number of scenes/i,
    )
    assert.match(formatAbuseError({ message: 'WK_ABUSE:scene_bytes' }), /too large/i)
    assert.match(formatAbuseError({ message: 'WK_ABUSE:user_bytes' }), /storage/i)
  })

  it('reads codes from details when message is generic', () => {
    assert.match(
      formatAbuseError({ message: 'Database error', details: 'WK_ABUSE:user_bytes' }),
      /storage/i,
    )
  })
})

describe('actionErrorMessage', () => {
  it('prefers abuse copy then Error.message', () => {
    assert.match(
      actionErrorMessage({ message: 'WK_ABUSE:scene_limit' }),
      /maximum number of scenes/i,
    )
    assert.equal(actionErrorMessage(new Error('plain')), 'plain')
    assert.equal(actionErrorMessage(null, 'fallback'), 'fallback')
  })
})

describe('mapAbuseError', () => {
  it('wraps abuse errors and passes others through', () => {
    const abuse = mapAbuseError({ message: 'WK_ABUSE:scene_bytes' })
    assert.ok(abuse instanceof Error)
    assert.match(abuse.message, /too large/i)

    const other = { message: 'network' }
    assert.equal(mapAbuseError(other), other)
  })
})
