import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
  countScriptPanelsInPmDoc,
  isAutoPanelLineText,
  panelLineLabel,
} from './comicScriptNumbering.js'
import { TALE_TYPES } from '../../constants/taleTypes.js'
import { isComicTale, getTaleType } from '../taleTerminology.js'

describe('comicScriptNumbering', () => {
  it('builds Panel N labels', () => {
    assert.equal(panelLineLabel(1), 'Panel 1')
    assert.equal(panelLineLabel(12), 'Panel 12')
    assert.equal(isAutoPanelLineText('Panel 3'), true)
    assert.equal(isAutoPanelLineText('Panel 3 — wide shot'), false)
  })

  it('counts panel-role paragraphs', () => {
    const doc = {
      descendants(callback) {
        const nodes = [
          { type: { name: 'paragraph' }, attrs: { scriptRole: 'panel' }, textContent: 'Panel 1' },
          { type: { name: 'paragraph' }, attrs: { scriptRole: 'panelDescription' }, textContent: 'desc' },
          { type: { name: 'paragraph' }, attrs: { scriptRole: 'panel' }, textContent: 'Panel 2' },
        ]
        nodes.forEach((node, i) => callback(node, i))
      },
    }
    assert.equal(countScriptPanelsInPmDoc(doc), 2)
  })
})

describe('tale type gate in comic context', () => {
  it('treats prose as non-comic so comic editor path stays gated', () => {
    assert.equal(isComicTale({ tale_type: TALE_TYPES.PROSE }), false)
    assert.equal(getTaleType({}), TALE_TYPES.PROSE)
    assert.equal(isComicTale({ tale_type: TALE_TYPES.COMIC }), true)
  })
})
