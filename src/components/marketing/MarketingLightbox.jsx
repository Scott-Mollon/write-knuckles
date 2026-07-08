import { useEffect } from 'react'

const MarketingLightbox = ({ src, alt, title, onClose }) => {
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === 'Escape') onClose()
    }

    document.addEventListener('keydown', onKeyDown)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = prevOverflow
    }
  }, [onClose])

  return (
    <div
      className="marketing-lightbox"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="marketing-lightbox__panel"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={title || alt}
      >
        <button
          type="button"
          className="marketing-lightbox__close"
          onClick={onClose}
          aria-label="Close image"
        >
          ×
        </button>
        {title && <p className="marketing-lightbox__title">{title}</p>}
        <img src={src} alt={alt} className="marketing-lightbox__image" />
      </div>
    </div>
  )
}

export default MarketingLightbox
