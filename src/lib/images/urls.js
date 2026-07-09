import { IMAGE_PROBE_TIMEOUT_MS, MAX_IMAGE_URL_LENGTH } from './constants'

export function validateImageUrl(rawUrl) {
  const trimmed = rawUrl?.trim()
  if (!trimmed) {
    return { valid: false, error: 'Enter an image URL.' }
  }
  if (trimmed.length > MAX_IMAGE_URL_LENGTH) {
    return { valid: false, error: 'URL is too long.' }
  }

  let parsed
  try {
    parsed = new URL(trimmed)
  } catch {
    return { valid: false, error: 'That does not look like a valid URL.' }
  }

  if (parsed.protocol !== 'https:') {
    return { valid: false, error: 'Image URLs must use https.' }
  }

  if (parsed.username || parsed.password) {
    return { valid: false, error: 'URLs with credentials are not allowed.' }
  }

  return { valid: true, url: parsed.href }
}

export function probeImageUrl(url) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const timer = setTimeout(() => {
      img.src = ''
      reject(new Error('Image took too long to load. Check the URL or try uploading instead.'))
    }, IMAGE_PROBE_TIMEOUT_MS)

    img.onload = () => {
      clearTimeout(timer)
      if (img.naturalWidth === 0) {
        reject(new Error('Could not load that image.'))
        return
      }
      resolve(url)
    }

    img.onerror = () => {
      clearTimeout(timer)
      reject(new Error('Could not load that image. The link may be broken or blocked.'))
    }

    img.referrerPolicy = 'no-referrer'
    img.src = url
  })
}
