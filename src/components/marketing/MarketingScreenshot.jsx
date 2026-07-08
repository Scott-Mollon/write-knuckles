import { useState } from 'react'

/**
 * Product screenshot with dashed placeholder until the PNG is dropped in public/marketing/.
 */
const MarketingScreenshot = ({
  src,
  alt,
  caption,
  className = '',
  variant = 'feature',
  expandable = false,
  onExpand,
}) => {
  const [failed, setFailed] = useState(false)

  if (failed) {
    return (
      <div
        className={`marketing-shot-placeholder marketing-shot-placeholder--${variant} ${className}`}
        role="img"
        aria-label={alt}
      >
        <span className="marketing-shot-placeholder__label">{caption || alt}</span>
        <span className="marketing-shot-placeholder__hint">Save as {src.replace(/^\//, '')}</span>
      </div>
    )
  }

  const image = (
    <img
      src={src}
      alt={alt}
      className={`marketing-shot marketing-shot--${variant} ${className}`}
      onError={() => setFailed(true)}
    />
  )

  if (!expandable || !onExpand) {
    return image
  }

  return (
    <button
      type="button"
      className="marketing-shot-trigger"
      onClick={onExpand}
      aria-label={`View larger: ${alt}`}
    >
      {image}
      <span className="marketing-shot-trigger__hint" aria-hidden="true">
        Click to enlarge
      </span>
    </button>
  )
}

export default MarketingScreenshot
