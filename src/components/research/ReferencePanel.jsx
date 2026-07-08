import { useState } from 'react'
import { REFERENCE_TABS } from '../../constants/taleEditor'
import CharacterList from './CharacterList'
import LocationList from './LocationList'
import ResearchList from './ResearchList'

const TABS = [
  { key: REFERENCE_TABS.CHARACTERS, label: 'Characters' },
  { key: REFERENCE_TABS.LOCATIONS, label: 'Locations' },
  { key: REFERENCE_TABS.RESEARCH, label: 'Research' },
]

const ReferencePanel = ({
  taleId,
  characters,
  locations,
  researchItems,
}) => {
  const [tab, setTab] = useState(REFERENCE_TABS.CHARACTERS)

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div className="flex shrink-0 gap-1 border-b border-bronze-dark/30 px-6 py-2 font-ui text-xs uppercase">
        {TABS.map(({ key, label }) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            className={`px-3 py-1 ${
              tab === key ? 'bg-bronze/20 text-bronze' : 'text-cream/50 hover:text-cream'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="flex min-h-0 flex-1 overflow-hidden p-4 sm:p-6">
        {tab === REFERENCE_TABS.CHARACTERS && (
          <CharacterList taleId={taleId} characters={characters} />
        )}
        {tab === REFERENCE_TABS.LOCATIONS && (
          <LocationList taleId={taleId} locations={locations} />
        )}
        {tab === REFERENCE_TABS.RESEARCH && (
          <ResearchList taleId={taleId} researchItems={researchItems} />
        )}
      </div>
    </div>
  )
}

export default ReferencePanel
