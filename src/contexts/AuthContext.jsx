import { createContext, useContext, useEffect, useState } from 'react'
import { supabase, writeDb } from '../clients/supabase'
import { PLAN_FREE, normalizePlan } from '../constants/account'
import { deleteMyAccount as deleteMyAccountRequest } from '../lib/deleteAccount'

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [loading, setLoading] = useState(true)
  const [approvalLoading, setApprovalLoading] = useState(false)
  const [user, setUser] = useState(null)
  const [session, setSession] = useState(null)
  const [admin, setAdmin] = useState(false)
  const [approved, setApproved] = useState(false)
  const [plan, setPlan] = useState(PLAN_FREE)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession)
      setUser(currentSession?.user ?? null)
      if (currentSession?.user) {
        setApprovalLoading(true)
        checkAdmin(currentSession.user.id)
        checkPlan(currentSession.user.id)
        checkApproved()
      }
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession)
      setUser(nextSession?.user ?? null)
      if (nextSession?.user) {
        setApprovalLoading(true)
        checkAdmin(nextSession.user.id)
        // Defer until the Supabase client attaches the new session JWT to API calls.
        setTimeout(() => {
          checkPlan(nextSession.user.id)
          checkApproved()
        }, 0)
      } else {
        setAdmin(false)
        setApproved(false)
        setPlan(PLAN_FREE)
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

  const checkPlan = async (userId) => {
    if (!userId) {
      setPlan(PLAN_FREE)
      return
    }

    try {
      const { data, error } = await writeDb
        .from('profiles')
        .select('plan')
        .eq('user_id', userId)
        .maybeSingle()

      if (error) {
        if (import.meta.env.DEV) {
          console.error('Plan check failed:', error.message, error)
        }
        setPlan(PLAN_FREE)
        return
      }

      setPlan(normalizePlan(data?.plan))
    } catch (err) {
      if (import.meta.env.DEV) {
        console.error('Plan check error:', err)
      }
      setPlan(PLAN_FREE)
    }
  }

  const checkApproved = async () => {
    setApprovalLoading(true)
    try {
      const { data: { session: currentSession } } = await supabase.auth.getSession()
      const authUser = currentSession?.user
      if (!authUser?.email) {
        setApproved(false)
        return
      }

      const { data, error } = await writeDb
        .from('approved_users')
        .select('id')
        .ilike('email', authUser.email)
        .is('revoked_at', null)
        .maybeSingle()

      if (error) {
        if (import.meta.env.DEV) {
          console.error('Approval check failed:', error.message, error)
        }
        setApproved(false)
        return
      }

      if (!data) {
        if (import.meta.env.DEV) {
          console.warn('No active approval row for', authUser.email)
        }
        setApproved(false)
        return
      }

      await writeDb.rpc('link_approved_user')
      setApproved(true)
    } catch (err) {
      if (import.meta.env.DEV) {
        console.error('Approval check error:', err)
      }
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
    setPlan(PLAN_FREE)
    return supabase.auth.signOut()
  }

  const deleteAccount = async () => {
    try {
      await deleteMyAccountRequest()
      setUser(null)
      setSession(null)
      setAdmin(false)
      setApproved(false)
      setPlan(PLAN_FREE)
      await supabase.auth.signOut()
      return { success: true }
    } catch (err) {
      return {
        success: false,
        message: err.message || 'Failed to delete account. Please try again.',
      }
    }
  }

  const updateProfile = async ({ firstName, lastName }) => {
    try {
      const { data, error } = await supabase.auth.updateUser({
        data: {
          first_name: firstName?.trim() || '',
          last_name: lastName?.trim() || '',
        },
      })

      if (error) {
        return { success: false, message: error.message }
      }

      if (data.user) {
        setUser(data.user)
      }

      return { success: true }
    } catch {
      return {
        success: false,
        message: 'Failed to update profile. Please try again.',
      }
    }
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
        plan,
        refreshPlan: () => checkPlan(user?.id),
        signout,
        deleteAccount,
        updateProfile,
        session,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
