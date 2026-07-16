import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
  harperWordsEqual,
  isWordInHarperDictionary,
  normalizeHarperWord,
} from './normalizeWord.js'

describe('normalizeHarperWord', () => {
  it('maps curly apostrophes to ASCII', () => {
    assert.equal(normalizeHarperWord('O\u2019Shaughnessy'), "O'Shaughnessy")
    assert.equal(normalizeHarperWord("O'Shaughnessy"), "O'Shaughnessy")
  })

  it('strips outer punctuation', () => {
    assert.equal(normalizeHarperWord('"O\u2019Shaughnessy,"'), "O'Shaughnessy")
  })

  it('treats curly and straight forms as equal', () => {
    assert.equal(harperWordsEqual('O\u2019Shaughnessy', "O'Shaughnessy"), true)
    assert.equal(
      isWordInHarperDictionary('O\u2019Shaughnessy', ["O'Shaughnessy"]),
      true,
    )
  })
})
