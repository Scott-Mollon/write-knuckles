const fieldClass =
  'w-full rounded border border-bronze-dark/50 bg-ink px-2 py-1.5 text-sm text-cream placeholder:text-cream/30 focus:border-bronze focus:outline-none'

const labelClass = 'mb-1 block text-xs uppercase tracking-wide text-cream/50'

const ACCENT_TONES = [
  { bar: 'bg-[#938938]', wash: 'from-[#938938]/25 via-surface/80 to-surface/40' },
  { bar: 'bg-[#c87533]', wash: 'from-[#c87533]/20 via-surface/80 to-surface/40' },
  { bar: 'bg-[#8b2635]', wash: 'from-[#8b2635]/25 via-surface/80 to-surface/40' },
  { bar: 'bg-[#4a6741]', wash: 'from-[#4a6741]/25 via-surface/80 to-surface/40' },
  { bar: 'bg-[#3d5a80]', wash: 'from-[#3d5a80]/25 via-surface/80 to-surface/40' },
  { bar: 'bg-[#6b4c7a]', wash: 'from-[#6b4c7a]/25 via-surface/80 to-surface/40' },
]

const toneForId = (id) => {
  if (!id) return ACCENT_TONES[0]
  let hash = 0
  for (let i = 0; i < id.length; i += 1) hash = (hash + id.charCodeAt(i) * (i + 1)) % ACCENT_TONES.length
  return ACCENT_TONES[hash]
}

export { fieldClass, labelClass, toneForId }
