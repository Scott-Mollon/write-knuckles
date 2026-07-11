import { Link } from 'react-router-dom'
import { useDeleteTale } from '../../hooks/useTales'
import { confirmDelete } from '../../lib/confirmAction'
import TaleCoverThumbnail from './TaleCoverThumbnail'

const TaleCard = ({ tale, onOpenSettings, onOpenExport }) => {
  const deleteTale = useDeleteTale()

  const progress = tale.target_word_count
    ? Math.min(100, Math.round((tale.word_count / tale.target_word_count) * 100))
    : 0

  const stopCardNavigation = (event) => {
    event.preventDefault()
    event.stopPropagation()
  }

  return (
    <div className="flex items-stretch gap-4 border border-bronze-dark/50 bg-surface/50 p-4 hover:border-bronze sm:p-5">
      <Link
        to={`/tale/${tale.id}`}
        className="shrink-0 transition opacity-90 hover:opacity-100"
        aria-hidden
        tabIndex={-1}
      >
        <TaleCoverThumbnail tale={tale} title={tale.title} />
      </Link>

      <div className="flex min-w-0 flex-1 items-center justify-between gap-4">
        <Link to={`/tale/${tale.id}`} className="min-w-0 flex-1">
          <h2 className="font-ui text-xl text-cream hover:text-bronze">{tale.title}</h2>
          {tale.genre && <p className="text-sm text-cream/50">{tale.genre}</p>}
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <div className="h-2 min-w-[8rem] max-w-xs flex-1 bg-ink">
              <div className="h-full bg-bronze transition-all" style={{ width: `${progress}%` }} />
            </div>
            <span className="text-sm text-cream/60">
              {tale.word_count.toLocaleString()} / {tale.target_word_count?.toLocaleString()} words
            </span>
          </div>
        </Link>

        <div className="flex shrink-0 flex-col items-end gap-2 self-start">
          <button
            type="button"
            onClick={(e) => {
              stopCardNavigation(e)
              onOpenSettings?.(tale)
            }}
            className="font-ui text-xs uppercase tracking-wide text-cream/50 hover:text-bronze"
          >
            Settings
          </button>
          <button
            type="button"
            onClick={(e) => {
              stopCardNavigation(e)
              onOpenExport?.(tale)
            }}
            className="font-ui text-xs uppercase tracking-wide text-cream/50 hover:text-bronze"
          >
            Export
          </button>
          <button
            type="button"
            onClick={async (e) => {
              stopCardNavigation(e)
              if (await confirmDelete(`"${tale.title}"`, { irreversible: true })) {
                deleteTale.mutate(tale.id)
              }
            }}
            className="text-sm text-cream/40 hover:text-punch"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}

export default TaleCard
