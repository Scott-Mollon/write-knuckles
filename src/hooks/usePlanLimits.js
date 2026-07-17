import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { writeDb } from '../clients/supabase'
import { PLAN_FREE, normalizePlan } from '../constants/account'
import { useAuth } from '../contexts/AuthContext'

export const PLAN_LIMITS_QUERY_KEY = ['plan-limits']

export const usePlanLimits = () => {
  const { user } = useAuth()

  return useQuery({
    queryKey: PLAN_LIMITS_QUERY_KEY,
    queryFn: async () => {
      const { data, error } = await writeDb
        .from('plan_limits')
        .select('plan, max_active_tales, updated_at')
        .order('plan')

      if (error) throw error
      return data ?? []
    },
    enabled: !!user,
    staleTime: 60_000,
  })
}

export const useSetFreeTaleLimit = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (maxActiveTales) => {
      const value = Number(maxActiveTales)
      if (!Number.isInteger(value) || value < 0) {
        throw new Error('Enter a whole number of 0 or greater.')
      }

      const { data, error } = await writeDb
        .from('plan_limits')
        .update({
          max_active_tales: value,
        })
        .eq('plan', PLAN_FREE)
        .select('plan, max_active_tales, updated_at')
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PLAN_LIMITS_QUERY_KEY })
    },
  })
}

/** Convenience: resolve max_active_tales for the signed-in user's plan. */
export const useCurrentPlanTaleLimit = () => {
  const { plan } = useAuth()
  const query = usePlanLimits()
  const normalized = normalizePlan(plan)
  const row = query.data?.find((r) => r.plan === normalized)
  const maxActiveTales = row ? row.max_active_tales : undefined

  return {
    ...query,
    maxActiveTales,
  }
}
