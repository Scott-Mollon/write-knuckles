const TagFilterBar = ({ availableTags, selectedTags, onChange }) => {
  if (availableTags.length === 0) return null

  const toggle = (tag) => {
    if (selectedTags.includes(tag)) {
      onChange(selectedTags.filter((t) => t !== tag))
    } else {
      onChange([...selectedTags, tag])
    }
  }

  return (
    <div className="mb-4 flex flex-wrap items-center gap-1.5 px-1">
      <span className="mr-1 font-ui text-[10px] uppercase tracking-widest text-cream/40">
        Tags
      </span>
      {availableTags.map((tag) => {
        const active = selectedTags.includes(tag)
        return (
          <button
            key={tag}
            type="button"
            onClick={() => toggle(tag)}
            className={`rounded px-2 py-0.5 text-[10px] uppercase tracking-wide transition ${
              active
                ? 'bg-bronze/30 text-bronze'
                : 'bg-ink/50 text-cream/45 hover:bg-ink hover:text-cream/70'
            }`}
          >
            {tag}
          </button>
        )
      })}
      {selectedTags.length > 0 && (
        <button
          type="button"
          onClick={() => onChange([])}
          className="ml-1 font-ui text-[10px] uppercase tracking-wide text-cream/35 hover:text-bronze"
        >
          Clear
        </button>
      )}
    </div>
  )
}

export default TagFilterBar
