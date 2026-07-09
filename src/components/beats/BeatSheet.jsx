import { useState } from 'react'
import {
  getBeatScenes,
  getBeatTargetWords,
  getBeatWordProgress,
} from '../../lib/beats'
import { useCreateBeatLink, useDeleteBeatLink } from '../../hooks/useBeatLinks'
import { confirmUnlink } from '../../lib/confirmAction'
import BeatWordBar from './BeatWordBar'
import BeatSheetPicker from './BeatSheetPicker'
import SceneLinkSelect from './SceneLinkSelect'
import { formatSceneLabel } from '../../lib/scenes'

const BeatSheet = ({ beats, beatLinks, scenes, chapters = [], tale, onOpenScene }) => {
  const [showChangePicker, setShowChangePicker] = useState(false)
  const createLink = useCreateBeatLink(tale?.id)
  const deleteLink = useDeleteBeatLink(tale?.id)
  const taleTargetWordCount = tale?.target_word_count || 0

  const handleLinkScene = (beatKey, sceneId) => {
    const exists = beatLinks.some((l) => l.beat_key === beatKey && l.scene_id === sceneId)
    if (exists) return
    createLink.mutate({ beatKey, sceneId })
  }

  const handleUnlink = async (beatKey, sceneId) => {
    const link = beatLinks.find((l) => l.beat_key === beatKey && l.scene_id === sceneId)
    if (!link) return

    const scene = scenes.find((s) => s.id === sceneId)
    const sceneLabel = scene ? formatSceneLabel(scene, chapters) : 'this scene'
    if (!(await confirmUnlink(`scene "${sceneLabel}" from this beat`))) return

    deleteLink.mutate(link.id)
  }

  if (beats.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center p-6">
        <BeatSheetPicker
          taleId={tale?.id}
          currentTemplateId={tale?.beat_template_id}
          hasBeats={false}
          hasBeatLinks={beatLinks.length > 0}
        />
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div className="flex shrink-0 justify-end border-b border-bronze-dark/30 px-6 py-2">
        <button
          type="button"
          onClick={() => setShowChangePicker((v) => !v)}
          className="font-ui text-xs uppercase text-bronze hover:text-cream"
        >
          {showChangePicker ? 'Cancel' : 'Change Beat Sheet'}
        </button>
      </div>

      {showChangePicker && (
        <div className="shrink-0 border-b border-bronze-dark/30 bg-surface/30 px-6 py-4">
          <BeatSheetPicker
            taleId={tale?.id}
            currentTemplateId={tale?.beat_template_id}
            hasBeats
            hasBeatLinks={beatLinks.length > 0}
            title="Change Beat Sheet"
            description="Swap to a different structure template."
            compact
            onApplied={() => setShowChangePicker(false)}
          />
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-6">
        <div className="mx-auto max-w-3xl space-y-3">
          {beats.map((beat, beatIndex) => {
            const linked = getBeatScenes(beat.key, beatLinks, scenes)
            const linkedSceneIds = linked.map((s) => s.id)
            const targetWords = getBeatTargetWords(beat, beats, beatIndex, taleTargetWordCount)
            const wordProgress = getBeatWordProgress(beat, linked, beats, beatIndex, taleTargetWordCount)
            const previousPercent = beatIndex > 0 ? beats[beatIndex - 1].target_percent : 0
            const hasLinks = linked.length > 0

            return (
              <div
                key={beat.key}
                className={`rounded border p-4 ${
                  hasLinks ? 'border-cream/20 bg-surface/50' : 'border-bronze-dark/30 bg-ink/50'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <h3 className="font-ui text-lg text-bronze">{beat.title}</h3>
                    <p className="mt-1 text-sm text-cream/60">{beat.guidance}</p>
                  </div>
                  <div className="shrink-0 text-right text-xs text-cream/40">
                    <div>
                      {previousPercent}–{beat.target_percent}%
                    </div>
                    <div>~{targetWords.toLocaleString()} words</div>
                  </div>
                </div>

                <BeatWordBar wordProgress={wordProgress} />

                <div className="mt-3 flex flex-wrap items-center gap-2">
                  {linked.map((s) => (
                    <span key={s.id} className="inline-flex max-w-full items-start gap-1 rounded bg-bronze/20 text-xs text-bronze">
                      <button
                        type="button"
                        onClick={() => onOpenScene(s.id)}
                        className="break-words px-2 py-1 text-left hover:bg-bronze/30"
                      >
                        {formatSceneLabel(s, chapters)}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleUnlink(beat.key, s.id)}
                        className="pr-1.5 text-bronze/60 hover:text-error"
                        title="Unlink scene"
                        aria-label={`Unlink ${formatSceneLabel(s, chapters)}`}
                      >
                        ×
                      </button>
                    </span>
                  ))}

                  <SceneLinkSelect
                    scenes={scenes}
                    chapters={chapters}
                    excludeSceneIds={linkedSceneIds}
                    onSelect={(sceneId) => handleLinkScene(beat.key, sceneId)}
                    placeholder="+ Link scene"
                  />
                </div>

                {!hasLinks && (
                  <p className="mt-2 text-xs italic text-cream/30">No scene linked yet.</p>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default BeatSheet
