import HelpSection from '../HelpSection'

const InspectorDoc = () => (
  <HelpSection id="inspector" title="Inspector">
    <p>
      In Write mode, the Inspector sits on the right. Collapse it to a narrow rail or expand it for
      full scene metadata.
    </p>

    <h3>Scene metadata</h3>
    <ul>
      <li>
        <strong>Title</strong> and <strong>synopsis</strong> — synopsis saves when you leave the
        field.
      </li>
      <li>
        <strong>Status</strong> — Raw → Drafted → Rewritten → Final (color-coded).
      </li>
      <li>
        <strong>POV color tags</strong> — pick a color dot for viewpoint tracking (also shown on The
        Rack and Story Board).
      </li>
      <li>
        <strong>Word count</strong> — live count for the open scene.
      </li>
    </ul>

    <h3>Beat link (prose)</h3>
    <p>
      Link the scene to one beat on your Beat Sheet, or unlink it. Linked scenes feed Story Board’s
      By Beat view and header progress.
    </p>

    <h3>Character and location pins</h3>
    <p>
      Pin Characters and Locations from Research onto the active scene so cast and setting stay
      attached while you write. Manage the master lists under Research.
    </p>
  </HelpSection>
)

export default InspectorDoc
