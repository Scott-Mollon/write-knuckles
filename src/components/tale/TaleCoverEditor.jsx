import { useState } from 'react'
import { useUpdateTaleCover } from '../../hooks/useTales'
import { confirmAction } from '../../lib/confirmAction'
import { taleHasCover } from '../../lib/images/resolveImageUrl'
import ImageUpload from '../images/ImageUpload'
import TaleCoverThumbnail from './TaleCoverThumbnail'

const TaleCoverEditor = ({ tale, taleId }) => {
  const updateCover = useUpdateTaleCover(taleId)
  const [error, setError] = useState(null)

  const hasCover = taleHasCover(tale)
  const busy = updateCover.isPending

  const handleAdded = async (result) => {
    setError(null)
    try {
      await updateCover.mutateAsync({
        action: 'set',
        sourceType: result.sourceType,
        storagePath: result.storagePath,
        externalUrl: result.externalUrl,
        previousTale: tale,
      })
    } catch (err) {
      setError(err.message || 'Could not save cover image.')
    }
  }

  const handleRemove = async () => {
    if (!hasCover) return
    if (!(await confirmAction('Remove this cover image?'))) return

    setError(null)
    try {
      await updateCover.mutateAsync({
        action: 'clear',
        previousTale: tale,
      })
    } catch (err) {
      setError(err.message || 'Could not remove cover image.')
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <p className="mb-2 font-ui text-xs uppercase text-cream/80">Cover image</p>
        <p className="mb-3 text-xs text-cream/45">
          Shown on your dashboard tale card. Upload JPEG, PNG, WebP, or GIF (max 10 MB).
        </p>
        <div className="flex flex-wrap items-start gap-4">
          <TaleCoverThumbnail tale={tale} title={tale?.title} sizeClass="h-36 w-24" />
          <div className="min-w-[12rem] flex-1">
            {hasCover && (
              <button
                type="button"
                onClick={handleRemove}
                disabled={busy}
                className="mb-3 font-ui text-xs uppercase tracking-wide text-cream/50 hover:text-punch disabled:opacity-40"
              >
                Remove cover
              </button>
            )}
          </div>
        </div>
      </div>

      <ImageUpload
        taleId={taleId}
        scope="tales"
        entityId={taleId}
        allowUrl={false}
        multiple={false}
        onAdded={handleAdded}
        onError={setError}
      />

      {busy && (
        <p className="text-sm text-bronze/80" role="status">
          Saving cover…
        </p>
      )}

      {error && (
        <p className="text-sm text-error" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}

export default TaleCoverEditor
