import { formatSceneLabel, getScenesInRackOrder } from '../../lib/scenes'

const SceneLinkSelect = ({
  scenes,
  chapters = [],
  excludeSceneIds = [],
  onSelect,
  placeholder = 'Link a scene…',
  className = '',
}) => {
  const rackScenes = chapters.length > 0 ? getScenesInRackOrder(chapters) : scenes
  const available = rackScenes.filter((s) => !excludeSceneIds.includes(s.id))

  if (available.length === 0) return null

  return (
    <select
      value=""
      onChange={(e) => {
        const sceneId = e.target.value
        if (sceneId) onSelect(sceneId)
      }}
      className={`rounded border border-bronze-dark/50 bg-ink px-2 py-1 text-xs text-cream focus:border-bronze focus:outline-none ${className}`}
    >
      <option value="" disabled>
        {placeholder}
      </option>
      {available.map((s) => (
        <option key={s.id} value={s.id}>
          {formatSceneLabel(s, chapters)}
        </option>
      ))}
    </select>
  )
}

export default SceneLinkSelect
