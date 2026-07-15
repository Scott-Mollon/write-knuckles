import { useEffect, useState } from 'react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import {
  useCreateChapter,
  useCreateScene,
  useDeleteChapter,
  useDeleteScene,
  useReorderStructure,
  useUpdateChapterMeta,
} from '../../hooks/useSceneMutations'
import ChapterTitleInput from '../chapters/ChapterTitleInput'
import { confirmDelete } from '../../lib/confirmAction'
import { getScenePovColor } from '../../lib/scenePov'

const SortableScene = ({ scene, isActive, onSelect, onDelete, canDelete }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: `scene-${scene.id}`,
    data: { type: 'scene', scene },
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div className="mb-1 flex items-center gap-1">
      <div ref={setNodeRef} style={style} className="flex min-w-0 flex-1 items-center gap-1">
        <button
          type="button"
          className="cursor-grab px-1 text-cream/30 hover:text-cream/60 active:cursor-grabbing"
          aria-label="Drag scene"
          {...attributes}
          {...listeners}
        >
          ⠿
        </button>
        <button
          type="button"
          onClick={() => onSelect(scene.id)}
          className={`min-w-0 flex-1 truncate rounded border-l-[3px] py-1 pl-2 pr-2 text-left text-sm ${
            isActive ? 'bg-bronze/20 text-bronze' : 'text-cream/70 hover:bg-ink'
          }`}
          style={{ borderLeftColor: getScenePovColor(scene) }}
        >
          {scene.title}
        </button>
      </div>
      {canDelete && (
        <button
          type="button"
          onClick={() => onDelete(scene)}
          className="shrink-0 px-1 text-xs text-cream/30 hover:text-error"
          title="Delete scene"
          aria-label={`Delete ${scene.title}`}
        >
          ×
        </button>
      )}
    </div>
  )
}

const SortableChapter = ({
  chapter,
  chapterIndex,
  activeSceneId,
  onSelectScene,
  onAddScene,
  onDeleteChapter,
  onDeleteScene,
  onSaveChapterTitle,
  canDeleteChapter,
  totalScenes,
}) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: `chapter-${chapter.id}`,
    data: { type: 'chapter', chapter },
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const sceneIds = chapter.scenes.map((s) => `scene-${s.id}`)

  return (
    <div className="mb-4">
      <div className="mb-1 flex items-start gap-1">
        <div ref={setNodeRef} style={style} className="flex min-w-0 flex-1 items-start gap-1">
          <button
            type="button"
            className="cursor-grab px-1 text-cream/30 hover:text-cream/60 active:cursor-grabbing"
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
          />
          <button
            type="button"
            onClick={() => onAddScene(chapter.id)}
            className="px-1 text-xs text-bronze hover:text-cream"
            title="Add scene"
          >
            + Scene
          </button>
        </div>
        {canDeleteChapter && (
          <button
            type="button"
            onClick={() => onDeleteChapter(chapter)}
            className="shrink-0 px-1 text-xs text-cream/30 hover:text-error"
            title="Delete chapter"
            aria-label="Delete chapter"
          >
            ×
          </button>
        )}
      </div>

      <SortableContext items={sceneIds} strategy={verticalListSortingStrategy}>
        <div className="pl-4">
          {chapter.scenes.map((scene) => (
            <SortableScene
              key={scene.id}
              scene={scene}
              isActive={activeSceneId === scene.id}
              onSelect={onSelectScene}
              onDelete={onDeleteScene}
              canDelete={totalScenes > 1}
            />
          ))}
        </div>
      </SortableContext>
    </div>
  )
}

const Rack = ({ taleId, chapters, activeSceneId, onSelectScene, totalScenes }) => {
  const [localChapters, setLocalChapters] = useState(chapters)

  useEffect(() => {
    setLocalChapters(chapters)
  }, [chapters])

  const createChapter = useCreateChapter(taleId)
  const createScene = useCreateScene(taleId)
  const deleteChapter = useDeleteChapter(taleId)
  const deleteScene = useDeleteScene(taleId)
  const reorder = useReorderStructure(taleId)
  const updateChapter = useUpdateChapterMeta(taleId)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  const chapterIds = localChapters.map((ch) => `chapter-${ch.id}`)
  const allSceneIds = localChapters.flatMap((ch) => ch.scenes.map((s) => `scene-${s.id}`))

  const findContainer = (id) => {
    if (id.startsWith('chapter-')) {
      const chapterId = id.replace('chapter-', '')
      return { type: 'chapter', chapterId }
    }
    const sceneId = id.replace('scene-', '')
    for (const ch of localChapters) {
      if (ch.scenes.some((s) => s.id === sceneId)) {
        return { type: 'scene', chapterId: ch.id, sceneId }
      }
    }
    return null
  }

  const handleDragOver = ({ active, over }) => {
    if (!over) return

    const activeId = String(active.id)
    const overId = String(over.id)

    if (!activeId.startsWith('scene-')) return

    const activeSceneId = activeId.replace('scene-', '')
    const activeContainer = findContainer(activeId)
    if (!activeContainer) return

    let overChapterId = null
    if (overId.startsWith('chapter-')) {
      overChapterId = overId.replace('chapter-', '')
    } else if (overId.startsWith('scene-')) {
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
      if (overId.startsWith('scene-')) {
        const overSceneId = overId.replace('scene-', '')
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

    if (activeId.startsWith('chapter-') && overId.startsWith('chapter-')) {
      const oldIndex = nextChapters.findIndex((ch) => `chapter-${ch.id}` === activeId)
      const newIndex = nextChapters.findIndex((ch) => `chapter-${ch.id}` === overId)
      if (oldIndex !== newIndex) {
        nextChapters = arrayMove(nextChapters, oldIndex, newIndex)
      }
    } else if (activeId.startsWith('scene-')) {
      const sceneId = activeId.replace('scene-', '')
      const activeChapter = nextChapters.find((ch) => ch.scenes.some((s) => s.id === sceneId))

      if (overId.startsWith('scene-')) {
        const overSceneId = overId.replace('scene-', '')
        const overChapter = nextChapters.find((ch) => ch.scenes.some((s) => s.id === overSceneId))

        if (activeChapter && overChapter) {
          if (activeChapter.id === overChapter.id) {
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
      }
    }

    setLocalChapters(nextChapters)
    reorder.mutate({ chapters: nextChapters })
  }

  const handleAddChapter = async () => {
    const count = localChapters.length
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
    const chapter = localChapters.find((ch) => ch.id === chapterId)
    const sortOrder = chapter?.scenes?.length || 0
    const scene = await createScene.mutateAsync({
      chapterId,
      title: `Scene ${sortOrder + 1}`,
      sortOrder,
    })
    onSelectScene(scene.id)
  }

  const handleDeleteChapter = async (chapter) => {
    if (localChapters.length <= 1) return

    const label = chapter.title?.trim()
      ? `chapter "${chapter.title}" and all its scenes`
      : 'this chapter and all its scenes'

    if (!(await confirmDelete(label))) return

    await deleteChapter.mutateAsync(chapter.id)
  }

  const handleDeleteScene = async (scene) => {
    if (totalScenes <= 1) return

    const label = scene.title?.trim() ? `"${scene.title}"` : 'this scene'
    if (!(await confirmDelete(label))) return

    await deleteScene.mutateAsync(scene.id)
    if (activeSceneId === scene.id) {
      const remaining = localChapters.flatMap((ch) => ch.scenes).filter((s) => s.id !== scene.id)
      if (remaining[0]) onSelectScene(remaining[0].id)
    }
  }

  const handleSaveChapterTitle = (chapterId, title) => {
    updateChapter.mutate({ chapterId, title })
  }

  return (
    <aside className="flex w-64 shrink-0 flex-col border-r border-bronze-dark/50 bg-surface/30">
      <div className="flex items-center justify-between border-b border-bronze-dark/30 p-3">
        <h2 className="font-ui text-xs uppercase tracking-widest text-bronze">The Rack</h2>
        <button
          type="button"
          onClick={handleAddChapter}
          disabled={createChapter.isPending}
          className="text-xs text-bronze hover:text-cream disabled:opacity-50"
        >
          + Chapter
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-3">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={[...chapterIds, ...allSceneIds]} strategy={verticalListSortingStrategy}>
            {localChapters.map((chapter, chapterIndex) => (
              <SortableChapter
                key={chapter.id}
                chapter={chapter}
                chapterIndex={chapterIndex}
                activeSceneId={activeSceneId}
                onSelectScene={onSelectScene}
                onAddScene={handleAddScene}
                onDeleteChapter={handleDeleteChapter}
                onDeleteScene={handleDeleteScene}
                onSaveChapterTitle={handleSaveChapterTitle}
                canDeleteChapter={localChapters.length > 1}
                totalScenes={totalScenes}
              />
            ))}
          </SortableContext>
        </DndContext>
      </div>
    </aside>
  )
}

export default Rack
