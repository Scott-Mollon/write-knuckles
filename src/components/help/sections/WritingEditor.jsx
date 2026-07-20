import HelpSection from '../HelpSection'

const WritingEditor = () => (
  <HelpSection id="writing-editor" title="Writing and the editor">
    <p>
      In Write mode, the center pane is the TipTap editor for the selected scene or page. Edit the
      scene title in the editor header. Empty scenes show a rotating placeholder prompt.
    </p>

    <h3>Formatting toolbar</h3>
    <ul>
      <li>Font family and size, text color</li>
      <li>Bold, italic, underline</li>
      <li>Highlight with color</li>
      <li>Align left, center, or right</li>
      <li>Undo and redo</li>
      <li>
        <strong>Prose extras:</strong> drop cap, blockquote, scene divider
      </li>
    </ul>

    <h3>Light and dark editor theme</h3>
    <p>
      Toggle the editor surface between light and dark from the toolbar. This only affects the
      writing pane, not the whole app chrome.
    </p>

    <h3>Writing defaults</h3>
    <p>
      Set browser-wide defaults for font, size, and tab indent under Tale Settings → Writing (or the
      editor defaults control). Toolbar changes still override the selection while you write; defaults
      apply to new typing and fresh scenes.
    </p>

    <h3>Word count and save status</h3>
    <p>
      Live word count appears for the open scene (also in the Inspector). Autosave status shows
      whether the latest edits are flushed to the server.
    </p>
  </HelpSection>
)

export default WritingEditor
