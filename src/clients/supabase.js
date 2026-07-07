import { createClient } from '@supabase/supabase-js'
import { crossSubdomainAuthStorage } from '../lib/authStorage'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: crossSubdomainAuthStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
})

/** Write Knuckles tables live in the `write` schema (write.tales, write.scenes, etc.) */
export const writeDb = supabase.schema('write')

export const appUrl = import.meta.env.VITE_APP_URL || window.location.origin
