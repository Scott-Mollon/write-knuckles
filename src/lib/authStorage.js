const COOKIE_DOMAIN = import.meta.env.VITE_COOKIE_DOMAIN || ''
const MAX_AGE = 60 * 60 * 24 * 400 // ~400 days

function isLocalhost() {
  return window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
}

function readCookie(name) {
  const match = document.cookie.match(new RegExp(`(?:^|; )${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}=([^;]*)`))
  return match ? decodeURIComponent(match[1]) : null
}

function writeCookie(name, value, maxAge = MAX_AGE) {
  const parts = [
    `${name}=${encodeURIComponent(value)}`,
    'path=/',
    'SameSite=Lax',
  ]
  if (!isLocalhost() && COOKIE_DOMAIN) {
    parts.push(`domain=${COOKIE_DOMAIN}`)
    parts.push('Secure')
  }
  if (maxAge > 0) {
    parts.push(`max-age=${maxAge}`)
  }
  document.cookie = parts.join('; ')
}

function removeCookie(name) {
  writeCookie(name, '', 0)
}

/**
 * Supabase auth storage that shares sessions across subdomains in production.
 * Uses localStorage on localhost; cookies with VITE_COOKIE_DOMAIN elsewhere.
 */
export const crossSubdomainAuthStorage = {
  getItem(key) {
    if (isLocalhost() || !COOKIE_DOMAIN) {
      return localStorage.getItem(key)
    }
    return readCookie(key)
  },
  setItem(key, value) {
    if (isLocalhost() || !COOKIE_DOMAIN) {
      localStorage.setItem(key, value)
      return
    }
    writeCookie(key, value)
  },
  removeItem(key) {
    if (isLocalhost() || !COOKIE_DOMAIN) {
      localStorage.removeItem(key)
      return
    }
    removeCookie(key)
  },
}
