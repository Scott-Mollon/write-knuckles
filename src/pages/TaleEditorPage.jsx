import { useState, useEffect, useCallback } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useTale } from '../hooks/useTales'
import { useTaleStructure } from '../hooks/useTaleStructure'
import { useAutosave } from '../hooks/useAutosave'
import { TALE_MODES, SCENE_STATUS_COLORS } from '../constants/taleEditor'
import Rack from '../components/rack/Rack'
import SceneEditor from '../components/editor/SceneEditor'
import Inspector from '../components/inspector/Inspector'
import Loading from './Loading'

const TaleEditorPage = () => {
  const { taleId } = useParams()
  const [mode, setMode] = useState(TALE_MODES.WRITE)
  const [activeSceneId, setActiveSceneId] = useState(null)
  const [liveWordCount, setLiveWordCount] = useState(null)

  const { data: tale, isLoading: taleLoading } = useTale(taleId)
  const { data: structure, isLoading: structureLoading } = useTaleStructure(taleId)

  const activeScene = structure?.scenes?.find((s) => s.id === activeSceneId)
    || structure?.scenes?.[0]

  const autosave = useAutosave(activeScene?.id, taleId)

  useEffect(() => {
    if (!activeSceneId && structure?.scenes?.[0]) {
      setActiveSceneId(structure.scenes[0].id)
    }
  }, [activeSceneId, structure?.scenes])

  useEffect(() => {
    setLiveWordCount(activeScene?.word_count ?? 0)
  }, [activeScene?.id, activeScene?.word_count])

  const handleSelectScene = useCallback(
    async (sceneId) => {
      if (sceneId === activeSceneId) return
      await autosave.flush()
      setActiveSceneId(sceneId)
    },
    [activeSceneId, autosave],
  )

  if (taleLoading || structureLoading) return <Loading />

  const beats = structure?.taleBeats?.beats || []
  const beatLinks = structure?.beatLinks || []
  const totalScenes = structure?.scenes?.length || 0

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
          <Rack
            taleId={taleId}
            chapters={structure?.chapters || []}
            activeSceneId={activeScene?.id}
            onSelectScene={handleSelectScene}
            totalScenes={totalScenes}
          />

          <main className="flex flex-1 flex-col overflow-hidden">
            <SceneEditor
              key={activeScene?.id}
              scene={activeScene}
              onWordCountChange={setLiveWordCount}
              autosave={autosave}
            />
          </main>

          <Inspector
            scene={activeScene}
            taleId={taleId}
            liveWordCount={liveWordCount}
          />
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
                  handleSelectScene(scene.id)
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
                            handleSelectScene(s.id)
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
