import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
  collectBlockText,
  findInScenes,
  findInText,
  isWholeWordMatch,
  replaceOccurrencesInContent,
  replaceRangeInBlock,
} from './findReplace.js'

const para = (...parts) => ({
  type: 'doc',
  content: [
    {
      type: 'paragraph',
      content: parts.map((p) =>
        typeof p === 'string'
          ? { type: 'text', text: p }
          : { type: 'text', text: p.text, marks: p.marks },
      ),
    },
  ],
})

const scene = (id, content, chapter_id = 'ch1') => ({ id, chapter_id, content })

describe('isWholeWordMatch', () => {
  it('accepts bounded words and rejects substrings of larger words', () => {
    assert.equal(isWholeWordMatch('I run fast', 2, 5), true)
    assert.equal(isWholeWordMatch('running', 0, 3), false)
    assert.equal(isWholeWordMatch('run.', 0, 3), true)
    assert.equal(isWholeWordMatch("(run)", 1, 4), true)
  })
})

describe('findInText', () => {
  it('defaults to case-insensitive whole-word', () => {
    const text = 'Run to the running store and RUN home.'
    const hits = findInText(text, 'run', { matchCase: false, partialMatch: false })
    assert.deepEqual(
      hits.map((h) => h.matchText),
      ['Run', 'RUN'],
    )
  })

  it('respects Match Case', () => {
    const text = 'Run run RUN'
    assert.equal(findInText(text, 'run', { matchCase: true, partialMatch: false }).length, 1)
    assert.equal(findInText(text, 'run', { matchCase: false, partialMatch: false }).length, 3)
  })

  it('respects Partial Match', () => {
    const text = 'run running overrun'
    assert.equal(findInText(text, 'run', { partialMatch: false }).length, 1)
    assert.equal(findInText(text, 'run', { partialMatch: true }).length, 3)
  })
})

describe('findInScenes with marked text', () => {
  it('finds matches that span bold marks within a paragraph', () => {
    const content = para('He said ', { text: 'Sam', marks: [{ type: 'bold' }] }, 'uel left.')
    const hits = findInScenes([scene('s1', content)], 'Samuel', {
      matchCase: false,
      partialMatch: false,
    })
    assert.equal(hits.length, 1)
    assert.equal(hits[0].matchText, 'Samuel')
    assert.equal(hits[0].blockIndex, 0)
  })

  it('finds across multiple paragraphs', () => {
    const content = {
      type: 'doc',
      content: [
        { type: 'paragraph', content: [{ type: 'text', text: 'First cat here.' }] },
        { type: 'paragraph', content: [{ type: 'text', text: 'Second cat there.' }] },
      ],
    }
    const hits = findInScenes([scene('s1', content)], 'cat', { partialMatch: false })
    assert.equal(hits.length, 2)
    assert.equal(hits[0].blockIndex, 0)
    assert.equal(hits[1].blockIndex, 1)
  })
})

describe('replaceOccurrencesInContent', () => {
  it('replaces within a single text node', () => {
    const content = para('The cat sat.')
    const next = replaceOccurrencesInContent(
      content,
      [{ blockIndex: 0, start: 4, end: 7 }],
      'dog',
    )
    assert.equal(collectBlockText(next.content[0]).text, 'The dog sat.')
  })

  it('replaces across marked nodes and preserves remaining marks', () => {
    const content = para('He said ', { text: 'Sam', marks: [{ type: 'bold' }] }, 'uel left.')
    const hits = findInScenes([scene('s1', content)], 'Samuel')
    const next = replaceOccurrencesInContent(content, hits, 'Alex')
    assert.equal(collectBlockText(next.content[0]).text, 'He said Alex left.')
    const boldNode = next.content[0].content.find((n) => n.marks?.some((m) => m.type === 'bold'))
    assert.ok(boldNode)
    assert.equal(boldNode.text, 'Alex')
  })

  it('applies multiple replacements end-to-start without offset drift', () => {
    const content = para('cat and cat')
    const hits = findInScenes([scene('s1', content)], 'cat')
    assert.equal(hits.length, 2)
    const next = replaceOccurrencesInContent(content, hits, 'dog')
    assert.equal(collectBlockText(next.content[0]).text, 'dog and dog')
  })
})

describe('replaceRangeInBlock', () => {
  it('returns false when range does not cover text nodes', () => {
    const doc = {
      type: 'doc',
      content: [{ type: 'paragraph', content: [{ type: 'hardBreak' }] }],
    }
    assert.equal(replaceRangeInBlock(doc, 0, 0, 1, 'x'), false)
  })
})
