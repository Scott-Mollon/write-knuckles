import HelpSection from '../HelpSection'

const TaleSettings = () => (
  <HelpSection id="tale-settings" title="Tale settings">
    <p>
      Open Settings from the tale editor header or from a dashboard tale card. Settings are organized
      into tabs.
    </p>

    <h3>Tale</h3>
    <ul>
      <li>
        <strong>Cover image</strong> — upload or remove (JPEG, PNG, WebP, GIF, max 10 MB). Shown on
        the dashboard card.
      </li>
      <li>
        <strong>Type</strong> — Prose or Comic Script (read-only after creation).
      </li>
      <li>Title, subtitle, author, genre.</li>
      <li>
        <strong>Prose:</strong> target word count and Beat Sheet picker (swapping clears beat
        links).
      </li>
    </ul>

    <h3>Writing</h3>
    <p>
      Browser-wide writing defaults: default font, size, and tab indent for the editor.
    </p>

    <h3>Script (comic)</h3>
    <p>Typography for comic script element types, with preview.</p>

    <h3>Compile Options</h3>
    <p>
      Content and page layout preferences saved on the tale (cover, title page fields, page size,
      margins, chapter breaks, include images, and more). Used when you run Compile.
    </p>
  </HelpSection>
)

export default TaleSettings
