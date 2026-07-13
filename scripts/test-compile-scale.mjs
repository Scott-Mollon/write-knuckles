/**
 * Smoke test: compile pipeline on a novel-sized manuscript (no DB).
 * Run: node scripts/test-compile-scale.mjs
 */
import { buildManuscriptModel, manuscriptHasContent } from '../src/lib/compile/buildManuscriptModel.js'
import { exportCompileHtml } from '../src/lib/compile/exportCompileHtml.js'
import { exportTxt } from '../src/lib/compile/exportTxt.js'
import { DEFAULT_COMPILE_OPTIONS } from '../src/constants/compile.js'

const WORDS_PER_SCENE = 1000
const SCENES = 65

function makeParagraph(wordCount) {
  const words = []
  for (let i = 0; i < wordCount; i += 1) {
    words.push(`word${i}`)
  }
  return words.join(' ')
}

function makeSceneDoc(text) {
  return {
    type: 'doc',
    content: [
      {
        type: 'paragraph',
        content: [{ type: 'text', text }],
      },
    ],
  }
}

const chapters = []
const scenes = []

for (let c = 0; c < 20; c += 1) {
  const chapterId = `chapter-${c}`
  chapters.push({
    id: chapterId,
    tale_id: 'tale-1',
    title: c === 0 ? 'The Fat Man' : `Chapter ${c + 1}`,
    sort_order: c,
  })

  const scenesInChapter = c < 19 ? 3 : SCENES - 19 * 3
  for (let s = 0; s < scenesInChapter; s += 1) {
    const text = makeParagraph(WORDS_PER_SCENE)
    scenes.push({
      id: `scene-${c}-${s}`,
      chapter_id: chapterId,
      tale_id: 'tale-1',
      title: `Scene ${s + 1}`,
      sort_order: s,
      plain_text: text,
      content: makeSceneDoc(text),
    })
  }
}

const tale = {
  id: 'tale-1',
  title: 'Scale Test Novel',
  author: 'Test Author',
  subtitle: 'A compile stress test',
}

const scope = {
  chapterIds: chapters.map((ch) => ch.id),
  sceneIds: scenes.map((sc) => sc.id),
}

const chaptersWithScenes = chapters.map((chapter) => ({
  ...chapter,
  scenes: scenes.filter((scene) => scene.chapter_id === chapter.id),
}))

const options = { ...DEFAULT_COMPILE_OPTIONS }
const model = buildManuscriptModel({ tale, chapters: chaptersWithScenes, options, scope })

if (!manuscriptHasContent(model)) {
  throw new Error('Expected manuscript content')
}

const images = { cover: null, sceneImages: new Map() }
const t0 = performance.now()
const html = exportCompileHtml(model, options, images, { pageLayout: { pageSize: 'letter' } })
const txt = exportTxt(model, options)
const ms = Math.round(performance.now() - t0)

console.log(`Scenes: ${scenes.length}`)
console.log(`HTML bytes: ${html.length.toLocaleString()}`)
console.log(`TXT bytes: ${txt.length.toLocaleString()}`)
console.log(`Compile time: ${ms}ms`)

if (html.length < 100_000) {
  throw new Error('HTML output smaller than expected')
}

console.log('OK')
