import HelpSection from '../HelpSection'
import { Link } from 'react-router-dom'

const GettingStarted = () => (
  <HelpSection id="getting-started" title="Getting started">
    <p>
      Write Knuckles is invite-only. After you create an account and confirm your email, an admin
      must approve your access before you can open or create tales. Until then you will see an
      access-pending screen.
    </p>

    <h3>Sign in and password reset</h3>
    <ol>
      <li>
        Go to <Link to="/signin">Sign In</Link> and use your email and password.
      </li>
      <li>
        New accounts: follow the email confirmation step, then wait for approval if you have not
        been pre-approved.
      </li>
      <li>
        Forgot your password? Use the reset link on the sign-in page. You will receive an email to
        set a new password.
      </li>
    </ol>

    <h3>Your Tales dashboard</h3>
    <p>
      Once approved, the home page lists <strong>Your Tales</strong> as cards with cover art,
      genre, and word progress (prose) or word count (comic scripts).
    </p>
    <ul>
      <li>
        <strong>Sort</strong> — Newest, Oldest, or Title A–Z. Your choice is remembered in this
        browser.
      </li>
      <li>
        <strong>Open</strong> a tale by clicking its card.
      </li>
      <li>
        Use card actions for <strong>Settings</strong>, <strong>Compile</strong>, or{' '}
        <strong>Delete</strong> without entering the editor.
      </li>
    </ul>

    <h3>Plan limits</h3>
    <p>
      Free accounts have a maximum number of active tales. When you hit the limit, New Tale is
      disabled until you delete a tale or upgrade. Paid and Complimentary plans are not limited
      this way. Your plan appears in Profile (user menu).
    </p>

    <p>
      <strong>Delete tale</strong> permanently removes the tale and its content. Prefer Trash
      (soft delete) for chapters and scenes inside a tale when you might want them back.
    </p>
  </HelpSection>
)

export default GettingStarted
