import { createSupabaseClient } from './db'
import { User } from '@supabase/supabase-js'
import { Player } from './players'
import { useQuery } from '@tanstack/react-query'

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
  const { data: user = null, isLoading: userLoading } = useQuery<User | null>({
    queryKey: ['authUser'],
    queryFn: async () => {
      const supabase = createSupabaseClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()
      return (user as User | null) ?? null
    },
  })

  const { data: userData = null, isLoading: userDataLoading } =
    useQuery<Player | null>({
      queryKey: ['userData', user?.id],
      queryFn: async () => {
        if (!user?.id) return null
        return fetchUserData(user.id)
      },
      enabled: !!user?.id,
    })

  const loading = userLoading || userDataLoading
  const isLoaded = !loading
  const isSignedIn = !!user
  const isAdmin = userData?.isAdmin || false

  return { user, loading, isAdmin, isSignedIn, isLoaded, userData }
}
