import { useState, useEffect, useCallback } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useTale } from '../hooks/useTales'
import { useTaleStructure } from '../hooks/useTaleStructure'
import { useAutosave } from '../hooks/useAutosave'
import { countLinkedBeats } from '../lib/beats'
import { TALE_MODES } from '../constants/taleEditor'
import Rack from '../components/rack/Rack'
import SceneEditor from '../components/editor/SceneEditor'
import Inspector from '../components/inspector/Inspector'
import StoryBoard from '../components/story-board/StoryBoard'
import BeatSheet from '../components/beats/BeatSheet'
import TaleSettingsModal from '../components/tale/TaleSettingsModal'
import Loading from './Loading'

const TaleEditorPage = () => {
  const { taleId } = useParams()
  const [mode, setMode] = useState(TALE_MODES.WRITE)
  const [activeSceneId, setActiveSceneId] = useState(null)
  const [liveWordCount, setLiveWordCount] = useState(null)
  const [settingsOpen, setSettingsOpen] = useState(false)

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

  const handleOpenScene = useCallback(
    async (sceneId) => {
      await handleSelectScene(sceneId)
      setMode(TALE_MODES.WRITE)
    },
    [handleSelectScene],
  )

  const handleOpenSettings = useCallback(async () => {
    await autosave.flush()
    setSettingsOpen(true)
  }, [autosave])

  if (taleLoading || structureLoading) return <Loading />

  const beats = structure?.taleBeats?.beats || []
  const beatLinks = structure?.beatLinks || []
  const totalScenes = structure?.scenes?.length || 0
  const beatProgress = countLinkedBeats(beats, beatLinks)

  return (
    <div className="flex h-[calc(100vh-57px)] flex-col">
      <header className="flex items-center justify-between border-b border-bronze-dark px-4 py-2">
        <div className="flex items-center gap-4">
          <Link to="/" className="text-sm text-cream/50 hover:text-bronze">
            &larr; Tales
          </Link>
          <h1 className="font-ui text-lg uppercase text-bronze">{tale?.title}</h1>
          <button
            type="button"
            onClick={handleOpenSettings}
            className="font-ui text-xs uppercase text-cream/50 hover:text-bronze"
          >
            Settings
          </button>
          {beatProgress.total > 0 && (
            <span className="hidden text-xs text-cream/40 sm:inline">
              Beats: {beatProgress.linked}/{beatProgress.total} linked
            </span>
          )}
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
            beats={beats}
            beatLinks={beatLinks}
          />
        </div>
      )}

      {mode === TALE_MODES.STORY_BOARD && (
        <StoryBoard
          taleId={taleId}
          tale={tale}
          chapters={structure?.chapters || []}
          scenes={structure?.scenes || []}
          beats={beats}
          beatLinks={beatLinks}
          onOpenScene={handleOpenScene}
        />
      )}

      {mode === TALE_MODES.BEAT_SHEET && (
        <BeatSheet
          beats={beats}
          beatLinks={beatLinks}
          scenes={structure?.scenes || []}
          chapters={structure?.chapters || []}
          tale={tale}
          onOpenScene={handleOpenScene}
        />
      )}

      {settingsOpen && (
        <TaleSettingsModal
          tale={tale}
          taleId={taleId}
          hasBeats={beats.length > 0}
          hasBeatLinks={beatLinks.length > 0}
          onClose={() => setSettingsOpen(false)}
        />
      )}
    </div>
  )
}

export default TaleEditorPage
