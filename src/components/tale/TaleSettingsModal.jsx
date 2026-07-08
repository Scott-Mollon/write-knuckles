import { useEffect, useState } from 'react'
import { useUpdateTale } from '../../hooks/useTales'
import BeatSheetPicker from '../beats/BeatSheetPicker'

const fieldClass =
  'w-full rounded border border-bronze-dark/50 bg-ink px-3 py-2 text-cream placeholder:text-cream/30 focus:border-bronze focus:outline-none'

const TaleSettingsModal = ({ tale, taleId, hasBeats, hasBeatLinks, onClose }) => {
  const updateTale = useUpdateTale(taleId)
  const [title, setTitle] = useState('')
  const [author, setAuthor] = useState('')
  const [subtitle, setSubtitle] = useState('')
  const [genre, setGenre] = useState('')
  const [targetWordCount, setTargetWordCount] = useState(80000)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!tale) return
    setTitle(tale.title || '')
    setAuthor(tale.author || '')
    setSubtitle(tale.subtitle || '')
    setGenre(tale.genre || '')
    setTargetWordCount(tale.target_word_count || 80000)
  }, [tale])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    if (!title.trim()) {
      setError('Give your tale a title.')
      return
    }

    const wordCount = Number(targetWordCount)
    if (!Number.isFinite(wordCount) || wordCount < 1000) {
      setError('Target word count must be at least 1,000.')
      return
    }

    try {
      await updateTale.mutateAsync({
        title,
        author,
        subtitle,
        genre,
        targetWordCount: wordCount,
      })
      onClose()
    } catch (err) {
      setError(err.message || 'Failed to save tale settings.')
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded border border-bronze-dark/50 bg-ink p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="tale-settings-title"
      >
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h2 id="tale-settings-title" className="font-ui text-xl uppercase tracking-wide text-bronze">
              Tale Settings
            </h2>
            <p className="mt-1 text-sm text-cream/60">Update your manuscript details.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-cream/50 hover:text-bronze"
            aria-label="Close settings"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="tale-settings-title-input" className="mb-2 block font-ui text-xs uppercase text-cream/80">
              Title
            </label>
            <input
              id="tale-settings-title-input"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={fieldClass}
            />
          </div>

          <div>
            <label htmlFor="tale-settings-author" className="mb-2 block font-ui text-xs uppercase text-cream/80">
              Author
            </label>
            <input
              id="tale-settings-author"
              type="text"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              placeholder="Optional"
              className={fieldClass}
            />
          </div>

          <div>
            <label htmlFor="tale-settings-subtitle" className="mb-2 block font-ui text-xs uppercase text-cream/80">
              Subtitle
            </label>
            <input
              id="tale-settings-subtitle"
              type="text"
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              placeholder="Optional"
              className={fieldClass}
            />
          </div>

          <div>
            <label htmlFor="tale-settings-genre" className="mb-2 block font-ui text-xs uppercase text-cream/80">
              Genre
            </label>
            <input
              id="tale-settings-genre"
              type="text"
              value={genre}
              onChange={(e) => setGenre(e.target.value)}
              className={fieldClass}
            />
          </div>

          <div>
            <label htmlFor="tale-settings-word-count" className="mb-2 block font-ui text-xs uppercase text-cream/80">
              Target Word Count
            </label>
            <input
              id="tale-settings-word-count"
              type="number"
              value={targetWordCount}
              onChange={(e) => setTargetWordCount(e.target.value)}
              className={fieldClass}
              min={1000}
              step={1000}
            />
          </div>

          {error && <p className="text-sm text-error">{error}</p>}

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={updateTale.isPending}
              className="border-2 border-bronze-dark px-6 py-2 font-ui text-sm uppercase text-bronze hover:border-bronze disabled:opacity-50"
            >
              {updateTale.isPending ? 'Saving…' : 'Save Settings'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 font-ui text-sm uppercase text-cream/50 hover:text-cream"
            >
              Cancel
            </button>
          </div>
        </form>

        <div className="mt-8 border-t border-bronze-dark/30 pt-6">
          <BeatSheetPicker
            taleId={taleId}
            currentTemplateId={tale?.beat_template_id}
            hasBeats={hasBeats}
            hasBeatLinks={hasBeatLinks}
            title="Beat Sheet"
            description="Swap to a different structure template."
            compact
          />
        </div>
      </div>
    </div>
  )
}

export default TaleSettingsModal
