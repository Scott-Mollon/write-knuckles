import { useTaleStructure } from '../../hooks/useTaleStructure'
import TaleExportModal from './TaleExportModal'
import TaleSettingsModal from './TaleSettingsModal'

const DashboardTaleModals = ({ settingsTale, exportTale, onCloseSettings, onCloseExport }) => {
  const structureTaleId = settingsTale?.id ?? exportTale?.id ?? null
  const { data: structure, isLoading: structureLoading } = useTaleStructure(structureTaleId)

  const beats = structure?.taleBeats?.beats || []
  const beatLinks = structure?.beatLinks || []

  return (
    <>
      {settingsTale && (
        <TaleSettingsModal
          tale={settingsTale}
          taleId={settingsTale.id}
          hasBeats={beats.length > 0}
          hasBeatLinks={beatLinks.length > 0}
          onClose={onCloseSettings}
        />
      )}

      {exportTale && structureLoading && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          role="presentation"
        >
          <p className="font-ui text-sm uppercase text-cream/70">Loading export…</p>
        </div>
      )}

      {exportTale && !structureLoading && structure && (
        <TaleExportModal
          tale={exportTale}
          taleId={exportTale.id}
          chapters={structure.chapters}
          onClose={onCloseExport}
        />
      )}
    </>
  )
}

export default DashboardTaleModals
