import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
  DEFAULT_TALE_SORT,
  TALE_SORT,
  sortableTitle,
  sortTales,
} from './sortTales.js'

describe('sortableTitle', () => {
  it('strips leading The / A / An', () => {
    assert.equal(sortableTitle('The Great Gatsby'), 'Great Gatsby')
    assert.equal(sortableTitle('A Tale of Two Cities'), 'Tale of Two Cities')
    assert.equal(sortableTitle('An American Tragedy'), 'American Tragedy')
  })

  it('is case-insensitive for articles', () => {
    assert.equal(sortableTitle('THE Road'), 'Road')
    assert.equal(sortableTitle('a Clockwork Orange'), 'Clockwork Orange')
  })

  it('leaves titles without articles alone', () => {
    assert.equal(sortableTitle('Moby-Dick'), 'Moby-Dick')
    assert.equal(sortableTitle('Then Came the Night'), 'Then Came the Night')
  })

  it('keeps a title that is only an article', () => {
    assert.equal(sortableTitle('The'), 'The')
    assert.equal(sortableTitle('A'), 'A')
  })
})

describe('sortTales', () => {
  const tales = [
    { id: '1', title: 'The Odyssey', created_at: '2026-01-03T00:00:00Z' },
    { id: '2', title: 'Beowulf', created_at: '2026-01-01T00:00:00Z' },
    { id: '3', title: 'Aeneid', created_at: '2026-01-02T00:00:00Z' },
  ]

  it('defaults to newest first', () => {
    assert.equal(DEFAULT_TALE_SORT, TALE_SORT.NEWEST)
    assert.deepEqual(
      sortTales(tales).map((t) => t.id),
      ['1', '3', '2'],
    )
  })

  it('sorts oldest first', () => {
    assert.deepEqual(
      sortTales(tales, TALE_SORT.OLDEST).map((t) => t.id),
      ['2', '3', '1'],
    )
  })

  it('sorts titles A–Z ignoring leading articles', () => {
    assert.deepEqual(
      sortTales(tales, TALE_SORT.TITLE).map((t) => t.title),
      ['Aeneid', 'Beowulf', 'The Odyssey'],
    )
  })
})
