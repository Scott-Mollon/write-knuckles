import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase, writeDb } from '../clients/supabase'
import { useAuth } from '../contexts/AuthContext'
import { deleteExportFile } from '../lib/export/storage'

export const taleExportsQueryKey = (taleId) => ['tale-exports', taleId]

export const useTaleExports = (taleId) => {
  const { user } = useAuth()

  return useQuery({
    queryKey: taleExportsQueryKey(taleId),
    queryFn: async () => {
      const { data, error } = await writeDb
        .from('tale_exports')
        .select('*')
        .eq('tale_id', taleId)
        .eq('status', 'complete')
        .order('created_at', { ascending: false })

      if (error) throw error
      return data
    },
    enabled: !!user?.id && !!taleId,
  })
}

export const useCreateTaleExport = (taleId) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ format, options, scope }) => {
      const { data, error } = await supabase.functions.invoke('tale-export', {
        body: { taleId, format, options, scope },
      })

      if (error) throw error
      if (data?.error) throw new Error(data.error)
      if (!data?.export) throw new Error('Export did not return a file record.')

      return data.export
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: taleExportsQueryKey(taleId) })
    },
  })
}

export const useDeleteTaleExports = (taleId) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (exportsToDelete) => {
      for (const row of exportsToDelete) {
        if (row.storage_path) {
          try {
            await deleteExportFile(row.storage_path)
          } catch {
            // Continue deleting DB rows even if storage cleanup fails
          }
        }
      }

      const ids = exportsToDelete.map((row) => row.id)
      const { error } = await writeDb.from('tale_exports').delete().in('id', ids)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: taleExportsQueryKey(taleId) })
    },
  })
}

export async function fetchTaleExportStoragePaths(taleId) {
  const { data, error } = await writeDb
    .from('tale_exports')
    .select('storage_path')
    .eq('tale_id', taleId)

  if (error) throw error
  return (data || []).map((row) => row.storage_path).filter(Boolean)
}
