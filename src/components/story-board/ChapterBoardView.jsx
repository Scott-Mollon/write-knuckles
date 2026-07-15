import { useEffect, useState } from 'react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  horizontalListSortingStrategy,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useReorderStructure, useUpdateChapterMeta } from '../../hooks/useSceneMutations'
import { getTaleTerminology } from '../../lib/taleTerminology'
import ChapterTitleInput from '../chapters/ChapterTitleInput'
import SceneBoardCard from './SceneBoardCard'

const SortableSceneCard = ({ scene, chapters, onOpen, tale }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: `board-scene-${scene.id}`,
    data: { type: 'scene', scene },
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div ref={setNodeRef} style={style} className="mb-3">
      <SceneBoardCard
        scene={scene}
        chapters={chapters}
        tale={tale}
        onOpen={onOpen}
        dragHandleProps={{ ...attributes, ...listeners }}
      />
    </div>
  )
}

const SortableChapterColumn = ({
  chapter,
  chapterIndex,
  chapters,
  onOpen,
  onAddScene,
  onSaveChapterTitle,
  isAddingScene,
  tale,
  terms,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef: setSortableRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: `board-chapter-${chapter.id}`,
    data: { type: 'chapter', chapter },
  })

  const { setNodeRef: setDropRef, isOver } = useDroppable({
    id: `board-chapter-${chapter.id}`,
    data: { type: 'chapter', chapter },
  })

  const setNodeRef = (node) => {
    setSortableRef(node)
    setDropRef(node)
  }

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const sceneIds = chapter.scenes.map((s) => `board-scene-${s.id}`)

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex w-64 shrink-0 flex-col rounded border p-3 transition ${
        isOver ? 'border-bronze bg-bronze/5' : 'border-bronze-dark/40 bg-surface/30'
      }`}
    >
      <div className="mb-3 flex items-start gap-1">
        <button
          type="button"
          className="cursor-grab px-0.5 text-cream/30 hover:text-cream/60 active:cursor-grabbing"
          aria-label="Drag chapter"
          {...attributes}
          {...listeners}
        >
          ⠿
        </button>
        <ChapterTitleInput
          chapter={chapter}
          chapterIndex={chapterIndex}
          onSave={onSaveChapterTitle}
          variant="storyboard"
          tale={tale}
        />
        <button
          type="button"
          onClick={() => onAddScene(chapter.id)}
          disabled={isAddingScene}
          className="shrink-0 text-xs text-bronze hover:text-cream disabled:opacity-50"
          title={`Add ${terms.scene.toLowerCase()}`}
        >
          {terms.addScene}
        </button>
      </div>

      <SortableContext items={sceneIds} strategy={verticalListSortingStrategy}>
        <div className="min-h-[120px]">
          {chapter.scenes.map((scene) => (
            <SortableSceneCard
              key={scene.id}
              scene={scene}
              chapters={chapters}
              tale={tale}
              onOpen={onOpen}
            />
          ))}
          {chapter.scenes.length === 0 && (
            <p className="py-8 text-center text-xs italic text-cream/30">
              Drop {terms.scenePlural.toLowerCase()} here
            </p>
          )}
        </div>
      </SortableContext>
    </div>
  )
}

const ChapterBoardView = ({ taleId, tale, chapters, onOpen, onAddScene, isAddingScene }) => {
  const [localChapters, setLocalChapters] = useState(chapters)
  const reorder = useReorderStructure(taleId)
  const updateChapter = useUpdateChapterMeta(taleId)
  const terms = getTaleTerminology(tale)

  useEffect(() => {
    setLocalChapters(chapters)
  }, [chapters])

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  const chapterIds = localChapters.map((ch) => `board-chapter-${ch.id}`)

  const findContainer = (id) => {
    const sceneId = id.replace('board-scene-', '')
    for (const ch of localChapters) {
      if (ch.scenes.some((s) => s.id === sceneId)) {
        return { type: 'scene', chapterId: ch.id, sceneId }
      }
    }
    if (id.startsWith('board-chapter-')) {
      return { type: 'chapter', chapterId: id.replace('board-chapter-', '') }
    }
    return null
  }

  const handleDragOver = ({ active, over }) => {
    if (!over) return

    const activeId = String(active.id)
    const overId = String(over.id)

    if (!activeId.startsWith('board-scene-')) return

    const activeSceneId = activeId.replace('board-scene-', '')
    const activeContainer = findContainer(activeId)
    if (!activeContainer?.chapterId) return

    let overChapterId = null
    if (overId.startsWith('board-chapter-')) {
      overChapterId = overId.replace('board-chapter-', '')
    } else if (overId.startsWith('board-scene-')) {
      overChapterId = findContainer(overId)?.chapterId
    }

    if (!overChapterId || overChapterId === activeContainer.chapterId) return

    setLocalChapters((prev) => {
      const sourceChapter = prev.find((ch) => ch.id === activeContainer.chapterId)
      const targetChapter = prev.find((ch) => ch.id === overChapterId)
      if (!sourceChapter || !targetChapter) return prev

      const sceneIndex = sourceChapter.scenes.findIndex((s) => s.id === activeSceneId)
      if (sceneIndex === -1) return prev

      const scene = sourceChapter.scenes[sceneIndex]
      const newSourceScenes = sourceChapter.scenes.filter((s) => s.id !== activeSceneId)

      let newTargetScenes
      if (overId.startsWith('board-scene-')) {
        const overSceneId = overId.replace('board-scene-', '')
        const overIndex = targetChapter.scenes.findIndex((s) => s.id === overSceneId)
        newTargetScenes = [...targetChapter.scenes]
        newTargetScenes.splice(overIndex, 0, scene)
      } else {
        newTargetScenes = [...targetChapter.scenes, scene]
      }

      return prev.map((ch) => {
        if (ch.id === activeContainer.chapterId) return { ...ch, scenes: newSourceScenes }
        if (ch.id === overChapterId) return { ...ch, scenes: newTargetScenes }
        return ch
      })
    })
  }

  const handleDragEnd = ({ active, over }) => {
    if (!over) return

    const activeId = String(active.id)
    const overId = String(over.id)

    let nextChapters = [...localChapters]

    if (activeId.startsWith('board-chapter-') && overId.startsWith('board-chapter-')) {
      const oldIndex = nextChapters.findIndex((ch) => `board-chapter-${ch.id}` === activeId)
      const newIndex = nextChapters.findIndex((ch) => `board-chapter-${ch.id}` === overId)
      if (oldIndex !== newIndex) {
        nextChapters = arrayMove(nextChapters, oldIndex, newIndex)
      }
      setLocalChapters(nextChapters)
      reorder.mutate({ chapters: nextChapters })
      return
    }

    if (!activeId.startsWith('board-scene-')) return

    const sceneId = activeId.replace('board-scene-', '')
    const activeChapter = nextChapters.find((ch) => ch.scenes.some((s) => s.id === sceneId))

    if (overId.startsWith('board-scene-')) {
      const overSceneId = overId.replace('board-scene-', '')
      const overChapter = nextChapters.find((ch) => ch.scenes.some((s) => s.id === overSceneId))

      if (activeChapter && overChapter && activeChapter.id === overChapter.id) {
        const oldIndex = activeChapter.scenes.findIndex((s) => s.id === sceneId)
        const newIndex = overChapter.scenes.findIndex((s) => s.id === overSceneId)
        if (oldIndex !== newIndex) {
          nextChapters = nextChapters.map((ch) =>
            ch.id === activeChapter.id
              ? { ...ch, scenes: arrayMove(ch.scenes, oldIndex, newIndex) }
              : ch,
          )
        }
      }
    }

    setLocalChapters(nextChapters)
    reorder.mutate({ chapters: nextChapters })
  }

  const handleSaveChapterTitle = (chapterId, title) => {
    updateChapter.mutate({ chapterId, title })
  }

  return (
    <div className="flex-1 overflow-x-auto overflow-y-auto p-6">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={chapterIds} strategy={horizontalListSortingStrategy}>
          <div className="flex items-start gap-4">
            {localChapters.map((chapter, chapterIndex) => (
              <SortableChapterColumn
                key={chapter.id}
                chapter={chapter}
                chapterIndex={chapterIndex}
                chapters={localChapters}
                onOpen={onOpen}
                onAddScene={onAddScene}
                onSaveChapterTitle={handleSaveChapterTitle}
                isAddingScene={isAddingScene}
                tale={tale}
                terms={terms}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  )
}

export default ChapterBoardView
