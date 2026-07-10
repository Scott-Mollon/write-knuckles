import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { writeDb } from '../clients/supabase'
import { useAuth } from '../contexts/AuthContext'

const QUERY_KEY = ['feature-requests']

export const useFeatureRequests = () => {
  const { isSignedIn } = useAuth()

  return useQuery({
    queryKey: QUERY_KEY,
    queryFn: async () => {
      const { data, error } = await writeDb.rpc('list_feature_requests')
      if (error) throw error
      return data
    },
    enabled: isSignedIn(),
  })
}

export const useCreateFeatureRequest = () => {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: async ({ title, description }) => {
      const { data, error } = await writeDb
        .from('feature_requests')
        .insert({
          title: title.trim(),
          description: description.trim(),
          created_by: user.id,
        })
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
    },
  })
}

export const useToggleFeatureRequestVote = () => {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: async ({ featureRequestId, userHasVoted }) => {
      if (userHasVoted) {
        const { error } = await writeDb
          .from('feature_request_votes')
          .delete()
          .eq('feature_request_id', featureRequestId)
          .eq('user_id', user.id)

        if (error) throw error
        return
      }

      const { error } = await writeDb
        .from('feature_request_votes')
        .insert({
          feature_request_id: featureRequestId,
          user_id: user.id,
        })

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
    },
  })
}

export const useUpdateFeatureRequest = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, title, description }) => {
      const { data, error } = await writeDb
        .from('feature_requests')
        .update({
          title: title.trim(),
          description: description.trim(),
        })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
    },
  })
}

export const useDeleteFeatureRequest = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id) => {
      const { error } = await writeDb
        .from('feature_requests')
        .delete()
        .eq('id', id)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
    },
  })
}

export const useMergeFeatureRequests = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ sourceId, targetId }) => {
      const { error } = await writeDb.rpc('merge_feature_requests', {
        p_source_id: sourceId,
        p_target_id: targetId,
      })

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
    },
  })
}
