import { writeDb } from '../clients/supabase'

export async function deleteMyAccount() {
  const { error } = await writeDb.rpc('delete_my_account')

  if (error) {
    throw error
  }
}
