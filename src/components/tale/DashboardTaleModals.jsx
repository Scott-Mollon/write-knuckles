import { useTaleStructure } from '../../hooks/useTaleStructure'
import { useTale } from '../../hooks/useTales'
import TaleCompileModal from './TaleCompileModal'
import TaleSettingsModal from './TaleSettingsModal'

const DashboardTaleModals = ({ settingsTale, compileTale, onCloseSettings, onCloseCompile }) => {
  const structureTaleId = settingsTale?.id ?? compileTale?.id ?? null
  const { data: structure, isLoading: structureLoading } = useTaleStructure(structureTaleId)
  const { data: settingsTaleRecord } = useTale(settingsTale?.id)

  const beats = structure?.taleBeats?.beats || []
  const beatLinks = structure?.beatLinks || []

  return (
    <>
      {settingsTale && (
        <TaleSettingsModal
          tale={settingsTaleRecord || settingsTale}
          taleId={settingsTale.id}
          hasBeats={beats.length > 0}
          hasBeatLinks={beatLinks.length > 0}
          onClose={onCloseSettings}
        />
      )}

      {compileTale && structureLoading && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          role="presentation"
        >
          <p className="font-ui text-sm uppercase text-cream/70">Loading compile…</p>
        </div>
      )}

      {compileTale && !structureLoading && structure && (
        <TaleCompileModal
          tale={compileTale}
          taleId={compileTale.id}
          chapters={structure.chapters}
          onClose={onCloseCompile}
        />
      )}
    </>
  )
}

export default DashboardTaleModals
