import HelpSection from '../HelpSection'

const Trash = () => (
  <HelpSection id="trash" title="Trash">
    <p>
      Soft-deleted items from the tale land in Trash: chapters/issues, scenes/pages, characters,
      locations, and research notes.
    </p>

    <h3>Restore</h3>
    <p>
      Restore brings the item back into the tale (structure returns to The Rack; research cards
      return to Research).
    </p>

    <h3>Delete permanently</h3>
    <p>
      Permanent delete is <strong>irreversible</strong>. Confirm carefully — the item cannot be
      recovered afterward.
    </p>

    <p>
      Deleting an entire tale from the dashboard is separate from Trash and removes the whole tale
      immediately after confirmation.
    </p>
  </HelpSection>
)

export default Trash
