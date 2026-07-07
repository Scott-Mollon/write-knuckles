import { createContext, useContext, useEffect, useState } from 'react'
import { supabase, writeDb } from '../clients/supabase'

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [loading, setLoading] = useState(true)
  const [approvalLoading, setApprovalLoading] = useState(false)
  const [user, setUser] = useState(null)
  const [session, setSession] = useState(null)
  const [admin, setAdmin] = useState(false)
  const [approved, setApproved] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession)
      setUser(currentSession?.user ?? null)
      if (currentSession?.user) {
        setApprovalLoading(true)
        checkAdmin(currentSession.user.id)
        checkApproved(currentSession.user)
      }
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession)
      setUser(nextSession?.user ?? null)
      if (nextSession?.user) {
        setApprovalLoading(true)
        checkAdmin(nextSession.user.id)
        checkApproved(nextSession.user)
      } else {
        setAdmin(false)
        setApproved(false)
        setApprovalLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const checkAdmin = async (userId) => {
    const { data, error } = await supabase
      .from('Admins')
      .select('admin_id')
      .eq('admin_id', userId)

    if (!error) {
      setAdmin(data?.length === 1)
    }
  }

  const checkApproved = async (authUser) => {
    setApprovalLoading(true)
    try {
      const { data, error } = await writeDb
        .from('approved_users')
        .select('id')
        .ilike('email', authUser.email)
        .is('revoked_at', null)
        .maybeSingle()

      if (error || !data) {
        setApproved(false)
        return
      }

      await writeDb.rpc('link_approved_user')
      setApproved(true)
    } catch {
      setApproved(false)
    } finally {
      setApprovalLoading(false)
    }
  }

  const signup = async (credentials) => {
    try {
      const redirectTo = `${import.meta.env.VITE_APP_URL}/signin`
      const { error } = await supabase.auth.signUp({
        email: credentials.email,
        password: credentials.password,
        options: { emailRedirectTo: redirectTo },
      })

      if (error) {
        return { success: false, message: error.message }
      }
      return { success: true, message: 'User signed up' }
    } catch {
      return {
        success: false,
        message: 'An error was encountered while signing up. Please try again.',
      }
    }
  }

  const signin = async (credentials) => {
    try {
      const { error } = await supabase.auth.signInWithPassword(credentials)

      if (error) {
        return { success: false, message: error.message }
      }
      return { success: true, message: 'User signed in' }
    } catch {
      return {
        success: false,
        message: 'An error was encountered while signing in. Please try again.',
      }
    }
  }

  const isSignedIn = () => !!session

  const signout = async () => {
    setUser(null)
    setSession(null)
    setAdmin(false)
    setApproved(false)
    return supabase.auth.signOut()
  }

  return (
    <AuthContext.Provider
      value={{
        loading,
        approvalLoading,
        signup,
        signin,
        isSignedIn,
        user,
        admin,
        approved,
        signout,
        session,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
