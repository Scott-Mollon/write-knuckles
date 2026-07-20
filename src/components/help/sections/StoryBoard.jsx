import HelpSection from '../HelpSection'

const StoryBoard = () => (
  <HelpSection id="story-board" title="Story Board">
    <p>
      Story Board is a corkboard of scene/page cards for high-level structure without diving into
      full manuscript text.
    </p>

    <h3>Views</h3>
    <ul>
      <li>
        <strong>By Chapter</strong> / <strong>By Issue</strong> — columns or groups per
        chapter/issue.
      </li>
      <li>
        <strong>By Beat</strong> (prose) — lanes for each beat plus an unlinked pool. Drag cards onto
        a beat to link, or out to unlink.
      </li>
    </ul>

    <h3>Scene cards</h3>
    <p>
      Each card shows status, POV color, and synopsis. Open a card to jump into Write for that
      scene/page.
    </p>

    <h3>Add structure</h3>
    <p>
      Add chapters/issues and scenes/pages from Story Board the same way as from The Rack. If you
      have no beats yet on a prose tale, the By Beat view prompts you to pick a Beat Sheet template.
    </p>
  </HelpSection>
)

export default StoryBoard
