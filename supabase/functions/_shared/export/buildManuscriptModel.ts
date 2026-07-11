import { buildChapterHeading } from './chapterHeading.ts'
import { prepareSceneContent } from './prepareSceneContent.ts'
import { blocksHaveText, tiptapToBlocks } from './tiptapToBlocks.ts'
import type {
  ChapterRow,
  ExportFormat,
  ExportOptions,
  ExportScope,
  ManuscriptModel,
  SceneRow,
  TaleRow,
} from './types.ts'

function isInScope(id: string, ids: string[]): boolean {
  return ids.length === 0 || ids.includes(id)
}

export function buildManuscriptModel({
  tale,
  chapters,
  scenes,
  options,
  scope,
  format = 'txt',
}: {
  tale: TaleRow
  chapters: ChapterRow[]
  scenes: SceneRow[]
  options: ExportOptions
  scope: ExportScope
  format?: ExportFormat
}): ManuscriptModel {
  const sortedChapters = [...chapters].sort((a, b) => a.sort_order - b.sort_order)
  const scenesByChapter = new Map<string, SceneRow[]>()

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
          const preparedContent = prepareSceneContent(
            scene.content,
            scene.plain_text,
            format,
            options,
          )
          let blocks = tiptapToBlocks(preparedContent)
          if (format === 'txt' && !options.includeImagePlaceholders) {
            blocks = blocks.filter((block) => block.type !== 'image')
          }
          if ((format === 'pdf' || format === 'docx' || format === 'html') && !options.includeImages) {
            blocks = blocks.filter((block) => block.type !== 'image')
          }
          if (!blocksHaveText(blocks) && scene.plain_text?.trim()) {
            blocks = [{ type: 'paragraph', spans: [{ text: scene.plain_text.trim(), marks: [] }] }]
          }
          return {
            id: scene.id,
            blocks,
            content: format === 'html' ? preparedContent : undefined,
          }
        })
        .filter((scene) => blocksHaveText(scene.blocks))

      if (chapterScenes.length === 0) return null

      return {
        id: chapter.id,
        heading: buildChapterHeading(chapter.title, chapterIndex, options),
        scenes: chapterScenes,
      }
    })
    .filter((chapter): chapter is NonNullable<typeof chapter> => chapter !== null)

  return {
    title: tale.title,
    author: tale.author,
    subtitle: tale.subtitle,
    chapters: manuscriptChapters,
  }
}

export function manuscriptHasContent(model: ManuscriptModel): boolean {
  return model.chapters.some((chapter) => chapter.scenes.length > 0)
}
