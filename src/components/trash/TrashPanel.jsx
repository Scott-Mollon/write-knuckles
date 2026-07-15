import { confirmDelete } from '../../lib/confirmAction'
import {
  usePermanentlyDeleteChapter,
  usePermanentlyDeleteScene,
  useRestoreChapter,
  useRestoreScene,
} from '../../hooks/useSceneMutations'
import {
  usePermanentlyDeleteCharacter,
  usePermanentlyDeleteLocation,
  usePermanentlyDeleteResearchItem,
  useRestoreCharacter,
  useRestoreLocation,
  useRestoreResearchItem,
} from '../../hooks/useReferenceMutations'
import { useTaleTrash } from '../../hooks/useTaleTrash'
import Loading from '../../pages/Loading'

const formatDeletedAt = (value) => {
  if (!value) return ''
  try {
    return new Date(value).toLocaleString(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
    })
  } catch {
    return value
  }
}

const TrashSection = ({ title, items, renderLabel, onRestore, onPermanentDelete, busy }) => {
  if (!items.length) return null

  return (
    <section className="space-y-3">
      <h2 className="font-ui text-xs uppercase tracking-widest text-bronze">
        {title}
        <span className="ml-2 text-cream/35">({items.length})</span>
      </h2>
      <ul className="divide-y divide-bronze-dark/30 border border-bronze-dark/40">
        {items.map((item) => (
          <li
            key={item.id}
            className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="min-w-0">
              <p className="truncate text-sm text-cream">{renderLabel(item)}</p>
              <p className="mt-0.5 text-xs text-cream/40">
                Deleted {formatDeletedAt(item.deleted_at)}
              </p>
            </div>
            <div className="flex shrink-0 gap-3">
              <button
                type="button"
                disabled={busy}
                onClick={() => onRestore(item)}
                className="font-ui text-xs uppercase tracking-wide text-bronze hover:text-cream disabled:opacity-40"
              >
                Restore
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={() => onPermanentDelete(item)}
                className="font-ui text-xs uppercase tracking-wide text-error/80 hover:text-error disabled:opacity-40"
              >
                Delete permanently
              </button>
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}

const TrashPanel = ({ taleId }) => {
  const { data, isLoading } = useTaleTrash(taleId)

  const restoreChapter = useRestoreChapter(taleId)
  const restoreScene = useRestoreScene(taleId)
  const permanentlyDeleteChapter = usePermanentlyDeleteChapter(taleId)
  const permanentlyDeleteScene = usePermanentlyDeleteScene(taleId)

  const restoreCharacter = useRestoreCharacter(taleId)
  const restoreLocation = useRestoreLocation(taleId)
  const restoreResearchItem = useRestoreResearchItem(taleId)
  const permanentlyDeleteCharacter = usePermanentlyDeleteCharacter(taleId)
  const permanentlyDeleteLocation = usePermanentlyDeleteLocation(taleId)
  const permanentlyDeleteResearchItem = usePermanentlyDeleteResearchItem(taleId)

  const busy =
    restoreChapter.isPending ||
    restoreScene.isPending ||
    permanentlyDeleteChapter.isPending ||
    permanentlyDeleteScene.isPending ||
    restoreCharacter.isPending ||
    restoreLocation.isPending ||
    restoreResearchItem.isPending ||
    permanentlyDeleteCharacter.isPending ||
    permanentlyDeleteLocation.isPending ||
    permanentlyDeleteResearchItem.isPending

  if (isLoading) return <Loading />

  const chapters = data?.chapters || []
  const scenes = data?.scenes || []
  const characters = data?.characters || []
  const locations = data?.locations || []
  const researchItems = data?.researchItems || []
  const total =
    chapters.length +
    scenes.length +
    characters.length +
    locations.length +
    researchItems.length

  const permanentDelete = async (label, mutate) => {
    if (!(await confirmDelete(label, { irreversible: true }))) return
    await mutate()
  }

  return (
    <div className="flex-1 overflow-y-auto px-6 py-6">
      <div className="mx-auto max-w-3xl space-y-8">
        <div>
          <h1 className="font-ui text-lg uppercase tracking-wide text-bronze">Trash</h1>
          <p className="mt-1 text-sm text-cream/50">
            Restore items to bring them back, or delete them permanently.
          </p>
        </div>

        {total === 0 ? (
          <p className="text-sm text-cream/40">Trash is empty.</p>
        ) : (
          <>
            <TrashSection
              title="Chapters"
              items={chapters}
              renderLabel={(ch) => ch.title?.trim() || 'Untitled chapter'}
              busy={busy}
              onRestore={(ch) => restoreChapter.mutate(ch.id)}
              onPermanentDelete={(ch) =>
                permanentDelete(
                  ch.title?.trim()
                    ? `chapter "${ch.title}" and all its scenes permanently`
                    : 'this chapter and all its scenes permanently',
                  () => permanentlyDeleteChapter.mutateAsync(ch.id),
                )
              }
            />

            <TrashSection
              title="Scenes"
              items={scenes}
              renderLabel={(scene) => scene.title?.trim() || 'Untitled scene'}
              busy={busy}
              onRestore={(scene) => restoreScene.mutate(scene.id)}
              onPermanentDelete={(scene) =>
                permanentDelete(
                  scene.title?.trim() ? `"${scene.title}" permanently` : 'this scene permanently',
                  () => permanentlyDeleteScene.mutateAsync(scene.id),
                )
              }
            />

            <TrashSection
              title="Characters"
              items={characters}
              renderLabel={(character) => character.name?.trim() || 'Untitled character'}
              busy={busy}
              onRestore={(character) => restoreCharacter.mutate(character.id)}
              onPermanentDelete={(character) =>
                permanentDelete(
                  character.name?.trim()
                    ? `"${character.name}" permanently`
                    : 'this character permanently',
                  () => permanentlyDeleteCharacter.mutateAsync(character.id),
                )
              }
            />

            <TrashSection
              title="Locations"
              items={locations}
              renderLabel={(location) => location.name?.trim() || 'Untitled location'}
              busy={busy}
              onRestore={(location) => restoreLocation.mutate(location.id)}
              onPermanentDelete={(location) =>
                permanentDelete(
                  location.name?.trim()
                    ? `"${location.name}" permanently`
                    : 'this location permanently',
                  () => permanentlyDeleteLocation.mutateAsync(location.id),
                )
              }
            />

            <TrashSection
              title="Research"
              items={researchItems}
              renderLabel={(item) => item.title?.trim() || 'Untitled research'}
              busy={busy}
              onRestore={(item) => restoreResearchItem.mutate(item.id)}
              onPermanentDelete={(item) =>
                permanentDelete(
                  item.title?.trim()
                    ? `"${item.title}" permanently`
                    : 'this research item permanently',
                  () => permanentlyDeleteResearchItem.mutateAsync(item.id),
                )
              }
            />
          </>
        )}
      </div>
    </div>
  )
}

export default TrashPanel
