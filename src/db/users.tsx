import { useEffect, useState } from 'react'
import { createSupabaseClient } from './db'
import { UserResponse } from '@supabase/supabase-js'
import { Player } from './players'

export async function registerUser(email: string, password: string) {
  const supabase = createSupabaseClient()

  const {
    error,
    data: { user },
  } = await supabase.auth.signUp({
    email,
    password,
  })

  if (error) throw error
  return user
}

export async function signInUser(email: string, password: string) {
  const supabase = createSupabaseClient()

  const {
    error: signInError,
    data: { user: signedInUser },
  } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (signInError) throw signInError
  return signedInUser
}

export async function signOutUser() {
  const supabase = createSupabaseClient()
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

export const fetchUserData = async (supabaseId: string) => {
  const supabase = createSupabaseClient()

  const response = await supabase
    .from('players')
    .select()
    .eq('supabase_id', supabaseId)
    .single()

  if (response.status && response.status == 406) {
    return null
  }

  if (!response.status || response.error) {
    throw new Error('Network response was not ok')
  }

  return (response.data as Player) || null
}

export function useCurrentUser() {
  const [user, setUser] = useState<UserResponse | null>(null)
  const [userData, setUserData] = useState<Player | null>(null)
  const [isSignedIn, setIsSignedIn] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    let cancelled = false

    const fetchUser = async () => {
      const supabase = createSupabaseClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (cancelled) return

      try {
        const userData = user ? await fetchUserData(user.id) : null

        if (!cancelled) {
          setUser(user as UserResponse | null)
          setUserData(userData)
          setIsSignedIn(!!user)
          setIsAdmin(userData?.isAdmin || false)
        }
      } catch (error) {
        console.error('Error fetching user data:', error)
      } finally {
        if (!cancelled) {
          setLoading(false)
          setIsLoaded(true)
        }
      }
    }

    fetchUser()

    return () => {
      cancelled = true
    }
  }, [])

  return { user, loading, isAdmin, isSignedIn, isLoaded, userData }
}
