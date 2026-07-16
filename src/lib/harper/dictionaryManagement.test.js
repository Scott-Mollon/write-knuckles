import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
  getDictionaryJumpKey,
  groupDictionaryWords,
} from './dictionaryIndex.js'
import { countIgnoredLintsJson } from './prefs.js'

describe('dictionary index', () => {
  it('sorts words case-insensitively and groups them alphabetically', () => {
    assert.deepEqual(groupDictionaryWords(['Beta', 'apple', 'Alpha']), [
      { key: 'A', words: ['Alpha', 'apple'] },
      { key: 'B', words: ['Beta'] },
    ])
  })

  it('groups words beginning with non-ASCII letters or symbols under #', () => {
    assert.equal(getDictionaryJumpKey('42nd'), '#')
    assert.equal(getDictionaryJumpKey('Élan'), '#')
    assert.deepEqual(groupDictionaryWords(['Zulu', '42nd']), [
      { key: 'Z', words: ['Zulu'] },
      { key: '#', words: ['42nd'] },
    ])
  })
})

describe('ignored lint count', () => {
  it('counts context hashes without converting large hash values to numbers', () => {
    assert.equal(
      countIgnoredLintsJson(
        '{"context_hashes":[15631463166295000148,18446744073709551615]}'
      ),
      2
    )
  })

  it('handles empty, legacy array, and malformed payloads', () => {
    assert.equal(countIgnoredLintsJson('[]'), 0)
    assert.equal(countIgnoredLintsJson('["15631463166295000148","2"]'), 2)
    assert.equal(countIgnoredLintsJson('not json'), 0)
  })
})
