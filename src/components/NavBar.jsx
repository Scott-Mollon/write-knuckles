import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { KOFI_SUPPORT } from '../constants/links'
import { useAuth } from '../contexts/AuthContext'
import { getUserDisplayName } from '../lib/userProfile'
import ProfileDialog from './ProfileDialog'

const MAGAZINE_CONTACT = 'https://bronzeknucklesmagazine.com/contact'

const NavBar = () => {
  const { isSignedIn, signout, user, admin } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const menuRef = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    if (!menuOpen) return undefined

    const handlePointerDown = (event) => {
      if (!menuRef.current?.contains(event.target)) {
        setMenuOpen(false)
      }
    }

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setMenuOpen(false)
      }
    }

    document.addEventListener('pointerdown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [menuOpen])

  const handleSignOut = async () => {
    setMenuOpen(false)
    await signout()
    navigate('/')
  }

  const openProfile = () => {
    setMenuOpen(false)
    setProfileOpen(true)
  }

  return (
    <nav className="flex items-center justify-between border-b border-bronze-dark px-6 py-3 font-ui uppercase tracking-wide">
      <Link to="/" className="text-bronze text-xl font-semibold hover:text-cream">
        Write Knuckles
      </Link>
      <div className="flex items-center gap-4 text-sm text-cream/80">
        {isSignedIn() ? (
          <>
            {admin && (
              <Link to="/admin/access" className="hover:text-bronze">
                Admin
              </Link>
            )}
            <div className="relative" ref={menuRef}>
              <button
                type="button"
                className="inline-flex max-w-[14rem] items-center gap-1 truncate normal-case hover:text-bronze"
                aria-expanded={menuOpen}
                aria-haspopup="menu"
                onClick={() => setMenuOpen((open) => !open)}
              >
                <span className="truncate">{getUserDisplayName(user)}</span>
                <span aria-hidden className="shrink-0 text-xs">
                  ▾
                </span>
              </button>
              {menuOpen && (
                <div
                  role="menu"
                  className="absolute right-0 top-full z-50 mt-1 min-w-[10rem] border border-bronze-dark bg-ink py-1 shadow-lg"
                >
                  <button
                    type="button"
                    role="menuitem"
                    className="block w-full px-3 py-2 text-left normal-case hover:bg-surface/40 hover:text-bronze"
                    onClick={openProfile}
                  >
                    Profile
                  </button>
                  <button
                    type="button"
                    role="menuitem"
                    className="block w-full px-3 py-2 text-left normal-case hover:bg-surface/40 hover:text-bronze"
                    onClick={() => {
                      setMenuOpen(false)
                      navigate('/feature-requests')
                    }}
                  >
                    Feature Requests
                  </button>
                  <button
                    type="button"
                    role="menuitem"
                    className="block w-full px-3 py-2 text-left normal-case hover:bg-surface/40 hover:text-bronze"
                    onClick={() => {
                      setMenuOpen(false)
                      window.open(KOFI_SUPPORT, '_blank', 'noopener,noreferrer')
                    }}
                  >
                    Support
                  </button>
                  <button
                    type="button"
                    role="menuitem"
                    className="block w-full px-3 py-2 text-left normal-case hover:bg-surface/40 hover:text-bronze"
                    onClick={() => {
                      setMenuOpen(false)
                      window.open(MAGAZINE_CONTACT, '_blank', 'noopener,noreferrer')
                    }}
                  >
                    Report an Issue
                  </button>
                  <Link
                    to="/privacy"
                    role="menuitem"
                    className="block border-t border-bronze-dark/50 px-3 py-2 normal-case hover:bg-surface/40 hover:text-bronze"
                    onClick={() => setMenuOpen(false)}
                  >
                    Privacy
                  </Link>
                  <Link
                    to="/terms"
                    role="menuitem"
                    className="block px-3 py-2 normal-case hover:bg-surface/40 hover:text-bronze"
                    onClick={() => setMenuOpen(false)}
                  >
                    Terms
                  </Link>
                  <button
                    type="button"
                    role="menuitem"
                    className="block w-full border-t border-bronze-dark/50 px-3 py-2 text-left normal-case hover:bg-surface/40 hover:text-bronze"
                    onClick={handleSignOut}
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>
            {profileOpen && <ProfileDialog onClose={() => setProfileOpen(false)} />}
          </>
        ) : (
          <Link to="/signin" className="hover:text-bronze">
            Sign In
          </Link>
        )}
      </div>
    </nav>
  )
}

export default NavBar
