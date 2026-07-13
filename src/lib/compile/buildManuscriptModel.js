import { buildChapterHeading, buildChapterHeadingParts } from './chapterHeading.js'
import { prepareSceneContent } from './prepareSceneContent.js'
import { blocksHaveText, plainTextToSceneBlock, tiptapToBlocks } from './tiptapToBlocks.js'

function isInScope(id, ids) {
  return ids.length === 0 || ids.includes(id)
}

function flattenScenes(chapters) {
  return chapters.flatMap((chapter) => chapter.scenes || [])
}

export function buildManuscriptModel({ tale, chapters, options, scope }) {
  const sortedChapters = [...chapters].sort((a, b) => a.sort_order - b.sort_order)
  const scenes = flattenScenes(chapters)
  const scenesByChapter = new Map()

  for (const scene of scenes) {
    if (!isInScope(scene.id, scope.sceneIds)) continue
    const list = scenesByChapter.get(scene.chapter_id) || []
    list.push(scene)
    scenesByChapter.set(scene.chapter_id, list)
  }

  const manuscriptChapters = sortedChapters
    .map((chapter, chapterIndex) => {
      if (!isInScope(chapter.id, scope.chapterIds)) return null

      const chapterScenes = (scenesByChapter.get(chapter.id) || [])
        .sort((a, b) => a.sort_order - b.sort_order)
        .map((scene) => {
          const preparedContent = prepareSceneContent(scene.content, scene.plain_text, options)
          let blocks = tiptapToBlocks(preparedContent)

          if (!options.includeImages) {
            blocks = blocks.filter((block) => block.type !== 'image')
          }

          if (!blocksHaveText(blocks) && scene.plain_text?.trim()) {
            blocks = plainTextToSceneBlock(scene.plain_text)
          }

          return {
            id: scene.id,
            blocks,
            content: preparedContent,
          }
        })
        .filter((scene) => blocksHaveText(scene.blocks))

      if (chapterScenes.length === 0) return null

      return {
        id: chapter.id,
        heading: buildChapterHeading(chapter.title, chapterIndex, options),
        headingParts: buildChapterHeadingParts(chapter.title, chapterIndex, options),
        scenes: chapterScenes,
      }
    })
    .filter(Boolean)

  return {
    title: tale.title,
    author: tale.author,
    subtitle: tale.subtitle,
    chapters: manuscriptChapters,
  }
}

export function manuscriptHasContent(model) {
  return model.chapters.some((chapter) => chapter.scenes.length > 0)
}
