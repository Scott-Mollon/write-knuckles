import { useEffect, useState } from 'react'
import { useSceneSearch } from '../../hooks/useSceneSearch'
import { formatSceneLabel } from '../../lib/scenes'
import { snippetAroundMatch } from '../../lib/reference'
import { fieldClass, labelClass } from './referenceStyles'

const storageKey = (taleId) => `write-knuckles-scene-search:${taleId}`

const readStoredSearch = (taleId) => {
  if (!taleId) return { query: '', results: [] }
  try {
    const raw = localStorage.getItem(storageKey(taleId))
    if (!raw) return { query: '', results: [] }
    const parsed = JSON.parse(raw)
    return {
      query: typeof parsed?.query === 'string' ? parsed.query : '',
      results: Array.isArray(parsed?.results) ? parsed.results : [],
    }
  } catch {
    return { query: '', results: [] }
  }
}

const writeStoredSearch = (taleId, query, results) => {
  if (!taleId) return
  try {
    const trimmed = query.trim()
    if (trimmed.length < 2) {
      localStorage.removeItem(storageKey(taleId))
      return
    }
    localStorage.setItem(
      storageKey(taleId),
      JSON.stringify({
        query,
        results: Array.isArray(results) ? results : [],
        savedAt: Date.now(),
      }),
    )
  } catch {
    // ignore quota / private mode
  }
}

const clearStoredSearch = (taleId) => {
  if (!taleId) return
  try {
    localStorage.removeItem(storageKey(taleId))
  } catch {
    // ignore
  }
}

const SceneSearchPanel = ({ taleId, chapters, onOpenScene }) => {
  const [stored, setStored] = useState(() => readStoredSearch(taleId))
  const [query, setQuery] = useState(stored.query)
  const { data: liveResults, isFetching, isFetched, isSuccess } = useSceneSearch(taleId, query)
  const trimmed = query.trim()
  const storedMatchesQuery = stored.query.trim() === trimmed && trimmed.length >= 2

  useEffect(() => {
    const next = readStoredSearch(taleId)
    setStored(next)
    setQuery(next.query)
  }, [taleId])

  useEffect(() => {
    if (trimmed.length < 2) {
      setStored({ query: '', results: [] })
      writeStoredSearch(taleId, query, [])
      return
    }

    if (isSuccess && Array.isArray(liveResults)) {
      const next = { query, results: liveResults }
      setStored(next)
      writeStoredSearch(taleId, query, liveResults)
    }
  }, [taleId, query, trimmed, isSuccess, liveResults])

  const handleClear = () => {
    setQuery('')
    setStored({ query: '', results: [] })
    clearStoredSearch(taleId)
  }

  const results =
    isSuccess && Array.isArray(liveResults)
      ? liveResults
      : storedMatchesQuery
        ? stored.results
        : []
  const showResults = trimmed.length >= 2
  const showSearching = isFetching && !(storedMatchesQuery && results.length > 0) && !isFetched
  const canClear = query.length > 0 || stored.results.length > 0

  return (
    <div className="space-y-4">
      <div>
        <div className="mb-1 flex items-center justify-between gap-3">
          <label htmlFor="scene-search" className={labelClass}>
            Search scene text
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
          placeholder="Search prose across all scenes…"
          className={fieldClass}
        />
        <p className="mt-1 text-xs text-cream/30">
          Enter at least 2 characters. Uses full-text search on scene prose. Last search is kept for this tale.
        </p>
      </div>

      {showResults && (
        <div className="space-y-2">
          {showSearching && <p className="text-sm text-cream/40">Searching…</p>}
          {!showSearching && results.length === 0 && (
            <p className="text-sm italic text-cream/30">No scenes match that query.</p>
          )}
          {results.map((scene) => (
            <button
              key={scene.id}
              type="button"
              onClick={() => onOpenScene(scene.id)}
              className="w-full rounded border border-bronze-dark/40 bg-surface/30 p-3 text-left transition hover:border-bronze/50"
            >
              <div className="font-ui text-sm font-medium text-bronze">
                {formatSceneLabel(scene, chapters)}
              </div>
              <p className="mt-1 text-xs text-cream/60">
                {snippetAroundMatch(scene.plain_text, trimmed)}
              </p>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default SceneSearchPanel
