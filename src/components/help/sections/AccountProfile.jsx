import HelpSection from '../HelpSection'
import { Link } from 'react-router-dom'
import { KOFI_SUPPORT } from '../../../constants/links'

const MAGAZINE_CONTACT = 'https://bronzeknucklesmagazine.com/contact'

const AccountProfile = () => (
  <HelpSection id="account-profile" title="Account and profile">
    <p>
      Open the user menu (your display name in the nav) for Profile, Help, Support, and legal links.
    </p>

    <h3>Profile</h3>
    <ul>
      <li>View your email and plan (Free, Paid, or Complimentary).</li>
      <li>Edit first and last name.</li>
      <li>Follow the link to reset your password via email.</li>
    </ul>

    <h3>Support and issues</h3>
    <ul>
      <li>
        <strong>Support</strong> —{' '}
        <a href={KOFI_SUPPORT} target="_blank" rel="noopener noreferrer">
          Ko-fi
        </a>{' '}
        if you want to tip the project.
      </li>
      <li>
        <strong>Report an Issue</strong> —{' '}
        <a href={MAGAZINE_CONTACT} target="_blank" rel="noopener noreferrer">
          Bronze Knuckles Magazine contact
        </a>
        .
      </li>
      <li>
        <Link to="/privacy">Privacy</Link> and <Link to="/terms">Terms</Link> from the user menu.
      </li>
    </ul>

    <h3>Delete account</h3>
    <p>
      From Profile, you can delete your account. You must type a confirmation phrase and enter your
      password. This permanently removes your Write Knuckles data and related magazine
      submissions/files tied to the shared account — it cannot be undone.
    </p>
  </HelpSection>
)

export default AccountProfile
