import { useSignedStorageUrl } from '../../hooks/useSignedStorageUrl'
import { getImageSourceFields } from '../../lib/images/resolveImageUrl'

const ReferenceImageDisplay = ({
  image,
  alt = 'Reference image',
  className = '',
  sizeClass = 'h-20 w-20',
  objectFit = 'cover',
}) => {
  const { sourceType, storagePath, externalUrl } = getImageSourceFields(image)
  const fitClass = objectFit === 'scale-down' ? 'object-scale-down' : 'object-cover'
  const boxClass = `${sizeClass} shrink-0 overflow-hidden rounded border border-bronze-dark/40 ${className}`
  const imgClass = `${boxClass} ${fitClass}`

  const { data: signedUrl, isLoading } = useSignedStorageUrl(
    sourceType === 'upload' ? storagePath : null
  )

  if (sourceType === 'url') {
    return (
      <img
        src={externalUrl}
        alt={image.alt_text || alt}
        referrerPolicy="no-referrer"
        className={imgClass}
      />
    )
  }

  if (isLoading || !signedUrl) {
    return (
      <div
        className={`flex items-center justify-center bg-surface/60 ${boxClass}`}
        aria-label={alt}
        role="img"
      >
        <span className="text-[10px] uppercase tracking-widest text-cream/30">…</span>
      </div>
    )
  }

  return (
    <img
      src={signedUrl}
      alt={image.alt_text || alt}
      className={imgClass}
    />
  )
}

export default ReferenceImageDisplay
