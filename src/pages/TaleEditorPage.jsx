import { useState, useEffect, useCallback } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useTale } from '../hooks/useTales'
import { useTaleStructure } from '../hooks/useTaleStructure'
import { useTaleReference } from '../hooks/useTaleReference'
import { useAutosave } from '../hooks/useAutosave'
import { countLinkedBeats } from '../lib/beats'
import { TALE_MODES } from '../constants/taleEditor'
import { isComicTale } from '../lib/taleTerminology'
import Rack from '../components/rack/Rack'
import SceneEditor from '../components/editor/SceneEditor'
import Inspector from '../components/inspector/Inspector'
import StoryBoard from '../components/story-board/StoryBoard'
import BeatSheet from '../components/beats/BeatSheet'
import ReferencePanel from '../components/research/ReferencePanel'
import SearchMode from '../components/search/SearchMode'
import TrashPanel from '../components/trash/TrashPanel'
import TaleSettingsModal from '../components/tale/TaleSettingsModal'
import TaleCompileModal from '../components/tale/TaleCompileModal'
import {
  BeatSheetIcon,
  ResearchIcon,
  SearchIcon,
  StoryBoardIcon,
  TrashIcon,
  WriteIcon,
} from '../components/tale/TaleModeIcons'
import Loading from './Loading'

const MODE_TABS = [
  { key: TALE_MODES.WRITE, label: 'Write', Icon: WriteIcon },
  { key: TALE_MODES.STORY_BOARD, label: 'Story Board', Icon: StoryBoardIcon },
  { key: TALE_MODES.BEAT_SHEET, label: 'Beat Sheet', Icon: BeatSheetIcon },
  { key: TALE_MODES.RESEARCH, label: 'Research', Icon: ResearchIcon },
  { key: TALE_MODES.SEARCH, label: 'Search', Icon: SearchIcon },
  { key: TALE_MODES.TRASH, label: 'Trash', Icon: TrashIcon },
]

const TaleEditorPage = () => {
  const { taleId } = useParams()
  const [mode, setMode] = useState(TALE_MODES.WRITE)
  const [activeSceneId, setActiveSceneId] = useState(null)
  const [liveWordCount, setLiveWordCount] = useState(null)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [compileOpen, setCompileOpen] = useState(false)

  const { data: tale, isLoading: taleLoading } = useTale(taleId)
  const { data: structure, isLoading: structureLoading } = useTaleStructure(taleId)
  const { data: reference, isLoading: referenceLoading } = useTaleReference(taleId)

  const activeScene = structure?.scenes?.find((s) => s.id === activeSceneId)
    || structure?.scenes?.[0]

  const autosave = useAutosave(activeScene?.id, taleId)

  useEffect(() => {
    const scenes = structure?.scenes
    if (!scenes?.length) return
    const stillActive = activeSceneId && scenes.some((s) => s.id === activeSceneId)
    if (!stillActive) {
      setActiveSceneId(scenes[0].id)
    }
  }, [activeSceneId, structure?.scenes])

  useEffect(() => {
    setLiveWordCount(activeScene?.word_count ?? 0)
  }, [activeScene?.id, activeScene?.word_count])

  useEffect(() => {
    if (isComicTale(tale) && mode === TALE_MODES.BEAT_SHEET) {
      setMode(TALE_MODES.WRITE)
    }
  }, [tale, mode])

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

  const handleOpenCompile = useCallback(async () => {
    await autosave.flush()
    setCompileOpen(true)
  }, [autosave])

  if (taleLoading || structureLoading || referenceLoading) return <Loading />

  const beats = structure?.taleBeats?.beats || []
  const beatLinks = structure?.beatLinks || []
  const totalScenes = structure?.scenes?.length || 0
  const beatProgress = countLinkedBeats(beats, beatLinks)
  const characters = reference?.characters || []
  const locations = reference?.locations || []
  const researchItems = reference?.researchItems || []
  const referenceImages = reference?.referenceImages || []
  const characterLinks = reference?.characterLinks || []
  const locationLinks = reference?.locationLinks || []
  const comic = isComicTale(tale)

  const modeTabs = comic
    ? MODE_TABS.filter((tab) => tab.key !== TALE_MODES.BEAT_SHEET)
    : MODE_TABS

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
          <button
            type="button"
            onClick={handleOpenCompile}
            className="font-ui text-xs uppercase text-cream/50 hover:text-bronze"
          >
            Compile
          </button>
          {beatProgress.total > 0 && !comic && (
            <span className="hidden text-xs text-cream/40 sm:inline">
              Beats: {beatProgress.linked}/{beatProgress.total} linked
            </span>
          )}
        </div>
        <div className="flex gap-0.5">
          {modeTabs.map((tab) => {
            const ModeIcon = tab.Icon
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setMode(tab.key)}
                title={tab.label}
                aria-label={tab.label}
                aria-current={mode === tab.key ? 'page' : undefined}
                className={`px-3 py-2 ${
                  mode === tab.key
                    ? 'border-b-2 border-bronze bg-bronze/20 text-bronze'
                    : 'text-cream/60 hover:text-cream'
                }`}
              >
                <ModeIcon />
              </button>
            )
          })}
        </div>
      </header>

      {mode === TALE_MODES.WRITE && (
        <div className="flex flex-1 overflow-hidden">
          <Rack
            taleId={taleId}
            tale={tale}
            chapters={structure?.chapters || []}
            activeSceneId={activeScene?.id}
            onSelectScene={handleSelectScene}
            totalScenes={totalScenes}
          />

          <main className="flex flex-1 flex-col overflow-hidden">
            <SceneEditor
              key={activeScene?.id}
              scene={activeScene}
              tale={tale}
              taleId={taleId}
              onWordCountChange={setLiveWordCount}
              autosave={autosave}
            />
          </main>

          <Inspector
            scene={activeScene}
            tale={tale}
            taleId={taleId}
            liveWordCount={liveWordCount}
            beats={beats}
            beatLinks={beatLinks}
            characters={characters}
            locations={locations}
            characterLinks={characterLinks}
            locationLinks={locationLinks}
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

      {mode === TALE_MODES.BEAT_SHEET && !comic && (
        <BeatSheet
          beats={beats}
          beatLinks={beatLinks}
          scenes={structure?.scenes || []}
          chapters={structure?.chapters || []}
          tale={tale}
          onOpenScene={handleOpenScene}
        />
      )}

      {mode === TALE_MODES.RESEARCH && (
        <ReferencePanel
          taleId={taleId}
          characters={characters}
          locations={locations}
          researchItems={researchItems}
          referenceImages={referenceImages}
        />
      )}

      {mode === TALE_MODES.SEARCH && (
        <SearchMode
          taleId={taleId}
          chapters={structure?.chapters || []}
          scenes={structure?.scenes || []}
          onOpenScene={handleOpenScene}
          onBeforeReplace={() => autosave.flush()}
        />
      )}

      {mode === TALE_MODES.TRASH && <TrashPanel taleId={taleId} />}

      {settingsOpen && (
        <TaleSettingsModal
          tale={tale}
          taleId={taleId}
          hasBeats={beats.length > 0}
          hasBeatLinks={beatLinks.length > 0}
          onClose={() => setSettingsOpen(false)}
        />
      )}

      {compileOpen && (
        <TaleCompileModal
          tale={tale}
          taleId={taleId}
          chapters={structure?.chapters || []}
          onClose={() => setCompileOpen(false)}
          onBeforeCompile={() => autosave.flush()}
        />
      )}
    </div>
  )
}

export default TaleEditorPage
