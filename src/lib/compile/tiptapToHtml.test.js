import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { tiptapToHtml } from './tiptapToHtml.js'

function doc(...content) {
  return { type: 'doc', content }
}

function paragraph(text, marks = [], attrs = {}) {
  return {
    type: 'paragraph',
    attrs,
    content: [{ type: 'text', text, marks }],
  }
}

describe('tiptapToHtml sanitization', () => {
  it('escapes text content', () => {
    const html = tiptapToHtml(doc(paragraph('<script>alert(1)</script>')))
    assert.match(html, /&lt;script&gt;/)
    assert.doesNotMatch(html, /<script>/)
  })

  it('allows http(s) links only', () => {
    const ok = tiptapToHtml(
      doc(paragraph('safe', [{ type: 'link', attrs: { href: 'https://example.com/a' } }])),
    )
    assert.match(ok, /href="https:\/\/example\.com\/a"/)

    const bad = tiptapToHtml(
      doc(paragraph('bad', [{ type: 'link', attrs: { href: 'javascript:alert(1)' } }])),
    )
    assert.equal(bad, '<p>bad</p>')
    assert.doesNotMatch(bad, /href=/)
  })

  it('allows hex highlight colors only', () => {
    const ok = tiptapToHtml(
      doc(paragraph('hi', [{ type: 'highlight', attrs: { color: '#ffe066' } }])),
    )
    assert.match(ok, /background-color: #ffe066/)

    const injected = tiptapToHtml(
      doc(
        paragraph('hi', [
          { type: 'highlight', attrs: { color: 'red; background-image: url(https://evil)' } },
        ]),
      ),
    )
    assert.match(injected, /<mark>hi<\/mark>/)
    assert.doesNotMatch(injected, /background-image/)
  })

  it('allowlists scriptRole and textAlign', () => {
    const ok = tiptapToHtml(
      doc(
        paragraph('line', [], {
          scriptRole: 'dialogue',
          textAlign: 'center',
        }),
      ),
    )
    assert.match(ok, /data-script-role="dialogue"/)
    assert.match(ok, /script-role--dialogue/)
    assert.match(ok, /text-align: center/)

    const bad = tiptapToHtml(
      doc(
        paragraph('line', [], {
          scriptRole: 'dialogue" onclick="alert(1)',
          textAlign: 'center; color: red',
        }),
      ),
    )
    assert.doesNotMatch(bad, /onclick/)
    assert.doesNotMatch(bad, /data-script-role/)
    assert.doesNotMatch(bad, /color: red/)
  })
})
