import { useMutation } from '@tanstack/react-query'
import { useAuth } from '../contexts/AuthContext'
import { createSignedStorageUrl, uploadTaleImage } from '../lib/images/storage'

/**
 * Upload a file to write-tale-images. Metadata persistence (reference_images,
 * tale cover) is wired in later steps — this returns storage paths only.
 */
export function useTaleImageUpload() {
  const { user } = useAuth()

  return useMutation({
    mutationFn: async ({ taleId, scope, entityId, file }) => {
      if (!user?.id) throw new Error('You must be signed in to upload images.')
      if (!taleId || !scope || !entityId) throw new Error('Missing tale or entity context.')

      const { storagePath } = await uploadTaleImage({
        userId: user.id,
        taleId,
        scope,
        entityId,
        file,
      })

      const signedUrl = await createSignedStorageUrl(storagePath)

      return {
        sourceType: 'upload',
        storagePath,
        signedUrl,
        originalFileName: file.name,
        taleId,
        scope,
        entityId,
      }
    },
  })
}
