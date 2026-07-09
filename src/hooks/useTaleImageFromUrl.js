import { useMutation } from '@tanstack/react-query'
import { probeImageUrl, validateImageUrl } from '../lib/images/urls'

/**
 * Validate and probe an external image URL. Metadata persistence lands in
 * later steps — this returns the normalized URL only.
 */
export function useTaleImageFromUrl() {
  return useMutation({
    mutationFn: async ({ url, taleId, scope, entityId }) => {
      const validation = validateImageUrl(url)
      if (!validation.valid) {
        throw new Error(validation.error)
      }

      const probedUrl = await probeImageUrl(validation.url)

      return {
        sourceType: 'url',
        externalUrl: probedUrl,
        taleId,
        scope,
        entityId,
      }
    },
  })
}
