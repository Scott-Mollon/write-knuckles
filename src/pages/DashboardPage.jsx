import { useState } from 'react'
import { Link } from 'react-router-dom'
import { canCreateTale, FREE_MAX_TALES, FREE_TALE_LIMIT_MESSAGE } from '../constants/account'
import { useAuth } from '../contexts/AuthContext'
import { useTales } from '../hooks/useTales'
import TaleCard from '../components/tale/TaleCard'
import DashboardTaleModals from '../components/tale/DashboardTaleModals'
import Loading from './Loading'

const DashboardPage = () => {
  const { plan } = useAuth()
  const { data: tales, isLoading, error } = useTales()
  const [settingsTale, setSettingsTale] = useState(null)
  const [compileTale, setCompileTale] = useState(null)

  if (isLoading) return <Loading />

  if (error) {
    return (
      <div className="p-8 text-error">
        Could not load tales. Make sure the database migration has been run.
      </div>
    )
  }

  const taleCount = tales?.length ?? 0
  const allowNewTale = canCreateTale({ plan, taleCount })

  return (
    <div className="mx-auto max-w-5xl p-8">
      <div className="mb-8 flex items-center justify-between gap-4">
        <div>
          <h1 className="font-ui text-3xl uppercase tracking-wide text-bronze">Your Tales</h1>
          <p className="mt-2 text-cream/70">Got a tale to tell? Let's knock it out.</p>
          {!allowNewTale && (
            <p className="mt-2 max-w-xl text-sm text-cream/50">{FREE_TALE_LIMIT_MESSAGE}</p>
          )}
        </div>
        {allowNewTale ? (
          <Link
            to="/new"
            className="shrink-0 border-2 border-bronze-dark px-6 py-2 font-ui uppercase tracking-wide text-bronze hover:border-bronze hover:bg-bronze/10"
          >
            New Tale
          </Link>
        ) : (
          <span
            className="shrink-0 cursor-not-allowed border-2 border-bronze-dark/40 px-6 py-2 font-ui uppercase tracking-wide text-cream/30"
            title={FREE_TALE_LIMIT_MESSAGE}
          >
            New Tale
          </span>
        )}
      </div>

      {taleCount === 0 ? (
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
                setCompileTale(null)
                setSettingsTale(tale)
              }}
              onOpenCompile={(tale) => {
                setSettingsTale(null)
                setCompileTale(tale)
              }}
            />
          ))}
        </div>
      )}

      {!allowNewTale && taleCount > 0 && (
        <p className="mt-6 text-center text-xs text-cream/40">
          Free plan: {taleCount} of {FREE_MAX_TALES} tales used.
        </p>
      )}

      <DashboardTaleModals
        settingsTale={settingsTale}
        compileTale={compileTale}
        onCloseSettings={() => setSettingsTale(null)}
        onCloseCompile={() => setCompileTale(null)}
      />
    </div>
  )
}

export default DashboardPage
