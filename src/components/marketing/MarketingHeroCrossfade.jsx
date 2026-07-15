import { useEffect, useMemo, useState } from 'react'

const HOLD_MS = 4000
const FADE_MS = 900

const SLIDES = [
  {
    src: '/marketing/hero-cockpit.png',
    alt: 'Write Knuckles prose writing cockpit with Rack, editor, and Inspector',
    caption: 'hero-cockpit.png — Prose writing cockpit (dark theme)',
  },
  {
    src: '/marketing/hero-cockpit-comic.png',
    alt: 'Write Knuckles comic script cockpit with Issues, Pages, and script editor',
    caption: 'hero-cockpit-comic.png — Comic script cockpit (dark theme)',
  },
]

/**
 * Full-bleed hero that slowly crossfades between prose and comic cockpits
 * when both screenshots are present. Falls back to a single shot or placeholder.
 */
const MarketingHeroCrossfade = () => {
  const [ready, setReady] = useState(() => SLIDES.map(() => false))
  const [failed, setFailed] = useState(() => SLIDES.map(() => false))
  const [active, setActive] = useState(0)
  const [reduceMotion, setReduceMotion] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const sync = () => setReduceMotion(mq.matches)
    sync()
    mq.addEventListener('change', sync)
    return () => mq.removeEventListener('change', sync)
  }, [])

  const availableIndexes = useMemo(
    () => SLIDES.map((_, i) => i).filter((i) => ready[i] && !failed[i]),
    [ready, failed],
  )

  const canCrossfade = availableIndexes.length > 1 && !reduceMotion
  const availableKey = availableIndexes.join(',')

  useEffect(() => {
    if (!availableIndexes.length) return
    if (!availableIndexes.includes(active)) {
      setActive(availableIndexes[0])
    }
  }, [availableKey, active, availableIndexes])

  useEffect(() => {
    if (!canCrossfade) return undefined

    const indexes = availableKey.split(',').map(Number)
    const id = window.setInterval(() => {
      setActive((prev) => {
        const idx = indexes.indexOf(prev)
        return indexes[(idx + 1) % indexes.length]
      })
    }, HOLD_MS + FADE_MS)

    return () => window.clearInterval(id)
  }, [canCrossfade, availableKey])

  const allFailed = failed.every(Boolean)
  if (allFailed) {
    const first = SLIDES[0]
    return (
      <div
        className="marketing-shot-placeholder marketing-shot-placeholder--hero"
        role="img"
        aria-label={first.alt}
      >
        <span className="marketing-shot-placeholder__label">{first.caption}</span>
        <span className="marketing-shot-placeholder__hint">
          Save as {first.src.replace(/^\//, '')}
        </span>
      </div>
    )
  }

  const visibleIndex = canCrossfade
    ? active
    : (availableIndexes[0] ?? SLIDES.findIndex((_, i) => !failed[i]))

  return (
    <div
      className="landing-hero__crossfade"
      role="img"
      aria-label="Write Knuckles writing cockpit — prose novel and comic script modes"
      style={{ '--hero-fade-ms': `${FADE_MS}ms` }}
    >
      {SLIDES.map((slide, index) => {
        if (failed[index]) return null
        const isActive = index === visibleIndex
        return (
          <img
            key={slide.src}
            src={slide.src}
            alt=""
            aria-hidden="true"
            className={`marketing-shot marketing-shot--hero landing-hero__crossfade-slide${
              isActive ? ' is-active' : ''
            }`}
            onLoad={() =>
              setReady((prev) => {
                if (prev[index]) return prev
                const next = [...prev]
                next[index] = true
                return next
              })
            }
            onError={() =>
              setFailed((prev) => {
                if (prev[index]) return prev
                const next = [...prev]
                next[index] = true
                return next
              })
            }
          />
        )
      })}
    </div>
  )
}

export default MarketingHeroCrossfade
