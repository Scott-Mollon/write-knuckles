import { useState, useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useTale } from '../hooks/useTales'
import { useTaleStructure } from '../hooks/useTaleStructure'
import { TALE_MODES, SCENE_STATUS_COLORS } from '../constants/taleEditor'
import Loading from './Loading'

const TaleEditorPage = () => {
  const { taleId } = useParams()
  const [mode, setMode] = useState(TALE_MODES.WRITE)
  const [activeSceneId, setActiveSceneId] = useState(null)

  const { data: tale, isLoading: taleLoading } = useTale(taleId)
  const { data: structure, isLoading: structureLoading } = useTaleStructure(taleId)

  useEffect(() => {
    if (!activeSceneId && structure?.scenes?.[0]) {
      setActiveSceneId(structure.scenes[0].id)
    }
  }, [activeSceneId, structure?.scenes])

  if (taleLoading || structureLoading) return <Loading />

  const activeScene = structure?.scenes?.find((s) => s.id === activeSceneId)
    || structure?.scenes?.[0]

  const beats = structure?.taleBeats?.beats || []
  const beatLinks = structure?.beatLinks || []

  const getBeatScenes = (beatKey) =>
    beatLinks
      .filter((l) => l.beat_key === beatKey)
      .map((l) => structure.scenes.find((s) => s.id === l.scene_id))
      .filter(Boolean)

  const getBeatStatus = (beatKey) => {
    const linked = getBeatScenes(beatKey)
    if (linked.length === 0) return 'empty'
    if (linked.some((s) => s.word_count > 0)) return 'drafted'
    return 'linked'
  }

  return (
    <div className="flex h-[calc(100vh-57px)] flex-col">
      <header className="flex items-center justify-between border-b border-bronze-dark px-4 py-2">
        <div className="flex items-center gap-4">
          <Link to="/" className="text-sm text-cream/50 hover:text-bronze">
            &larr; Tales
          </Link>
          <h1 className="font-ui text-lg uppercase text-bronze">{tale?.title}</h1>
        </div>
        <div className="flex gap-1 font-ui text-sm uppercase">
          {[
            { key: TALE_MODES.WRITE, label: 'Write' },
            { key: TALE_MODES.STORY_BOARD, label: 'Story Board' },
            { key: TALE_MODES.BEAT_SHEET, label: 'Beat Sheet' },
          ].map(({ key, label }) => (
            <button
              key={key}
              type="button"
              onClick={() => setMode(key)}
              className={`px-4 py-2 ${mode === key ? 'bg-bronze/20 text-bronze border-b-2 border-bronze' : 'text-cream/60 hover:text-cream'}`}
            >
              {label}
            </button>
          ))}
        </div>
      </header>

      {mode === TALE_MODES.WRITE && (
        <div className="flex flex-1 overflow-hidden">
          <aside className="w-64 shrink-0 overflow-y-auto border-r border-bronze-dark/50 bg-surface/30 p-3">
            <h2 className="mb-3 font-ui text-xs uppercase tracking-widest text-bronze">The Rack</h2>
            {structure?.chapters?.map((chapter) => (
              <div key={chapter.id} className="mb-4">
                <div className="mb-1 font-ui text-sm font-medium text-cream/80">{chapter.title}</div>
                {chapter.scenes?.map((scene) => (
                  <button
                    key={scene.id}
                    type="button"
                    onClick={() => setActiveSceneId(scene.id)}
                    className={`mb-1 block w-full truncate rounded px-2 py-1 text-left text-sm ${
                      activeScene?.id === scene.id
                        ? 'bg-bronze/20 text-bronze'
                        : 'text-cream/70 hover:bg-ink'
                    }`}
                  >
                    {scene.title}
                  </button>
                ))}
              </div>
            ))}
          </aside>

          <main className="flex flex-1 flex-col overflow-hidden">
            {activeScene ? (
              <>
                <div className="border-b border-bronze-dark/30 px-6 py-3">
                  <h2 className="font-prose text-xl text-cream">{activeScene.title}</h2>
                  <p className="text-sm text-cream/40">{activeScene.word_count} words</p>
                </div>
                <div className="flex-1 overflow-y-auto px-6 py-4">
                  <p className="font-prose text-cream/50 italic">
                    TipTap editor coming in M2. Scene content is stored and ready.
                  </p>
                  {activeScene.plain_text && (
                    <pre className="mt-4 whitespace-pre-wrap font-prose text-cream/80">{activeScene.plain_text}</pre>
                  )}
                </div>
              </>
            ) : (
              <div className="flex flex-1 items-center justify-center text-cream/40">
                No scenes yet.
              </div>
            )}
          </main>

          <aside className="w-72 shrink-0 overflow-y-auto border-l border-bronze-dark/50 bg-surface/30 p-4">
            <h2 className="mb-3 font-ui text-xs uppercase tracking-widest text-bronze">Inspector</h2>
            {activeScene && (
              <div className="space-y-4 text-sm">
                <div>
                  <label className="text-cream/50">Status</label>
                  <p style={{ color: SCENE_STATUS_COLORS[activeScene.scene_status] }}>{activeScene.scene_status}</p>
                </div>
                {activeScene.synopsis && (
                  <div>
                    <label className="text-cream/50">Synopsis</label>
                    <p className="text-cream/80">{activeScene.synopsis}</p>
                  </div>
                )}
                <div>
                  <label className="text-cream/50">Word Count</label>
                  <p className="text-cream/80">{activeScene.word_count}</p>
                </div>
              </div>
            )}
          </aside>
        </div>
      )}

      {mode === TALE_MODES.STORY_BOARD && (
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {structure?.scenes?.map((scene) => (
              <button
                key={scene.id}
                type="button"
                onClick={() => {
                  setActiveSceneId(scene.id)
                  setMode(TALE_MODES.WRITE)
                }}
                className="rounded border-2 p-4 text-left transition hover:scale-[1.02]"
                style={{
                  borderColor: SCENE_STATUS_COLORS[scene.scene_status],
                  backgroundColor: `${SCENE_STATUS_COLORS[scene.scene_status]}15`,
                }}
              >
                <h3 className="font-ui text-sm font-semibold text-cream">{scene.title}</h3>
                <p className="mt-2 line-clamp-4 text-xs text-cream/60">
                  {scene.synopsis || 'No synopsis yet.'}
                </p>
                <span className="mt-3 inline-block text-xs uppercase" style={{ color: SCENE_STATUS_COLORS[scene.scene_status] }}>
                  {scene.scene_status}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {mode === TALE_MODES.BEAT_SHEET && (
        <div className="flex-1 overflow-y-auto p-6">
          <div className="mx-auto max-w-3xl space-y-3">
            {beats.map((beat) => {
              const status = getBeatStatus(beat.key)
              const linked = getBeatScenes(beat.key)
              const targetWords = Math.round((beat.target_percent / 100) * (tale?.target_word_count || 0))

              return (
                <div
                  key={beat.key}
                  className={`rounded border p-4 ${
                    status === 'drafted'
                      ? 'border-bronze/50 bg-bronze/5'
                      : status === 'linked'
                        ? 'border-cream/20 bg-surface/50'
                        : 'border-bronze-dark/30 bg-ink/50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-ui text-lg text-bronze">{beat.title}</h3>
                      <p className="mt-1 text-sm text-cream/60">{beat.guidance}</p>
                    </div>
                    <div className="shrink-0 text-right text-xs text-cream/40">
                      <div>{beat.target_percent}%</div>
                      <div>~{targetWords.toLocaleString()} words</div>
                    </div>
                  </div>
                  {linked.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {linked.map((s) => (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => {
                            setActiveSceneId(s.id)
                            setMode(TALE_MODES.WRITE)
                          }}
                          className="rounded bg-bronze/20 px-2 py-1 text-xs text-bronze hover:bg-bronze/30"
                        >
                          {s.title}
                        </button>
                      ))}
                    </div>
                  )}
                  {status === 'empty' && (
                    <p className="mt-2 text-xs italic text-cream/30">No scene linked yet.</p>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

export default TaleEditorPage
