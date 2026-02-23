import Loader from '@/components/Loader'
import { signOutUser, useCurrentUser } from '@/db/users'
import { Tooltip, IconButton } from '@mui/material'
import { Link } from '@tanstack/react-router'
import { LogIn, LogOut, User } from 'lucide-react'

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
      <Tooltip title="Sign In" arrow>
        <Link to="/login">
          <IconButton sx={{ color: 'white' }} aria-label="Sign In">
            <LogIn size={22} />
          </IconButton>
        </Link>
      </Tooltip>
    )
  }

  return (
    <div className="flex items-center gap-1">
      <Tooltip title={`Account: ${userData?.name ?? ''}`} arrow>
        <Link to="/account">
          <IconButton sx={{ color: 'white' }} aria-label="My Account">
            <User size={22} />
          </IconButton>
        </Link>
      </Tooltip>
      <Tooltip title="Sign Out" arrow>
        <IconButton
          sx={{ color: 'white' }}
          aria-label="Sign Out"
          onClick={handleSignOut}
        >
          <LogOut size={22} />
        </IconButton>
      </Tooltip>
    </div>
  )
}
