import { useEffect, useState } from 'react'
import {
  useCreateCharacter,
  useDeleteCharacter,
  useUpdateCharacter,
} from '../../hooks/useReferenceMutations'
import { getJsonSummary } from '../../lib/reference'
import ReferencePinBoard from './ReferencePinBoard'
import { fieldClass, labelClass } from './referenceStyles'

const CharacterDetailForm = ({ character, taleId }) => {
  const update = useUpdateCharacter(taleId)
  const [name, setName] = useState(character.name)
  const [role, setRole] = useState(character.role || '')
  const [bio, setBio] = useState(getJsonSummary(character.bio))

  useEffect(() => {
    setName(character.name)
    setRole(character.role || '')
    setBio(getJsonSummary(character.bio))
  }, [character.id, character.name, character.role, character.bio])

  const save = () => {
    const trimmedName = name.trim()
    if (!trimmedName) {
      setName(character.name)
      return
    }
    const nextRole = role.trim()
    const nextBio = bio.trim()
    if (
      trimmedName === character.name &&
      nextRole === (character.role || '') &&
      nextBio === getJsonSummary(character.bio)
    ) {
      return
    }
    update.mutate({
      id: character.id,
      name: trimmedName,
      role: nextRole,
      bioSummary: nextBio,
    })
  }

  return (
    <div className="space-y-4">
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
    </div>
  )
}

const CharacterList = ({ taleId, characters }) => {
  const create = useCreateCharacter(taleId)
  const del = useDeleteCharacter(taleId)
  const [selectedId, setSelectedId] = useState(null)

  const selected = characters.find((c) => c.id === selectedId) || null

  useEffect(() => {
    if (selectedId && !characters.some((c) => c.id === selectedId)) {
      setSelectedId(null)
    }
  }, [characters, selectedId])

  const handleAdd = async () => {
    const created = await create.mutateAsync({
      name: `Character ${characters.length + 1}`,
      sortOrder: characters.length,
    })
    setSelectedId(created.id)
  }

  return (
    <ReferencePinBoard
      items={characters}
      selectedId={selected?.id}
      onSelect={setSelectedId}
      onClearSelection={() => setSelectedId(null)}
      onAdd={handleAdd}
      addLabel="+ Character"
      countLabel={`${characters.length} character${characters.length !== 1 ? 's' : ''}`}
      emptyMessage="No characters yet. Add your cast."
      isAdding={create.isPending}
      getCardProps={(c) => ({
        title: c.name,
        eyebrow: c.role || 'Character',
        preview: getJsonSummary(c.bio) || null,
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
