import { useQuery } from '@tanstack/react-query'
import { writeDb } from '../clients/supabase'
import { useAuth } from '../contexts/AuthContext'

export const useAdminUsageStats = () => {
  const { admin } = useAuth()

  return useQuery({
    queryKey: ['admin-usage-stats'],
    queryFn: async () => {
      const { data, error } = await writeDb.rpc('admin_usage_stats')
      if (error) throw error
      return Array.isArray(data) ? data[0] ?? null : data
    },
    enabled: !!admin,
  })
}
