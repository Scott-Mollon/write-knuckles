import {
  useCreateCharacterLink,
  useCreateLocationLink,
  useDeleteCharacterLink,
  useDeleteLocationLink,
} from '../../hooks/useSceneReferenceLinks'
import {
  getLinkedCharacters,
  getLinkedLocations,
  getSceneCharacterLinks,
  getSceneLocationLinks,
} from '../../lib/reference'
import { confirmUnlink } from '../../lib/confirmAction'

const chipClass = 'inline-flex max-w-full items-start gap-1 rounded bg-bronze/20 text-xs text-bronze'
const selectClass =
  'w-full rounded border border-bronze-dark/50 bg-ink px-2 py-1.5 text-cream focus:border-bronze focus:outline-none'

const SceneReferenceLinks = ({
  scene,
  taleId,
  characters,
  locations,
  characterLinks,
  locationLinks,
}) => {
  const createCharLink = useCreateCharacterLink(taleId)
  const deleteCharLink = useDeleteCharacterLink(taleId)
  const createLocLink = useCreateLocationLink(taleId)
  const deleteLocLink = useDeleteLocationLink(taleId)

  if (!scene) return null

  const linkedChars = getLinkedCharacters(scene.id, characterLinks, characters)
  const linkedLocs = getLinkedLocations(scene.id, locationLinks, locations)
  const charLinkRows = getSceneCharacterLinks(scene.id, characterLinks)
  const locLinkRows = getSceneLocationLinks(scene.id, locationLinks)

  const availableChars = characters.filter((c) => !linkedChars.some((lc) => lc.id === c.id))
  const availableLocs = locations.filter((l) => !linkedLocs.some((ll) => ll.id === l.id))

  return (
    <>
      <div>
        <span className="mb-2 block text-cream/50">Characters</span>
        {linkedChars.length > 0 && (
          <div className="mb-2 flex flex-wrap gap-1.5">
            {linkedChars.map((c) => {
              const link = charLinkRows.find((l) => l.character_id === c.id)
              return (
                <span key={c.id} className={chipClass}>
                  <span className="break-words px-2 py-1">{c.name}</span>
                  {link && (
                    <button
                      type="button"
                      onClick={async () => {
                        if (await confirmUnlink(`character "${c.name}"`)) {
                          deleteCharLink.mutate(link.id)
                        }
                      }}
                      className="pr-1.5 text-bronze/60 hover:text-error"
                      title="Unlink character"
                      aria-label={`Unlink ${c.name}`}
                    >
                      ×
                    </button>
                  )}
                </span>
              )
            })}
          </div>
        )}
        {characters.length === 0 ? (
          <p className="text-xs italic text-cream/30">Add characters in Research.</p>
        ) : availableChars.length > 0 ? (
          <select
            value=""
            onChange={(e) => {
              const characterId = e.target.value
              if (characterId) createCharLink.mutate({ sceneId: scene.id, characterId })
            }}
            className={selectClass}
          >
            <option value="" disabled>
              Link a character…
            </option>
            {availableChars.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        ) : linkedChars.length === 0 ? (
          <p className="text-xs italic text-cream/30">No characters to link.</p>
        ) : null}
      </div>

      <div>
        <span className="mb-2 block text-cream/50">Locations</span>
        {linkedLocs.length > 0 && (
          <div className="mb-2 flex flex-wrap gap-1.5">
            {linkedLocs.map((loc) => {
              const link = locLinkRows.find((l) => l.location_id === loc.id)
              return (
                <span key={loc.id} className={chipClass}>
                  <span className="break-words px-2 py-1">{loc.name}</span>
                  {link && (
                    <button
                      type="button"
                      onClick={async () => {
                        if (await confirmUnlink(`location "${loc.name}"`)) {
                          deleteLocLink.mutate(link.id)
                        }
                      }}
                      className="pr-1.5 text-bronze/60 hover:text-error"
                      title="Unlink location"
                      aria-label={`Unlink ${loc.name}`}
                    >
                      ×
                    </button>
                  )}
                </span>
              )
            })}
          </div>
        )}
        {locations.length === 0 ? (
          <p className="text-xs italic text-cream/30">Add locations in Research.</p>
        ) : availableLocs.length > 0 ? (
          <select
            value=""
            onChange={(e) => {
              const locationId = e.target.value
              if (locationId) createLocLink.mutate({ sceneId: scene.id, locationId })
            }}
            className={selectClass}
          >
            <option value="" disabled>
              Link a location…
            </option>
            {availableLocs.map((loc) => (
              <option key={loc.id} value={loc.id}>
                {loc.name}
              </option>
            ))}
          </select>
        ) : linkedLocs.length === 0 ? (
          <p className="text-xs italic text-cream/30">No locations to link.</p>
        ) : null}
      </div>
    </>
  )
}

export default SceneReferenceLinks
