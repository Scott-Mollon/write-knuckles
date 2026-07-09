import { useSignedStorageUrl } from '../../hooks/useSignedStorageUrl'
import { getImageSourceFields, hasImageSource } from '../../lib/images/resolveImageUrl'

const BookIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.25"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    className="text-bronze/50"
  >
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
  </svg>
)

const TaleCoverThumbnail = ({ tale, title, sizeClass = 'h-28 w-20' }) => {
  const { sourceType, storagePath, externalUrl } = getImageSourceFields(tale)
  const hasCover = hasImageSource({ sourceType, storagePath, externalUrl })
  const alt = title ? `Cover for ${title}` : 'Tale cover'
  const boxClass = `${sizeClass} shrink-0 overflow-hidden rounded border border-bronze-dark/40`

  const { data: signedUrl, isLoading } = useSignedStorageUrl(
    sourceType === 'upload' ? storagePath : null
  )

  if (!hasCover) {
    return (
      <div
        className={`flex items-center justify-center bg-gradient-to-b from-bronze/15 via-surface/60 to-surface/40 ${boxClass}`}
        aria-hidden
      >
        <BookIcon />
      </div>
    )
  }

  if (sourceType === 'url') {
    return (
      <img
        src={externalUrl}
        alt={alt}
        referrerPolicy="no-referrer"
        className={`${boxClass} object-cover`}
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

  return <img src={signedUrl} alt={alt} className={`${boxClass} object-cover`} />
}

export default TaleCoverThumbnail
