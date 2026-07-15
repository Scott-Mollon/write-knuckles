import { SCENE_FONT_GROUPS, SCENE_FONT_OPTIONS, sceneFontPreviewFamily } from '../../constants/sceneFonts'
import {
  SCRIPT_ELEMENT_KEYS,
  SCRIPT_ELEMENT_LABELS,
  SCRIPT_ELEMENT_PREVIEW_SAMPLES,
  cloneDefaultScriptStylePreferences,
} from '../../lib/editor/scriptStyles'

const fieldClass =
  'w-full rounded border border-bronze-dark/50 bg-ink px-2 py-1.5 text-sm text-cream focus:border-bronze focus:outline-none'

const selectClass = fieldClass

const ALIGN_OPTIONS = [
  { value: 'left', label: 'Left' },
  { value: 'center', label: 'Center' },
  { value: 'right', label: 'Right' },
]

const WEIGHT_OPTIONS = [
  { value: '400', label: 'Regular' },
  { value: '700', label: 'Bold' },
]

function scriptStyleToReact(value) {
  return {
    fontFamily: sceneFontPreviewFamily(value.fontFamily),
    fontSize: value.fontSize || '13px',
    fontWeight: value.fontWeight || '400',
    fontStyle: value.fontStyle || 'normal',
    textAlign: value.textAlign || 'left',
    textTransform: value.textTransform || 'none',
    letterSpacing: value.letterSpacing || '0',
    lineHeight: value.lineHeight || '1.4',
    marginTop: value.marginTop || '0',
    marginBottom: value.marginBottom || '0',
    paddingLeft: value.indent || '0',
    paddingRight: value.indent || '0',
    color: '#1a1410',
  }
}

const ScriptElementEditor = ({ elementKey, value, onChange }) => {
  const update = (patch) => onChange({ ...value, ...patch })
  const sample = SCRIPT_ELEMENT_PREVIEW_SAMPLES[elementKey] || SCRIPT_ELEMENT_LABELS[elementKey]

  return (
    <div className="space-y-3 rounded border border-bronze-dark/40 p-4">
      <h3 className="font-ui text-sm uppercase tracking-wide text-bronze">
        {SCRIPT_ELEMENT_LABELS[elementKey]}
      </h3>

      <div className="rounded border border-bronze-dark/30 bg-cream px-3 py-3">
        <p className="mb-1.5 font-ui text-[10px] uppercase tracking-wide text-ink/45">Preview</p>
        <p className="break-words" style={scriptStyleToReact(value)}>
          {sample}
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block text-xs text-cream/70">
          Font
          <select
            value={value.fontFamily || ''}
            onChange={(e) => update({ fontFamily: e.target.value })}
            className={`mt-1 ${selectClass}`}
          >
            {SCENE_FONT_GROUPS.map((group) => (
              <optgroup key={group.id} label={group.label}>
                {SCENE_FONT_OPTIONS.filter((f) => f.group === group.id).map((font) => (
                  <option key={font.label} value={font.value}>
                    {font.label}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </label>

        <label className="block text-xs text-cream/70">
          Size
          <input
            type="text"
            value={value.fontSize || ''}
            onChange={(e) => update({ fontSize: e.target.value })}
            placeholder="13px"
            className={`mt-1 ${fieldClass}`}
          />
        </label>

        <label className="block text-xs text-cream/70">
          Weight
          <select
            value={value.fontWeight || '400'}
            onChange={(e) => update({ fontWeight: e.target.value })}
            className={`mt-1 ${selectClass}`}
          >
            {WEIGHT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </label>

        <label className="block text-xs text-cream/70">
          Align
          <select
            value={value.textAlign || 'left'}
            onChange={(e) => update({ textAlign: e.target.value })}
            className={`mt-1 ${selectClass}`}
          >
            {ALIGN_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </label>

        <label className="block text-xs text-cream/70">
          Letter spacing
          <input
            type="text"
            value={value.letterSpacing || ''}
            onChange={(e) => update({ letterSpacing: e.target.value })}
            placeholder="0.04em"
            className={`mt-1 ${fieldClass}`}
          />
        </label>

        <label className="block text-xs text-cream/70">
          Line height
          <input
            type="text"
            value={value.lineHeight || ''}
            onChange={(e) => update({ lineHeight: e.target.value })}
            placeholder="1.4"
            className={`mt-1 ${fieldClass}`}
          />
        </label>

        <label className="block text-xs text-cream/70">
          Indent
          <input
            type="text"
            value={value.indent || ''}
            onChange={(e) => update({ indent: e.target.value })}
            placeholder="0"
            className={`mt-1 ${fieldClass}`}
          />
        </label>

        <label className="block text-xs text-cream/70">
          Margin top
          <input
            type="text"
            value={value.marginTop || ''}
            onChange={(e) => update({ marginTop: e.target.value })}
            className={`mt-1 ${fieldClass}`}
          />
        </label>

        <label className="block text-xs text-cream/70">
          Margin bottom
          <input
            type="text"
            value={value.marginBottom || ''}
            onChange={(e) => update({ marginBottom: e.target.value })}
            className={`mt-1 ${fieldClass}`}
          />
        </label>
      </div>

      <div className="flex flex-wrap gap-4">
        <label className="flex items-center gap-2 text-xs text-cream/80">
          <input
            type="checkbox"
            checked={(value.textTransform || '') === 'uppercase'}
            onChange={(e) =>
              update({ textTransform: e.target.checked ? 'uppercase' : 'none' })
            }
          />
          Uppercase
        </label>
        <label className="flex items-center gap-2 text-xs text-cream/80">
          <input
            type="checkbox"
            checked={(value.fontStyle || 'normal') === 'italic'}
            onChange={(e) => update({ fontStyle: e.target.checked ? 'italic' : 'normal' })}
          />
          Italic
        </label>
      </div>
    </div>
  )
}

const ScriptStyleSettingsPanel = ({ preferences, onChange }) => (
  <div className="space-y-4">
    <div className="flex flex-wrap items-start justify-between gap-3">
      <p className="text-sm text-cream/60">
        Styles apply live in the script editor. Use the Write toolbar to insert each element type.
      </p>
      <button
        type="button"
        onClick={() => onChange(cloneDefaultScriptStylePreferences())}
        className="shrink-0 border border-bronze-dark/50 px-3 py-1.5 font-ui text-xs uppercase tracking-wide text-cream/70 transition hover:border-bronze hover:text-bronze"
      >
        Reset to defaults
      </button>
    </div>
    {SCRIPT_ELEMENT_KEYS.map((key) => (
      <ScriptElementEditor
        key={key}
        elementKey={key}
        value={preferences[key] || {}}
        onChange={(next) => onChange({ ...preferences, [key]: next })}
      />
    ))}
  </div>
)

export default ScriptStyleSettingsPanel
