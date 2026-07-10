import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import MarketingHeader from '../components/marketing/MarketingHeader'
import MarketingFooter from '../components/marketing/MarketingFooter'
import './PrivacyPage.scss'

const MAGAZINE = 'https://bronzeknucklesmagazine.com'
const CONTACT_EMAIL = 'bronzeknucklesmag@gmail.com'

const TermsPage = () => {
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  return (
    <div className="privacy-page bg-ink text-cream">
      <MarketingHeader />

      <main className="privacy-page__main">
        <header className="privacy-page__hero">
          <p className="privacy-page__eyebrow">Write Knuckles</p>
          <h1 className="privacy-page__title">Terms of Service</h1>
          <p className="privacy-page__lede">Effective: July 2026</p>
        </header>

        <hr className="privacy-page__rule" />

        <section>
          <div className="privacy-page__prose">
            <p>
              These Terms of Service (&ldquo;Terms&rdquo;) govern your use of Write Knuckles, including our
              website and writing application (the &ldquo;Service&rdquo;). The Service is operated by Bronze
              Knuckles Magazine (&ldquo;we&rdquo;, &ldquo;us&rdquo;, or &ldquo;our&rdquo;).
            </p>
            <p>
              By creating an account or using Write Knuckles, you agree to these Terms. If you do not agree,
              do not use the Service.
            </p>
          </div>
        </section>

        <hr className="privacy-page__rule" />

        <section>
          <h2 className="privacy-page__section-title">The service</h2>
          <div className="privacy-page__prose">
            <p>
              Write Knuckles is a free online writing tool for drafting and organizing fiction. Features may
              include Tales, scenes, outlines, beat sheets, research notes, and image uploads. We may add,
              change, or remove features at any time.
            </p>
            <p>
              During beta, access may be invite-only. We do not guarantee uninterrupted availability, specific
              features, or that the Service will meet your needs.
            </p>
          </div>
        </section>

        <hr className="privacy-page__rule" />

        <section>
          <h2 className="privacy-page__section-title">Your account</h2>
          <div className="privacy-page__prose">
            <p>
              You are responsible for your account credentials and for activity under your account. Provide
              accurate information when you sign up and keep your password secure. Notify us if you believe
              your account has been compromised.
            </p>
            <p>
              You must be old enough to use online services in your jurisdiction. The Service is not directed
              at children under 13.
            </p>
          </div>
        </section>

        <hr className="privacy-page__rule" />

        <section>
          <h2 className="privacy-page__section-title">Your content</h2>
          <div className="privacy-page__prose">
            <p>
              You keep ownership of the stories, text, images, and other material you create or upload
              (&ldquo;Your Content&rdquo;). You are solely responsible for Your Content and for having the
              rights needed to use and store it in the Service.
            </p>
            <p>
              To operate Write Knuckles, you grant us a limited license to host, store, back up, display,
              and process Your Content only as needed to provide the Service to you. We do not claim
              ownership of your writing.
            </p>
            <p>
              Write Knuckles is a drafting tool, not a publisher. We do not review, endorse, or guarantee
              publication of Your Content. Using the Service does not create any editorial, agency, or
              publishing relationship with{' '}
              <a href={MAGAZINE} target="_blank" rel="noreferrer">
                Bronze Knuckles Magazine
              </a>{' '}
              unless separately agreed in writing.
            </p>
          </div>
        </section>

        <hr className="privacy-page__rule" />

        <section>
          <h2 className="privacy-page__section-title">Acceptable use</h2>
          <div className="privacy-page__prose">
            <p>You agree not to:</p>
            <ul>
              <li>Use the Service for unlawful purposes or to violate others&apos; rights</li>
              <li>Upload malware, spam, or content you do not have permission to use</li>
              <li>Attempt to access another user&apos;s account or data without authorization</li>
              <li>Interfere with or disrupt the Service, including by automated scraping or abuse</li>
              <li>Reverse engineer or misuse the Service except as allowed by law</li>
            </ul>
            <p>
              We may suspend or terminate access if we reasonably believe you have violated these Terms or
              pose a risk to the Service or other users.
            </p>
          </div>
        </section>

        <hr className="privacy-page__rule" />

        <section>
          <h2 className="privacy-page__section-title">Free service</h2>
          <div className="privacy-page__prose">
            <p>
              Write Knuckles is currently provided free of charge. We have not added paid plans, subscriptions,
              or checkout. If we introduce paid features later, we will update these Terms and communicate
              any new conditions before they apply to you.
            </p>
          </div>
        </section>

        <hr className="privacy-page__rule" />

        <section>
          <h2 className="privacy-page__section-title">Use at your own risk</h2>
          <div className="privacy-page__prose">
            <p>
              <strong>
                The Service is provided &ldquo;as is&rdquo; and &ldquo;as available,&rdquo; without warranties
                of any kind, whether express or implied.
              </strong>{' '}
              To the fullest extent permitted by law, we disclaim all warranties, including implied warranties
              of merchantability, fitness for a particular purpose, and non-infringement.
            </p>
            <p>
              We do not warrant that the Service will be error-free, secure, or uninterrupted, or that your
              content will always be saved, synced, or recoverable. Autosave and backups may fail. You are
              responsible for maintaining your own copies of important work.
            </p>
            <p>
              <strong>You use Write Knuckles at your own risk.</strong>
            </p>
          </div>
        </section>

        <hr className="privacy-page__rule" />

        <section>
          <h2 className="privacy-page__section-title">Limitation of liability</h2>
          <div className="privacy-page__prose">
            <p>
              To the fullest extent permitted by law, Bronze Knuckles Magazine and its operators will not be
              liable for any indirect, incidental, special, consequential, or punitive damages, or for any
              loss of profits, data, goodwill, or content, arising from or related to your use of the
              Service.
            </p>
            <p>
              Our total liability for any claim arising from these Terms or the Service will not exceed the
              greater of (a) the amount you paid us in the twelve months before the claim or (b) zero
              dollars, since the Service is currently free.
            </p>
            <p>
              Some jurisdictions do not allow certain limitations, so parts of this section may not apply to
              you.
            </p>
          </div>
        </section>

        <hr className="privacy-page__rule" />

        <section>
          <h2 className="privacy-page__section-title">Privacy</h2>
          <div className="privacy-page__prose">
            <p>
              Our{' '}
              <Link to="/privacy">Privacy Policy</Link> explains how we collect and use personal information.
              By using the Service, you also agree to that policy.
            </p>
          </div>
        </section>

        <hr className="privacy-page__rule" />

        <section>
          <h2 className="privacy-page__section-title">Changes and termination</h2>
          <div className="privacy-page__prose">
            <p>
              We may modify, suspend, or discontinue the Service, or change these Terms, at any time. We will
              post updated Terms on this page with a revised effective date. Continued use after changes
              take effect means you accept the updated Terms.
            </p>
            <p>
              You may stop using the Service at any time. We may terminate or restrict your access if you
              breach these Terms or if we wind down the Service.
            </p>
          </div>
        </section>

        <hr className="privacy-page__rule" />

        <section>
          <h2 className="privacy-page__section-title">Our intellectual property</h2>
          <div className="privacy-page__prose">
            <p>
              Write Knuckles, including its name, branding, design, and underlying software, is owned by us
              or our licensors. These Terms do not grant you any right to use our trademarks or branding
              except as needed to use the Service in the ordinary way.
            </p>
          </div>
        </section>

        <hr className="privacy-page__rule" />

        <section>
          <h2 className="privacy-page__section-title">General</h2>
          <div className="privacy-page__prose">
            <p>
              If any part of these Terms is found unenforceable, the rest remains in effect. Our failure to
              enforce a provision is not a waiver. These Terms are the entire agreement between you and us
              regarding Write Knuckles.
            </p>
          </div>
        </section>

        <hr className="privacy-page__rule" />

        <section>
          <h2 className="privacy-page__section-title">Contact us</h2>
          <div className="privacy-page__prose">
            <p>
              Questions about these Terms? Email us at{' '}
              <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a> or{' '}
              <a href={`${MAGAZINE}/contact`} target="_blank" rel="noreferrer">
                contact Bronze Knuckles Magazine
              </a>
              .
            </p>
            <p>
              <Link to="/">Back to home</Link>
            </p>
          </div>
        </section>
      </main>

      <MarketingFooter />
    </div>
  )
}

export default TermsPage
