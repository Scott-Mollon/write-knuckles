import { useDraggable, useDroppable } from '@dnd-kit/core'
import { getBeatScenes, getBeatTargetWords, getBeatWordProgress } from '../../lib/beats'
import { getUnlinkedScenes, sortScenesByRackOrder } from '../../lib/scenes'
import BeatWordBar from '../beats/BeatWordBar'
import SceneBoardCard from './SceneBoardCard'

const DraggablePoolScene = ({ scene, chapters, tale, onOpen }) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `pool-scene-${scene.id}`,
    data: { type: 'pool-scene', sceneId: scene.id },
  })

  const style = transform
    ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`, opacity: isDragging ? 0.5 : 1 }
    : { opacity: isDragging ? 0.5 : 1 }

  return (
    <div ref={setNodeRef} style={style}>
      <SceneBoardCard
        scene={scene}
        chapters={chapters}
        tale={tale}
        onOpen={onOpen}
        dragHandleProps={{ ...attributes, ...listeners }}
        compact
      />
    </div>
  )
}

const DraggableBeatScene = ({ scene, beatKey, chapters, tale, onOpen, onUnlink }) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `beat-${beatKey}-scene-${scene.id}`,
    data: { type: 'beat-scene', sceneId: scene.id, beatKey },
  })

  const style = transform
    ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`, opacity: isDragging ? 0.5 : 1 }
    : { opacity: isDragging ? 0.5 : 1 }

  return (
    <div ref={setNodeRef} style={style} className="mb-3">
      <SceneBoardCard
        scene={scene}
        chapters={chapters}
        tale={tale}
        onOpen={onOpen}
        dragHandleProps={{ ...attributes, ...listeners }}
        showChapterLabel
        onUnlink={onUnlink}
      />
    </div>
  )
}

const BeatColumn = ({
  beat,
  beatIndex,
  beats,
  beatLinks,
  scenes,
  chapters,
  tale,
  taleTargetWordCount,
  onOpen,
  onUnlink,
}) => {
  const { setNodeRef, isOver } = useDroppable({
    id: `board-beat-${beat.key}`,
    data: { type: 'beat', beatKey: beat.key },
  })

  const linked = sortScenesByRackOrder(
    getBeatScenes(beat.key, beatLinks, scenes),
    chapters,
  )
  const previousPercent = beatIndex > 0 ? beats[beatIndex - 1].target_percent : 0
  const targetWords = getBeatTargetWords(beat, beats, beatIndex, taleTargetWordCount)
  const wordProgress = getBeatWordProgress(beat, linked, beats, beatIndex, taleTargetWordCount)

  return (
    <div
      ref={setNodeRef}
      className={`flex w-64 shrink-0 flex-col rounded border p-3 transition ${
        isOver ? 'border-bronze bg-bronze/5' : 'border-bronze-dark/40 bg-surface/30'
      }`}
    >
      <div className="mb-2">
        <h2 className="font-ui text-sm font-medium text-bronze">{beat.title}</h2>
        <p className="mt-1 line-clamp-2 text-xs text-cream/50">{beat.guidance}</p>
        <div className="mt-2 text-right text-xs text-cream/40">
          <div>
            {previousPercent}–{beat.target_percent}%
          </div>
          <div>~{targetWords.toLocaleString()} words</div>
        </div>
        <BeatWordBar wordProgress={wordProgress} />
      </div>

      <div className="min-h-[100px]">
        {linked.map((scene) => (
          <DraggableBeatScene
            key={`${beat.key}-${scene.id}`}
            scene={scene}
            beatKey={beat.key}
            chapters={chapters}
            tale={tale}
            onOpen={onOpen}
            onUnlink={() => onUnlink(beat.key, scene.id)}
          />
        ))}
        {linked.length === 0 && (
          <p className="py-8 text-center text-xs italic text-cream/30">Drop scenes here</p>
        )}
      </div>
    </div>
  )
}

const RackPool = ({ chapters, beatLinks, tale, onOpen }) => {
  const { setNodeRef, isOver } = useDroppable({
    id: 'board-pool',
    data: { type: 'pool' },
  })

  const unlinked = getUnlinkedScenes(chapters, beatLinks)

  return (
    <div
      ref={setNodeRef}
      className={`shrink-0 border-b px-6 py-3 transition ${
        isOver ? 'border-bronze bg-bronze/5' : 'border-bronze-dark/30 bg-ink/30'
      }`}
    >
      <div className="mb-2 flex items-center justify-between">
        <h2 className="font-ui text-xs uppercase tracking-widest text-bronze">The Rack — Unlinked</h2>
        <span className="text-xs text-cream/40">{unlinked.length} scene{unlinked.length !== 1 ? 's' : ''}</span>
      </div>
      {unlinked.length === 0 ? (
        <p className="text-xs italic text-cream/30">All scenes are linked to beats. Drag here to unlink.</p>
      ) : (
        <div className="flex gap-3 overflow-x-auto pb-1">
          {unlinked.map((scene) => (
            <DraggablePoolScene
              key={scene.id}
              scene={scene}
              chapters={chapters}
              tale={tale}
              onOpen={onOpen}
            />
          ))}
        </div>
      )}
    </div>
  )
}

const BeatBoardView = ({
  beats,
  beatLinks,
  scenes,
  chapters,
  tale,
  taleTargetWordCount,
  onOpen,
  onUnlink,
}) => (
  <div className="flex flex-1 flex-col overflow-hidden">
    <RackPool chapters={chapters} beatLinks={beatLinks} tale={tale} onOpen={onOpen} />
    <div className="flex-1 overflow-x-auto overflow-y-auto p-6">
      <div className="flex items-start gap-4">
        {beats.map((beat, beatIndex) => (
          <BeatColumn
            key={beat.key}
            beat={beat}
            beatIndex={beatIndex}
            beats={beats}
            beatLinks={beatLinks}
            scenes={scenes}
            chapters={chapters}
            tale={tale}
            taleTargetWordCount={taleTargetWordCount}
            onOpen={onOpen}
            onUnlink={onUnlink}
          />
        ))}
      </div>
    </div>
  </div>
)

export default BeatBoardView
