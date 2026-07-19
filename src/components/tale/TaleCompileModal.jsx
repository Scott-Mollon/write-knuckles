import { useCallback, useEffect, useMemo, useState } from 'react'
import { buildDefaultScope, countScopedScenes } from '../../constants/compile.js'
import { buildManuscriptModel, manuscriptHasContent } from '../../lib/compile/buildManuscriptModel.js'
import { validateCompileOptions } from '../../lib/compile/chapterHeading.js'
import { getTaleCompilePreferences } from '../../lib/compile/compilePreferences.js'
import { exportCompileHtml } from '../../lib/compile/exportCompileHtml.js'
import { exportTxt } from '../../lib/compile/exportTxt.js'
import { resolveCompileImages } from '../../lib/compile/resolveCompileImages.js'
import { normalizePageLayout } from '../../lib/compile/pageLayout.js'
import {
  fetchTaleSceneBodies,
  mergeSceneBodiesIntoChapters,
} from '../../lib/scenes/fetchTaleSceneBodies.js'
import { useTale } from '../../hooks/useTales'
import { formatChapterLabel } from '../../lib/chapters'
import { getTaleTerminology } from '../../lib/taleTerminology'
import CompileViewer from './CompileViewer.jsx'
import TaleSettingsModal from './TaleSettingsModal.jsx'

const checkboxClass = 'size-4 shrink-0 accent-bronze'

const CompileScopePicker = ({ chapters, scope, onChange, tale }) => {
  const terms = getTaleTerminology(tale)
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
  const selectedCount = countScopedScenes(scope, chapters)
  const selectedUnit =
    selectedCount === 1 ? terms.scene.toLowerCase() : terms.scenePlural.toLowerCase()

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <p className="font-ui text-xs uppercase text-cream/80">
          {terms.chapterPlural} &amp; {terms.scenePlural.toLowerCase()}
        </p>
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
              <span>{formatChapterLabel(chapter, chapterIndex, tale)}</span>
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
        {selectedCount} {selectedUnit} selected
      </p>
    </div>
  )
}

const TaleCompileModal = ({ tale, taleId, chapters, onClose, onBeforeCompile }) => {
  const { data: taleRecord } = useTale(taleId)
  const taleForCompile = taleRecord || tale
  const terms = getTaleTerminology(taleForCompile)

  const [scope, setScope] = useState(() => buildDefaultScope(chapters))
  const [error, setError] = useState(null)
  const [isCompiling, setIsCompiling] = useState(false)
  const [compileResult, setCompileResult] = useState(null)
  const [compileRevision, setCompileRevision] = useState(0)
  const [compileSettingsOpen, setCompileSettingsOpen] = useState(false)

  useEffect(() => {
    setScope(buildDefaultScope(chapters))
  }, [chapters])

  const runCompile = useCallback(
    async ({ scope: compileScope, compilePreferences } = {}) => {
      const prefs = compilePreferences ?? getTaleCompilePreferences(taleForCompile, taleId)
      const options = prefs.options
      const pageLayout = normalizePageLayout(prefs.pageLayout)
      const activeScope = compileScope || scope

      const optionsError = validateCompileOptions(options)
      if (optionsError) {
        setError(optionsError)
        return null
      }

      if (activeScope.chapterIds.length === 0 || activeScope.sceneIds.length === 0) {
        setError(
          `Select at least one ${terms.chapter.toLowerCase()} and one ${terms.scene.toLowerCase()} to compile.`,
        )
        return null
      }

      if (onBeforeCompile) await onBeforeCompile()

      const bodies = await fetchTaleSceneBodies(taleId, {
        sceneIds: activeScope.sceneIds,
      })
      const chaptersWithBodies = mergeSceneBodiesIntoChapters(chapters, bodies)

      const model = buildManuscriptModel({
        tale: taleForCompile,
        chapters: chaptersWithBodies,
        options,
        scope: activeScope,
      })

      if (!manuscriptHasContent(model)) {
        setError('Nothing to compile in the selected scope.')
        return null
      }

      const images = await resolveCompileImages({ tale: taleForCompile, manuscript: model, options })
      const html = exportCompileHtml(model, options, images, { pageLayout })
      const txt = exportTxt(model, options)

      return {
        title: taleForCompile?.title || 'Compile',
        html,
        txt,
        pageLayout,
        model,
        options,
        images,
        scope: activeScope,
      }
    },
    [taleForCompile, taleId, chapters, scope, onBeforeCompile, terms.chapter, terms.scene],
  )

  const handleCompile = async () => {
    setError(null)
    setIsCompiling(true)

    try {
      const result = await runCompile()
      if (result) {
        setCompileRevision((revision) => revision + 1)
        setCompileResult(result)
      }
    } catch (err) {
      setError(err.message || 'Compile failed.')
    } finally {
      setIsCompiling(false)
    }
  }

  const handleRecompile = async (savedPrefs) => {
    if (!compileResult) return

    setError(null)
    setIsCompiling(true)

    try {
      const result = await runCompile({
        scope: compileResult.scope,
        compilePreferences: savedPrefs,
      })
      if (result) {
        setCompileRevision((revision) => revision + 1)
        setCompileResult(result)
      }
    } catch (err) {
      setError(err.message || 'Recompile failed.')
    } finally {
      setIsCompiling(false)
    }
  }

  if (compileResult) {
    return (
      <>
        <CompileViewer
          taleId={taleId}
          title={compileResult.title}
          html={compileResult.html}
          txt={compileResult.txt}
          pageLayout={compileResult.pageLayout}
          model={compileResult.model}
          options={compileResult.options}
          images={compileResult.images}
          contentRevision={compileRevision}
          isRecompiling={isCompiling}
          onOpenCompileSettings={() => setCompileSettingsOpen(true)}
          onClose={() => setCompileResult(null)}
        />

        {compileSettingsOpen && (
          <TaleSettingsModal
            tale={taleForCompile}
            taleId={taleId}
            hasBeats={false}
            hasBeatLinks={false}
            variant="compile-only"
            initialTab="compile"
            onClose={() => setCompileSettingsOpen(false)}
            onCompilePreferencesSaved={handleRecompile}
          />
        )}
      </>
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
              {taleForCompile?.title} — choose {terms.scenePlural.toLowerCase()}, then build a
              paginated preview.
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
            <CompileScopePicker
              chapters={chapters}
              scope={scope}
              onChange={setScope}
              tale={taleForCompile}
            />

            <p className="text-xs text-cream/45">
              Content and page layout options are in Tale Settings → Compile Options (or Compile
              settings in the preview). Download or print from the preview.
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
