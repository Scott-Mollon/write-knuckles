import { Link } from 'react-router-dom'
import { useTales, useDeleteTale } from '../hooks/useTales'
import Loading from './Loading'

const DashboardPage = () => {
  const { data: tales, isLoading, error } = useTales()
  const deleteTale = useDeleteTale()

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
          <p className="mt-2 text-cream/70">No tales started yet? Step into the ring.</p>
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
          {tales.map((tale) => {
            const progress = tale.target_word_count
              ? Math.min(100, Math.round((tale.word_count / tale.target_word_count) * 100))
              : 0

            return (
              <div
                key={tale.id}
                className="flex items-center justify-between border border-bronze-dark/50 bg-surface/50 p-5 hover:border-bronze"
              >
                <Link to={`/tale/${tale.id}`} className="flex-1">
                  <h2 className="font-ui text-xl text-cream hover:text-bronze">{tale.title}</h2>
                  {tale.genre && <p className="text-sm text-cream/50">{tale.genre}</p>}
                  <div className="mt-3 flex items-center gap-3">
                    <div className="h-2 flex-1 max-w-xs bg-ink">
                      <div className="h-full bg-bronze transition-all" style={{ width: `${progress}%` }} />
                    </div>
                    <span className="text-sm text-cream/60">
                      {tale.word_count.toLocaleString()} / {tale.target_word_count?.toLocaleString()} words
                    </span>
                  </div>
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm(`Delete "${tale.title}"? This cannot be undone.`)) {
                      deleteTale.mutate(tale.id)
                    }
                  }}
                  className="ml-4 text-sm text-cream/40 hover:text-punch"
                >
                  Delete
                </button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default DashboardPage
