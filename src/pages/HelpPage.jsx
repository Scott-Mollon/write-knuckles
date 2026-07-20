import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import HelpToc from '../components/help/HelpToc'
import { HELP_TOPICS } from '../components/help/helpTopics'
import './HelpPage.scss'

const scrollToId = (id) => {
  if (!id || id === 'help-top') {
    window.scrollTo({ top: 0, behavior: 'smooth' })
    return
  }
  const el = document.getElementById(id)
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}

const HelpPage = () => {
  const { hash, pathname } = useLocation()
  const navigate = useNavigate()
  const [tocOpen, setTocOpen] = useState(true)

  useEffect(() => {
    const id = hash ? hash.replace(/^#/, '') : ''
    if (!id) {
      window.scrollTo(0, 0)
      return undefined
    }
    const timer = window.setTimeout(() => scrollToId(id), 80)
    return () => window.clearTimeout(timer)
  }, [hash, pathname])

  const handleTocNavigate = (event, id) => {
    event.preventDefault()
    setTocOpen(false)
    navigate({ pathname: '/help', hash: id }, { preventScrollReset: true })
    window.requestAnimationFrame(() => scrollToId(id))
  }

  return (
    <div id="help-top" className="help-page mx-auto max-w-5xl p-6 sm:p-8">
      <div className="mb-8">
        <h1 className="font-ui text-3xl uppercase tracking-wide text-bronze">Help</h1>
        <p className="mt-2 max-w-2xl text-cream/70">
          A guide to Write Knuckles — tales, the editor, Research, Compile, and your account.
        </p>
      </div>

      <div className="help-page__mobile-toc mb-8">
        <button
          type="button"
          className="flex w-full items-center justify-between border border-bronze bg-bronze/20 px-4 py-3 font-ui text-sm uppercase tracking-wide text-bronze hover:bg-bronze/30"
          aria-expanded={tocOpen}
          onClick={() => setTocOpen((open) => !open)}
        >
          <span>Contents</span>
          <span aria-hidden>{tocOpen ? '▴' : '▾'}</span>
        </button>
        {tocOpen && (
          <div className="border border-t-0 border-bronze-dark/50 bg-surface/30 p-4">
            <HelpToc onNavigate={handleTocNavigate} showHeading={false} />
          </div>
        )}
      </div>

      <div className="help-page__layout">
        <aside className="help-page__sidebar">
          <div className="help-page__sidebar-sticky">
            <HelpToc onNavigate={handleTocNavigate} />
          </div>
        </aside>

        <article className="help-page__article min-w-0 space-y-10">
          {HELP_TOPICS.map(({ id, Component }) => (
            <Component key={id} />
          ))}
        </article>
      </div>

      <p className="mt-10 border-t border-bronze-dark/40 pt-6 text-center">
        <Link
          to="/help"
          className="font-ui text-sm uppercase tracking-wide text-bronze hover:text-cream"
          onClick={(event) => {
            event.preventDefault()
            navigate('/help', { preventScrollReset: true })
            scrollToId('help-top')
          }}
        >
          Back to top
        </Link>
      </p>
    </div>
  )
}

export default HelpPage
