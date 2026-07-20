import HelpSection from '../HelpSection'
import { Link } from 'react-router-dom'

const FeatureRequestsHelp = () => (
  <HelpSection id="feature-requests" title="Feature Requests">
    <p>
      Have an idea for Write Knuckles? Open{' '}
      <Link to="/feature-requests">Feature Requests</Link> from the user menu.
    </p>
    <ul>
      <li>Submit a short title and description.</li>
      <li>Upvote requests you want to see built.</li>
      <li>Edit or delete your own requests; admins can merge duplicates.</li>
    </ul>
    <p>
      Feature Requests is separate from bug reports — use <strong>Report an Issue</strong> in the
      user menu for problems that need fixing.
    </p>
  </HelpSection>
)

export default FeatureRequestsHelp
