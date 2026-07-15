import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { applyScriptTextTransform, buildCompileScriptStyles } from './compileScriptStyles.js'
import { DEFAULT_SCRIPT_STYLE_PREFERENCES } from '../editor/scriptStyles.js'
import { exportTxt } from './exportTxt.js'

describe('compileScriptStyles', () => {
  it('uppercases character names for plain text export', () => {
    const text = applyScriptTextTransform('Batman', 'character', DEFAULT_SCRIPT_STYLE_PREFERENCES)
    assert.equal(text, 'BATMAN')
  })

  it('includes script role CSS in compiled styles', () => {
    const css = buildCompileScriptStyles(DEFAULT_SCRIPT_STYLE_PREFERENCES)
    assert.match(css, /--script-character-text-transform: uppercase/)
    assert.match(css, /\.script-role--character/)
    assert.match(css, /text-transform: var\(--script-character-text-transform\)/)
  })
})

describe('exportTxt comic script roles', () => {
  it('applies uppercase to character lines', () => {
    const model = {
      isComic: true,
      title: 'Test',
      author: '',
      subtitle: '',
      scriptStyles: DEFAULT_SCRIPT_STYLE_PREFERENCES,
      chapters: [
        {
          heading: null,
          scenes: [
            {
              blocks: [
                {
                  type: 'paragraph',
                  scriptRole: 'character',
                  spans: [{ text: 'Batman', marks: [] }],
                },
              ],
            },
          ],
        },
      ],
    }

    const txt = exportTxt(model, { titlePage: false, includeAuthor: false, includeSubtitle: false })
    assert.match(txt, /BATMAN/)
    assert.doesNotMatch(txt, /\nBatman\n/)
  })
})
