import { useCallback } from 'react'

const MIN_WIDTH_PCT = 5
const MAX_WIDTH_PCT = 100

export function useSceneImageResize({ enabled, targetRef, updateAttributes }) {
  return useCallback(
    (event) => {
      if (!enabled || !targetRef.current) return

      event.preventDefault()
      event.stopPropagation()

      const target = targetRef.current
      const prose = target.closest('.ProseMirror') || target.closest('.scene-editor-prose')
      const editorWidth = prose?.clientWidth || 1
      const startX = event.clientX
      const startWidthPx = target.getBoundingClientRect().width
      let nextWidthPct = null

      const applyWidth = (pct) => {
        target.style.width = `${pct}%`
        target.style.maxWidth = `${pct}%`
      }

      const onMove = (moveEvent) => {
        const deltaX = moveEvent.clientX - startX
        const minPx = Math.max(24, editorWidth * (MIN_WIDTH_PCT / 100))
        const maxPx = editorWidth * (MAX_WIDTH_PCT / 100)
        const newWidthPx = Math.max(minPx, Math.min(maxPx, startWidthPx + deltaX))
        nextWidthPct = Math.round((newWidthPx / editorWidth) * 100)
        applyWidth(nextWidthPct)
      }

      const onUp = () => {
        document.removeEventListener('mousemove', onMove)
        document.removeEventListener('mouseup', onUp)
        document.body.style.userSelect = ''
        document.body.style.cursor = ''

        if (nextWidthPct != null) {
          updateAttributes({ width: nextWidthPct })
        }
      }

      document.body.style.userSelect = 'none'
      document.body.style.cursor = 'nwse-resize'
      document.addEventListener('mousemove', onMove)
      document.addEventListener('mouseup', onUp)
    },
    [enabled, targetRef, updateAttributes]
  )
}
