import { useMemo, useRef, useState } from 'react'
import { useHarperDictionary } from '../../hooks/useHarperDictionary'
import { confirmAction } from '../../lib/confirmAction'
import {
  DICTIONARY_JUMP_KEYS,
  groupDictionaryWords,
} from '../../lib/harper/dictionaryIndex'
import { clearAllIgnoredLints } from '../../lib/harper/ignoredLints'
import { countIgnoredLints } from '../../lib/harper/prefs'

const DictionaryList = ({ taleId }) => {
  const { words, isLoading, error, removeWord } = useHarperDictionary(taleId)
  const [ignoredCount, setIgnoredCount] = useState(countIgnoredLints)
  const [clearError, setClearError] = useState(null)
  const [isClearing, setIsClearing] = useState(false)
  const groupRefs = useRef({})

  const groups = useMemo(() => groupDictionaryWords(words), [words])
  const availableKeys = useMemo(
    () => new Set(groups.map((group) => group.key)),
    [groups]
  )

  const jumpTo = (key) => {
    groupRefs.current[key]?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const handleClearIgnored = async () => {
    if (ignoredCount === 0 || isClearing) return
    const confirmed = await confirmAction({
      message: `Clear all ${ignoredCount} ignored proofreading issue${ignoredCount === 1 ? '' : 's'} from this browser?`,
      confirmLabel: 'Clear ignores',
      destructive: true,
    })
    if (!confirmed) return

    setIsClearing(true)
    setClearError(null)
    try {
      await clearAllIgnoredLints()
      setIgnoredCount(0)
    } catch (err) {
      setClearError(err?.message || 'Could not clear ignored issues.')
    } finally {
      setIsClearing(false)
    }
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <div className="flex shrink-0 flex-col gap-4 border-b border-bronze-dark/30 pb-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="font-display text-xl text-cream">Tale dictionary</h2>
          <p className="mt-1 text-sm text-cream/50">
            {words.length} custom word{words.length === 1 ? '' : 's'} accepted by the proofreader
            in this tale.
          </p>
        </div>
        <div className="sm:text-right">
          <button
            type="button"
            onClick={handleClearIgnored}
            disabled={ignoredCount === 0 || isClearing}
            className="font-ui text-xs uppercase text-error hover:text-cream disabled:cursor-not-allowed disabled:opacity-40"
          >
            {isClearing ? 'Clearing…' : `Clear all ignored issues (${ignoredCount})`}
          </button>
          <p className="mt-1 max-w-sm text-xs text-cream/35">
            Ignored issues are shared across all tales in this browser.
          </p>
          {clearError && (
            <p className="mt-2 text-xs text-error" role="alert">{clearError}</p>
          )}
        </div>
      </div>

      <nav
        className="flex shrink-0 flex-wrap gap-1 border-b border-bronze-dark/20 py-3"
        aria-label="Dictionary alphabet"
      >
        {DICTIONARY_JUMP_KEYS.map((key) => {
          const available = availableKeys.has(key)
          return (
            <button
              key={key}
              type="button"
              onClick={() => jumpTo(key)}
              disabled={!available}
              className="h-7 min-w-7 px-1 font-ui text-xs text-bronze hover:bg-bronze/20 hover:text-cream disabled:cursor-default disabled:text-cream/20 disabled:hover:bg-transparent"
              aria-label={available ? `Jump to ${key}` : `No words under ${key}`}
            >
              {key}
            </button>
          )
        })}
      </nav>

      <div className="min-h-0 flex-1 overflow-y-auto py-4 pr-2">
        {isLoading ? (
          <p className="py-12 text-center text-sm italic text-cream/30">
            Loading dictionary…
          </p>
        ) : error ? (
          <p className="py-12 text-center text-sm text-error" role="alert">
            {error.message || 'Could not load the tale dictionary.'}
          </p>
        ) : groups.length === 0 ? (
          <p className="py-12 text-center text-sm italic text-cream/30">
            No custom words yet. Add one from a spelling suggestion in the editor.
          </p>
        ) : (
          <div className="space-y-6">
            {groups.map((group) => (
              <section
                key={group.key}
                id={`dictionary-${group.key === '#' ? 'other' : group.key.toLowerCase()}`}
                ref={(node) => {
                  groupRefs.current[group.key] = node
                }}
                className="scroll-mt-4"
                aria-labelledby={`dictionary-heading-${group.key === '#' ? 'other' : group.key.toLowerCase()}`}
              >
                <h3
                  id={`dictionary-heading-${group.key === '#' ? 'other' : group.key.toLowerCase()}`}
                  className="sticky top-0 border-b border-bronze-dark/30 bg-ink py-2 font-display text-lg text-bronze"
                >
                  {group.key}
                </h3>
                <ul className="divide-y divide-bronze-dark/20">
                  {group.words.map((word) => {
                    const removing = removeWord.isPending && removeWord.variables === word
                    return (
                      <li key={word} className="flex items-center justify-between gap-4 py-3">
                        <span className="min-w-0 break-words text-sm text-cream">{word}</span>
                        <button
                          type="button"
                          onClick={() => removeWord.mutate(word)}
                          disabled={removeWord.isPending}
                          className="shrink-0 font-ui text-xs uppercase text-cream/40 hover:text-error disabled:opacity-40"
                          aria-label={`Remove ${word} from this tale's dictionary`}
                        >
                          {removing ? 'Removing…' : 'Remove'}
                        </button>
                      </li>
                    )
                  })}
                </ul>
              </section>
            ))}
          </div>
        )}

        {removeWord.error && (
          <p className="mt-4 text-sm text-error" role="alert">
            {removeWord.error.message || 'Could not remove the dictionary word.'}
          </p>
        )}
      </div>
    </div>
  )
}

export default DictionaryList
