import { useEffect, useMemo, useState } from 'react'
import { useReplaceInScenes } from '../../hooks/useReplaceInScenes'
import { useTaleSceneBodies } from '../../hooks/useTaleSceneBodies'
import {
  buildReplacedScenes,
  countScenesInHits,
  findInScenes,
} from '../../lib/editor/findReplace'
import { mergeSceneBodies } from '../../lib/scenes/fetchTaleSceneBodies'
import { formatSceneLabel, sortScenesByRackOrder } from '../../lib/scenes'
import { fieldClass, labelClass } from './referenceStyles'

const checkboxClass = 'size-4 shrink-0 accent-bronze'
const storageKey = (taleId) => `write-knuckles-scene-search:${taleId}`

const readStoredQuery = (taleId) => {
  if (!taleId) return ''
  try {
    const raw = localStorage.getItem(storageKey(taleId))
    if (!raw) return ''
    const parsed = JSON.parse(raw)
    return typeof parsed?.query === 'string' ? parsed.query : ''
  } catch {
    return ''
  }
}

const writeStoredQuery = (taleId, query) => {
  if (!taleId) return
  try {
    const trimmed = query.trim()
    if (trimmed.length < 2) {
      localStorage.removeItem(storageKey(taleId))
      return
    }
    localStorage.setItem(
      storageKey(taleId),
      JSON.stringify({ query, savedAt: Date.now() }),
    )
  } catch {
    // ignore quota / private mode
  }
}

const clearStoredQuery = (taleId) => {
  if (!taleId) return
  try {
    localStorage.removeItem(storageKey(taleId))
  } catch {
    // ignore
  }
}

const sceneLookup = (scenes, sceneId) => scenes.find((s) => s.id === sceneId)

const SceneSearchPanel = ({ taleId, chapters, scenes = [], onOpenScene, onBeforeReplace }) => {
  const [query, setQuery] = useState(() => readStoredQuery(taleId))
  const [matchCase, setMatchCase] = useState(false)
  const [partialMatch, setPartialMatch] = useState(false)
  const [replaceOpen, setReplaceOpen] = useState(false)
  const [replaceWith, setReplaceWith] = useState('')
  const [selectedIds, setSelectedIds] = useState(() => new Set())
  const [error, setError] = useState(null)

  const replaceMutation = useReplaceInScenes(taleId)
  const trimmed = query.trim()
  const showResults = trimmed.length >= 2

  const {
    data: bodies,
    isPending: bodiesPending,
    isError: bodiesError,
    error: bodiesErrorObj,
  } = useTaleSceneBodies(taleId, { enabled: showResults })

  const scenesWithBodies = useMemo(
    () => mergeSceneBodies(scenes, bodies),
    [scenes, bodies],
  )

  const bodiesReady = showResults && !!bodies && !bodiesPending

  const hits = useMemo(() => {
    if (!bodiesReady) return []
    const orderedScenes = sortScenesByRackOrder(scenesWithBodies, chapters)
    return findInScenes(orderedScenes, trimmed, { matchCase, partialMatch })
  }, [bodiesReady, scenesWithBodies, chapters, trimmed, matchCase, partialMatch])

  useEffect(() => {
    setQuery(readStoredQuery(taleId))
    setMatchCase(false)
    setPartialMatch(false)
    setReplaceOpen(false)
    setReplaceWith('')
    setSelectedIds(new Set())
    setError(null)
  }, [taleId])

  useEffect(() => {
    writeStoredQuery(taleId, query)
  }, [taleId, query])

  useEffect(() => {
    setSelectedIds((prev) => {
      if (prev.size === 0) return prev
      const valid = new Set(hits.map((h) => h.id))
      const next = new Set([...prev].filter((id) => valid.has(id)))
      return next.size === prev.size ? prev : next
    })
  }, [hits])

  const handleClear = () => {
    setQuery('')
    setSelectedIds(new Set())
    setError(null)
    clearStoredQuery(taleId)
  }

  const toggleSelected = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const selectAll = () => setSelectedIds(new Set(hits.map((h) => h.id)))
  const selectNone = () => setSelectedIds(new Set())

  const applyReplace = async (hitsToReplace) => {
    if (!hitsToReplace.length) return
    setError(null)
    try {
      await onBeforeReplace?.()
      const scenesById = new Map(scenesWithBodies.map((s) => [s.id, s]))
      const updates = buildReplacedScenes(scenesById, hitsToReplace, replaceWith)
      if (updates.length === 0) return
      await replaceMutation.mutateAsync(updates)
      setSelectedIds((prev) => {
        const removed = new Set(hitsToReplace.map((h) => h.id))
        return new Set([...prev].filter((id) => !removed.has(id)))
      })
    } catch (err) {
      setError(err?.message || 'Replace failed')
    }
  }

  const canClear = query.length > 0
  const sceneCount = countScenesInHits(hits)
  const selectedHits = hits.filter((h) => selectedIds.has(h.id))
  const replacing = replaceMutation.isPending
  const canReplace = replaceOpen && showResults && hits.length > 0 && !replacing && bodiesReady

  return (
    <div className="space-y-4">
      <div>
        <div className="mb-1 flex items-center justify-between gap-3">
          <label htmlFor="scene-search" className={labelClass}>
            Find in tale
          </label>
          {canClear && (
            <button
              type="button"
              onClick={handleClear}
              className="font-ui text-[10px] uppercase tracking-wide text-cream/40 hover:text-bronze"
            >
              Clear search
            </button>
          )}
        </div>
        <input
          id="scene-search"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Find across all scenes…"
          className={fieldClass}
        />
        <div className="mt-2 flex flex-wrap gap-4">
          <label className="flex cursor-pointer items-center gap-2 text-xs text-cream/60">
            <input
              type="checkbox"
              checked={matchCase}
              onChange={(e) => setMatchCase(e.target.checked)}
              className={checkboxClass}
            />
            Match Case
          </label>
          <label className="flex cursor-pointer items-center gap-2 text-xs text-cream/60">
            <input
              type="checkbox"
              checked={partialMatch}
              onChange={(e) => setPartialMatch(e.target.checked)}
              className={checkboxClass}
            />
            Partial Match
          </label>
        </div>
        <p className="mt-1 text-xs text-cream/30">
          Enter at least 2 characters. Literal search on scene prose. Last find is kept for this tale.
        </p>
      </div>

      <div>
        <button
          type="button"
          onClick={() => setReplaceOpen((open) => !open)}
          className="font-ui text-[10px] uppercase tracking-wide text-cream/50 hover:text-bronze"
        >
          {replaceOpen ? 'Hide replace' : 'Replace…'}
        </button>
        {replaceOpen && (
          <div className="mt-2 space-y-3">
            <div>
              <label htmlFor="scene-replace" className={labelClass}>
                Replace with
              </label>
              <input
                id="scene-replace"
                type="text"
                value={replaceWith}
                onChange={(e) => setReplaceWith(e.target.value)}
                placeholder="Replacement text (empty deletes matches)"
                className={fieldClass}
              />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                disabled={!canReplace || selectedHits.length === 0}
                onClick={() => applyReplace(selectedHits)}
                className="rounded border border-bronze-dark/50 px-2.5 py-1 font-ui text-[10px] uppercase tracking-wide text-cream/70 enabled:hover:border-bronze enabled:hover:text-bronze disabled:opacity-40"
              >
                Replace selected
              </button>
              <button
                type="button"
                disabled={!canReplace}
                onClick={() => applyReplace(hits)}
                className="rounded border border-bronze-dark/50 px-2.5 py-1 font-ui text-[10px] uppercase tracking-wide text-cream/70 enabled:hover:border-bronze enabled:hover:text-bronze disabled:opacity-40"
              >
                Replace all
              </button>
              <button
                type="button"
                disabled={!hits.length}
                onClick={selectAll}
                className="font-ui text-[10px] uppercase tracking-wide text-cream/40 hover:text-bronze disabled:opacity-40"
              >
                Select all
              </button>
              <button
                type="button"
                disabled={selectedIds.size === 0}
                onClick={selectNone}
                className="font-ui text-[10px] uppercase tracking-wide text-cream/40 hover:text-bronze disabled:opacity-40"
              >
                Select none
              </button>
            </div>
          </div>
        )}
      </div>

      {error && <p className="text-sm text-red-400/90">{error}</p>}
      {replacing && <p className="text-sm text-cream/40">Replacing…</p>}

      {showResults && bodiesPending && (
        <p className="text-sm text-cream/40">Loading scene text for search…</p>
      )}

      {showResults && bodiesError && (
        <p className="text-sm text-red-400/90">
          {bodiesErrorObj?.message || 'Could not load scene text for search.'}
        </p>
      )}

      {showResults && bodiesReady && (
        <div className="space-y-2">
          {hits.length === 0 ? (
            <p className="text-sm italic text-cream/30">No matches for that query.</p>
          ) : (
            <p className="text-xs text-cream/40">
              {hits.length} match{hits.length === 1 ? '' : 'es'} in {sceneCount} scene
              {sceneCount === 1 ? '' : 's'}
            </p>
          )}
          {hits.map((hit) => {
            const scene = sceneLookup(scenesWithBodies, hit.sceneId)
            const label = scene ? formatSceneLabel(scene, chapters) : 'Unknown scene'
            return (
              <div
                key={hit.id}
                className="rounded border border-bronze-dark/40 bg-surface/30 p-3"
              >
                <div className="flex items-start gap-3">
                  {replaceOpen && (
                    <input
                      type="checkbox"
                      checked={selectedIds.has(hit.id)}
                      onChange={() => toggleSelected(hit.id)}
                      className={`${checkboxClass} mt-0.5`}
                      aria-label={`Select match in ${label}`}
                    />
                  )}
                  <div className="min-w-0 flex-1">
                    <button
                      type="button"
                      onClick={() => onOpenScene(hit.sceneId)}
                      className="w-full text-left"
                    >
                      <div className="font-ui text-sm font-medium text-bronze">{label}</div>
                      <p className="mt-1 text-xs leading-relaxed text-cream/60">
                        <span>{hit.before}</span>
                        <mark className="rounded-sm bg-bronze/30 px-0.5 text-cream">{hit.matchText}</mark>
                        <span>{hit.after}</span>
                      </p>
                    </button>
                    {replaceOpen && (
                      <button
                        type="button"
                        disabled={!canReplace}
                        onClick={() => applyReplace([hit])}
                        className="mt-2 font-ui text-[10px] uppercase tracking-wide text-cream/40 enabled:hover:text-bronze disabled:opacity-40"
                      >
                        Replace
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default SceneSearchPanel
