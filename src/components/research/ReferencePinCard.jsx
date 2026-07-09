import ReferenceImageDisplay from '../images/ReferenceImageDisplay'
import { toneForId } from './referenceStyles'

const ReferencePinCard = ({
  id,
  title,
  eyebrow,
  preview,
  tags = [],
  heroImage = null,
  imageCount = 0,
  selected = false,
  onSelect,
}) => {
  const tone = toneForId(id)
  const extraImages = imageCount > 1 ? imageCount - 1 : 0

  return (
    <button
      type="button"
      onClick={onSelect}
      className={`mb-3 w-full break-inside-avoid rounded border text-left transition ${
        selected
          ? 'border-bronze bg-bronze/10 shadow-[0_0_0_1px_rgba(147,137,56,0.35)]'
          : 'border-bronze-dark/40 bg-surface/40 hover:border-bronze/60 hover:bg-surface/70'
      }`}
    >
      <div className={`h-1.5 rounded-t ${tone.bar}`} />

      {heroImage ? (
        <div className="relative flex h-32 items-center justify-center border-b border-bronze-dark/30 bg-surface/50">
          <ReferenceImageDisplay
            image={heroImage}
            alt={title ? `Hero for ${title}` : 'Hero image'}
            sizeClass="max-h-32 w-full"
            objectFit="scale-down"
            className="rounded-none border-0"
          />
          {extraImages > 0 && (
            <span className="absolute bottom-2 right-2 rounded bg-ink/80 px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-cream/70">
              +{extraImages}
            </span>
          )}
        </div>
      ) : (
        <div className={`bg-gradient-to-b ${tone.wash} px-3 pt-3`} />
      )}

      <div className={`${heroImage ? 'bg-surface/50' : `bg-gradient-to-b ${tone.wash}`} px-3 pb-3 pt-3`}>
        {eyebrow && (
          <p className="mb-1 font-ui text-[10px] uppercase tracking-widest text-cream/45">{eyebrow}</p>
        )}
        <h3 className="break-words font-ui text-base font-medium text-cream">{title}</h3>
        {preview && (
          <p className="mt-2 line-clamp-5 break-words text-xs leading-relaxed text-cream/60">{preview}</p>
        )}
        {tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1">
            {tags.slice(0, 4).map((tag) => (
              <span
                key={tag}
                className="rounded bg-ink/50 px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-bronze/90"
              >
                {tag}
              </span>
            ))}
            {tags.length > 4 && (
              <span className="rounded bg-ink/50 px-1.5 py-0.5 text-[10px] text-cream/40">
                +{tags.length - 4}
              </span>
            )}
          </div>
        )}
      </div>
    </button>
  )
}

export default ReferencePinCard
