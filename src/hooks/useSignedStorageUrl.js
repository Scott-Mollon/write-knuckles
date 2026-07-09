import { useQuery } from '@tanstack/react-query'
import { createSignedStorageUrl } from '../lib/images/storage'
import { SIGNED_URL_STALE_MS, SIGNED_URL_TTL_SECONDS } from '../lib/images/constants'

export function useSignedStorageUrl(storagePath) {
  return useQuery({
    queryKey: ['signed-storage-url', storagePath],
    queryFn: () => createSignedStorageUrl(storagePath, SIGNED_URL_TTL_SECONDS),
    enabled: !!storagePath,
    staleTime: SIGNED_URL_STALE_MS,
    gcTime: SIGNED_URL_STALE_MS,
    retry: 1,
  })
}
