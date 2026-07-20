import HelpSection from '../HelpSection'

const ComicScriptWriting = () => (
  <HelpSection id="comic-scripts" title="Comic script writing">
    <p>
      Comic Script tales use <strong>Issues</strong> and <strong>Pages</strong> instead of Chapters
      and Scenes. There is no Beat Sheet tab. Story Board uses “By Issue.”
    </p>

    <h3>Script toolbar</h3>
    <p>Insert script elements with the comic-specific toolbar:</p>
    <ul>
      <li>
        <strong>Panel</strong> — panel slug; panels are numbered automatically as you add them.
      </li>
      <li>
        <strong>Desc</strong> — panel or action description.
      </li>
      <li>
        <strong>Char</strong> — character name cue.
      </li>
      <li>
        <strong>(desc)</strong> — parenthetical delivery note.
      </li>
      <li>
        <strong>Dial</strong> — dialogue.
      </li>
      <li>
        <strong>SFX</strong> — sound effects.
      </li>
    </ul>

    <h3>Script styles</h3>
    <p>
      Under Tale Settings → <strong>Script</strong>, set typography for each element type (panel,
      dialogue, SFX, and so on) with a live preview. These styles follow into compile/export.
    </p>

    <h3>Compile differences</h3>
    <p>
      Comic compiles force a page break between issues, omit the page-numbers option used for prose,
      and can show issue fields on the title page. See Compile and export for the full flow.
    </p>
  </HelpSection>
)

export default ComicScriptWriting
