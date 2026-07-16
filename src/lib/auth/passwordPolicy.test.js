import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
  evaluatePassword,
  formatAuthPasswordError,
  MIN_PASSWORD_LENGTH,
} from './passwordPolicy.js'

describe('evaluatePassword', () => {
  it('accepts a password that meets all rules', () => {
    const result = evaluatePassword('Abcd1234!')
    assert.equal(result.ok, true)
    assert.deepEqual(result.checks, {
      length: true,
      lower: true,
      upper: true,
      digit: true,
      symbol: true,
    })
  })

  it('rejects short passwords', () => {
    const result = evaluatePassword('Ab1!')
    assert.equal(result.ok, false)
    assert.equal(result.checks.length, false)
  })

  it('rejects missing character classes', () => {
    assert.equal(evaluatePassword('abcdefgh1!').checks.upper, false)
    assert.equal(evaluatePassword('ABCDEFGH1!').checks.lower, false)
    assert.equal(evaluatePassword('Abcdefgh!').checks.digit, false)
    assert.equal(evaluatePassword('Abcdefgh1').checks.symbol, false)
  })
})

describe('formatAuthPasswordError', () => {
  it('maps pwned reason', () => {
    const msg = formatAuthPasswordError({
      weak_password: { reasons: ['pwned'] },
      message: 'Password is known to be weak',
    })
    assert.match(msg, /data breach/i)
  })

  it('maps length and characters reasons', () => {
    const msg = formatAuthPasswordError({
      weak_password: { reasons: ['length', 'characters'] },
    })
    assert.match(msg, new RegExp(`${MIN_PASSWORD_LENGTH} characters`))
    assert.match(msg, /uppercase/i)
  })

  it('falls back to error message', () => {
    assert.equal(formatAuthPasswordError({ message: 'Invalid email' }), 'Invalid email')
  })
})
