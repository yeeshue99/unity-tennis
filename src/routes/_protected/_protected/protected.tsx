import { createSupabaseClient } from '@/db/db'
import { useCurrentUser } from '@/db/users'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_protected/_protected/protected')({
  component: Info,
})

function Info() {
  const { userData } = useCurrentUser()
  console.log('Protected route data:', userData)

  return <p>Hello {userData?.name}</p>
}
