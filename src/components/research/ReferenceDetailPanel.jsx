import { confirmDelete } from '../../lib/confirmAction'

const ReferenceDetailPanel = ({
  title,
  subtitle,
  onClose,
  onDelete,
  deleteLabel = 'Delete',
  children,
}) => (
  <aside className="flex h-full w-full max-w-md shrink-0 flex-col border-l border-bronze-dark/40 bg-ink/80">
    <div className="flex items-start justify-between gap-3 border-b border-bronze-dark/30 px-4 py-3">
      <div className="min-w-0">
        <p className="font-ui text-[10px] uppercase tracking-widest text-bronze/70">Details</p>
        <h2 className="mt-0.5 break-words font-ui text-lg text-cream">{title}</h2>
        {subtitle && <p className="mt-0.5 break-words text-xs text-cream/45">{subtitle}</p>}
      </div>
      <button
        type="button"
        onClick={onClose}
        className="shrink-0 px-1 text-cream/40 hover:text-bronze"
        aria-label="Close details"
      >
        ×
      </button>
    </div>

    <div className="flex-1 overflow-y-auto p-4">{children}</div>

    {onDelete && (
      <div className="border-t border-bronze-dark/30 px-4 py-3">
        <button
          type="button"
          onClick={async () => {
            if (await confirmDelete(`"${title}"`)) {
              onDelete()
            }
          }}
          className="font-ui text-xs uppercase tracking-wide text-error/80 hover:text-error"
        >
          {deleteLabel}
        </button>
      </div>
    )}
  </aside>
)

export default ReferenceDetailPanel
