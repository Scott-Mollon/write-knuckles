import {
  COMPILE_TEXT_ALIGN_OPTIONS,
  COMPILE_TEXT_COLORS,
  COMPILE_TEXT_FONT_GROUPS,
  COMPILE_TEXT_FONT_OPTIONS,
  COMPILE_TEXT_FONT_SIZE_OPTIONS,
} from '../../constants/compile.js'
import { toHexColorForInput } from '../../lib/compile/compileTextStyle.js'
import { sceneFontPreviewFamily } from '../../constants/sceneFonts.js'

const selectClass = 'w-full border border-bronze-dark/50 bg-ink px-2 py-1 text-cream'
const checkboxClass = 'size-4 shrink-0 accent-bronze'

const CompileTextStyleFields = ({ label, style, onChange }) => {
  const update = (patch) => onChange({ ...style, ...patch })
  const colorPickerValue = toHexColorForInput(style.color, COMPILE_TEXT_COLORS.text)

  return (
    <div className="ml-6 space-y-3 rounded border border-bronze-dark/20 bg-ink/40 p-3">
      <p className="font-ui text-[10px] uppercase tracking-wide text-cream/55">{label} formatting</p>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <label className="flex flex-col gap-1 font-ui text-xs uppercase text-cream/70">
          Font
          <select
            value={style.font}
            onChange={(e) => update({ font: e.target.value })}
            className={selectClass}
          >
            {COMPILE_TEXT_FONT_GROUPS.map((group) => (
              <optgroup key={group.id} label={group.label}>
                {COMPILE_TEXT_FONT_OPTIONS.filter((font) => font.group === group.id).map((font) => (
                  <option
                    key={`${group.id}-${font.label}`}
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

        <label className="flex flex-col gap-1 font-ui text-xs uppercase text-cream/70">
          Font size
          <select
            value={style.fontSizePt}
            onChange={(e) => update({ fontSizePt: Number(e.target.value) })}
            className={selectClass}
          >
            {COMPILE_TEXT_FONT_SIZE_OPTIONS.map((size) => (
              <option key={size} value={size}>
                {size} pt
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1 font-ui text-xs uppercase text-cream/70">
          Align
          <select
            value={style.align}
            onChange={(e) => update({ align: e.target.value })}
            className={selectClass}
          >
            {COMPILE_TEXT_ALIGN_OPTIONS.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1 font-ui text-xs uppercase text-cream/70">
          Color
          <input
            type="color"
            value={colorPickerValue}
            onChange={(e) => update({ color: e.target.value })}
            className="h-[34px] w-full cursor-pointer border border-bronze-dark/50 bg-ink p-1"
          />
        </label>
      </div>

      <div className="flex flex-wrap gap-4">
        <label className="flex items-center gap-2 text-sm text-cream/80">
          <input
            type="checkbox"
            checked={Boolean(style.bold)}
            onChange={(e) => update({ bold: e.target.checked })}
            className={checkboxClass}
          />
          Bold
        </label>
        <label className="flex items-center gap-2 text-sm text-cream/80">
          <input
            type="checkbox"
            checked={Boolean(style.italic)}
            onChange={(e) => update({ italic: e.target.checked })}
            className={checkboxClass}
          />
          Italic
        </label>
        <label className="flex items-center gap-2 text-sm text-cream/80">
          <input
            type="checkbox"
            checked={Boolean(style.underline)}
            onChange={(e) => update({ underline: e.target.checked })}
            className={checkboxClass}
          />
          Underline
        </label>
      </div>
    </div>
  )
}

export default CompileTextStyleFields
