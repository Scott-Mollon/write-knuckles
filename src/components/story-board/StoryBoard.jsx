import { useState } from 'react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import { STORY_BOARD_VIEWS } from '../../constants/taleEditor'
import { useCreateChapter, useCreateScene } from '../../hooks/useSceneMutations'
import { useCreateBeatLink, useDeleteBeatLink } from '../../hooks/useBeatLinks'
import { confirmUnlink } from '../../lib/confirmAction'
import { actionErrorMessage } from '../../lib/abuseErrors'
import { formatSceneLabel, nextDefaultSceneTitle } from '../../lib/scenes'
import { getTaleTerminology, isComicTale } from '../../lib/taleTerminology'
import BeatBoardView from './BeatBoardView'
import ChapterBoardView from './ChapterBoardView'
import BeatSheetPicker from '../beats/BeatSheetPicker'

const StoryBoard = ({
  taleId,
  tale,
  chapters,
  scenes,
  beats,
  beatLinks,
  onOpenScene,
}) => {
  const comic = isComicTale(tale)
  const terms = getTaleTerminology(tale)
  const [view, setView] = useState(
    comic ? STORY_BOARD_VIEWS.CHAPTER : STORY_BOARD_VIEWS.CHAPTER,
  )
  const [actionError, setActionError] = useState(null)
  const createChapter = useCreateChapter(taleId)
  const createScene = useCreateScene(taleId)
  const createLink = useCreateBeatLink(taleId)
  const deleteLink = useDeleteBeatLink(taleId)

  const isAdding = createChapter.isPending || createScene.isPending
  const taleTargetWordCount = tale?.target_word_count || 0
  const effectiveView = comic ? STORY_BOARD_VIEWS.CHAPTER : view

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor),
  )

  const handleAddChapter = async () => {
    setActionError(null)
    try {
      const count = chapters.length
      const chapter = await createChapter.mutateAsync({
        title: '',
        sortOrder: count,
      })
      await createScene.mutateAsync({
        chapterId: chapter.id,
        title: terms.defaultSceneTitle,
        sortOrder: 0,
      })
    } catch (err) {
      setActionError(actionErrorMessage(err, `Could not add ${terms.chapter.toLowerCase()}.`))
    }
  }

  const handleAddScene = async (chapterId) => {
    setActionError(null)
    try {
      const chapter = chapters.find((ch) => ch.id === chapterId)
      const sortOrder = chapter?.scenes?.length || 0
      await createScene.mutateAsync({
        chapterId,
        title: nextDefaultSceneTitle(sortOrder, tale),
        sortOrder,
      })
    } catch (err) {
      setActionError(actionErrorMessage(err, `Could not add ${terms.scene.toLowerCase()}.`))
    }
  }

  const handleUnlink = async (beatKey, sceneId) => {
    const link = beatLinks.find((l) => l.beat_key === beatKey && l.scene_id === sceneId)
    if (!link) return

    const scene = scenes.find((s) => s.id === sceneId)
    const sceneLabel = scene
      ? formatSceneLabel(scene, chapters, tale)
      : `this ${terms.scene.toLowerCase()}`
    if (!(await confirmUnlink(`${terms.scene.toLowerCase()} "${sceneLabel}" from this beat`))) return

    deleteLink.mutate(link.id)
  }

  const handleBeatDragEnd = ({ active, over }) => {
    if (!over) return

    const activeData = active.data.current
    if (!activeData?.sceneId) return

    const overId = String(over.id)
    const sceneId = activeData.sceneId

    if (overId === 'board-pool') {
      if (activeData.type === 'beat-scene' && activeData.beatKey) {
        handleUnlink(activeData.beatKey, sceneId)
      }
      return
    }

    if (overId.startsWith('board-beat-')) {
      const beatKey = overId.replace('board-beat-', '')
      const exists = beatLinks.some((l) => l.beat_key === beatKey && l.scene_id === sceneId)
      if (!exists) {
        createLink.mutate({ beatKey, sceneId })
      }
    }
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div className="flex shrink-0 items-center justify-between border-b border-bronze-dark/30 px-6 py-2">
        {comic ? (
          <div className="font-ui text-xs uppercase text-bronze">{terms.byChapterView}</div>
        ) : (
          <div className="flex gap-1 font-ui text-xs uppercase">
            {[
              { key: STORY_BOARD_VIEWS.BEAT, label: terms.byBeatView },
              { key: STORY_BOARD_VIEWS.CHAPTER, label: terms.byChapterView },
            ].map(({ key, label }) => (
              <button
                key={key}
                type="button"
                onClick={() => setView(key)}
                className={`px-3 py-1 ${
                  effectiveView === key
                    ? 'bg-bronze/20 text-bronze'
                    : 'text-cream/50 hover:text-cream'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        )}
        <button
          type="button"
          onClick={handleAddChapter}
          disabled={isAdding}
          className="font-ui text-xs uppercase text-bronze hover:text-cream disabled:opacity-50"
        >
          {terms.addChapter}
        </button>
      </div>

      {actionError && (
        <div className="shrink-0 border-b border-error/40 bg-error/10 px-6 py-2 text-sm text-error">
          {actionError}
        </div>
      )}

      {!comic && effectiveView === STORY_BOARD_VIEWS.BEAT && beats.length > 0 ? (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleBeatDragEnd}>
          <BeatBoardView
            beats={beats}
            beatLinks={beatLinks}
            scenes={scenes}
            chapters={chapters}
            tale={tale}
            taleTargetWordCount={taleTargetWordCount}
            onOpen={onOpenScene}
            onUnlink={handleUnlink}
          />
        </DndContext>
      ) : !comic && effectiveView === STORY_BOARD_VIEWS.BEAT && beats.length === 0 ? (
        <div className="flex flex-1 items-center justify-center p-6">
          <BeatSheetPicker
            taleId={taleId}
            currentTemplateId={tale?.beat_template_id}
            hasBeats={false}
            hasBeatLinks={beatLinks.length > 0}
            description="Pick a story structure template to use the By Beat view."
          />
        </div>
      ) : (
        <ChapterBoardView
          taleId={taleId}
          tale={tale}
          chapters={chapters}
          onOpen={onOpenScene}
          onAddScene={handleAddScene}
          isAddingScene={isAdding}
        />
      )}
    </div>
  )
}

export default StoryBoard
