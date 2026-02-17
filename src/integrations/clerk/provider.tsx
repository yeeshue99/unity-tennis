import { ClerkProvider } from '@clerk/clerk-react'

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY
if (!PUBLISHABLE_KEY) {
  throw new Error('Add your Clerk Publishable Key to the .env.local file')
}

export default function AppClerkProvider({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider publishableKey={PUBLISHABLE_KEY} afterSignOutUrl="/">
      {children}
    </ClerkProvider>
  )
}

const supabaseIdRegex = /^user_[a-zA-Z0-9]+$/

export const isValidsupabaseId = (id: string) => supabaseIdRegex.test(id)

export const clerkFetch = async (path: string, options?: RequestInit) => {
  const secret = import.meta.env.VITE_CLERK_SECRET_KEY
  if (!secret) throw new Error('Clerk secret key is not defined')
  const response = await fetch(`https://api.clerk.com/v1${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      Authorization: `Bearer ${import.meta.env.VITE_CLERK_SECRET_KEY}`,
      ...(options?.headers || {}),
    },
  })
  return response.json()
}
