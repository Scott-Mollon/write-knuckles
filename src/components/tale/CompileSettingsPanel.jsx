import { useMemo } from 'react'
import {
  COMPILE_OPTION_SECTIONS,
  COMPILE_PAGE_MARGIN_OPTIONS,
  COMPILE_PAGE_ORIENTATION_OPTIONS,
  COMPILE_PAGE_SIZE_OPTIONS,
  isCompileOptionEnabled,
} from '../../constants/compile.js'
import { taleHasCover } from '../../lib/images/resolveImageUrl'

const checkboxClass = 'size-4 shrink-0 accent-bronze'
const selectClass = 'w-full border border-bronze-dark/50 bg-ink px-2 py-1 text-cream'
const sectionClass = 'space-y-3 border-t border-bronze-dark/30 pt-5 first:border-t-0 first:pt-0'
const sectionTitleClass = 'font-ui text-xs uppercase text-cream/80'

const CompileSettingsPanel = ({ tale, options, pageLayout, onOptionsChange, onPageLayoutChange }) => {
  const compileOptionContext = useMemo(
    () => ({ taleHasCover: taleHasCover(tale) }),
    [tale],
  )

  const toggleOption = (key) => {
    onOptionsChange({ ...options, [key]: !options[key] })
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
              onChange={(e) => onPageLayoutChange({ ...pageLayout, marginPreset: e.target.value })}
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
      </section>

      {COMPILE_OPTION_SECTIONS.map((section) => (
        <section key={section.id} className={sectionClass}>
          <p className={sectionTitleClass}>{section.label}</p>
          <div className="space-y-2">
            {section.options.map((def) => {
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
            })}
          </div>
        </section>
      ))}
    </div>
  )
}

export default CompileSettingsPanel
