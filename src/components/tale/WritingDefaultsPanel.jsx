import {
  SCENE_FONT_GROUPS,
  SCENE_FONT_OPTIONS,
  sceneFontPreviewFamily,
} from '../../constants/sceneFonts'
import { PROSE_FONT_SIZE_OPTIONS } from '../../hooks/useEditorProseDefaults'
import { TAB_SIZE_OPTIONS } from '../../hooks/useEditorTabSize'

const fieldClass =
  'w-full rounded border border-bronze-dark/50 bg-ink px-3 py-2 text-sm text-cream focus:border-bronze focus:outline-none'

const labelClass = 'mb-1.5 block font-ui text-xs uppercase tracking-wide text-cream/80'

const WritingDefaultsPanel = ({
  proseFont,
  onProseFontChange,
  proseFontSize,
  onProseFontSizeChange,
  tabSize,
  onTabSizeChange,
}) => {
  return (
    <div className="space-y-5">
      <p className="text-sm text-cream/60">
        Applies in this browser for all tales. Toolbar Font and Size still override selected text.
      </p>

      <label className={labelClass}>
        Font
        <select
          value={proseFont}
          onChange={(event) => onProseFontChange(event.target.value)}
          className={`${fieldClass} mt-1.5`}
        >
          {SCENE_FONT_GROUPS.map((group) => (
            <optgroup key={group.id} label={group.label}>
              {SCENE_FONT_OPTIONS.filter((font) => font.group === group.id).map((font) => (
                <option
                  key={font.label}
                  value={font.value}
                  style={{ fontFamily: sceneFontPreviewFamily(font.value) }}
                >
                  {font.label}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
      </label>

      <label className={labelClass}>
        Size
        <select
          value={proseFontSize}
          onChange={(event) => onProseFontSizeChange(event.target.value)}
          className={`${fieldClass} mt-1.5`}
        >
          {PROSE_FONT_SIZE_OPTIONS.map((size) => (
            <option key={size.label} value={size.value}>
              {size.label}
            </option>
          ))}
        </select>
      </label>

      <label className={labelClass}>
        Tab indent
        <select
          value={tabSize}
          onChange={(event) => onTabSizeChange(event.target.value)}
          className={`${fieldClass} mt-1.5`}
        >
          {TAB_SIZE_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>

      <div className="rounded border border-bronze-dark/40 bg-cream px-3 py-4">
        <p className="mb-2 font-ui text-[10px] uppercase tracking-wide text-ink/45">Preview</p>
        <p
          className="m-0 text-ink"
          style={{
            fontFamily: sceneFontPreviewFamily(proseFont),
            fontSize: proseFontSize,
            textIndent: tabSize,
            lineHeight: 1.6,
          }}
        >
          The rain fell hard on the alley bricks as Spade pushed through the door.
        </p>
      </div>
    </div>
  )
}

export default WritingDefaultsPanel
