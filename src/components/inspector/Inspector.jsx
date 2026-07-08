import { useEffect, useState } from 'react'
import { SCENE_STATUSES, SCENE_STATUS_COLORS, POV_COLOR_TAGS, DEFAULT_SCENE_COLOR } from '../../constants/taleEditor'
import { useUpdateSceneMeta } from '../../hooks/useSceneMutations'
import { useCreateBeatLink, useDeleteBeatLink } from '../../hooks/useBeatLinks'
import { getSceneBeatLinks } from '../../lib/beats'
import SceneReferenceLinks from './SceneReferenceLinks'

const Inspector = ({
  scene,
  taleId,
  liveWordCount,
  beats = [],
  beatLinks = [],
  characters = [],
  locations = [],
  characterLinks = [],
  locationLinks = [],
}) => {
  const updateMeta = useUpdateSceneMeta(taleId)
  const createLink = useCreateBeatLink(taleId)
  const deleteLink = useDeleteBeatLink(taleId)
  const [collapsed, setCollapsed] = useState(false)
  const [title, setTitle] = useState('')
  const [synopsis, setSynopsis] = useState('')
  const [status, setStatus] = useState('Raw')
  const [color, setColor] = useState(DEFAULT_SCENE_COLOR)

  useEffect(() => {
    if (!scene) return
    setTitle(scene.title || '')
    setSynopsis(scene.synopsis || '')
    setStatus(scene.scene_status || 'Raw')
    setColor(scene.scene_color || DEFAULT_SCENE_COLOR)
  }, [scene?.id])

  if (collapsed) {
    return (
      <aside className="flex w-10 shrink-0 flex-col items-center border-l border-bronze-dark/50 bg-surface/30 py-3">
        <button
          type="button"
          onClick={() => setCollapsed(false)}
          title="Expand Inspector"
          className="px-1 text-cream/50 hover:text-bronze"
          aria-label="Expand Inspector"
        >
          ‹
        </button>
        <span
          className="mt-4 font-ui text-[10px] uppercase tracking-widest text-bronze/60 [writing-mode:vertical-rl] rotate-180"
        >
          Inspector
        </span>
      </aside>
    )
  }

  const saveField = (fields) => {
    if (!scene) return
    updateMeta.mutate({ sceneId: scene.id, ...fields })
  }

  const wordCount = liveWordCount ?? scene?.word_count ?? 0
  const sceneLinks = scene ? getSceneBeatLinks(scene.id, beatLinks) : []
  const linkedBeat = sceneLinks[0]
    ? beats.find((b) => b.key === sceneLinks[0].beat_key)
    : null
  const availableBeats = beats.filter((b) => b.key !== linkedBeat?.key)

  const handleLinkBeat = (beatKey) => {
    if (!scene || !beatKey) return
    createLink.mutate({ beatKey, sceneId: scene.id })
  }

  const handleUnlinkBeat = (linkId) => {
    deleteLink.mutate(linkId)
  }

  return (
    <aside className="flex w-72 shrink-0 flex-col overflow-hidden border-l border-bronze-dark/50 bg-surface/30">
      <div className="flex items-center justify-between border-b border-bronze-dark/30 px-4 py-3">
        <h2 className="font-ui text-xs uppercase tracking-widest text-bronze">Inspector</h2>
        <button
          type="button"
          onClick={() => setCollapsed(true)}
          title="Collapse Inspector"
          className="text-cream/50 hover:text-bronze"
          aria-label="Collapse Inspector"
        >
          ›
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {!scene ? (
          <p className="text-sm text-cream/40">No scene selected.</p>
        ) : (
          <div className="space-y-4 text-sm">
            <div>
              <label htmlFor="inspector-title" className="mb-1 block text-cream/50">
                Title
              </label>
              <input
                id="inspector-title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onBlur={() => {
                  if (title.trim() && title !== scene.title) {
                    saveField({ title: title.trim() })
                  }
                }}
                className="w-full rounded border border-bronze-dark/50 bg-ink px-2 py-1.5 text-cream focus:border-bronze focus:outline-none"
              />
            </div>

            <div>
              <label htmlFor="inspector-synopsis" className="mb-1 block text-cream/50">
                Synopsis
              </label>
              <textarea
                id="inspector-synopsis"
                value={synopsis}
                onChange={(e) => setSynopsis(e.target.value)}
                onBlur={() => {
                  if (synopsis !== (scene.synopsis || '')) {
                    saveField({ synopsis: synopsis.trim() || null })
                  }
                }}
                rows={4}
                placeholder="What happens in this scene?"
                className="w-full resize-y rounded border border-bronze-dark/50 bg-ink px-2 py-1.5 text-cream placeholder:text-cream/30 focus:border-bronze focus:outline-none"
              />
            </div>

            <div>
              <label htmlFor="inspector-status" className="mb-1 block text-cream/50">
                Status
              </label>
              <select
                id="inspector-status"
                value={status}
                onChange={(e) => {
                  setStatus(e.target.value)
                  saveField({ scene_status: e.target.value })
                }}
                className="w-full rounded border border-bronze-dark/50 bg-ink px-2 py-1.5 text-cream focus:border-bronze focus:outline-none"
                style={{ color: SCENE_STATUS_COLORS[status] }}
              >
                {SCENE_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <span className="mb-2 block text-cream/50">Point of View Tags</span>
              <div className="flex flex-wrap gap-2">
                {POV_COLOR_TAGS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    title={c}
                    onClick={() => {
                      setColor(c)
                      saveField({ scene_color: c })
                    }}
                    className={`h-6 w-6 rounded-full border-2 transition ${
                      color === c ? 'border-cream scale-110' : 'border-transparent hover:scale-105'
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>

            <div>
              <span className="mb-2 block text-cream/50">Beat Link</span>
              {linkedBeat ? (
                <div className="mb-2 flex flex-wrap gap-1.5">
                  <span className="inline-flex items-center gap-1 rounded bg-bronze/20 text-xs text-bronze">
                    <span className="px-2 py-1">{linkedBeat.title}</span>
                    <button
                      type="button"
                      onClick={() => handleUnlinkBeat(sceneLinks[0].id)}
                      className="pr-1.5 text-bronze/60 hover:text-error"
                      title="Unlink beat"
                      aria-label={`Unlink ${linkedBeat.title}`}
                    >
                      ×
                    </button>
                  </span>
                </div>
              ) : (
                <p className="mb-2 text-xs italic text-cream/30">No beat linked.</p>
              )}
              {availableBeats.length > 0 && (
                <select
                  value=""
                  onChange={(e) => handleLinkBeat(e.target.value)}
                  className="w-full rounded border border-bronze-dark/50 bg-ink px-2 py-1.5 text-cream focus:border-bronze focus:outline-none"
                >
                  <option value="" disabled>
                    {linkedBeat ? 'Change beat…' : 'Link a beat…'}
                  </option>
                  {availableBeats.map((b) => (
                    <option key={b.key} value={b.key}>
                      {b.title}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <SceneReferenceLinks
              scene={scene}
              taleId={taleId}
              characters={characters}
              locations={locations}
              characterLinks={characterLinks}
              locationLinks={locationLinks}
            />

            <div>
              <span className="text-cream/50">Word Count</span>
              <p className="mt-1 font-prose text-lg text-cream">{wordCount.toLocaleString()}</p>
            </div>
          </div>
        )}
      </div>
    </aside>
  )
}

export default Inspector
