import { useState } from 'react'
import {
  useAddReferenceImage,
  useDeleteReferenceImage,
  useReferenceImages,
  useReorderReferenceImage,
  useSetReferenceHero,
} from '../../hooks/useReferenceImages'
import { ENTITY_TYPE_TO_SCOPE } from '../../lib/images/constants'
import ImageUpload from './ImageUpload'
import ReferenceImageDisplay from './ReferenceImageDisplay'

const LinkIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
  </svg>
)

const StarIcon = ({ filled }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill={filled ? 'currentColor' : 'none'}
    stroke="currentColor"
    strokeWidth="1.5"
    aria-hidden="true"
  >
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 22 12 18.56 5.82 22 7 14.14l-5-4.87 6.91-1.01L12 2z" />
  </svg>
)

const ReferenceImageGallery = ({ taleId, entityType, entityId, label = 'Images' }) => {
  const scope = ENTITY_TYPE_TO_SCOPE[entityType]
  const { data: images = [], isLoading } = useReferenceImages(taleId, entityType, entityId)
  const addImage = useAddReferenceImage(taleId)
  const deleteImage = useDeleteReferenceImage(taleId)
  const setHero = useSetReferenceHero(taleId)
  const reorder = useReorderReferenceImage(taleId)
  const [error, setError] = useState(null)

  const busy =
    addImage.isPending ||
    deleteImage.isPending ||
    setHero.isPending ||
    reorder.isPending

  const handleAdded = async (result) => {
    setError(null)
    try {
      await addImage.mutateAsync({
        entityType,
        entityId,
        sourceType: result.sourceType,
        storagePath: result.storagePath,
        externalUrl: result.externalUrl,
      })
    } catch (err) {
      setError(err.message || 'Could not add image.')
    }
  }

  const handleDelete = async (image) => {
    if (!window.confirm('Delete this image?')) return
    setError(null)
    try {
      await deleteImage.mutateAsync({ image })
    } catch (err) {
      setError(err.message || 'Could not delete image.')
    }
  }

  const handleSetHero = async (image) => {
    if (image.is_hero) return
    setError(null)
    try {
      await setHero.mutateAsync({ image })
    } catch (err) {
      setError(err.message || 'Could not set hero image.')
    }
  }

  const handleReorder = async (image, direction) => {
    setError(null)
    try {
      await reorder.mutateAsync({ image, direction, images })
    } catch (err) {
      setError(err.message || 'Could not reorder images.')
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <p className="mb-1 font-ui text-xs uppercase text-cream/80">{label}</p>
        <p className="text-xs text-cream/45">
          Add reference images. Star one as the card hero. External links may break if the host removes the file.
        </p>
      </div>

      {isLoading ? (
        <p className="text-sm text-cream/40">Loading images…</p>
      ) : images.length > 0 ? (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {images.map((image, index) => (
            <li
              key={image.id}
              className="relative rounded border border-bronze-dark/40 bg-surface/30 p-2"
            >
              <ReferenceImageDisplay
                image={image}
                alt="Reference"
                sizeClass="h-24 w-full"
                className="mb-2"
              />

              <div className="flex items-center justify-between gap-1">
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    title={image.is_hero ? 'Hero image' : 'Set as hero'}
                    onClick={() => handleSetHero(image)}
                    disabled={busy}
                    className={`rounded p-1 ${
                      image.is_hero ? 'text-bronze' : 'text-cream/35 hover:text-bronze'
                    }`}
                  >
                    <StarIcon filled={image.is_hero} />
                  </button>
                  {image.source_type === 'url' && (
                    <span className="text-cream/35" title="Linked image">
                      <LinkIcon />
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    title="Move up"
                    disabled={busy || index === 0}
                    onClick={() => handleReorder(image, 'up')}
                    className="px-1 text-xs text-cream/35 hover:text-cream disabled:opacity-30"
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    title="Move down"
                    disabled={busy || index === images.length - 1}
                    onClick={() => handleReorder(image, 'down')}
                    className="px-1 text-xs text-cream/35 hover:text-cream disabled:opacity-30"
                  >
                    ↓
                  </button>
                  <button
                    type="button"
                    title="Delete"
                    disabled={busy}
                    onClick={() => handleDelete(image)}
                    className="px-1 text-xs text-cream/35 hover:text-punch"
                  >
                    ×
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm italic text-cream/30">No images yet.</p>
      )}

      <ImageUpload
        taleId={taleId}
        scope={scope}
        entityId={entityId}
        allowUrl
        multiple
        onAdded={handleAdded}
        onError={setError}
      />

      {busy && (
        <p className="text-sm text-bronze/80" role="status">
          Saving…
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

export default ReferenceImageGallery
