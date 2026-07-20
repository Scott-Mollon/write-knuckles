import HelpSection from '../HelpSection'

const ImagesInScenes = () => (
  <HelpSection id="scene-images" title="Images in scenes">
    <p>
      You can embed images in prose scene bodies for illustration or reference while drafting.
    </p>

    <h3>Upload and insert</h3>
    <ol>
      <li>Use the image control in the editor toolbar.</li>
      <li>
        Upload <strong>JPEG, PNG, WebP, or GIF</strong>, maximum <strong>10 MB</strong> per file.
      </li>
      <li>The image is inserted into the scene at the cursor.</li>
    </ol>

    <h3>Image bubble menu</h3>
    <p>Select an image in the editor to open its bubble menu:</p>
    <ul>
      <li>
        <strong>Display:</strong> Block, Float left, Float right, or Full width
      </li>
      <li>
        <strong>Alt text</strong> — describe the image for accessibility and compile
      </li>
      <li>
        <strong>Remove</strong> — delete the image from the scene
      </li>
    </ul>

    <p>
      Cover images for the tale card are separate — manage those under Tale Settings → Tale, not in
      the scene body.
    </p>
  </HelpSection>
)

export default ImagesInScenes
