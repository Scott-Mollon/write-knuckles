import { useMutation, useQueryClient } from '@tanstack/react-query'
import { writeDb } from '../clients/supabase'
import { useAuth } from '../contexts/AuthContext'
import { deleteEntityReferenceImages } from './useReferenceImages'

const invalidateReference = (queryClient, taleId) => {
  queryClient.invalidateQueries({ queryKey: ['tale-reference', taleId] })
  queryClient.invalidateQueries({ queryKey: ['reference-images', taleId] })
}

export const useCreateCharacter = (taleId) => {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: async ({ name, role, bioSummary, tags, sortOrder }) => {
      const { data, error } = await writeDb
        .from('characters')
        .insert({
          tale_id: taleId,
          user_id: user.id,
          name,
          role: role || null,
          bio: bioSummary ? { summary: bioSummary } : {},
          tags: tags || [],
          sort_order: sortOrder,
        })
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => invalidateReference(queryClient, taleId),
  })
}

export const useUpdateCharacter = (taleId) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, name, role, bioSummary, tags }) => {
      const { data, error } = await writeDb
        .from('characters')
        .update({
          name,
          role: role || null,
          bio: bioSummary ? { summary: bioSummary } : {},
          tags: tags || [],
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => invalidateReference(queryClient, taleId),
  })
}

export const useDeleteCharacter = (taleId) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id) => {
      await deleteEntityReferenceImages(taleId, 'character', id)
      const { error } = await writeDb.from('characters').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => invalidateReference(queryClient, taleId),
  })
}

export const useCreateLocation = (taleId) => {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: async ({ name, description, notesSummary, tags, sortOrder }) => {
      const { data, error } = await writeDb
        .from('locations')
        .insert({
          tale_id: taleId,
          user_id: user.id,
          name,
          description: description || null,
          notes: notesSummary ? { summary: notesSummary } : {},
          tags: tags || [],
          sort_order: sortOrder,
        })
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => invalidateReference(queryClient, taleId),
  })
}

export const useUpdateLocation = (taleId) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, name, description, notesSummary, tags }) => {
      const { data, error } = await writeDb
        .from('locations')
        .update({
          name,
          description: description || null,
          notes: notesSummary ? { summary: notesSummary } : {},
          tags: tags || [],
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => invalidateReference(queryClient, taleId),
  })
}

export const useDeleteLocation = (taleId) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id) => {
      await deleteEntityReferenceImages(taleId, 'location', id)
      const { error } = await writeDb.from('locations').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => invalidateReference(queryClient, taleId),
  })
}

export const useCreateResearchItem = (taleId) => {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: async ({ title, body, url, tags, sortOrder }) => {
      const { data, error } = await writeDb
        .from('research_items')
        .insert({
          tale_id: taleId,
          user_id: user.id,
          title,
          body: body || null,
          url: url || null,
          tags: tags || [],
          sort_order: sortOrder,
        })
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => invalidateReference(queryClient, taleId),
  })
}

export const useUpdateResearchItem = (taleId) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, title, body, url, tags }) => {
      const { data, error } = await writeDb
        .from('research_items')
        .update({
          title,
          body: body || null,
          url: url || null,
          tags: tags || [],
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => invalidateReference(queryClient, taleId),
  })
}

export const useDeleteResearchItem = (taleId) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id) => {
      await deleteEntityReferenceImages(taleId, 'research', id)
      const { error } = await writeDb.from('research_items').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => invalidateReference(queryClient, taleId),
  })
}
