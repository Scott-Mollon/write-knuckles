import { useState } from 'react'
import MarketingHeader from '../components/marketing/MarketingHeader'
import MarketingFooter from '../components/marketing/MarketingFooter'
import MarketingScreenshot from '../components/marketing/MarketingScreenshot'
import MarketingLightbox from '../components/marketing/MarketingLightbox'
import './LandingPage.scss'

const SUBSTACK = 'https://bronzeknuckles.substack.com/'

const FEATURES = [
  {
    id: 'rack',
    title: 'The Rack',
    body: 'Organize chapters and scenes in one place. Drag to reorder, rename freely, and keep draft status visible while you work.',
    src: '/marketing/feature-rack.png',
    alt: 'The Rack outline with chapters and scenes',
    caption: 'feature-rack.png — Rack panel with chapters & scenes',
  },
  {
    id: 'editor',
    title: 'Scene editor',
    body: 'Write with drop caps, scene dividers, live word count, and autosave that locks in your work.',
    src: '/marketing/feature-editor.png',
    alt: 'TipTap scene editor with toolbar and prose',
    caption: 'feature-editor.png — Editor with toolbar & word count',
  },
  {
    id: 'story-board',
    title: 'Story Board',
    body: 'See the whole Tale as cards on a story board. View your story By Chapter or By Beat, drag scenes across lanes, and keep Raw-to-Final progress available at a glance.',
    src: '/marketing/feature-story-board.png',
    alt: 'Story Board view by chapter',
    caption: 'feature-story-board.png — Story Board By Chapter',
  },
  {
    id: 'beat-sheets',
    title: 'Beat Sheets',
    body: 'Structure your Tale using popular beat sheets like Save the Cat, Hero’s Journey, Three-Act Pulp, Story Circle — or start blank. Link scenes to beats and track word budgets as you write.',
    src: '/marketing/feature-beat-sheet.png',
    alt: 'Beat Sheet timeline with linked scenes',
    caption: 'feature-beat-sheet.png — Beat Sheet timeline',
    sectionId: 'beat-sheets',
  },
  {
    id: 'research',
    title: 'Research desk',
    body: 'Keep Characters, Locations, and Research notes beside the manuscript. Tag sheets, filter fast, and pin cast and setting to the scene you’re writing.',
    src: '/marketing/feature-research.png',
    alt: 'Research panel with character sheets',
    caption: 'feature-research.png — Characters / Research panel',
    sectionId: 'research',
  },
  {
    id: 'search',
    title: 'Full-text search',
    body: 'Hunt a name, a line, or a forgotten clue across every scene — then jump straight back into Write mode.',
    src: '/marketing/feature-search.png',
    alt: 'Scene search results with snippets',
    caption: 'feature-search.png — Search results',
  },
]

const LandingPage = () => {
  const [lightbox, setLightbox] = useState(null)

  return (
  <div id="top" className="landing-page bg-ink text-cream">
    <MarketingHeader />

    <main>
      <section className="landing-hero" aria-labelledby="landing-brand">
        <div className="landing-hero__atmosphere" aria-hidden="true" />
        <div className="landing-hero__content">
          <p id="landing-brand" className="landing-hero__brand">
            Write Knuckles
          </p>
          <h1 className="landing-hero__headline">Structure the story. Write the scene.</h1>
          <p className="landing-hero__support">
            The back room where the story gets written — Rack, Story Board, and Beat Sheets in one desk.
          </p>
          <p className="landing-hero__note">Write Knuckles is in Beta and currently invite-only.</p>
          <p className="landing-hero__note">
            <a
              href={SUBSTACK}
              target="_blank"
              rel="noreferrer"
              className="text-bronze hover:text-cream underline underline-offset-2"
            >
              Subscribe to our Substack to learn more
            </a>
            .
          </p>
        </div>
        <div className="landing-hero__visual">
          <MarketingScreenshot
            src="/marketing/hero-cockpit.png"
            alt="Write Knuckles writing cockpit with Rack, editor, and Inspector"
            caption="hero-cockpit.png — Full writing cockpit (dark theme)"
            variant="hero"
          />
        </div>
      </section>

      <section id="features" className="landing-section landing-section--intro">
        <div className="landing-section__inner">
          <h2 className="landing-section__title">Built for short and long-form fiction</h2>
          <p className="landing-section__lede">
            Start a Tale, pick a Beat Sheet, and draft scene by scene — with outline, story board, and
            research under one roof.
          </p>
        </div>
      </section>

      {FEATURES.map((feature, index) => {
        const reversed = index % 2 === 1
        return (
          <section
            key={feature.id}
            id={feature.sectionId}
            className={`landing-feature ${reversed ? 'landing-feature--reverse' : ''}`}
          >
            <div className="landing-feature__copy">
              <h2 className="landing-feature__title">{feature.title}</h2>
              <p className="landing-feature__body">{feature.body}</p>
            </div>
            <div className="landing-feature__media">
              <MarketingScreenshot
                src={feature.src}
                alt={feature.alt}
                caption={feature.caption}
                variant="feature"
                expandable
                onExpand={() =>
                  setLightbox({ src: feature.src, alt: feature.alt, title: feature.title })
                }
              />
            </div>
          </section>
        )
      })}

      <section id="how-it-works" className="landing-section landing-how">
        <div className="landing-section__inner">
          <h2 className="landing-section__title">How it works</h2>
          <ol className="landing-how__steps">
            <li>
              <span className="landing-how__num">1</span>
              <div>
                <p className="landing-how__step-title">Start Your Tale</p>
                <p className="landing-how__step-body">
                  Set title, genre, target length, and a Beat Sheet. Chapter 1 and Scene 1 are ready
                  when you are.
                </p>
              </div>
            </li>
            <li>
              <span className="landing-how__num">2</span>
              <div>
                <p className="landing-how__step-title">Outline on The Rack</p>
                <p className="landing-how__step-body">
                  Grow chapters and scenes, drag to reorder, and keep status from Raw to Final in
                  view.
                </p>
              </div>
            </li>
            <li>
              <span className="landing-how__num">3</span>
              <div>
                <p className="landing-how__step-title">Write, board, and beat</p>
                <p className="landing-how__step-body">
                  Draft in the scene editor, reshuffle on the Story Board, and wire scenes to your Beat
                  Sheet as structure locks in.
                </p>
              </div>
            </li>
          </ol>
        </div>
      </section>

      <section className="landing-cta-band">
        <div className="landing-cta-band__inner">
          <h2 className="landing-cta-band__title">Knuckle Down and Write Your Story</h2>
          <p className="landing-cta-band__body">
            Write Knuckles is in Beta and currently invite-only.
          </p>
          <p className="landing-cta-band__body">
            <a href={SUBSTACK} target="_blank" rel="noreferrer">
              Subscribe to our Substack to learn more
            </a>
            .
          </p>
        </div>
      </section>
    </main>

    <MarketingFooter />

    {lightbox && (
      <MarketingLightbox
        src={lightbox.src}
        alt={lightbox.alt}
        title={lightbox.title}
        onClose={() => setLightbox(null)}
      />
    )}
  </div>
  )
}

export default LandingPage
