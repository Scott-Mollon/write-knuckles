import { useState } from 'react'
import { Link } from 'react-router-dom'

const NAV_LINKS = [
  { href: '/#features', label: 'Features' },
  { href: '/#beat-sheets', label: 'Beat Sheets' },
  { href: '/#research', label: 'Research' },
  { href: '/#how-it-works', label: 'How it works' },
  { to: '/about', label: 'About' },
]

const MarketingHeader = () => {
  const [open, setOpen] = useState(false)

  const close = () => setOpen(false)

  return (
    <header className="marketing-header sticky top-0 z-50 border-b border-bronze-dark/60 bg-ink/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-3 sm:px-8">
        <a
          href="/"
          className="font-ui text-xl font-semibold uppercase tracking-wide text-bronze hover:text-cream"
          onClick={close}
        >
          Write Knuckles
        </a>

        <nav className="hidden items-center gap-6 font-ui text-sm uppercase tracking-wide text-cream/75 lg:flex">
          {NAV_LINKS.map((link) =>
            link.to ? (
              <Link key={link.to} to={link.to} className="hover:text-bronze">
                {link.label}
              </Link>
            ) : (
              <a key={link.href} href={link.href} className="hover:text-bronze">
                {link.label}
              </a>
            ),
          )}
        </nav>

        <div className="hidden items-center gap-3 sm:flex">
          <Link
            to="/signin"
            className="font-ui text-sm uppercase tracking-wide text-cream/80 hover:text-bronze"
          >
            Sign In
          </Link>
          <Link
            to="/signin"
            className="border border-bronze bg-bronze px-3 py-1.5 font-ui text-sm uppercase tracking-wide text-ink hover:bg-bronze-dark hover:border-bronze-dark hover:text-cream"
          >
            Sign Up
          </Link>
        </div>

        <button
          type="button"
          className="flex h-9 w-9 items-center justify-center border border-bronze-dark text-cream hover:border-bronze lg:hidden"
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <span className="font-ui text-lg leading-none">{open ? '×' : '☰'}</span>
        </button>
      </div>

      {open && (
        <div className="border-t border-bronze-dark/60 bg-ink px-5 py-4 lg:hidden">
          <nav className="flex flex-col gap-3 font-ui text-sm uppercase tracking-wide text-cream/80">
            {NAV_LINKS.map((link) =>
              link.to ? (
                <Link key={link.to} to={link.to} className="hover:text-bronze" onClick={close}>
                  {link.label}
                </Link>
              ) : (
                <a key={link.href} href={link.href} className="hover:text-bronze" onClick={close}>
                  {link.label}
                </a>
              ),
            )}
            <div className="mt-2 flex flex-col gap-2 border-t border-bronze-dark/50 pt-3 sm:hidden">
              <Link to="/signin" className="hover:text-bronze" onClick={close}>
                Sign In
              </Link>
              <Link
                to="/signin"
                className="border border-bronze bg-bronze px-3 py-2 text-center text-ink hover:bg-bronze-dark hover:text-cream"
                onClick={close}
              >
                Sign Up
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}

export default MarketingHeader
