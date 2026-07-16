import { supabase, writeDb } from '../../clients/supabase'
import { normalizeHarperWord } from './normalizeWord'

export { normalizeHarperWord, harperWordsEqual, isWordInHarperDictionary } from './normalizeWord'

export async function fetchHarperDictionary() {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user?.id) return []

  const { data, error } = await writeDb
    .from('harper_dictionaries')
    .select('words')
    .eq('user_id', user.id)
    .maybeSingle()

  if (error) throw error
  return Array.isArray(data?.words)
    ? data.words.map(normalizeHarperWord).filter(Boolean)
    : []
}

export async function saveHarperDictionary(words) {
  const unique = [
    ...new Set(
      (words || [])
        .map((w) => normalizeHarperWord(w))
        .filter(Boolean)
    ),
  ].sort((a, b) => a.localeCompare(b))

  const { data, error } = await writeDb.rpc('set_harper_dictionary', {
    words: unique,
  })

  if (error) throw error

  const saved = Array.isArray(data) ? data : unique
  return saved.map(normalizeHarperWord).filter(Boolean)
}
