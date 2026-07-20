import HelpSection from '../HelpSection'

const CompileExport = () => (
  <HelpSection id="compile-export" title="Compile and export">
    <p>
      Compile builds a paginated manuscript from selected chapters/scenes (or issues/pages). Open it
      from the editor header or a dashboard tale card.
    </p>

    <h3>Select content</h3>
    <ol>
      <li>Check the chapters/issues and scenes/pages to include.</li>
      <li>Use Select all or Clear to speed selection.</li>
      <li>Run compile to generate the preview.</li>
    </ol>

    <h3>Compile options</h3>
    <p>
      Options are edited in Settings → Compile Options (and reflected in the compile flow). Common
      choices:
    </p>
    <ul>
      <li>Include cover and title page (title, subtitle, author)</li>
      <li>Page numbers (prose; comic scripts omit this option)</li>
      <li>Chapter/issue page breaks</li>
      <li>Include inline images</li>
      <li>Chapter heading parts and typography styles</li>
      <li>Page size, orientation, and margins (presets or custom)</li>
    </ul>

    <h3>Preview and download</h3>
    <ul>
      <li>
        <strong>Compile viewer</strong> — paginated preview (Paged.js). Toggle page guides; recompile
        after changing settings.
      </li>
      <li>
        <strong>Download HTML</strong> or <strong>plain TXT</strong>.
      </li>
      <li>
        <strong>Print / PDF</strong> — use the print dialog and choose Save as PDF in your browser
        or OS print UI.
      </li>
    </ul>

    <h3>Comic notes</h3>
    <p>
      Comic compiles force a break between issues, skip page-number controls used for prose, and can
      include issue fields on the title page.
    </p>
  </HelpSection>
)

export default CompileExport
