import HelpSection from '../HelpSection'

const Proofreading = () => (
  <HelpSection id="proofreading" title="Proofreading">
    <p>
      Write Knuckles includes Harper-based spelling and grammar checking in the scene editor.
    </p>

    <h3>Turn it on</h3>
    <p>
      Toggle proofreading from the editor toolbar. When enabled, issues are highlighted in the text
      and a badge shows how many need attention.
    </p>

    <h3>Suggestions</h3>
    <p>Click a highlighted issue to open the suggestion popover:</p>
    <ul>
      <li>
        <strong>Apply</strong> — accept the suggested fix
      </li>
      <li>
        <strong>Ignore</strong> — dismiss this occurrence (browser-wide ignore list can be cleared
        from Research → Dictionary)
      </li>
      <li>
        <strong>Add to dictionary</strong> — treat the word as correct for this tale’s dictionary
      </li>
    </ul>

    <p>
      Words you add appear under Research → <strong>Dictionary</strong>, where you can jump A–Z and
      remove entries.
    </p>
  </HelpSection>
)

export default Proofreading
