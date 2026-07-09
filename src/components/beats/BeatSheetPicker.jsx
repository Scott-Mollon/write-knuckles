import { useState, useEffect } from 'react'
import { useBeatTemplates } from '../../hooks/useTales'
import { useApplyBeatTemplate } from '../../hooks/useApplyBeatTemplate'
import { confirmAction } from '../../lib/confirmAction'
import Loading from '../../pages/Loading'

const BeatSheetPicker = ({
  taleId,
  currentTemplateId,
  hasBeats = false,
  hasBeatLinks = false,
  title = 'Add a Beat Sheet',
  description = 'Pick a story structure template for this tale.',
  compact = false,
  onApplied,
}) => {
  const { data: templates, isLoading } = useBeatTemplates()
  const apply = useApplyBeatTemplate(taleId)
  const [templateId, setTemplateId] = useState('')
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!templateId && templates?.length) {
      const preferred = currentTemplateId && templates.some((t) => t.id === currentTemplateId)
        ? currentTemplateId
        : templates.find((t) => t.slug === 'save-the-cat')?.id || templates[0].id
      setTemplateId(preferred)
    }
  }, [templates, templateId, currentTemplateId])

  if (isLoading) return <Loading />

  const selected = templates?.find((t) => t.id === templateId)

  const handleApply = async () => {
    setError(null)
    if (!selected) {
      setError('No beat templates found.')
      return
    }

    const needsConfirm = hasBeats || hasBeatLinks
    if (needsConfirm) {
      const message = hasBeatLinks
        ? `Replace the beat sheet with "${selected.name}"? Scene-to-beat links will be removed.`
        : `Replace the beat sheet with "${selected.name}"?`
      if (!(await confirmAction(message))) return
    }

    try {
      await apply.mutateAsync({
        beatTemplateId: selected.id,
        beatStructure: selected.structure,
      })
      onApplied?.()
    } catch (err) {
      setError(err.message || 'Failed to apply beat sheet.')
    }
  }

  const wrapperClass = compact
    ? 'max-w-md'
    : 'mx-auto max-w-md rounded border border-bronze-dark/50 bg-surface/50 p-6'

  return (
    <div className={wrapperClass}>
      <h2 className={`font-ui uppercase text-bronze ${compact ? 'text-sm' : 'text-lg'}`}>{title}</h2>
      <p className={`mt-2 text-cream/60 ${compact ? 'text-xs' : 'text-sm'}`}>{description}</p>

      <div className="mt-4">
        <label htmlFor="beat-sheet-picker" className="mb-2 block font-ui text-xs uppercase text-cream/80">
          Beat Sheet
        </label>
        <select
          id="beat-sheet-picker"
          value={templateId}
          onChange={(e) => setTemplateId(e.target.value)}
          className="w-full rounded border border-bronze-dark/50 bg-ink px-3 py-2 text-sm text-cream focus:border-bronze focus:outline-none"
        >
          {templates?.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>
        {selected?.description && (
          <p className="mt-2 text-xs text-cream/50">{selected.description}</p>
        )}
      </div>

      {error && <p className="mt-3 text-sm text-error">{error}</p>}

      <button
        type="button"
        onClick={handleApply}
        disabled={apply.isPending || !selected}
        className="mt-4 border-2 border-bronze-dark px-6 py-2 font-ui text-sm uppercase text-bronze hover:border-bronze disabled:opacity-50"
      >
        {apply.isPending ? 'Applying…' : hasBeats ? 'Apply Beat Sheet' : 'Add Beat Sheet'}
      </button>
    </div>
  )
}

export default BeatSheetPicker
