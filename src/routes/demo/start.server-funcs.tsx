import fs from 'node:fs'
import { useCallback, useState } from 'react'
import { createFileRoute, useRouter } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { useSession, useUser } from '@clerk/clerk-react'
import { useQuery } from '@tanstack/react-query'
import { fetchAdmins, addAdmin } from '@/db/admins'

/*
const loggingMiddleware = createMiddleware().server(
  async ({ next, request }) => {
    console.log("Request:", request.url);
    return next();
  }
);
const loggedServerFunction = createServerFn({ method: "GET" }).middleware([
  loggingMiddleware,
]);
*/

const TODOS_FILE = 'todos.json'

async function readTodos() {
  return JSON.parse(
    await fs.promises.readFile(TODOS_FILE, 'utf-8').catch(() =>
      JSON.stringify(
        [
          { id: 1, name: 'Get groceries' },
          { id: 2, name: 'Buy a new phone' },
        ],
        null,
        2,
      ),
    ),
  )
}

const getTodos = createServerFn({
  method: 'GET',
}).handler(async () => await readTodos())

export const Route = createFileRoute('/demo/start/server-funcs')({
  component: Home,
  loader: async () => await getTodos(),
})

function Home() {
  const router = useRouter()
  const { data: admins } = useQuery({
    queryKey: ['admins'],
    queryFn: fetchAdmins,
    staleTime: 1000 * 60 * 10,
  })
  const { isLoaded, session } = useSession()

  const [admin, setAdmin] = useState('')
  const { isSignedIn, user } = useUser()

  const submitAdmin = useCallback(async () => {
    if (!isLoaded || !session) return

    await addAdmin(admin, await session.getToken())
    setAdmin('')
    router.invalidate()
  }, [addAdmin, admin, session])

  if (!isSignedIn) return <div>Please sign in to view this page.</div>

  if (!user) return <div>Loading user...</div>

  // if (!user.publicMetadata?.isAdmin) {
  //   return <div>You do not have access to this page.</div>
  // }

  return (
    <div
      className="flex items-center justify-center min-h-screen bg-gradient-to-br from-zinc-800 to-black p-4 text-white"
      style={{
        backgroundImage:
          'radial-gradient(50% 50% at 20% 60%, #23272a 0%, #18181b 50%, #000000 100%)',
      }}
    >
      <div className="w-full max-w-2xl p-8 rounded-xl backdrop-blur-md bg-black/50 shadow-xl border-8 border-black/10">
        <h1 className="text-2xl mb-4">Add User to Admins</h1>
        <ul className="mb-4 space-y-2">
          {admins?.map((t: any) => (
            <li
              key={t.user_id}
              className="bg-white/10 border border-white/20 rounded-lg p-3 backdrop-blur-sm shadow-md"
            >
              <span className="text-lg text-white">{t.user_id}</span>
            </li>
          ))}
        </ul>
        <div className="flex flex-col gap-2">
          <input
            type="text"
            value={admin}
            onChange={(e) => setAdmin(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                submitAdmin()
              }
            }}
            placeholder="Enter a new admin..."
            className="w-full px-4 py-3 rounded-lg border border-white/20 bg-white/10 backdrop-blur-sm text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
          />
          <button
            disabled={admin.trim().length === 0}
            onClick={submitAdmin}
            className="bg-blue-500 hover:bg-blue-600 disabled:bg-blue-500/50 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg transition-colors"
          >
            Add admin
          </button>
        </div>
      </div>
    </div>
  )
}
