import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { writeDb } from '../clients/supabase'
import { useAuth } from '../contexts/AuthContext'

export const useApprovedUsers = () => {
  const { admin } = useAuth()

  return useQuery({
    queryKey: ['approved-users'],
    queryFn: async () => {
      const { data, error } = await writeDb
        .from('approved_users')
        .select('*')
        .order('approved_at', { ascending: false })

      if (error) throw error
      return data
    },
    enabled: !!admin,
  })
}

export const useRegisteredUsers = () => {
  const { admin } = useAuth()

  return useQuery({
    queryKey: ['registered-users'],
    queryFn: async () => {
      const { data, error } = await writeDb.rpc('list_registered_users')
      if (error) throw error
      return data
    },
    enabled: !!admin,
  })
}

export const useApproveUser = () => {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: async ({ email, notes, userId }) => {
      const normalizedEmail = email.trim().toLowerCase()
      const { data, error } = await writeDb
        .from('approved_users')
        .insert({
          email: normalizedEmail,
          user_id: userId || null,
          notes: notes?.trim() || null,
          approved_by: user.id,
        })
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['approved-users'] })
    },
  })
}

export const useRevokeUser = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id) => {
      const { error } = await writeDb
        .from('approved_users')
        .update({ revoked_at: new Date().toISOString() })
        .eq('id', id)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['approved-users'] })
    },
  })
}

export const useReapproveUser = () => {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: async ({ id, userId, notes }) => {
      const { error } = await writeDb
        .from('approved_users')
        .update({
          revoked_at: null,
          approved_at: new Date().toISOString(),
          approved_by: user.id,
          user_id: userId ?? undefined,
          notes: notes ?? undefined,
        })
        .eq('id', id)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['approved-users'] })
    },
  })
}

export const useSetUserAccess = () => {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: async ({ email, userId, approval, action }) => {
      if (action === 'revoke' && approval?.id) {
        const { error } = await writeDb
          .from('approved_users')
          .update({ revoked_at: new Date().toISOString() })
          .eq('id', approval.id)
        if (error) throw error
        return
      }

      if (action === 'approve') {
        if (approval?.revoked_at) {
          const { error } = await writeDb
            .from('approved_users')
            .update({
              revoked_at: null,
              approved_at: new Date().toISOString(),
              approved_by: user.id,
              user_id: userId ?? approval.user_id,
            })
            .eq('id', approval.id)
          if (error) throw error
          return
        }

        if (!approval) {
          const { error } = await writeDb.from('approved_users').insert({
            email: email.trim().toLowerCase(),
            user_id: userId || null,
            approved_by: user.id,
          })
          if (error) throw error
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['approved-users'] })
    },
  })
}
