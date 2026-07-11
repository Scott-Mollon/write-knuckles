import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTales } from '../hooks/useTales'
import TaleCard from '../components/tale/TaleCard'
import DashboardTaleModals from '../components/tale/DashboardTaleModals'
import Loading from './Loading'

const DashboardPage = () => {
  const { data: tales, isLoading, error } = useTales()
  const [settingsTale, setSettingsTale] = useState(null)
  const [exportTale, setExportTale] = useState(null)

  if (isLoading) return <Loading />

  if (error) {
    return (
      <div className="p-8 text-error">
        Could not load tales. Make sure the database migration has been run.
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-5xl p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-ui text-3xl uppercase tracking-wide text-bronze">Your Tales</h1>
          <p className="mt-2 text-cream/70">Got a tale to tell? Let's knock it out.</p>
        </div>
        <Link
          to="/new"
          className="border-2 border-bronze-dark px-6 py-2 font-ui uppercase tracking-wide text-bronze hover:border-bronze hover:bg-bronze/10"
        >
          New Tale
        </Link>
      </div>

      {tales?.length === 0 ? (
        <div className="border border-dashed border-bronze-dark p-12 text-center text-cream/60">
          <p className="mb-4">You haven&apos;t started a tale yet.</p>
          <Link to="/new" className="text-bronze underline hover:text-cream">
            Create your first Tale
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {tales.map((tale) => (
            <TaleCard
              key={tale.id}
              tale={tale}
              onOpenSettings={(tale) => {
                setExportTale(null)
                setSettingsTale(tale)
              }}
              onOpenExport={(tale) => {
                setSettingsTale(null)
                setExportTale(tale)
              }}
            />
          ))}
        </div>
      )}

      <DashboardTaleModals
        settingsTale={settingsTale}
        exportTale={exportTale}
        onCloseSettings={() => setSettingsTale(null)}
        onCloseExport={() => setExportTale(null)}
      />
    </div>
  )
}

export default DashboardPage
