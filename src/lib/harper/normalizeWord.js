/** Typographic apostrophes / primes → ASCII `'`. */
const APOSTROPHE_RE = /[\u2018\u2019\u201B\u2032\u02BC]/g

/**
 * Normalize a dictionary token so curly apostrophes (O’Shaughnessy) match
 * Harper / plain-text forms that use ASCII apostrophes.
 */
export function normalizeHarperWord(raw) {
  if (typeof raw !== 'string') return ''
  let word = raw.normalize('NFC').trim()
  if (!word) return ''

  word = word.replace(APOSTROPHE_RE, "'")
  // Strip outer punctuation but keep letters, numbers, and ASCII apostrophes.
  word = word.replace(/^[^\p{L}\p{N}']+|[^\p{L}\p{N}']+$/gu, '')
  return word
}

export function harperWordsEqual(a, b) {
  const left = normalizeHarperWord(a).toLowerCase()
  const right = normalizeHarperWord(b).toLowerCase()
  return Boolean(left) && left === right
}

export function isWordInHarperDictionary(word, dictionary) {
  const needle = normalizeHarperWord(word).toLowerCase()
  if (!needle || !Array.isArray(dictionary)) return false
  return dictionary.some((entry) => normalizeHarperWord(entry).toLowerCase() === needle)
}
