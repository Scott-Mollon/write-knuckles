import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import MarketingHeader from '../components/marketing/MarketingHeader'
import MarketingFooter from '../components/marketing/MarketingFooter'
import './AboutPage.scss'

const MAGAZINE = 'https://bronzeknucklesmagazine.com'
const SUBSTACK = 'https://bronzeknuckles.substack.com/'

const AboutPage = () => {
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  return (
    <div className="about-page bg-ink text-cream">
      <MarketingHeader />

      <main className="about-page__main">
        <header className="about-page__hero">
          <p className="about-page__eyebrow">About Write Knuckles</p>
          <h1 className="about-page__title">Knuckle down.</h1>
          <h1 className="about-page__title">Write your story.</h1>
          <p className="about-page__lede">
            Write Knuckles is the writing desk that grew out of{' '}
            <a href={MAGAZINE} target="_blank" rel="noreferrer">
              Bronze Knuckles Magazine
            </a> - built to make writing easy, fun, and free.
          </p>
        </header>

        <hr className="about-page__rule" />

        <section className="about-page__section">
          <h2 className="about-page__section-title">Where it started</h2>
          <div className="about-page__prose">
            <p>
              Bronze Knuckles Magazine began with a simple feeling: old adventure stories could still
              spark joy - and that joy could inspire people to write. Publishing pulp-style fiction,
              art, and comics meant working with creators who had stories to tell and needed a place
              for them to land.
            </p>
            <p>
              Along the way, the same gap kept showing up. Inspiration is one thing; actually
              organizing and writing a Tale is another. Outlines scattered across notes, scenes in
              separate files, structure in a spreadsheet - the fun drained out before
              the draft ever caught fire.
            </p>
            <p>
              Write Knuckles spun out of that magazine work: a dedicated space for the writing itself,
              shaped by the same spirit that launched the magazine - community, encouragement, and
              stories worth finishing.
            </p>
          </div>
        </section>

        <hr className="about-page__rule" />

        <section className="about-page__section">
          <h2 className="about-page__section-title">What we built</h2>
          <div className="about-page__prose">
            <p>
              Write Knuckles is a writing app for short and long-form fiction - not a publishing
              pipeline, not a paywall on your words. Start a Tale, outline on The Rack, draft scenes
              in a focused editor, map structure on the Story Board, walk a Beat Sheet, and keep
              Characters, Locations, and Research within reach. All features that in other offerings
              require a monthly subscription; but Write Knuckles provides for free.
            </p>
            <p>
              The goal is straightforward: remove friction so you can stay in the story. Drag chapters
              into place. See progress at a glance. Search across scenes when a name escapes you.
              Autosave quietly in the background so you can keep moving.
            </p>
            <p>
              We want writing to feel approachable again - easy to start, fun to stick with, and free
              to explore while you figure out the last chapter twist.
            </p>
          </div>
        </section>

        <hr className="about-page__rule" />

        <section className="about-page__section">
          <h2 className="about-page__section-title">Read &amp; Write</h2>
          <div className="about-page__prose">
            <p>
              <strong className="text-bronze">Read</strong> with Bronze Knuckles Magazine - pulp fiction,
              art, and serial adventures from a growing roster of creators.
            </p>
            <p>
              <strong className="text-bronze">Write</strong> with Write Knuckles - the back room where
              the story gets written before it ever hits unsuspecting readers.
            </p>
            <p>
              Same account across both sites. When Write Knuckles opens wider, we&apos;ll share news on{' '}
              <a href={SUBSTACK} target="_blank" rel="noreferrer">
                Substack
              </a>
              . Write Knuckles is invite-only during beta; subscribe on substack to be notified when it opens to everyone.
            </p>
          </div>
        </section>

        <hr className="about-page__rule" />

        <section className="about-page__section about-page__section--cta">
          <h2 className="about-page__section-title">Ready to write?</h2>
          <p className="about-page__prose">
            Explore the{' '}
            <Link to="/" className="about-page__link">
              features
            </Link>
            , or{' '}
            <Link to="/signin" className="about-page__link">
              sign in
            </Link>{' '}
            once you have access.
          </p>
        </section>
      </main>

      <MarketingFooter />
    </div>
  )
}

export default AboutPage
