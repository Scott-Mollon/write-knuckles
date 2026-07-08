import ReferencePinCard from './ReferencePinCard'
import ReferenceDetailPanel from './ReferenceDetailPanel'

const ReferencePinBoard = ({
  items,
  selectedId,
  onSelect,
  onClearSelection,
  onAdd,
  addLabel,
  countLabel,
  emptyMessage,
  isAdding = false,
  getCardProps,
  detailTitle,
  detailSubtitle,
  onDelete,
  deleteLabel,
  children,
}) => (
  <div className="flex h-full min-h-0 flex-1 overflow-hidden">
    <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
      <div className="flex shrink-0 items-center justify-between px-1 pb-4">
        <p className="text-sm text-cream/50">{countLabel}</p>
        <button
          type="button"
          onClick={onAdd}
          disabled={isAdding}
          className="font-ui text-xs uppercase text-bronze hover:text-cream disabled:opacity-50"
        >
          {addLabel}
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto pr-1">
        {items.length === 0 ? (
          <p className="py-12 text-center text-sm italic text-cream/30">{emptyMessage}</p>
        ) : (
          <div className="columns-1 gap-3 sm:columns-2 lg:columns-3 xl:columns-4">
            {items.map((item) => {
              const props = getCardProps(item)
              return (
                <ReferencePinCard
                  key={item.id}
                  id={item.id}
                  title={props.title}
                  eyebrow={props.eyebrow}
                  preview={props.preview}
                  tags={props.tags}
                  selected={selectedId === item.id}
                  onSelect={() => onSelect(item.id)}
                />
              )
            })}
          </div>
        )}
      </div>
    </div>

    {selectedId && (
      <ReferenceDetailPanel
        title={detailTitle}
        subtitle={detailSubtitle}
        onClose={onClearSelection}
        onDelete={onDelete}
        deleteLabel={deleteLabel}
      >
        {children}
      </ReferenceDetailPanel>
    )}
  </div>
)

export default ReferencePinBoard
