import { useMemo } from 'react'
import {
  COMPILE_OPTION_SECTIONS,
  COMPILE_MARGIN_UNITS,
  COMPILE_PAGE_MARGIN_OPTIONS,
  COMPILE_PAGE_MARGINS,
  COMPILE_PAGE_ORIENTATION_OPTIONS,
  COMPILE_PAGE_SIZE_OPTIONS,
  COMPILE_STYLED_OPTION_CONFIGS,
  DEFAULT_COMPILE_CUSTOM_MARGIN_UNIT,
  isCompileOptionEnabled,
} from '../../constants/compile.js'
import { taleHasCover } from '../../lib/images/resolveImageUrl'
import { getChapterHeadingStyles } from '../../lib/compile/chapterHeadingStyle.js'
import { getPageNumberStyle } from '../../lib/compile/pageNumberStyle.js'
import {
  convertMarginCSSValue,
  marginValueToCSSValue,
  parseMarginValue,
} from '../../lib/compile/pageLayout.js'
import { getTitlePageStyles } from '../../lib/compile/titlePageStyle.js'
import CompileTextStyleFields from './CompileTextStyleFields.jsx'

const checkboxClass = 'size-4 shrink-0 accent-bronze'
const selectClass = 'w-full border border-bronze-dark/50 bg-ink px-2 py-1 text-cream'
const inputClass = 'w-full border border-bronze-dark/50 bg-ink px-2 py-1 text-cream'
const sectionClass = 'space-y-3 border-t border-bronze-dark/30 pt-5 first:border-t-0 first:pt-0'
const sectionTitleClass = 'font-ui text-xs uppercase text-cream/80'

const CUSTOM_MARGIN_SIDES = [
  { key: 'top', label: 'Top' },
  { key: 'right', label: 'Right' },
  { key: 'bottom', label: 'Bottom' },
  { key: 'left', label: 'Left' },
]

const STYLED_SECTION_IDS = new Set(['titlePage', 'document'])

const STYLE_BY_OPTION = Object.fromEntries(
  COMPILE_STYLED_OPTION_CONFIGS.map((item) => [item.optionKey, item]),
)

function getChapterLabelFormattingLabel(options) {
  const parts = []
  if (options.includeChapterWord) parts.push('Word')
  if (options.includeChapterNumber) parts.push('Number')
  if (options.includeChapterTitle && !options.chapterTitleOnOwnLine) parts.push('Title')

  if (parts.length === 0) return 'Chapter'
  if (parts.length === 1) return `Chapter ${parts[0]}`
  if (parts.length === 2) return `Chapter ${parts[0]} & ${parts[1]}`
  return `Chapter ${parts[0]}, ${parts[1]} & ${parts[2]}`
}

const CompileSettingsPanel = ({ tale, options, pageLayout, onOptionsChange, onPageLayoutChange }) => {
  const compileOptionContext = useMemo(
    () => ({ taleHasCover: taleHasCover(tale) }),
    [tale],
  )
  const titlePageStyles = useMemo(() => getTitlePageStyles(options), [options])
  const chapterHeadingStyles = useMemo(() => getChapterHeadingStyles(options), [options])
  const pageNumberStyle = useMemo(() => getPageNumberStyle(options), [options])

  const toggleOption = (key) => {
    onOptionsChange({ ...options, [key]: !options[key] })
  }

  const getStylesForKey = (stylesKey) => {
    if (stylesKey === 'chapterHeadingStyles') return chapterHeadingStyles
    if (stylesKey === 'pageNumberStyle') return pageNumberStyle
    return titlePageStyles
  }

  const updateStyledOption = (stylesKey, styleKey, nextStyle) => {
    const currentStyles = getStylesForKey(stylesKey)
    onOptionsChange({
      ...options,
      [stylesKey]: {
        ...currentStyles,
        [styleKey]: nextStyle,
      },
    })
  }

  const handleMarginPresetChange = (marginPreset) => {
    if (marginPreset === 'custom') {
      const presetValue =
        COMPILE_PAGE_MARGINS[pageLayout.marginPreset] || COMPILE_PAGE_MARGINS.normal
      const unit = pageLayout.customMarginUnit || DEFAULT_COMPILE_CUSTOM_MARGIN_UNIT
      onPageLayoutChange({
        ...pageLayout,
        marginPreset: 'custom',
        customMarginUnit: unit,
        customMargins: {
          top: convertMarginCSSValue(presetValue, unit),
          right: convertMarginCSSValue(presetValue, unit),
          bottom: convertMarginCSSValue(presetValue, unit),
          left: convertMarginCSSValue(presetValue, unit),
        },
      })
      return
    }

    onPageLayoutChange({ ...pageLayout, marginPreset })
  }

  const handleCustomMarginUnitChange = (unit) => {
    const customMargins = {}
    for (const { key } of CUSTOM_MARGIN_SIDES) {
      customMargins[key] = convertMarginCSSValue(pageLayout.customMargins?.[key], unit)
    }

    onPageLayoutChange({
      ...pageLayout,
      customMarginUnit: unit,
      customMargins,
    })
  }

  const handleCustomMarginChange = (side, amount) => {
    const unit = pageLayout.customMarginUnit || DEFAULT_COMPILE_CUSTOM_MARGIN_UNIT
    onPageLayoutChange({
      ...pageLayout,
      customMargins: {
        ...pageLayout.customMargins,
        [side]: marginValueToCSSValue(amount, unit),
      },
    })
  }

  const showChapterLabelFormatting =
    options.includeChapterWord ||
    options.includeChapterNumber ||
    (options.includeChapterTitle && !options.chapterTitleOnOwnLine)

  const renderPlainCompileOption = (def) => {
    const enabled = isCompileOptionEnabled(def.key, options, compileOptionContext)

    return (
      <label
        key={def.key}
        className={`flex items-center gap-2 text-sm ${
          enabled ? 'cursor-pointer text-cream/80' : 'cursor-not-allowed text-cream/40'
        }`}
      >
        <input
          type="checkbox"
          checked={Boolean(options[def.key])}
          onChange={() => toggleOption(def.key)}
          disabled={!enabled}
          className={checkboxClass}
        />
        {def.label}
      </label>
    )
  }

  const renderChapterSection = (section) => (
    <div className="space-y-2">
      {section.options.map((def) => renderPlainCompileOption(def))}

      {showChapterLabelFormatting && (
        <CompileTextStyleFields
          label={getChapterLabelFormattingLabel(options)}
          style={chapterHeadingStyles.label}
          onChange={(nextStyle) => updateStyledOption('chapterHeadingStyles', 'label', nextStyle)}
        />
      )}

      {options.includeChapterTitle && options.chapterTitleOnOwnLine && (
        <CompileTextStyleFields
          label="Chapter title"
          style={chapterHeadingStyles.title}
          onChange={(nextStyle) => updateStyledOption('chapterHeadingStyles', 'title', nextStyle)}
        />
      )}
    </div>
  )

  const renderCompileOption = (def) => {
    const enabled = isCompileOptionEnabled(def.key, options, compileOptionContext)
    const styleMeta = STYLE_BY_OPTION[def.key]

    return (
      <div key={def.key} className="space-y-2">
        <label
          className={`flex items-center gap-2 text-sm ${
            enabled ? 'cursor-pointer text-cream/80' : 'cursor-not-allowed text-cream/40'
          }`}
        >
          <input
            type="checkbox"
            checked={Boolean(options[def.key])}
            onChange={() => toggleOption(def.key)}
            disabled={!enabled}
            className={checkboxClass}
          />
          {def.label}
        </label>

        {styleMeta && options[def.key] && (
          <CompileTextStyleFields
            label={styleMeta.label}
            style={
              styleMeta.flatStyle
                ? getStylesForKey(styleMeta.stylesKey)
                : getStylesForKey(styleMeta.stylesKey)[styleMeta.styleKey]
            }
            onChange={(nextStyle) => {
              if (styleMeta.flatStyle) {
                onOptionsChange({ ...options, [styleMeta.stylesKey]: nextStyle })
                return
              }
              updateStyledOption(styleMeta.stylesKey, styleMeta.styleKey, nextStyle)
            }}
          />
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <section className={sectionClass}>
        <p className={sectionTitleClass}>Page Layout</p>
        <div className="grid gap-4 sm:grid-cols-3">
          <label className="flex flex-col gap-1 font-ui text-xs uppercase text-cream/70">
            Page size
            <select
              value={pageLayout.pageSize}
              onChange={(e) => onPageLayoutChange({ ...pageLayout, pageSize: e.target.value })}
              className={selectClass}
            >
              {COMPILE_PAGE_SIZE_OPTIONS.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.label} ({opt.detail})
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1 font-ui text-xs uppercase text-cream/70">
            Margins
            <select
              value={pageLayout.marginPreset}
              onChange={(e) => handleMarginPresetChange(e.target.value)}
              className={selectClass}
            >
              {COMPILE_PAGE_MARGIN_OPTIONS.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.label} ({opt.detail})
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1 font-ui text-xs uppercase text-cream/70">
            Orientation
            <select
              value={pageLayout.orientation}
              onChange={(e) => onPageLayoutChange({ ...pageLayout, orientation: e.target.value })}
              className={selectClass}
            >
              {COMPILE_PAGE_ORIENTATION_OPTIONS.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        {pageLayout.marginPreset === 'custom' && (
          <div className="space-y-4">
            <label className="flex w-full max-w-xs flex-col gap-1 font-ui text-xs uppercase text-cream/70">
              Margin unit
              <select
                value={pageLayout.customMarginUnit || DEFAULT_COMPILE_CUSTOM_MARGIN_UNIT}
                onChange={(e) => handleCustomMarginUnitChange(e.target.value)}
                className={selectClass}
              >
                {Object.values(COMPILE_MARGIN_UNITS).map((unit) => (
                  <option key={unit} value={unit}>
                    {unit}
                  </option>
                ))}
              </select>
            </label>

            <div className="grid gap-4 sm:grid-cols-4">
              {CUSTOM_MARGIN_SIDES.map(({ key, label }) => {
                const unit = pageLayout.customMarginUnit || DEFAULT_COMPILE_CUSTOM_MARGIN_UNIT
                return (
                  <label
                    key={key}
                    className="flex flex-col gap-1 font-ui text-xs uppercase text-cream/70"
                  >
                    {label}
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="0"
                        step={unit === 'mm' ? 1 : 0.125}
                        value={parseMarginValue(pageLayout.customMargins?.[key], unit)}
                        onChange={(e) => handleCustomMarginChange(key, e.target.value)}
                        className={inputClass}
                      />
                      <span className="shrink-0 text-cream/60">{unit}</span>
                    </div>
                  </label>
                )
              })}
            </div>
          </div>
        )}
      </section>

      {COMPILE_OPTION_SECTIONS.map((section) => (
        <section key={section.id} className={sectionClass}>
          <p className={sectionTitleClass}>{section.label}</p>
          <div className="space-y-2">
            {section.id === 'chapters'
              ? renderChapterSection(section)
              : STYLED_SECTION_IDS.has(section.id)
                ? section.options.map((def) => renderCompileOption(def))
                : section.options.map((def) => renderPlainCompileOption(def))}
          </div>
        </section>
      ))}
    </div>
  )
}

export default CompileSettingsPanel
