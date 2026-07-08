import { getScenePovColor } from '../../lib/scenePov'

const ScenePovDot = ({ scene, className = 'mt-0.5' }) => (
  <span
    className={`h-3 w-3 shrink-0 rounded-full border border-cream/20 ${className}`}
    style={{ backgroundColor: getScenePovColor(scene) }}
    title="Point of view"
    aria-hidden="true"
  />
)

export default ScenePovDot
