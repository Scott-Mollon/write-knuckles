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
  const [view, setView] = useState(STORY_BOARD_VIEWS.CHAPTER)
  const createChapter = useCreateChapter(taleId)
  const createScene = useCreateScene(taleId)
  const createLink = useCreateBeatLink(taleId)
  const deleteLink = useDeleteBeatLink(taleId)

  const isAdding = createChapter.isPending || createScene.isPending
  const taleTargetWordCount = tale?.target_word_count || 0

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor),
  )

  const handleAddChapter = async () => {
    const count = chapters.length
    const chapter = await createChapter.mutateAsync({
      title: '',
      sortOrder: count,
    })
    await createScene.mutateAsync({
      chapterId: chapter.id,
      title: 'Scene 1',
      sortOrder: 0,
    })
  }

  const handleAddScene = async (chapterId) => {
    const chapter = chapters.find((ch) => ch.id === chapterId)
    const sortOrder = chapter?.scenes?.length || 0
    await createScene.mutateAsync({
      chapterId,
      title: `Scene ${sortOrder + 1}`,
      sortOrder,
    })
  }

  const handleUnlink = (beatKey, sceneId) => {
    const link = beatLinks.find((l) => l.beat_key === beatKey && l.scene_id === sceneId)
    if (link) deleteLink.mutate(link.id)
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
        <div className="flex gap-1 font-ui text-xs uppercase">
          {[
            { key: STORY_BOARD_VIEWS.BEAT, label: 'By Beat' },
            { key: STORY_BOARD_VIEWS.CHAPTER, label: 'By Chapter' },
          ].map(({ key, label }) => (
            <button
              key={key}
              type="button"
              onClick={() => setView(key)}
              className={`px-3 py-1 ${
                view === key
                  ? 'bg-bronze/20 text-bronze'
                  : 'text-cream/50 hover:text-cream'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={handleAddChapter}
          disabled={isAdding}
          className="font-ui text-xs uppercase text-bronze hover:text-cream disabled:opacity-50"
        >
          + Chapter
        </button>
      </div>

      {view === STORY_BOARD_VIEWS.BEAT && beats.length > 0 ? (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleBeatDragEnd}>
          <BeatBoardView
            beats={beats}
            beatLinks={beatLinks}
            scenes={scenes}
            chapters={chapters}
            taleTargetWordCount={taleTargetWordCount}
            onOpen={onOpenScene}
            onUnlink={handleUnlink}
          />
        </DndContext>
      ) : view === STORY_BOARD_VIEWS.BEAT && beats.length === 0 ? (
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
