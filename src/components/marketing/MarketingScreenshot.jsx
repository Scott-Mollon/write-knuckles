import { useState } from 'react'

/**
 * Product screenshot with dashed placeholder until the PNG is dropped in public/marketing/.
 */
const MarketingScreenshot = ({ src, alt, caption, className = '', variant = 'feature' }) => {
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

  return (
    <img
      src={src}
      alt={alt}
      className={`marketing-shot marketing-shot--${variant} ${className}`}
      onError={() => setFailed(true)}
    />
  )
}

export default MarketingScreenshot
