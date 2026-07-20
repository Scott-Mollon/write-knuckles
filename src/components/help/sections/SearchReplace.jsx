import HelpSection from '../HelpSection'

const SearchReplace = () => (
  <HelpSection id="search-replace" title="Search and replace">
    <p>
      Search mode finds text across <strong>all scene bodies</strong> in the current tale (minimum
      two characters).
    </p>

    <h3>Search</h3>
    <ul>
      <li>Enter a query to see matching scenes with snippets.</li>
      <li>
        Options: <strong>Match case</strong> and <strong>partial</strong> matching.
      </li>
      <li>Click a result to open that scene in Write.</li>
      <li>Your last query for this tale is remembered in the browser.</li>
    </ul>

    <h3>Replace</h3>
    <ol>
      <li>Run a search so hits are listed.</li>
      <li>
        Replace in <strong>selected</strong> hits or <strong>all</strong> matches.
      </li>
      <li>
        Autosave is flushed before replace runs so you do not overwrite unsaved edits incorrectly.
      </li>
    </ol>

    <p>
      Double-check replace-all before confirming — changes apply across every matching scene body in
      the tale.
    </p>
  </HelpSection>
)

export default SearchReplace
