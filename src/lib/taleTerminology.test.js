import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { DEFAULT_TALE_TYPE, TALE_TYPES } from '../constants/taleTypes.js'
import {
  getTaleTerminology,
  getTaleType,
  isComicTale,
} from './taleTerminology.js'

describe('isComicTale', () => {
  it('is false for null, missing, and prose', () => {
    assert.equal(isComicTale(null), false)
    assert.equal(isComicTale(undefined), false)
    assert.equal(isComicTale({}), false)
    assert.equal(isComicTale({ tale_type: 'prose' }), false)
    assert.equal(isComicTale(TALE_TYPES.PROSE), false)
  })

  it('is true only for comic', () => {
    assert.equal(isComicTale({ tale_type: 'comic' }), true)
    assert.equal(isComicTale(TALE_TYPES.COMIC), true)
  })
})

describe('getTaleType', () => {
  it('defaults to prose', () => {
    assert.equal(getTaleType(null), DEFAULT_TALE_TYPE)
    assert.equal(getTaleType({}), TALE_TYPES.PROSE)
  })

  it('returns comic when set', () => {
    assert.equal(getTaleType({ tale_type: 'comic' }), TALE_TYPES.COMIC)
  })
})

describe('getTaleTerminology', () => {
  it('returns Chapter/Scene for prose', () => {
    const t = getTaleTerminology({ tale_type: 'prose' })
    assert.equal(t.chapter, 'Chapter')
    assert.equal(t.scene, 'Scene')
    assert.equal(t.defaultSceneTitle, 'Scene 1')
    assert.equal(t.byChapterView, 'By Chapter')
  })

  it('returns Issue/Page for comic', () => {
    const t = getTaleTerminology({ tale_type: 'comic' })
    assert.equal(t.chapter, 'Issue')
    assert.equal(t.scene, 'Page')
    assert.equal(t.defaultSceneTitle, 'Page 1')
    assert.equal(t.byChapterView, 'By Issue')
  })
})
