import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useCurrentUser } from '@/db/users'
import { createSupabaseClient } from '@/db/db'
import Loader from '@/components/Loader'
import type { User } from '@supabase/supabase-js'
import {
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import { useState } from 'react'
import { useAlert } from '@/lib/alert-context'

export const Route = createFileRoute('/account/')({
  component: AccountPage,
})

function AccountPage() {
  const { isSignedIn, isLoaded, user, userData } = useCurrentUser()
  const authUser = user as unknown as User | null
  const navigate = useNavigate()
  const { showAlert } = useAlert()

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  if (!isLoaded) return <Loader />

  if (!isSignedIn) {
    navigate({ to: '/login' })
    return null
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()

    if (newPassword !== confirmPassword) {
      showAlert('New passwords do not match.', 'warning')
      return
    }
    if (newPassword.length < 6) {
      showAlert('Password must be at least 6 characters.', 'warning')
      return
    }

    setIsLoading(true)
    try {
      const supabase = createSupabaseClient()

      // Re-authenticate with current password first
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: authUser!.email!,
        password: currentPassword,
      })
      if (signInError) throw new Error('Current password is incorrect.')

      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      })
      if (updateError) throw updateError

      showAlert('Password updated successfully!', 'success', 'Done')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (err: unknown) {
      showAlert(
        err instanceof Error ? err.message : 'An error occurred.',
        'error',
        'Password update failed',
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Box sx={{ p: 4, maxWidth: 560, mx: 'auto' }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        My Account
      </Typography>

      <Card variant="outlined" sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Profile
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <Stack spacing={1}>
            <Typography>
              <strong>Name:</strong> {userData?.name ?? '—'}
            </Typography>
            <Typography>
              <strong>Email:</strong> {authUser?.email ?? '—'}
            </Typography>
            <Typography>
              <strong>Gender:</strong> {userData?.gender ?? '—'}
            </Typography>
          </Stack>
        </CardContent>
      </Card>

      <Card variant="outlined">
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Change Password
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <form onSubmit={handleChangePassword}>
            <Stack spacing={2}>
              <TextField
                label="Current Password"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                fullWidth
                size="small"
              />
              <TextField
                label="New Password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                fullWidth
                size="small"
              />
              <TextField
                label="Confirm New Password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                fullWidth
                size="small"
                error={!!confirmPassword && confirmPassword !== newPassword}
                helperText={
                  confirmPassword && confirmPassword !== newPassword
                    ? 'Passwords do not match'
                    : ''
                }
              />
              <Button
                type="submit"
                variant="contained"
                disabled={
                  isLoading ||
                  !currentPassword ||
                  !newPassword ||
                  !confirmPassword
                }
              >
                {isLoading ? 'Updating...' : 'Update Password'}
              </Button>
            </Stack>
          </form>
        </CardContent>
      </Card>
    </Box>
  )
}
