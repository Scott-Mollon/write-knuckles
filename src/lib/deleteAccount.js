import { supabase, writeDb } from '../clients/supabase'
import { TALE_IMAGES_BUCKET } from './images/constants'

const STORAGE_LIST_LIMIT = 1000

/**
 * Recursively list object paths under a prefix in a bucket.
 * @param {string} bucket
 * @param {string} prefix
 * @returns {Promise<string[]>}
 */
async function listStoragePaths(bucket, prefix = '') {
  const { data: items, error } = await supabase.storage.from(bucket).list(prefix, {
    limit: STORAGE_LIST_LIMIT,
  })

  if (error) throw error
  if (!items?.length) return []

  const paths = []

  for (const item of items) {
    const path = prefix ? `${prefix}/${item.name}` : item.name
    if (item.id) {
      paths.push(path)
    } else {
      // Folder — recurse
      const nested = await listStoragePaths(bucket, path)
      paths.push(...nested)
    }
  }

  return paths
}

/**
 * Remove all objects under the caller's prefix in write-tale-images.
 * @param {string} userId
 */
async function deleteWriteTaleImages(userId) {
  const paths = await listStoragePaths(TALE_IMAGES_BUCKET, userId)
  if (!paths.length) return

  // remove() accepts batches; chunk to stay under payload limits
  const chunkSize = 100
  for (let i = 0; i < paths.length; i += chunkSize) {
    const chunk = paths.slice(i, i + chunkSize)
    const { error } = await supabase.storage.from(TALE_IMAGES_BUCKET).remove(chunk)
    if (error) throw error
  }
}

/**
 * Empty and remove magazine submission buckets owned by this user (if any).
 * @param {string} userId
 */
async function deleteMagazineSubmissionBuckets(userId) {
  const { data: byUser, error: subError } = await supabase
    .from('Submissions')
    .select('id')
    .eq('user_id', userId)

  if (subError) throw subError

  const { data: contributors, error: contribError } = await supabase
    .from('Contributors')
    .select('id')
    .eq('user_id', userId)

  if (contribError) throw contribError

  const contributorIds = (contributors || []).map((c) => c.id)
  let byContributor = []
  if (contributorIds.length) {
    const { data, error } = await supabase
      .from('Submissions')
      .select('id')
      .in('contributor_id', contributorIds)
    if (error) throw error
    byContributor = data || []
  }

  const submissionIds = [
    ...new Set([...(byUser || []).map((s) => s.id), ...byContributor.map((s) => s.id)]),
  ]

  for (const id of submissionIds) {
    const bucketId = `sub-bucket-${id}`
    const { error: emptyError } = await supabase.storage.emptyBucket(bucketId)
    // Bucket may already be gone or inaccessible — continue when missing
    if (emptyError && !/not found|Bucket not found/i.test(emptyError.message || '')) {
      throw emptyError
    }

    const { error: removeError } = await supabase.storage.removeBucket(bucketId)
    if (removeError && !/not found|Bucket not found/i.test(removeError.message || '')) {
      throw removeError
    }
  }
}

/**
 * Re-authenticates with password, deletes Storage via the Storage API,
 * then permanently deletes the caller's account via RPC.
 * @param {string} password
 */
export async function deleteMyAccount(password) {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError) throw userError
  if (!user?.email) {
    throw new Error('You must be signed in to delete your account.')
  }
  if (typeof password !== 'string' || !password) {
    throw new Error('Password is required to delete your account.')
  }

  const { error: authError } = await supabase.auth.signInWithPassword({
    email: user.email,
    password,
  })

  if (authError) {
    throw new Error(authError.message || 'Incorrect password.')
  }

  // Storage rows cannot be deleted with SQL anymore — use the Storage API first.
  await deleteWriteTaleImages(user.id)
  await deleteMagazineSubmissionBuckets(user.id)

  const { error } = await writeDb.rpc('delete_my_account')

  if (error) {
    throw error
  }
}
