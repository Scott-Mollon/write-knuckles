import { useEffect, useMemo, useState } from 'react'
import {
  buildDefaultScope,
  countScopedScenes,
  COMPILE_OPTION_DEFS,
  isCompileOptionVisible,
} from '../../constants/compile.js'
import { buildManuscriptModel, manuscriptHasContent } from '../../lib/compile/buildManuscriptModel.js'
import { validateCompileOptions } from '../../lib/compile/chapterHeading.js'
import {
  readTaleCompilePreferences,
  writeTaleCompilePreferences,
} from '../../lib/compile/compilePreferences.js'
import { exportCompileHtml } from '../../lib/compile/exportCompileHtml.js'
import { exportTxt } from '../../lib/compile/exportTxt.js'
import { resolveCompileImages } from '../../lib/compile/resolveCompileImages.js'
import { normalizePageLayout } from '../../lib/compile/pageLayout.js'
import { formatChapterLabel } from '../../lib/chapters'
import { taleHasCover } from '../../lib/images/resolveImageUrl'
import CompileViewer from './CompileViewer.jsx'

const checkboxClass = 'size-4 shrink-0 accent-bronze'

const CompileScopePicker = ({ chapters, scope, onChange }) => {
  const sortedChapters = useMemo(
    () => [...chapters].sort((a, b) => a.sort_order - b.sort_order),
    [chapters],
  )

  const sceneIdsSet = useMemo(() => new Set(scope.sceneIds), [scope.sceneIds])
  const chapterIdsSet = useMemo(() => new Set(scope.chapterIds), [scope.chapterIds])

  const isChapterFullySelected = (chapter) =>
    (chapter.scenes || []).length > 0 &&
    (chapter.scenes || []).every((scene) => sceneIdsSet.has(scene.id))

  const isChapterPartiallySelected = (chapter) => {
    const scenes = chapter.scenes || []
    if (!scenes.length) return false
    const selected = scenes.filter((scene) => sceneIdsSet.has(scene.id)).length
    return selected > 0 && selected < scenes.length
  }

  const toggleChapter = (chapter) => {
    const sceneIds = (chapter.scenes || []).map((s) => s.id)
    const fullySelected = isChapterFullySelected(chapter)

    if (fullySelected) {
      onChange({
        chapterIds: scope.chapterIds.filter((id) => id !== chapter.id),
        sceneIds: scope.sceneIds.filter((id) => !sceneIds.includes(id)),
      })
      return
    }

    onChange({
      chapterIds: [...new Set([...scope.chapterIds, chapter.id])],
      sceneIds: [...new Set([...scope.sceneIds, ...sceneIds])],
    })
  }

  const toggleScene = (chapter, sceneId) => {
    const hasScene = sceneIdsSet.has(sceneId)
    const nextSceneIds = hasScene
      ? scope.sceneIds.filter((id) => id !== sceneId)
      : [...scope.sceneIds, sceneId]

    const chapterSceneIds = (chapter.scenes || []).map((s) => s.id)
    const anySceneSelected = chapterSceneIds.some((id) => nextSceneIds.includes(id))
    const nextChapterIds = anySceneSelected
      ? [...new Set([...scope.chapterIds, chapter.id])]
      : scope.chapterIds.filter((id) => id !== chapter.id)

    onChange({ chapterIds: nextChapterIds, sceneIds: nextSceneIds })
  }

  const selectAll = () => onChange(buildDefaultScope(chapters))
  const clearAll = () => onChange({ chapterIds: [], sceneIds: [] })

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <p className="font-ui text-xs uppercase text-cream/80">Chapters &amp; scenes</p>
        <div className="flex gap-2 text-xs">
          <button type="button" onClick={selectAll} className="text-bronze hover:underline">
            Select all
          </button>
          <button type="button" onClick={clearAll} className="text-cream/50 hover:text-cream">
            Clear
          </button>
        </div>
      </div>

      <div className="max-h-48 space-y-2 overflow-y-auto rounded border border-bronze-dark/30 p-3">
        {sortedChapters.map((chapter, chapterIndex) => (
          <div key={chapter.id} className="space-y-1">
            <label className="flex cursor-pointer items-center gap-2 text-sm text-cream">
              <input
                type="checkbox"
                checked={chapterIdsSet.has(chapter.id) && isChapterFullySelected(chapter)}
                ref={(el) => {
                  if (el) el.indeterminate = isChapterPartiallySelected(chapter)
                }}
                onChange={() => toggleChapter(chapter)}
                className={checkboxClass}
              />
              <span>{formatChapterLabel(chapter, chapterIndex)}</span>
            </label>
            <div className="ml-6 space-y-1">
              {(chapter.scenes || [])
                .sort((a, b) => a.sort_order - b.sort_order)
                .map((scene) => (
                  <label key={scene.id} className="flex cursor-pointer items-center gap-2 text-xs text-cream/70">
                    <input
                      type="checkbox"
                      checked={sceneIdsSet.has(scene.id)}
                      onChange={() => toggleScene(chapter, scene.id)}
                      className={checkboxClass}
                    />
                    <span>{scene.title}</span>
                  </label>
                ))}
            </div>
          </div>
        ))}
      </div>
      <p className="text-xs text-cream/50">
        {countScopedScenes(scope, chapters)} scene{countScopedScenes(scope, chapters) === 1 ? '' : 's'} selected
      </p>
    </div>
  )
}

const TaleCompileModal = ({ tale, taleId, chapters, onClose, onBeforeCompile }) => {
  const [options, setOptions] = useState(() => readTaleCompilePreferences(taleId).options)
  const [pageLayout, setPageLayout] = useState(() => readTaleCompilePreferences(taleId).pageLayout)
  const [scope, setScope] = useState(() => buildDefaultScope(chapters))
  const [error, setError] = useState(null)
  const [isCompiling, setIsCompiling] = useState(false)
  const [compileResult, setCompileResult] = useState(null)

  useEffect(() => {
    const prefs = readTaleCompilePreferences(taleId)
    setOptions(prefs.options)
    setPageLayout(prefs.pageLayout)
  }, [taleId])

  useEffect(() => {
    writeTaleCompilePreferences(taleId, { options, pageLayout })
  }, [taleId, options, pageLayout])

  useEffect(() => {
    setScope(buildDefaultScope(chapters))
  }, [chapters])

  const compileOptionContext = useMemo(
    () => ({ taleHasCover: taleHasCover(tale) }),
    [tale],
  )

  const visibleOptions = COMPILE_OPTION_DEFS.filter((def) =>
    isCompileOptionVisible(def.key, options, compileOptionContext),
  )

  const toggleOption = (key) => {
    setOptions((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const handleCompile = async () => {
    setError(null)

    const optionsError = validateCompileOptions(options)
    if (optionsError) {
      setError(optionsError)
      return
    }

    if (scope.chapterIds.length === 0 || scope.sceneIds.length === 0) {
      setError('Select at least one chapter and one scene to compile.')
      return
    }

    setIsCompiling(true)

    try {
      if (onBeforeCompile) await onBeforeCompile()

      const model = buildManuscriptModel({ tale, chapters, options, scope })

      if (!manuscriptHasContent(model)) {
        setError('Nothing to compile in the selected scope.')
        return
      }

      const images = await resolveCompileImages({ tale, manuscript: model, options })
      const html = exportCompileHtml(model, options, images, { pageLayout: normalizePageLayout(pageLayout) })
      const txt = exportTxt(model, options)

      setCompileResult({
        title: tale?.title || 'Compile',
        html,
        txt,
        pageLayout: normalizePageLayout(pageLayout),
        model,
        options,
        images,
      })
    } catch (err) {
      setError(err.message || 'Compile failed.')
    } finally {
      setIsCompiling(false)
    }
  }

  if (compileResult) {
    return (
      <CompileViewer
        title={compileResult.title}
        html={compileResult.html}
        txt={compileResult.txt}
        pageLayout={compileResult.pageLayout}
        model={compileResult.model}
        options={compileResult.options}
        images={compileResult.images}
        onPageLayoutChange={setPageLayout}
        onClose={() => setCompileResult(null)}
      />
    )
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      role="presentation"
    >
      <div
        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded border border-bronze-dark/50 bg-ink p-6 shadow-xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="tale-compile-title"
      >
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h2 id="tale-compile-title" className="font-ui text-xl uppercase tracking-wide text-bronze">
              Compile Tale
            </h2>
            <p className="mt-1 text-sm text-cream/60">
              {tale?.title} — build a paginated manuscript preview from your selected scenes.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-cream/50 hover:text-bronze"
            aria-label="Close compile"
          >
            ×
          </button>
        </div>

        <div className="space-y-6">
          <section className="space-y-4 rounded border border-bronze-dark/30 p-4">
            <CompileScopePicker chapters={chapters} scope={scope} onChange={setScope} />

            <div>
              <p className="mb-2 font-ui text-xs uppercase text-cream/80">Options</p>
              <div className="space-y-2">
                {visibleOptions.map((def) => (
                  <label key={def.key} className="flex cursor-pointer items-center gap-2 text-sm text-cream/80">
                    <input
                      type="checkbox"
                      checked={Boolean(options[def.key])}
                      onChange={() => toggleOption(def.key)}
                      className={checkboxClass}
                    />
                    {def.label}
                  </label>
                ))}
              </div>
            </div>

            <p className="text-xs text-cream/45">
              Compile opens a paginated HTML preview. Download plain text or HTML, or print to PDF from there.
            </p>

            {error && <p className="text-sm text-error">{error}</p>}

            <button
              type="button"
              onClick={handleCompile}
              disabled={isCompiling}
              className="border-2 border-bronze-dark px-6 py-2 font-ui text-sm uppercase text-bronze hover:border-bronze disabled:opacity-50"
            >
              {isCompiling ? 'Compiling…' : 'Compile'}
            </button>
          </section>
        </div>
      </div>
    </div>
  )
}

export default TaleCompileModal
