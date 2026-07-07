import { formatChapterLabel } from './chapters'

export const getChapterForScene = (scene, chapters) =>
  chapters.find((ch) => ch.id === scene.chapter_id)

export const formatSceneLabel = (scene, chapters) => {
  const sorted = [...chapters].sort((a, b) => a.sort_order - b.sort_order)
  const chapterIndex = sorted.findIndex((ch) => ch.id === scene.chapter_id)
  const chapter = chapterIndex >= 0 ? sorted[chapterIndex] : null
  const chapterLabel = chapter
    ? formatChapterLabel(chapter, chapterIndex)
    : 'Unknown chapter'
  return `${chapterLabel} — ${scene.title}`
}

export const getScenesInRackOrder = (chapters) =>
  [...chapters]
    .sort((a, b) => a.sort_order - b.sort_order)
    .flatMap((chapter) =>
      [...(chapter.scenes || [])].sort((a, b) => a.sort_order - b.sort_order),
    )

export const sortScenesByRackOrder = (scenes, chapters) => {
  const order = getScenesInRackOrder(chapters).map((s) => s.id)
  return [...scenes].sort((a, b) => order.indexOf(a.id) - order.indexOf(b.id))
}

export const getUnlinkedScenes = (chapters, beatLinks) => {
  const linkedIds = new Set(
    beatLinks.filter((l) => l.scene_id).map((l) => l.scene_id),
  )
  return getScenesInRackOrder(chapters).filter((s) => !linkedIds.has(s.id))
}
