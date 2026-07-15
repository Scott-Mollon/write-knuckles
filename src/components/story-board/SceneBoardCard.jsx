import { SCENE_STATUS_COLORS } from '../../constants/taleEditor'
import { formatChapterLabel } from '../../lib/chapters'
import { formatSceneLabel, getChapterForScene } from '../../lib/scenes'
import ScenePovDot from '../scenes/ScenePovDot'

const SceneBoardCard = ({
  scene,
  chapters,
  tale = null,
  onOpen,
  dragHandleProps,
  compact = false,
  showChapterLabel = false,
  onUnlink,
}) => {
  const chapter = getChapterForScene(scene, chapters)
  const sortedChapters = [...chapters].sort((a, b) => a.sort_order - b.sort_order)
  const chapterIndex = sortedChapters.findIndex((ch) => ch.id === scene.chapter_id)
  const chapterLabel =
    chapter && chapterIndex >= 0
      ? formatChapterLabel(chapter, chapterIndex, tale)
      : ''

  const borderStyle = {
    borderColor: SCENE_STATUS_COLORS[scene.scene_status],
    backgroundColor: `${SCENE_STATUS_COLORS[scene.scene_status]}15`,
  }

  return (
    <div
      className={`rounded border-2 text-left transition hover:scale-[1.01] ${
        compact ? 'w-48 shrink-0 p-2' : 'p-3'
      }`}
      style={borderStyle}
    >
      <div className="flex items-start gap-2">
        {dragHandleProps && (
          <button
            type="button"
            className="cursor-grab px-0.5 text-cream/30 hover:text-cream/60 active:cursor-grabbing"
            aria-label="Drag scene"
            {...dragHandleProps}
          >
            ⠿
          </button>
        )}
        <button type="button" onClick={() => onOpen(scene.id)} className="min-w-0 flex-1 text-left">
          <div className="flex items-start gap-2">
            <ScenePovDot scene={scene} />
            <div className="min-w-0 flex-1">
              {compact ? (
                <h3 className="break-words font-ui text-xs font-semibold text-cream">
                  {formatSceneLabel(scene, chapters, tale)}
                </h3>
              ) : (
                <>
                  {showChapterLabel && chapterLabel && (
                    <p className="break-words text-[10px] uppercase text-cream/40">{chapterLabel}</p>
                  )}
                  <h3 className="font-ui text-sm font-semibold text-cream">{scene.title}</h3>
                </>
              )}
            </div>
          </div>
          {!compact && (
            <p className="mt-2 line-clamp-3 pl-5 text-xs text-cream/60">
              {scene.synopsis || 'No synopsis yet.'}
            </p>
          )}
          <span
            className={`inline-block text-xs uppercase ${compact ? 'mt-1 pl-5' : 'mt-2 pl-5'}`}
            style={{ color: SCENE_STATUS_COLORS[scene.scene_status] }}
          >
            {scene.scene_status}
          </span>
        </button>
        {onUnlink && (
          <button
            type="button"
            onClick={onUnlink}
            className="shrink-0 text-bronze/60 hover:text-error"
            title="Unlink from beat"
            aria-label={`Unlink ${scene.title}`}
          >
            ×
          </button>
        )}
      </div>
    </div>
  )
}

export default SceneBoardCard
