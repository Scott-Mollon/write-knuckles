import { useEffect, useMemo } from 'react'
import {
  COMPILE_OPTION_SECTIONS,
  COMPILE_MARGIN_UNITS,
  COMPILE_PAGE_MARGIN_OPTIONS,
  COMPILE_PAGE_MARGINS,
  COMPILE_PAGE_ORIENTATION_OPTIONS,
  COMPILE_PAGE_SIZE_OPTIONS,
  COMPILE_STYLED_OPTION_CONFIGS,
  DEFAULT_COMPILE_CUSTOM_MARGIN_UNIT,
  DEFAULT_COMPILE_OPTIONS,
  isCompileOptionEnabled,
} from '../../constants/compile.js'
import { taleHasCover } from '../../lib/images/resolveImageUrl'
import { getTaleTerminology, isComicTale } from '../../lib/taleTerminology'
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

const COMPILE_STYLE_PREVIEW_TEXT = {
  titlePage: 'The Maltese Falcon',
  includeSubtitle: 'A Detective Story',
  includeAuthor: 'Dashiell Hammett',
  includePageNumbers: '12',
  includeChapterWord: 'Issue',
  includeChapterNumber: '1',
  includeChapterTitle: 'The Opening Gambit',
}

const COMIC_TITLE_PAGE_EXTRA_OPTIONS = [
  { key: 'includeChapterWord', label: 'Include word "Issue"' },
  { key: 'includeChapterNumber', label: 'Include issue number' },
  { key: 'includeChapterTitle', label: 'Include issue title' },
]

function getCompileOptionLabel(def, terms) {
  const chapter = terms.chapterWord
  const chapterLower = chapter.toLowerCase()
  switch (def.key) {
    case 'chapterPageBreak':
      return `Start each ${chapterLower} on a new page`
    case 'includeChapterWord':
      return `Include word "${chapter}"`
    case 'includeChapterNumber':
      return `Include ${chapterLower} number`
    case 'includeChapterTitle':
      return `Include ${chapterLower} title`
    case 'chapterTitleOnOwnLine':
      return `${chapter} title on own line`
    default:
      return def.label
  }
}

function getCompileSectionLabel(section, terms) {
  if (section.id === 'chapters') return terms.chapterPlural
  return section.label
}

function getChapterLabelFormattingLabel(options, chapterWord = 'Chapter') {
  const parts = []
  if (options.includeChapterWord) parts.push('Word')
  if (options.includeChapterNumber) parts.push('Number')
  if (options.includeChapterTitle && !options.chapterTitleOnOwnLine) parts.push('Title')

  if (parts.length === 0) return chapterWord
  if (parts.length === 1) return `${chapterWord} ${parts[0]}`
  if (parts.length === 2) return `${chapterWord} ${parts[0]} & ${parts[1]}`
  return `${chapterWord} ${parts[0]}, ${parts[1]} & ${parts[2]}`
}

function getVisibleCompileSections(comic) {
  return COMPILE_OPTION_SECTIONS.flatMap((section) => {
    if (comic && section.id === 'chapters') return []

    if (comic && section.id === 'document') {
      return [
        {
          ...section,
          options: section.options.filter((def) => def.key !== 'includePageNumbers'),
        },
      ]
    }

    if (comic && section.id === 'titlePage') {
      return [
        {
          ...section,
          options: [...section.options, ...COMIC_TITLE_PAGE_EXTRA_OPTIONS],
        },
      ]
    }

    return [section]
  })
}

const CompileSettingsPanel = ({ tale, options, pageLayout, onOptionsChange, onPageLayoutChange }) => {
  const comic = isComicTale(tale)
  const terms = getTaleTerminology(tale)
  const compileOptionContext = useMemo(
    () => ({ taleHasCover: taleHasCover(tale) }),
    [tale],
  )
  const titlePageStyles = useMemo(() => getTitlePageStyles(options), [options])
  const chapterHeadingStyles = useMemo(() => getChapterHeadingStyles(options), [options])
  const pageNumberStyle = useMemo(() => getPageNumberStyle(options), [options])
  const visibleSections = useMemo(() => getVisibleCompileSections(comic), [comic])

  useEffect(() => {
    if (!comic) return
    onOptionsChange((prev) => {
      if (prev.chapterPageBreak && !prev.includePageNumbers) return prev
      return {
        ...prev,
        chapterPageBreak: true,
        includePageNumbers: false,
      }
    })
  }, [comic, onOptionsChange])

  const toggleOption = (key) => {
    if (comic && key === 'chapterPageBreak') return
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

  const handleResetFormattingDefaults = () => {
    onOptionsChange({
      ...options,
      titlePageStyles: {
        title: { ...DEFAULT_COMPILE_OPTIONS.titlePageStyles.title },
        subtitle: { ...DEFAULT_COMPILE_OPTIONS.titlePageStyles.subtitle },
        author: { ...DEFAULT_COMPILE_OPTIONS.titlePageStyles.author },
        issueWord: { ...DEFAULT_COMPILE_OPTIONS.titlePageStyles.issueWord },
        issueNumber: { ...DEFAULT_COMPILE_OPTIONS.titlePageStyles.issueNumber },
        issueTitle: { ...DEFAULT_COMPILE_OPTIONS.titlePageStyles.issueTitle },
      },
      chapterHeadingStyles: {
        label: { ...DEFAULT_COMPILE_OPTIONS.chapterHeadingStyles.label },
        title: { ...DEFAULT_COMPILE_OPTIONS.chapterHeadingStyles.title },
      },
      pageNumberStyle: { ...DEFAULT_COMPILE_OPTIONS.pageNumberStyle },
    })
  }

  const showChapterLabelFormatting =
    options.includeChapterWord ||
    options.includeChapterNumber ||
    (options.includeChapterTitle && !options.chapterTitleOnOwnLine)

  const renderPlainCompileOption = (def) => {
    const forcedPageBreak = comic && def.key === 'chapterPageBreak'
    const enabled =
      forcedPageBreak ? false : isCompileOptionEnabled(def.key, options, compileOptionContext)

    return (
      <label
        key={def.key}
        className={`flex items-center gap-2 text-sm ${
          enabled && !forcedPageBreak
            ? 'cursor-pointer text-cream/80'
            : 'cursor-not-allowed text-cream/40'
        }`}
      >
        <input
          type="checkbox"
          checked={forcedPageBreak ? true : Boolean(options[def.key])}
          onChange={() => toggleOption(def.key)}
          disabled={!enabled || forcedPageBreak}
          className={checkboxClass}
        />
        {getCompileOptionLabel(def, terms)}
      </label>
    )
  }

  const renderChapterSection = (section) => (
    <div className="space-y-2">
      {section.options.map((def) => renderPlainCompileOption(def))}

      {showChapterLabelFormatting && (
        <CompileTextStyleFields
          label={getChapterLabelFormattingLabel(options, terms.chapterWord)}
          previewText={`${terms.chapterWord} 1`}
          style={chapterHeadingStyles.label}
          onChange={(nextStyle) => updateStyledOption('chapterHeadingStyles', 'label', nextStyle)}
        />
      )}

      {options.includeChapterTitle && options.chapterTitleOnOwnLine && (
        <CompileTextStyleFields
          label={`${terms.chapterWord} title`}
          previewText="The Opening Gambit"
          style={chapterHeadingStyles.title}
          onChange={(nextStyle) => updateStyledOption('chapterHeadingStyles', 'title', nextStyle)}
        />
      )}
    </div>
  )

  const renderCompileOption = (def) => {
    const forcedPageBreak = comic && def.key === 'chapterPageBreak'
    const enabled =
      forcedPageBreak ? false : isCompileOptionEnabled(def.key, options, compileOptionContext)
    const styleMeta = STYLE_BY_OPTION[def.key]

    return (
      <div key={def.key} className="space-y-2">
        <label
          className={`flex items-center gap-2 text-sm ${
            enabled && !forcedPageBreak
              ? 'cursor-pointer text-cream/80'
              : 'cursor-not-allowed text-cream/40'
          }`}
        >
          <input
            type="checkbox"
            checked={forcedPageBreak ? true : Boolean(options[def.key])}
            onChange={() => toggleOption(def.key)}
            disabled={!enabled || forcedPageBreak}
            className={checkboxClass}
          />
          {getCompileOptionLabel(def, terms)}
        </label>

        {styleMeta && !forcedPageBreak && options[def.key] && (
          <CompileTextStyleFields
            label={styleMeta.label}
            previewText={COMPILE_STYLE_PREVIEW_TEXT[def.key] || styleMeta.label}
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
      <div className="flex flex-wrap items-start justify-between gap-3">
        <p className="text-sm text-cream/60">
          Content options and page layout for compiling this tale.
        </p>
        <button
          type="button"
          onClick={handleResetFormattingDefaults}
          className="shrink-0 border border-bronze-dark/50 px-3 py-1.5 font-ui text-xs uppercase tracking-wide text-cream/70 transition hover:border-bronze hover:text-bronze"
          title="Restore title, heading, and page-number text styles to defaults"
        >
          Reset formatting
        </button>
      </div>

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

      {visibleSections.map((section) => (
        <section key={section.id} className={sectionClass}>
          <p className={sectionTitleClass}>{getCompileSectionLabel(section, terms)}</p>
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
