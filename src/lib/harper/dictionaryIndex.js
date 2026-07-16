const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')

export const DICTIONARY_JUMP_KEYS = [...LETTERS, '#']

export function getDictionaryJumpKey(word) {
  const first = String(word || '').trim().charAt(0).toUpperCase()
  return LETTERS.includes(first) ? first : '#'
}

export function groupDictionaryWords(words) {
  const sorted = [...(words || [])].sort((a, b) =>
    a.localeCompare(b, undefined, { sensitivity: 'base' })
  )

  return sorted.reduce((groups, word) => {
    const key = getDictionaryJumpKey(word)
    const group = groups.find((entry) => entry.key === key)
    if (group) {
      group.words.push(word)
    } else {
      groups.push({ key, words: [word] })
    }
    return groups
  }, []).sort(
    (a, b) => DICTIONARY_JUMP_KEYS.indexOf(a.key) - DICTIONARY_JUMP_KEYS.indexOf(b.key)
  )
}
