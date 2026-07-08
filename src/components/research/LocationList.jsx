import { useEffect, useMemo, useState } from 'react'
import {
  useCreateLocation,
  useDeleteLocation,
  useUpdateLocation,
} from '../../hooks/useReferenceMutations'
import {
  collectUniqueTags,
  filterItemsByTags,
  formatTags,
  getJsonSummary,
  parseTags,
  tagsEqual,
} from '../../lib/reference'
import ReferencePinBoard from './ReferencePinBoard'
import { fieldClass, labelClass } from './referenceStyles'

const LocationDetailForm = ({ location, taleId }) => {
  const update = useUpdateLocation(taleId)
  const [name, setName] = useState(location.name)
  const [description, setDescription] = useState(location.description || '')
  const [notes, setNotes] = useState(getJsonSummary(location.notes))
  const [tags, setTags] = useState(formatTags(location.tags))

  useEffect(() => {
    setName(location.name)
    setDescription(location.description || '')
    setNotes(getJsonSummary(location.notes))
    setTags(formatTags(location.tags))
  }, [location.id, location.name, location.description, location.notes, location.tags])

  const save = () => {
    const trimmedName = name.trim()
    if (!trimmedName) {
      setName(location.name)
      return
    }
    const nextDescription = description.trim()
    const nextNotes = notes.trim()
    const nextTags = parseTags(tags)
    if (
      trimmedName === location.name &&
      nextDescription === (location.description || '') &&
      nextNotes === getJsonSummary(location.notes) &&
      tagsEqual(nextTags, location.tags || [])
    ) {
      return
    }
    update.mutate({
      id: location.id,
      name: trimmedName,
      description: nextDescription,
      notesSummary: nextNotes,
      tags: nextTags,
    })
  }

  return (
    <div className="space-y-4">
      <div>
        <label className={labelClass} htmlFor={`location-name-${location.id}`}>
          Name
        </label>
        <input
          id={`location-name-${location.id}`}
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onBlur={save}
          className={`${fieldClass} font-ui text-base font-medium`}
        />
      </div>
      <div>
        <label className={labelClass} htmlFor={`location-description-${location.id}`}>
          Description
        </label>
        <input
          id={`location-description-${location.id}`}
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          onBlur={save}
          placeholder="A smoky back-room bar…"
          className={fieldClass}
        />
      </div>
      <div>
        <label className={labelClass} htmlFor={`location-notes-${location.id}`}>
          Notes
        </label>
        <textarea
          id={`location-notes-${location.id}`}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          onBlur={save}
          rows={10}
          placeholder="Atmosphere, history, secrets…"
          className={`${fieldClass} resize-y`}
        />
      </div>
      <div>
        <label className={labelClass} htmlFor={`location-tags-${location.id}`}>
          Tags
        </label>
        <input
          id={`location-tags-${location.id}`}
          type="text"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          onBlur={save}
          placeholder="city, hideout, docks"
          className={fieldClass}
        />
      </div>
    </div>
  )
}

const LocationList = ({ taleId, locations }) => {
  const create = useCreateLocation(taleId)
  const del = useDeleteLocation(taleId)
  const [selectedId, setSelectedId] = useState(null)
  const [selectedTags, setSelectedTags] = useState([])

  const availableTags = useMemo(() => collectUniqueTags(locations), [locations])
  const filtered = useMemo(
    () => filterItemsByTags(locations, selectedTags),
    [locations, selectedTags],
  )
  const selected = filtered.find((loc) => loc.id === selectedId)
    || locations.find((loc) => loc.id === selectedId)
    || null

  useEffect(() => {
    if (selectedId && !locations.some((loc) => loc.id === selectedId)) {
      setSelectedId(null)
    }
  }, [locations, selectedId])

  useEffect(() => {
    setSelectedTags((prev) => prev.filter((tag) => availableTags.includes(tag)))
  }, [availableTags])

  const handleAdd = async () => {
    const created = await create.mutateAsync({
      name: `Location ${locations.length + 1}`,
      sortOrder: locations.length,
      tags: [],
    })
    setSelectedId(created.id)
  }

  return (
    <ReferencePinBoard
      items={filtered}
      selectedId={selected?.id}
      onSelect={setSelectedId}
      onClearSelection={() => setSelectedId(null)}
      onAdd={handleAdd}
      addLabel="+ Location"
      countLabel={
        selectedTags.length > 0
          ? `${filtered.length} of ${locations.length} location${locations.length !== 1 ? 's' : ''}`
          : `${locations.length} location${locations.length !== 1 ? 's' : ''}`
      }
      emptyMessage="No locations yet. Map your world."
      emptyFilteredMessage="No locations match the selected tags."
      isAdding={create.isPending}
      availableTags={availableTags}
      selectedTags={selectedTags}
      onSelectedTagsChange={setSelectedTags}
      getCardProps={(loc) => ({
        title: loc.name,
        eyebrow: 'Location',
        preview: loc.description || getJsonSummary(loc.notes) || null,
        tags: loc.tags || [],
      })}
      detailTitle={selected?.name || 'Location'}
      detailSubtitle={selected?.description || 'No description'}
      onDelete={
        selected
          ? () => {
              if (window.confirm(`Delete "${selected.name}"?`)) {
                del.mutate(selected.id)
                setSelectedId(null)
              }
            }
          : undefined
      }
      deleteLabel="Delete location"
    >
      {selected && <LocationDetailForm key={selected.id} location={selected} taleId={taleId} />}
    </ReferencePinBoard>
  )
}

export default LocationList
