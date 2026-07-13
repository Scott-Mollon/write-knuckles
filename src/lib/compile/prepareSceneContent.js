function plainTextDoc(text) {
  return {
    type: 'doc',
    content: [{ type: 'paragraph', content: [{ type: 'text', text }] }],
  }
}

function stripSceneImages(doc) {
  if (!Array.isArray(doc.content)) return doc

  return {
    ...doc,
    content: doc.content.filter((node) => node.type !== 'sceneImage'),
  }
}

export function prepareSceneContent(content, plainText, options) {
  let doc = null

  if (content && typeof content === 'object' && content.type === 'doc') {
    doc = structuredClone(content)
  } else if (plainText?.trim()) {
    doc = plainTextDoc(plainText.trim())
  } else {
    doc = { type: 'doc', content: [] }
  }

  if (!options.includeImages) {
    doc = stripSceneImages(doc)
  }

  return doc
}
