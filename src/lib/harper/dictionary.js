import { supabase, writeDb } from '../../clients/supabase'

export async function fetchHarperDictionary() {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user?.id) return []

  const { data, error } = await writeDb
    .from('profiles')
    .select('harper_dictionary')
    .eq('user_id', user.id)
    .maybeSingle()

  if (error) throw error
  return Array.isArray(data?.harper_dictionary) ? data.harper_dictionary : []
}

export async function saveHarperDictionary(words) {
  const unique = [
    ...new Set(
      (words || [])
        .map((w) => (typeof w === 'string' ? w.trim() : ''))
        .filter(Boolean)
    ),
  ].sort((a, b) => a.localeCompare(b))

  const { data, error } = await writeDb.rpc('set_harper_dictionary', {
    words: unique,
  })

  if (error) throw error
  return Array.isArray(data) ? data : unique
}
