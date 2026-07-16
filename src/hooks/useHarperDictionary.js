import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '../contexts/AuthContext'
import { fetchHarperDictionary, saveHarperDictionary } from '../lib/harper/dictionary'

const dictionaryQueryKey = (taleId) => ['harper-dictionary', taleId]

export function useHarperDictionary(taleId) {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const queryKey = dictionaryQueryKey(taleId)

  const query = useQuery({
    queryKey,
    queryFn: () => fetchHarperDictionary(taleId),
    enabled: !!user?.id && !!taleId,
    staleTime: 0,
  })

  const removeWord = useMutation({
    mutationFn: async (word) => {
      const current = queryClient.getQueryData(queryKey) || []
      const remaining = current.filter((entry) => entry !== word)
      return saveHarperDictionary(taleId, remaining)
    },
    onSuccess: (words) => {
      queryClient.setQueryData(queryKey, words)
    },
  })

  return {
    ...query,
    words: query.data || [],
    removeWord,
  }
}
