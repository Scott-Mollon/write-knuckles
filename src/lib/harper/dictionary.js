import { writeDb } from '../../clients/supabase'
import { normalizeHarperWord } from './normalizeWord'

export { normalizeHarperWord, harperWordsEqual, isWordInHarperDictionary } from './normalizeWord'

export async function fetchHarperDictionary(taleId) {
  if (!taleId) return []

  const { data, error } = await writeDb
    .from('harper_dictionaries')
    .select('words')
    .eq('tale_id', taleId)
    .maybeSingle()

  if (error) throw error
  return Array.isArray(data?.words)
    ? data.words.map(normalizeHarperWord).filter(Boolean)
    : []
}

export async function saveHarperDictionary(taleId, words) {
  if (!taleId) {
    throw new Error('taleId is required to save dictionary')
  }

  const unique = [
    ...new Set(
      (words || [])
        .map((w) => normalizeHarperWord(w))
        .filter(Boolean)
    ),
  ].sort((a, b) => a.localeCompare(b))

  const { data, error } = await writeDb.rpc('set_harper_dictionary', {
    p_tale_id: taleId,
    words: unique,
  })

  if (error) throw error

  const saved = Array.isArray(data) ? data : unique
  return saved.map(normalizeHarperWord).filter(Boolean)
}
