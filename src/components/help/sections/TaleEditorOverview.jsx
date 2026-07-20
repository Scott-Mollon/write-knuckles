import HelpSection from '../HelpSection'

const TaleEditorOverview = () => (
  <HelpSection id="tale-editor" title="Tale editor overview">
    <p>
      Opening a tale loads the editor: outline on the left (The Rack), main workspace in the center,
      and the Inspector on the right in Write mode.
    </p>

    <h3>Mode tabs</h3>
    <ul>
      <li>
        <strong>Write</strong> — scene/page editor with Rack and Inspector.
      </li>
      <li>
        <strong>Story Board</strong> — corkboard of scene cards by chapter/issue (and by beat for
        prose).
      </li>
      <li>
        <strong>Beat Sheet</strong> — prose only. Structure beats, word targets, and scene links.
      </li>
      <li>
        <strong>Research</strong> — Characters, Locations, Research notes, and Dictionary.
      </li>
      <li>
        <strong>Search</strong> — find and replace across all scene bodies in the tale.
      </li>
      <li>
        <strong>Trash</strong> — restore or permanently delete soft-deleted items.
      </li>
    </ul>

    <h3>Header actions</h3>
    <ul>
      <li>
        <strong>Back to Tales</strong> — return to the dashboard.
      </li>
      <li>
        <strong>Settings</strong> — cover, metadata, writing defaults, script styles, compile
        options.
      </li>
      <li>
        <strong>Compile</strong> — select content and export or print.
      </li>
      <li>
        <strong>Prose:</strong> beat-link progress (how many beats have linked scenes).
      </li>
    </ul>

    <h3>Autosave</h3>
    <p>
      Scene body and title save automatically. Watch the status near the editor (“Unsaved…”, then
      “Locked in.”). Switching modes, opening Settings/Compile, or changing scenes flushes a pending
      save first so you do not lose work.
    </p>
  </HelpSection>
)

export default TaleEditorOverview
