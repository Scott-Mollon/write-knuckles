export const getBeatScenes = (beatKey, beatLinks, scenes) =>
  beatLinks
    .filter((l) => l.beat_key === beatKey && l.scene_id)
    .map((l) => scenes.find((s) => s.id === l.scene_id))
    .filter(Boolean)

export const getBeatSpanPercent = (beat, beats, beatIndex) => {
  const previousPercent = beatIndex > 0 ? beats[beatIndex - 1].target_percent : 0
  return beat.target_percent - previousPercent
}

export const getBeatTargetWords = (beat, beats, beatIndex, taleTargetWordCount) => {
  const spanPercent = getBeatSpanPercent(beat, beats, beatIndex)
  return Math.round((spanPercent / 100) * (taleTargetWordCount || 0))
}

export const getBeatWordProgress = (beat, linkedScenes, beats, beatIndex, taleTargetWordCount) => {
  const targetWords = getBeatTargetWords(beat, beats, beatIndex, taleTargetWordCount)
  const linkedWords = linkedScenes.reduce((sum, s) => sum + (s.word_count || 0), 0)
  const percent = targetWords > 0 ? Math.round((linkedWords / targetWords) * 100) : 0

  return {
    targetWords,
    linkedWords,
    percent,
    barPercent: Math.min(100, percent),
  }
}

export const getSceneBeatLinks = (sceneId, beatLinks) =>
  beatLinks.filter((l) => l.scene_id === sceneId)

export const getSceneBeats = (sceneId, beatLinks, beats) => {
  const keys = getSceneBeatLinks(sceneId, beatLinks).map((l) => l.beat_key)
  return beats.filter((b) => keys.includes(b.key))
}

export const countLinkedBeats = (beats, beatLinks) => {
  let linked = 0
  for (const beat of beats) {
    if (beatLinks.some((l) => l.beat_key === beat.key && l.scene_id)) linked += 1
  }
  return { total: beats.length, linked }
}
