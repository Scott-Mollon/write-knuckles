import { useState } from 'react'
import { Link } from 'react-router-dom'
import { canCreateTale, freeTaleLimitMessage } from '../constants/account'
import { useAuth } from '../contexts/AuthContext'
import { useCurrentPlanTaleLimit } from '../hooks/usePlanLimits'
import { useTales } from '../hooks/useTales'
import {
  DEFAULT_TALE_SORT,
  TALE_SORT,
  sortTales,
} from '../lib/tales/sortTales'
import TaleCard from '../components/tale/TaleCard'
import DashboardTaleModals from '../components/tale/DashboardTaleModals'
import Loading from './Loading'

const SORT_STORAGE_KEY = 'write-knuckles-tales-sort'

const readStoredSort = () => {
  try {
    const stored = localStorage.getItem(SORT_STORAGE_KEY)
    if (Object.values(TALE_SORT).includes(stored)) return stored
  } catch {
    // ignore
  }
  return DEFAULT_TALE_SORT
}

const DashboardPage = () => {
  const { plan } = useAuth()
  const { data: tales, isLoading, error } = useTales()
  const {
    maxActiveTales,
    isLoading: limitsLoading,
    error: limitsError,
  } = useCurrentPlanTaleLimit()
  const [settingsTale, setSettingsTale] = useState(null)
  const [compileTale, setCompileTale] = useState(null)
  const [sortMode, setSortMode] = useState(readStoredSort)

  if (isLoading || limitsLoading) return <Loading />

  if (error || limitsError) {
    return (
      <div className="p-8 text-error">
        Could not load tales. Make sure the database migration has been run.
      </div>
    )
  }

  const taleCount = tales?.length ?? 0
  const allowNewTale = canCreateTale({ plan, taleCount, maxActiveTales })
  const limitMessage = freeTaleLimitMessage(maxActiveTales)
  const sortedTales = sortTales(tales, sortMode)

  const handleSortChange = (next) => {
    setSortMode(next)
    try {
      localStorage.setItem(SORT_STORAGE_KEY, next)
    } catch {
      // ignore
    }
  }

  return (
    <div className="mx-auto max-w-5xl p-8">
      <div className="mb-8 flex items-center justify-between gap-4">
        <div>
          <h1 className="font-ui text-3xl uppercase tracking-wide text-bronze">Your Tales</h1>
          <p className="mt-2 text-cream/70">Got a tale to tell? Let's knock it out.</p>
          {!allowNewTale && (
            <p className="mt-2 max-w-xl text-sm text-cream/50">{limitMessage}</p>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-3">
          {taleCount > 0 && (
            <label className="flex items-center gap-2">
              <span className="font-ui text-xs uppercase tracking-wide text-cream/50">Sort</span>
              <select
                value={sortMode}
                onChange={(e) => handleSortChange(e.target.value)}
                className="rounded border border-bronze-dark/50 bg-ink px-2 py-1.5 font-ui text-sm text-cream focus:border-bronze focus:outline-none"
              >
                <option value={TALE_SORT.NEWEST}>Newest</option>
                <option value={TALE_SORT.OLDEST}>Oldest</option>
                <option value={TALE_SORT.TITLE}>Title A–Z</option>
              </select>
            </label>
          )}
          {allowNewTale ? (
            <Link
              to="/new"
              className="border-2 border-bronze-dark px-6 py-2 font-ui uppercase tracking-wide text-bronze hover:border-bronze hover:bg-bronze/10"
            >
              New Tale
            </Link>
          ) : (
            <span
              className="cursor-not-allowed border-2 border-bronze-dark/40 px-6 py-2 font-ui uppercase tracking-wide text-cream/30"
              title={limitMessage}
            >
              New Tale
            </span>
          )}
        </div>
      </div>

      {taleCount === 0 ? (
        <div className="border border-dashed border-bronze-dark p-12 text-center text-cream/60">
          <p className="mb-4">You haven&apos;t started a tale yet.</p>
          {allowNewTale ? (
            <Link to="/new" className="text-bronze underline hover:text-cream">
              Create your first Tale
            </Link>
          ) : (
            <p className="text-sm text-cream/50">{limitMessage}</p>
          )}
        </div>
      ) : (
        <div className="grid gap-4">
          {sortedTales.map((tale) => (
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

      {!allowNewTale && taleCount > 0 && typeof maxActiveTales === 'number' && (
        <p className="mt-6 text-center text-xs text-cream/40">
          Free plan: {taleCount} of {maxActiveTales} tales used.
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
