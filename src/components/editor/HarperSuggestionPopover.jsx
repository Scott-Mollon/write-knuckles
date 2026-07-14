import { useEffect, useLayoutEffect, useRef, useState } from 'react'

const VIEWPORT_PAD = 8
const ANCHOR_GAP = 6

const HarperSuggestionPopover = ({
  activeLint,
  actionError,
  onClose,
  onApplySuggestion,
  onIgnore,
  onAddToDictionary,
}) => {
  const panelRef = useRef(null)
  const [position, setPosition] = useState(null)

  useEffect(() => {
    if (!activeLint) return undefined

    const onPointerDown = (event) => {
      const target = event.target
      if (!(target instanceof Node)) return
      if (panelRef.current?.contains(target)) return
      if (target instanceof Element && target.closest('.harper-lint')) return
      onClose?.()
    }

    const onKeyDown = (event) => {
      if (event.key === 'Escape') onClose?.()
    }

    document.addEventListener('pointerdown', onPointerDown, true)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown, true)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [activeLint, onClose])

  useLayoutEffect(() => {
    if (!activeLint?.coords || !panelRef.current) {
      setPosition(null)
      return undefined
    }

    const place = () => {
      const el = panelRef.current
      const coords = activeLint.coords
      if (!el || !coords) return

      const width = el.offsetWidth
      const height = el.offsetHeight
      const maxLeft = Math.max(VIEWPORT_PAD, window.innerWidth - width - VIEWPORT_PAD)
      const left = Math.min(Math.max(VIEWPORT_PAD, coords.left), maxLeft)

      const spaceBelow = window.innerHeight - coords.bottom - ANCHOR_GAP - VIEWPORT_PAD
      const spaceAbove = coords.top - ANCHOR_GAP - VIEWPORT_PAD
      const preferBelow = spaceBelow >= Math.min(height, 120) || spaceBelow >= spaceAbove

      let top
      let maxHeight
      if (preferBelow) {
        top = coords.bottom + ANCHOR_GAP
        maxHeight = Math.max(80, window.innerHeight - top - VIEWPORT_PAD)
      } else {
        maxHeight = Math.max(80, spaceAbove)
        top = Math.max(VIEWPORT_PAD, coords.top - ANCHOR_GAP - Math.min(height, maxHeight))
        maxHeight = Math.max(80, window.innerHeight - top - VIEWPORT_PAD)
      }

      // Keep the box fully inside the viewport when it fits.
      if (height <= maxHeight && top + height > window.innerHeight - VIEWPORT_PAD) {
        top = Math.max(VIEWPORT_PAD, window.innerHeight - height - VIEWPORT_PAD)
      }

      setPosition({ left, top, maxHeight })
    }

    place()
    window.addEventListener('resize', place)
    return () => window.removeEventListener('resize', place)
  }, [activeLint, actionError])

  if (!activeLint?.item || !activeLint.coords) return null

  const { item } = activeLint
  const style = {
    position: 'fixed',
    left: position?.left ?? activeLint.coords.left,
    top: position?.top ?? activeLint.coords.bottom + ANCHOR_GAP,
    maxHeight: position?.maxHeight,
    visibility: position ? 'visible' : 'hidden',
    zIndex: 40,
  }

  return (
    <div
      ref={panelRef}
      className="harper-suggestion-popover"
      style={style}
      role="dialog"
      aria-modal="true"
      aria-label="Proofreading suggestion"
    >
      <div className="harper-suggestion-popover__header">
        <span className="harper-suggestion-popover__kind">
          {item.isSpelling ? 'Spelling' : item.lintKind || 'Issue'}
        </span>
        <button
          type="button"
          className="harper-suggestion-popover__close"
          onClick={onClose}
          aria-label="Close"
          title="Close"
        >
          ×
        </button>
      </div>

      <p className="harper-suggestion-popover__message">{item.message}</p>

      {item.problemText ? (
        <p className="harper-suggestion-popover__problem">“{item.problemText}”</p>
      ) : null}

      {item.suggestions?.length > 0 ? (
        <div className="harper-suggestion-popover__suggestions">
          {item.suggestions.map((suggestion, index) => {
            const label =
              suggestion.replacementText ||
              (suggestion.kind === 1 ? 'Remove' : 'Apply')
            return (
              <button
                key={`${item.id}-sug-${index}`}
                type="button"
                className={`harper-suggestion-popover__suggestion${index === 0 ? ' is-primary' : ''}`}
                onClick={() => onApplySuggestion(suggestion)}
              >
                {label}
              </button>
            )
          })}
        </div>
      ) : null}

      <div className="harper-suggestion-popover__actions">
        <button type="button" onClick={onIgnore}>
          Ignore
        </button>
        {item.isSpelling ? (
          <button type="button" onClick={onAddToDictionary}>
            Add to dictionary
          </button>
        ) : null}
      </div>

      {actionError ? (
        <p className="harper-suggestion-popover__error" role="alert">
          {actionError}
        </p>
      ) : null}
    </div>
  )
}

export default HarperSuggestionPopover
