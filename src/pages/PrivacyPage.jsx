import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import MarketingHeader from '../components/marketing/MarketingHeader'
import MarketingFooter from '../components/marketing/MarketingFooter'
import './PrivacyPage.scss'

const MAGAZINE = 'https://bronzeknucklesmagazine.com'
const CONTACT_EMAIL = 'bronzeknucklesmag@gmail.com'

const PrivacyPage = () => {
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  return (
    <div className="privacy-page bg-ink text-cream">
      <MarketingHeader />

      <main className="privacy-page__main">
        <header className="privacy-page__hero">
          <p className="privacy-page__eyebrow">Write Knuckles</p>
          <h1 className="privacy-page__title">Privacy Policy</h1>
          <p className="privacy-page__lede">Effective: July 2026</p>
        </header>

        <hr className="privacy-page__rule" />

        <section>
          <div className="privacy-page__prose">
            <p>
              Write Knuckles (&ldquo;we&rdquo;, &ldquo;us&rdquo;, or &ldquo;our&rdquo;) is committed to protecting
              your privacy. This policy explains what information we collect when you use our writing app and
              website, how we use it, and the choices you have. Write Knuckles is built by{' '}
              <a href={MAGAZINE} target="_blank" rel="noreferrer">
                Bronze Knuckles Magazine
              </a>
              .
            </p>
          </div>
        </section>

        <hr className="privacy-page__rule" />

        <section>
          <h2 className="privacy-page__section-title">Information we collect</h2>
          <div className="privacy-page__prose">
            <p>We collect only what we need to run the service.</p>
            <p>
              <strong>Account and profile data.</strong> When you sign up or sign in, we collect your email
              address and a password. Passwords are stored securely by our authentication provider; we do not
              store them in plain text. We also assign an account identifier so your Tales and settings stay
              tied to you.
            </p>
            <p>
              <strong>Content you create.</strong> Tales, scenes, outlines, beat sheets, characters, locations,
              research notes, and images you upload are stored so you can write, edit, and return to your work.
              This is your creative content, not marketing profile data, but it is associated with your account.
            </p>
            <p>
              <strong>Technical data.</strong> To keep you signed in, we use browser storage and, in
              production, cookies that share your session with other Bronze Knuckles sites when you use the
              same account. We do not run third-party advertising or analytics trackers on Write Knuckles at
              this time.
            </p>
            <p>
              <strong>What we do not collect.</strong> We do not collect payment card numbers, billing
              addresses, or other financial information. Write Knuckles is free, and we have not added paid
              features or checkout yet.
            </p>
          </div>
        </section>

        <hr className="privacy-page__rule" />

        <section>
          <h2 className="privacy-page__section-title">How we use your information</h2>
          <div className="privacy-page__prose">
            <p>We use the information above to:</p>
            <ul>
              <li>Create and manage your account</li>
              <li>Authenticate you and keep you signed in across our sites</li>
              <li>Store, sync, and autosave your writing and related files</li>
              <li>Operate invite-only access during beta</li>
              <li>Respond to support requests and protect the security of the service</li>
              <li>Improve Write Knuckles based on how the product is used</li>
            </ul>
            <p>We do not sell your personal information.</p>
          </div>
        </section>

        <hr className="privacy-page__rule" />

        <section>
          <h2 className="privacy-page__section-title">How we share information</h2>
          <div className="privacy-page__prose">
            <p>
              We do not sell or rent your personal data. We share information only in these limited cases:
            </p>
            <ul>
              <li>
                <strong>Service providers.</strong> We use Supabase to host authentication and store your
                account and writing data. They process data on our behalf under their own security and
                privacy terms.
              </li>
              <li>
                <strong>Shared sign-in.</strong> If you use the same account on Write Knuckles and Bronze
                Knuckles Magazine, your sign-in session may be shared across those sites so you do not have
                to log in twice.
              </li>
              <li>
                <strong>Legal requirements.</strong> We may disclose information if required by law, court
                order, or to protect the rights, safety, and security of our users and the service.
              </li>
            </ul>
            <p>Your Tales and drafts are private to your account unless you choose to share them elsewhere.</p>
          </div>
        </section>

        <hr className="privacy-page__rule" />

        <section>
          <h2 className="privacy-page__section-title">How we store and protect information</h2>
          <div className="privacy-page__prose">
            <p>
              Your data is stored on secure infrastructure with access limited to what is needed to operate
              the app. No system is perfectly secure, but we use industry-standard measures to guard against
              unauthorized access, loss, or misuse.
            </p>
            <p>
              If you delete your account or ask us to remove your data, we will handle the request in line
              with applicable law and our ability to recover backups.
            </p>
          </div>
        </section>

        <hr className="privacy-page__rule" />

        <section>
          <h2 className="privacy-page__section-title">Your rights and choices</h2>
          <div className="privacy-page__prose">
            <p>Depending on where you live, you may have the right to:</p>
            <ul>
              <li>Access the personal information we hold about you</li>
              <li>Correct inaccurate account information</li>
              <li>Request deletion of your account and associated personal data</li>
              <li>Export or receive a copy of your data</li>
              <li>Object to or restrict certain processing</li>
            </ul>
            <p>
              To make a request, contact us using the details below. We may need to verify your identity
              before fulfilling a request.
            </p>
          </div>
        </section>

        <hr className="privacy-page__rule" />

        <section>
          <h2 className="privacy-page__section-title">Cookies and local storage</h2>
          <div className="privacy-page__prose">
            <p>
              Write Knuckles uses cookies and browser storage to keep you signed in and to remember your
              session. In production, authentication cookies may be set for our parent domain so sign-in works
              across Write Knuckles and Bronze Knuckles Magazine. You can clear cookies and site data in your
              browser settings, though you will need to sign in again afterward.
            </p>
          </div>
        </section>

        <hr className="privacy-page__rule" />

        <section>
          <h2 className="privacy-page__section-title">Children&apos;s privacy</h2>
          <div className="privacy-page__prose">
            <p>
              Write Knuckles is not directed at children under 13, and we do not knowingly collect personal
              information from children under 13. If you believe a child has provided us with personal
              information, please contact us and we will take steps to delete it.
            </p>
          </div>
        </section>

        <hr className="privacy-page__rule" />

        <section>
          <h2 className="privacy-page__section-title">Changes to this policy</h2>
          <div className="privacy-page__prose">
            <p>
              We may update this policy as Write Knuckles grows—for example, if we add paid features or new
              data practices. When we do, we will post the revised policy on this page with an updated
              effective date. Continued use of the service after changes take effect means you accept the
              updated policy.
            </p>
          </div>
        </section>

        <hr className="privacy-page__rule" />

        <section>
          <h2 className="privacy-page__section-title">Contact us</h2>
          <div className="privacy-page__prose">
            <p>
              Questions about this policy, a copy of your personal data, or a deletion request? Email us at{' '}
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

export default PrivacyPage
