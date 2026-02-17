import { createSupabaseClient } from '@/db/db'
import { isValidsupabaseId, clerkFetch } from '@/integrations/clerk/provider'

export const fetchAdmins = async () => {
  const supabase = createSupabaseClient()
  const response = await supabase.from('admins').select()
  if (!response.status || response.error) {
    throw new Error('Network response was not ok')
  }
  return response.data
}

export const addAdmin = async (admin: string) => {
  const supabase = createSupabaseClient()

  if (!isValidsupabaseId(admin)) {
    throw new Error('Invalid Clerk user ID format')
  }

  await clerkFetch(`/${admin}/metadata`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${import.meta.env.VITE_CLERK_SECRET_KEY}`,
    },
    body: JSON.stringify({
      public_metadata: {
        isAdmin: true,
      },
    }),
  })

  const response = await supabase.from('admins').insert({ user_id: admin })

  if (!response.status || response.error) {
    throw new Error('Network response was not ok')
  }
  return response.data
}
