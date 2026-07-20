import HelpSection from '../HelpSection'

const ResearchDesk = () => (
  <HelpSection id="research" title="Research Desk">
    <p>
      Research mode is your story bible: pin boards for Characters, Locations, and Research notes,
      plus the tale Dictionary.
    </p>

    <h3>Tabs</h3>
    <ul>
      <li>
        <strong>Characters</strong> — name, role, bio, tags, reference images
      </li>
      <li>
        <strong>Locations</strong> — name, description, notes, tags, images
      </li>
      <li>
        <strong>Research</strong> — title, body, optional URL, tags, images
      </li>
      <li>
        <strong>Dictionary</strong> — words added via proofreading; A–Z jump; remove words; clear
        browser-wide ignored lints
      </li>
    </ul>

    <h3>Working with pins</h3>
    <ol>
      <li>Add a new card or select an existing one to edit details.</li>
      <li>Filter lists with multi-select <strong>tag</strong> chips.</li>
      <li>
        Soft-delete items you no longer need — they move to Trash and can be restored.
      </li>
    </ol>

    <h3>Reference images</h3>
    <p>
      Upload files and/or paste image URLs. Star one image as the hero thumbnail for the card.
      Uploads use the same type and 10 MB limits as scene images.
    </p>

    <h3>Scene pins</h3>
    <p>
      From the Inspector in Write mode, pin Characters and Locations onto the active scene so they
      stay visible while you draft.
    </p>
  </HelpSection>
)

export default ResearchDesk
