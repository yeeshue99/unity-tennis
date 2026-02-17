import Loader from '@/components/Loader'
import { signOutUser, useCurrentUser } from '@/db/users'
import { Button, Link, Typography } from '@mui/material'

export default function HeaderUser() {
  const { isSignedIn, userData, isLoaded } = useCurrentUser()

  const handleSignOut = async () => {
    try {
      await signOutUser()
      window.location.reload()
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  if (!isLoaded) {
    return <Loader />
  }

  if (!isSignedIn) {
    return (
      <Link href="/login/" style={{ flex: 1 }}>
        <Button variant="contained" fullWidth>
          Sign In
        </Button>
      </Link>
    )
  }

  return (
    <>
      <Typography variant="h6" style={{ marginRight: '16px' }}>
        Signed in as: {userData?.name}
      </Typography>
      <Button
        className="bg-gray-500 text-white rounded"
        onClick={handleSignOut}
      >
        Sign Out
      </Button>
    </>
  )
}
