import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '../contexts/AuthContext'
import { fetchHarperDictionary, saveHarperDictionary } from '../lib/harper/dictionary'
import { invalidateHarperLinterDictionary } from '../lib/harper/linterDictionary'

export const harperDictionaryQueryKey = (taleId) => ['harper-dictionary', taleId]

export function useHarperDictionary(taleId) {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const queryKey = harperDictionaryQueryKey(taleId)

  const query = useQuery({
    queryKey,
    queryFn: () => fetchHarperDictionary(taleId),
    enabled: !!user?.id && !!taleId,
    // Per-tale dictionary; scene switches remount editors and must not refetch.
    staleTime: 1000 * 60 * 5,
  })

  const removeWord = useMutation({
    mutationFn: async (word) => {
      const current = queryClient.getQueryData(queryKey) || []
      const remaining = current.filter((entry) => entry !== word)
      return saveHarperDictionary(taleId, remaining)
    },
    onSuccess: (words) => {
      queryClient.setQueryData(queryKey, words)
      // Proofreader imports words into a singleton linter — force resync next lint.
      invalidateHarperLinterDictionary()
    },
  })

  return {
    ...query,
    words: query.data || [],
    removeWord,
  }
}
