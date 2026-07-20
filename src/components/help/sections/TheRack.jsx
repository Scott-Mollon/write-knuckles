import HelpSection from '../HelpSection'

const TheRack = () => (
  <HelpSection id="the-rack" title="The Rack">
    <p>
      The Rack is your outline: a tree of <strong>Chapters</strong> and <strong>Scenes</strong>{' '}
      (prose) or <strong>Issues</strong> and <strong>Pages</strong> (comic scripts). Select a
      scene/page to edit it in Write mode.
    </p>

    <h3>Organize structure</h3>
    <ul>
      <li>
        <strong>Add</strong> a chapter/issue or scene/page with the controls on The Rack (or from
        Story Board).
      </li>
      <li>
        <strong>Rename</strong> a chapter/issue by editing its title inline.
      </li>
      <li>
        <strong>Drag</strong> to reorder chapters/issues, reorder scenes/pages, or move a
        scene/page into a different chapter/issue.
      </li>
    </ul>

    <h3>Delete</h3>
    <p>
      Deleting from The Rack soft-deletes the item into <strong>Trash</strong>. Deleting a
      chapter/issue also moves its scenes/pages. You cannot delete the last remaining scene/page in
      a tale — keep at least one.
    </p>

    <h3>POV color stripe</h3>
    <p>
      The left border color on a scene/page in The Rack comes from the POV color tag set in the
      Inspector. Use it to see whose viewpoint you are in at a glance.
    </p>
  </HelpSection>
)

export default TheRack
