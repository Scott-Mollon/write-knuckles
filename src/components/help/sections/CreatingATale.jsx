import HelpSection from '../HelpSection'
import { Link } from 'react-router-dom'

const CreatingATale = () => (
  <HelpSection id="creating-a-tale" title="Creating a tale">
    <p>
      From the dashboard, choose <strong>New Tale</strong> (or open{' '}
      <Link to="/new">/new</Link>). The wizard walks you through type and metadata.
    </p>

    <h3>Prose vs Comic Script</h3>
    <p>
      Pick <strong>Prose</strong> or <strong>Comic Script</strong> at creation. This choice is{' '}
      <strong>permanent</strong> — you cannot switch types later.
    </p>
    <ul>
      <li>
        <strong>Prose</strong> uses Chapters and Scenes, Beat Sheets, target word count, and the
        full prose formatting toolbar.
      </li>
      <li>
        <strong>Comic Script</strong> uses Issues and Pages, a script-specific toolbar (Panel,
        Dialogue, SFX, and more), and has no Beat Sheet mode.
      </li>
    </ul>

    <h3>Metadata</h3>
    <ul>
      <li>
        <strong>Title</strong>, <strong>author</strong>, and <strong>genre</strong> for every tale.
      </li>
      <li>
        <strong>Prose only:</strong> target word count (used by Beat Sheet word budgets and
        progress).
      </li>
      <li>
        <strong>Prose only:</strong> optional Beat Sheet template (for example Save the Cat) so
        structure is ready when you open the editor.
      </li>
    </ul>

    <p>
      If your Free plan is at its tale limit, creation is blocked with a message explaining the
      limit. Delete a tale or upgrade to continue.
    </p>
  </HelpSection>
)

export default CreatingATale
