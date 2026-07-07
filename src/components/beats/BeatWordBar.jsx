const BeatWordBar = ({ wordProgress }) => {
  const { targetWords, linkedWords, percent, barPercent } = wordProgress

  if (targetWords === 0) return null

  return (
    <div className="mt-3">
      <div className="mb-1 flex justify-between text-xs text-cream/50">
        <span>
          {linkedWords.toLocaleString()} / {targetWords.toLocaleString()} words
        </span>
        <span>{percent}%</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-ink">
        <div
          className="h-full bg-bronze transition-all"
          style={{ width: `${barPercent}%` }}
        />
      </div>
    </div>
  )
}

export default BeatWordBar
