import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
  PLAN_COMPLIMENTARY,
  PLAN_FREE,
  PLAN_PAID,
  canCreateTale,
  freeTaleLimitMessage,
  maxActiveTalesForPlan,
} from './account.js'

describe('canCreateTale', () => {
  it('allows paid and complimentary regardless of count or limit', () => {
    assert.equal(canCreateTale({ plan: PLAN_PAID, taleCount: 99, maxActiveTales: 1 }), true)
    assert.equal(
      canCreateTale({ plan: PLAN_COMPLIMENTARY, taleCount: 99, maxActiveTales: undefined }),
      true,
    )
  })

  it('treats null maxActiveTales as unlimited for free', () => {
    assert.equal(canCreateTale({ plan: PLAN_FREE, taleCount: 100, maxActiveTales: null }), true)
  })

  it('denies when the free limit has not loaded', () => {
    assert.equal(canCreateTale({ plan: PLAN_FREE, taleCount: 0, maxActiveTales: undefined }), false)
  })

  it('enforces a numeric free limit against active tale count', () => {
    assert.equal(canCreateTale({ plan: PLAN_FREE, taleCount: 4, maxActiveTales: 5 }), true)
    assert.equal(canCreateTale({ plan: PLAN_FREE, taleCount: 5, maxActiveTales: 5 }), false)
    assert.equal(canCreateTale({ plan: PLAN_FREE, taleCount: 0, maxActiveTales: 0 }), false)
  })
})

describe('freeTaleLimitMessage', () => {
  it('includes the numeric free cap when known', () => {
    assert.match(freeTaleLimitMessage(5), /up to 5 tales/)
  })

  it('falls back when the cap is unknown', () => {
    assert.match(freeTaleLimitMessage(undefined), /tale limit/)
  })
})

describe('maxActiveTalesForPlan', () => {
  const rows = [
    { plan: 'free', max_active_tales: 5 },
    { plan: 'paid', max_active_tales: null },
    { plan: 'complimentary', max_active_tales: null },
  ]

  it('returns undefined when rows are missing', () => {
    assert.equal(maxActiveTalesForPlan(undefined, PLAN_FREE), undefined)
  })

  it('resolves free and unlimited paid caps', () => {
    assert.equal(maxActiveTalesForPlan(rows, PLAN_FREE), 5)
    assert.equal(maxActiveTalesForPlan(rows, PLAN_PAID), null)
  })
})
