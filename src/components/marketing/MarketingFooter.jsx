import { Link } from 'react-router-dom'
import { KOFI_SUPPORT } from '../../constants/links'

const MAGAZINE = 'https://bronzeknucklesmagazine.com'
const SUBSTACK = 'https://bronzeknuckles.substack.com/'
const FACEBOOK = 'https://www.facebook.com/bronzeknucklesmag'

const MarketingFooter = () => {
  const year = new Date().getFullYear()

  return (
    <footer className="marketing-footer border-t border-bronze-dark/70 bg-ink">
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-x-6 gap-y-10 px-5 py-14 sm:px-8 lg:grid-cols-5 lg:gap-10">
        <div>
          <p className="font-ui text-lg uppercase tracking-wide text-bronze">Write</p>
          <ul className="mt-4 space-y-2 font-prose text-sm text-cream/70">
            <li>
              <a href="/#features" className="hover:text-bronze">
                Features
              </a>
            </li>
            <li>
              <a href="/#beat-sheets" className="hover:text-bronze">
                Beat Sheets
              </a>
            </li>
            <li>
              <a href="/#research" className="hover:text-bronze">
                Research
              </a>
            </li>
            <li>
              <a href="/#how-it-works" className="hover:text-bronze">
                How it works
              </a>
            </li>
            <li>
              <Link to="/about" className="hover:text-bronze">
                About
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <p className="font-ui text-lg uppercase tracking-wide text-bronze">Follow</p>
          <ul className="mt-4 space-y-2 font-prose text-sm text-cream/70">
            <li>
              <a href={SUBSTACK} target="_blank" rel="noreferrer" className="hover:text-bronze">
                Substack
              </a>
            </li>
            <li>
              <a href={FACEBOOK} target="_blank" rel="noreferrer" className="hover:text-bronze">
                Facebook
              </a>
            </li>
            <li>
              <a href={KOFI_SUPPORT} target="_blank" rel="noreferrer" className="hover:text-bronze">
                Support
              </a>
            </li>
          </ul>
        </div>

        <div>
          <p className="font-ui text-lg uppercase tracking-wide text-bronze">Read</p>
          <ul className="mt-4 space-y-2 font-prose text-sm text-cream/70">
            <li>
              <a href={MAGAZINE} target="_blank" rel="noreferrer" className="hover:text-bronze">
                Bronze Knuckles Magazine
              </a>
            </li>
            <li>
              <a
                href={`${MAGAZINE}/submitinfo`}
                target="_blank"
                rel="noreferrer"
                className="hover:text-bronze"
              >
                Submit
              </a>
            </li>
          </ul>
        </div>

        <div>
          <p className="font-ui text-lg uppercase tracking-wide text-bronze">Account</p>
          <ul className="mt-4 space-y-2 font-prose text-sm text-cream/70">
            <li>
              <Link to="/signin" className="hover:text-bronze">
                Sign Up
              </Link>
            </li>
            <li>
              <Link to="/signin" className="hover:text-bronze">
                Sign In
              </Link>
            </li>
            <li>
              <Link to="/reset" className="hover:text-bronze">
                Forgot password
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <p className="font-ui text-lg uppercase tracking-wide text-bronze">Small Print</p>
          <ul className="mt-4 space-y-2 font-prose text-sm text-cream/70">
            <li>
              <Link to="/privacy" className="hover:text-bronze">
                Privacy
              </Link>
            </li>
            <li>
              <Link to="/terms" className="hover:text-bronze">
                Terms
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-bronze-dark/50">
        <div className="mx-auto flex max-w-6xl flex-col gap-1 px-5 py-5 font-prose text-xs text-cream/45 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <span>© {year} Write Knuckles</span>
          <span>Built by Bronze Knuckles Magazine</span>
        </div>
      </div>
    </footer>
  )
}

export default MarketingFooter
