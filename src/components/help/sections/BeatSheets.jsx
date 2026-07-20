import HelpSection from '../HelpSection'

const BeatSheets = () => (
  <HelpSection id="beat-sheets" title="Beat Sheets">
    <p>
      Beat Sheets are <strong>prose only</strong>. They give your tale a structural template (for
      example Save the Cat) with guidance text and word budgets derived from your target word count.
    </p>

    <h3>Beat list</h3>
    <ul>
      <li>Each beat has a title, guidance, and a percentage / word target.</li>
      <li>
        <strong>Word progress bars</strong> show how linked scene words stack up against the beat’s
        budget.
      </li>
      <li>
        Link one or more scenes to a beat; open a linked scene in Write from the Beat Sheet UI.
      </li>
    </ul>

    <h3>Change Beat Sheet</h3>
    <p>
      You can swap templates from the Beat Sheet tab or Tale Settings → Tale. Changing the template{' '}
      <strong>clears existing beat links</strong> — confirm before proceeding if you have already
      mapped scenes.
    </p>

    <p>
      The editor header shows how many beats currently have at least one linked scene (for example
      “Beats: 3/15 linked”).
    </p>
  </HelpSection>
)

export default BeatSheets
