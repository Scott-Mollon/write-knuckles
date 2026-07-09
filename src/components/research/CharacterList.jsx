import { useEffect, useMemo, useState } from 'react'
import {
  useCreateCharacter,
  useDeleteCharacter,
  useUpdateCharacter,
} from '../../hooks/useReferenceMutations'
import {
  getEntityHero,
  getEntityImageCount,
} from '../../lib/images/referenceImages'
import {
  collectUniqueTags,
  filterItemsByTags,
  formatTags,
  getJsonSummary,
  parseTags,
  tagsEqual,
} from '../../lib/reference'
import ReferenceImageGallery from '../images/ReferenceImageGallery'
import ReferencePinBoard from './ReferencePinBoard'
import { fieldClass, labelClass } from './referenceStyles'

const CharacterDetailForm = ({ character, taleId }) => {
  const update = useUpdateCharacter(taleId)
  const [name, setName] = useState(character.name)
  const [role, setRole] = useState(character.role || '')
  const [bio, setBio] = useState(getJsonSummary(character.bio))
  const [tags, setTags] = useState(formatTags(character.tags))

  useEffect(() => {
    setName(character.name)
    setRole(character.role || '')
    setBio(getJsonSummary(character.bio))
    setTags(formatTags(character.tags))
  }, [character.id, character.name, character.role, character.bio, character.tags])

  const save = () => {
    const trimmedName = name.trim()
    if (!trimmedName) {
      setName(character.name)
      return
    }
    const nextRole = role.trim()
    const nextBio = bio.trim()
    const nextTags = parseTags(tags)
    if (
      trimmedName === character.name &&
      nextRole === (character.role || '') &&
      nextBio === getJsonSummary(character.bio) &&
      tagsEqual(nextTags, character.tags || [])
    ) {
      return
    }
    update.mutate({
      id: character.id,
      name: trimmedName,
      role: nextRole,
      bioSummary: nextBio,
      tags: nextTags,
    })
  }

  return (
    <div className="space-y-4">
      <ReferenceImageGallery
        taleId={taleId}
        entityType="character"
        entityId={character.id}
        label="Images"
      />

      <div>
        <label className={labelClass} htmlFor={`character-name-${character.id}`}>
          Name
        </label>
        <input
          id={`character-name-${character.id}`}
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onBlur={save}
          className={`${fieldClass} font-ui text-base font-medium`}
        />
      </div>
      <div>
        <label className={labelClass} htmlFor={`character-role-${character.id}`}>
          Role
        </label>
        <input
          id={`character-role-${character.id}`}
          type="text"
          value={role}
          onChange={(e) => setRole(e.target.value)}
          onBlur={save}
          placeholder="Protagonist, femme fatale…"
          className={fieldClass}
        />
      </div>
      <div>
        <label className={labelClass} htmlFor={`character-bio-${character.id}`}>
          Bio
        </label>
        <textarea
          id={`character-bio-${character.id}`}
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          onBlur={save}
          rows={10}
          placeholder="Backstory, motives, tells…"
          className={`${fieldClass} resize-y`}
        />
      </div>
      <div>
        <label className={labelClass} htmlFor={`character-tags-${character.id}`}>
          Tags
        </label>
        <input
          id={`character-tags-${character.id}`}
          type="text"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          onBlur={save}
          placeholder="villain, crew, informant"
          className={fieldClass}
        />
      </div>
    </div>
  )
}

const CharacterList = ({ taleId, characters, imageMeta }) => {
  const create = useCreateCharacter(taleId)
  const del = useDeleteCharacter(taleId)
  const [selectedId, setSelectedId] = useState(null)
  const [selectedTags, setSelectedTags] = useState([])

  const availableTags = useMemo(() => collectUniqueTags(characters), [characters])
  const filtered = useMemo(
    () => filterItemsByTags(characters, selectedTags),
    [characters, selectedTags],
  )
  const selected = filtered.find((c) => c.id === selectedId)
    || characters.find((c) => c.id === selectedId)
    || null

  useEffect(() => {
    if (selectedId && !characters.some((c) => c.id === selectedId)) {
      setSelectedId(null)
    }
  }, [characters, selectedId])

  useEffect(() => {
    setSelectedTags((prev) => prev.filter((tag) => availableTags.includes(tag)))
  }, [availableTags])

  const handleAdd = async () => {
    const created = await create.mutateAsync({
      name: `Character ${characters.length + 1}`,
      sortOrder: characters.length,
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
      addLabel="+ Character"
      countLabel={
        selectedTags.length > 0
          ? `${filtered.length} of ${characters.length} character${characters.length !== 1 ? 's' : ''}`
          : `${characters.length} character${characters.length !== 1 ? 's' : ''}`
      }
      emptyMessage="No characters yet. Add your cast."
      emptyFilteredMessage="No characters match the selected tags."
      isAdding={create.isPending}
      availableTags={availableTags}
      selectedTags={selectedTags}
      onSelectedTagsChange={setSelectedTags}
      getCardProps={(c) => ({
        title: c.name,
        eyebrow: c.role || 'Character',
        preview: getJsonSummary(c.bio) || null,
        tags: c.tags || [],
        heroImage: getEntityHero(imageMeta?.heroes, 'character', c.id),
        imageCount: getEntityImageCount(imageMeta?.counts, 'character', c.id),
      })}
      detailTitle={selected?.name || 'Character'}
      detailSubtitle={selected?.role || 'No role set'}
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
      deleteLabel="Delete character"
    >
      {selected && <CharacterDetailForm key={selected.id} character={selected} taleId={taleId} />}
    </ReferencePinBoard>
  )
}

export default CharacterList
